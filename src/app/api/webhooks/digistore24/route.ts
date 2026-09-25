import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/tokens";
import {
    verifyDigistore24Signature,
    resolveDigistore24Plan,
    DIGISTORE24_DEACTIVATION_EVENTS,
  } from "@/lib/digistore24";
import { sendPurchaseWelcomeEmail } from "@/lib/mail";

// Digistore24 schickt die IPN als application/x-www-form-urlencoded POST.
// Siehe src/lib/digistore24.ts für Signaturprüfung + Preisstufen-Zuordnung,
// und DIGISTORE24_SETUP.md für die Einrichtung in Digistore24 selbst.
export async function POST(req: Request) {
    const raw = await req.text();
    const parsed = new URLSearchParams(raw);
    const params: Record<string, string> = {};
    for (const [key, value] of parsed.entries()) params[key] = value;

    const passphrase = process.env.DIGISTORE24_IPN_PASSPHRASE;
    if (!passphrase) {
          console.error("DIGISTORE24_IPN_PASSPHRASE ist nicht gesetzt – IPN kann nicht verarbeitet werden.");
          return NextResponse.json({ error: "not_configured" }, { status: 500 });
        }

    // Digistore24 sendet bei der Verbindungsprüfung ("Test-IPN senden") ggf.
    // Testdaten ohne gültige Signatur für den echten Passphrase-Wert – daher
    // zuerst den connection_test separat behandeln, danach erst signieren.
    if (params["event"] === "connection_test") {
          return new NextResponse("OK", { status: 200 });
        }

    if (!verifyDigistore24Signature(params, passphrase)) {
          console.warn("Digistore24-IPN mit ungültiger Signatur abgelehnt.", { order_id: params["order_id"] });
          return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
        }

    const event = params["event"];
    const orderId = params["order_id"] || null;
    const email = (params["email"] || "").toLowerCase().trim();
    const productId = params["product_id"];
    const orderIsPaid = params["order_is_paid"] === "1" || params["order_is_paid"] === "true";

    // Idempotenz: dieselbe IPN kann von Digistore24 mehrfach zugestellt werden.
    if (orderId) {
          const already = await prisma.webhookEvent.findFirst({
                  where: { provider: "digistore24", externalId: orderId, eventType: event ?? "" },
                });
          if (already) {
                  return NextResponse.json({ ok: true, note: "already_processed" });
                }
        }

    await prisma.webhookEvent.create({
          data: {
                  provider: "digistore24",
                  eventType: event ?? "unknown",
                  externalId: orderId,
                  payloadJson: JSON.stringify(params),
                  status: "received",
                },
        });

    // --- Zahlung erfolgreich: Zugang anlegen/aktivieren ---------------------
    if (event === "on_payment" && orderIsPaid) {
          const plan = resolveDigistore24Plan(productId);
          if (!plan) {
                  console.warn(`Digistore24-Kauf mit unbekannter product_id "${productId}" – Zugang NICHT angelegt.`);
                  return NextResponse.json({ ok: true, note: "unknown_product" });
                }
          if (!email) {
                  return NextResponse.json({ ok: true, note: "no_email" });
                }

          const firstName = params["first_name"] || "";
          const lastName = params["last_name"] || "";
          const fullName = `${firstName} ${lastName}`.trim();
          const companyNameFromOrder = params["company"] || fullName || email;

          let company = await prisma.company.findUnique({
                  where: { ownerEmail: email },
                  include: { invitees: true },
                });

          if (!company) {
                  company = await prisma.company.create({
                            data: {
                                        name: companyNameFromOrder,
                                        accountType: "company",
                                        ownerName: fullName || null,
                                        ownerEmail: email,
                                        contactName: fullName || null,
                                        contactEmail: email,
                                        surveyToken: generateToken(20),
                                        dashboardToken: generateToken(20),
                                        isActive: true,
                                        participantLimit: plan.participantLimit,
                                        billingSource: "digistore24",
                                        digistore24OrderId: orderId,
                                        planLabel: plan.label,
                                        invitees: {
                                                      create: {
                                                                      name: fullName || email,
                                                                      email,
                                                                      role: "employee",
                                                                      inviteToken: generateToken(20),
                                                                      source: "digistore24",
                                                                      isOwner: true,
                                                                    },
                                                    },
                                      },
                            include: { invitees: true },
                          });
                } else {
                  // Bestehender Kunde – z.B. Upgrade/Verlängerung: Limit & Status
                  // aktualisieren, Zugang reaktivieren falls zuvor gesperrt.
                  company = await prisma.company.update({
                            where: { id: company.id },
                            data: {
                                        isActive: true,
                                        participantLimit: plan.participantLimit,
                                        billingSource: "digistore24",
                                        digistore24OrderId: orderId ?? company.digistore24OrderId,
                                        planLabel: plan.label,
                                      },
                            include: { invitees: true },
                          });
                }

          let ownerInvite = company.invitees.find((i) => i.isOwner);
          if (!ownerInvite) {
                  ownerInvite = await prisma.invitee.create({
                            data: {
                                        companyId: company.id,
                                        name: fullName || email,
                                        email,
                                        role: "employee",
                                        inviteToken: generateToken(20),
                                        source: "digistore24",
                                        isOwner: true,
                                      },
                          });
                }

          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
          const activateUrl = `${baseUrl}/invite/${ownerInvite.inviteToken}`;

          await sendPurchaseWelcomeEmail({
                  to: email,
                  companyName: company.name,
                  activateUrl,
                  planLabel: plan.label,
                });

          return NextResponse.json({ ok: true });
        }

    // --- Zahlung ausgeblieben/storniert/erstattet: Zugang sperren -----------
    if (event && DIGISTORE24_DEACTIVATION_EVENTS.has(event)) {
          if (email) {
                  await prisma.company.updateMany({
                            where: { ownerEmail: email, billingSource: "digistore24" },
                            data: { isActive: false },
                          });
                }
          return NextResponse.json({ ok: true });
        }

    return NextResponse.json({ ok: true, note: "event_ignored" });
  }
