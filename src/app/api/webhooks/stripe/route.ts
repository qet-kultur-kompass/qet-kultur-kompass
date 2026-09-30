import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { generateToken } from "@/lib/tokens";
import { tierNameForParticipants, FREE_PARTICIPANT_LIMIT } from "@/lib/billing";
import {
  sendWelcomeEmail,
  sendUpgradeEmail,
  sendRenewalReminderEmail,
  sendPaymentFailedEmail,
  sendSubscriptionCanceledEmail,
  ACCOUNT_SETUP_TOKEN_VALID_HOURS,
} from "@/lib/mail";
import type { Locale } from "@/lib/content/types";

// Wichtig: kein `export const runtime = "edge"` – wir brauchen den rohen
// Request-Body für die Signaturprüfung, siehe req.text() unten. Next.js
// liefert bei App-Router-Routen standardmäßig den ungeparsten Body, solange
// kein bodyParser-Workaround nötig ist (anders als bei den alten API-Routes).
export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.qet-compass.com";

function asLocale(value: unknown): Locale {
  return value === "en" || value === "tr" || value === "ro" ? value : "de";
}

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "webhook_not_configured" }, { status: 500 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe webhook] Signaturprüfung fehlgeschlagen:", err);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case "invoice.upcoming":
        await handleInvoiceUpcoming(event.data.object as Stripe.Invoice);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        // Andere Events (z.B. invoice.paid) sind für uns aktuell nicht
        // relevant – bewusst ignoriert statt einen Fehler zu werfen.
        break;
    }
  } catch (err) {
    // Stripe wiederholt den Webhook bei einem Nicht-2xx-Status automatisch –
    // daher hier bewusst 500 zurückgeben, statt den Fehler zu verschlucken.
    console.error(`[stripe webhook] Fehler bei ${event.type}:`, err);
    return NextResponse.json({ error: "handler_failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.mode !== "subscription" || !session.subscription || !session.customer) return;

  const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
  const customerId = typeof session.customer === "string" ? session.customer : session.customer.id;
  const subscription = await stripe().subscriptions.retrieve(subscriptionId);

  const metadata = session.metadata ?? {};
  const participants = Number(metadata.participants) || subscription.items.data[0]?.quantity || FREE_PARTICIPANT_LIMIT;
  const tier = metadata.tier || tierNameForParticipants(participants);
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
  const locale = asLocale(metadata.locale);

  if (metadata.companyId) {
    // Fall 1: bestehendes Konto hat sein Kontingent erweitert/erneuert.
    const company = await prisma.company.update({
      where: { id: metadata.companyId },
      data: {
        billingProvider: "stripe",
        tier,
        participantLimit: participants,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: subscription.status,
        currentPeriodEnd,
      },
    });
    if (company.ownerEmail) {
      await sendUpgradeEmail({
        to: company.ownerEmail,
        companyName: company.name,
        tier,
        participants,
        locale,
      });
    }
    return;
  }

  // Fall 2: Kauf ohne vorherige Registrierung -> Firma jetzt erst anlegen.
  const ownerEmail = (metadata.ownerEmail || session.customer_details?.email || "").toLowerCase().trim();
  if (!ownerEmail) {
    console.error("[stripe webhook] checkout.session.completed ohne ownerEmail/companyId – kann keine Firma anlegen.");
    return;
  }
  const existing = await prisma.company.findUnique({ where: { ownerEmail } });
  if (existing) {
    // Sollte durch die Prüfung in /api/checkout eigentlich nicht vorkommen,
    // aber bei parallelen Käufen (Doppel-Klick) ist das die sichere Variante:
    // Kontingent auf der bestehenden Firma erweitern statt einen Duplikat-Fehler zu werfen.
    await prisma.company.update({
      where: { id: existing.id },
      data: {
        billingProvider: "stripe",
        tier,
        participantLimit: participants,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: subscription.status,
        currentPeriodEnd,
      },
    });
    return;
  }

  const accountType = participants <= 1 ? "individual" : "company";
  const setupToken = generateToken(32);
  const setupTokenExpiresAt = new Date(Date.now() + ACCOUNT_SETUP_TOKEN_VALID_HOURS * 60 * 60 * 1000);
  const ownerName = metadata.ownerName || ownerEmail;
  const companyName = metadata.companyName || ownerName;

  await prisma.company.create({
    data: {
      name: companyName,
      accountType,
      ownerName,
      ownerEmail,
      contactName: ownerName,
      contactEmail: ownerEmail,
      surveyToken: generateToken(20),
      dashboardToken: generateToken(20),
      billingProvider: "stripe",
      tier,
      participantLimit: participants,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      subscriptionStatus: subscription.status,
      currentPeriodEnd,
      accountSetupToken: setupToken,
      accountSetupTokenExpiresAt: setupTokenExpiresAt,
      invitees: {
        create: {
          name: ownerName,
          email: ownerEmail,
          role: accountType === "individual" ? "customer" : "employee",
          inviteToken: generateToken(20),
          source: "self_service",
          isOwner: true,
        },
      },
    },
  });

  await sendWelcomeEmail({
    to: ownerEmail,
    companyName,
    tier,
    participants,
    setupUrl: `${APP_URL}/account-setup/${setupToken}`,
    locale,
  });
}
async function findCompanyBySubscription(subscriptionId: string) {
  return prisma.company.findUnique({ where: { stripeSubscriptionId: subscriptionId } });
}

async function findCompanyByCustomer(customerId: string) {
  return prisma.company.findUnique({ where: { stripeCustomerId: customerId } });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const company = await findCompanyBySubscription(subscription.id);
  if (!company) return;

  const participants = subscription.items.data[0]?.quantity ?? company.participantLimit;
  await prisma.company.update({
    where: { id: company.id },
    data: {
      participantLimit: participants,
      tier: tierNameForParticipants(participants),
      subscriptionStatus: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const company = await findCompanyBySubscription(subscription.id);
  if (!company) return;

  await prisma.company.update({
    where: { id: company.id },
    data: {
      billingProvider: "free",
      tier: null,
      participantLimit: FREE_PARTICIPANT_LIMIT,
      subscriptionStatus: "canceled",
    },
  });

  if (company.ownerEmail) {
    await sendSubscriptionCanceledEmail({ to: company.ownerEmail, companyName: company.name });
  }
}

async function handleInvoiceUpcoming(invoice: Stripe.Invoice) {
  const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
  if (!customerId) return;
  const company = await findCompanyByCustomer(customerId);
  if (!company || !company.ownerEmail) return;

  // Nicht doppelt erinnern innerhalb desselben Abrechnungszeitraums (Stripe
  // kann invoice.upcoming theoretisch mehrfach feuern).
  if (
    company.renewalReminderSentAt &&
    company.currentPeriodEnd &&
    company.renewalReminderSentAt > new Date(company.currentPeriodEnd.getTime() - 25 * 24 * 60 * 60 * 1000)
  ) {
    return;
  }

  const amount = ((invoice.amount_due ?? 0) / 100).toFixed(2).replace(".", ",");
  const renewalDate = invoice.next_payment_attempt ? new Date(invoice.next_payment_attempt * 1000) : company.currentPeriodEnd;

  await sendRenewalReminderEmail({
    to: company.ownerEmail,
    companyName: company.name,
    amount,
    renewalDate,
  });

  await prisma.company.update({ where: { id: company.id }, data: { renewalReminderSentAt: new Date() } });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
  if (!customerId) return;
  const company = await findCompanyByCustomer(customerId);
  if (!company || !company.ownerEmail) return;

  await sendPaymentFailedEmail({
    to: company.ownerEmail,
    companyName: company.name,
    portalUrl: `${APP_URL}/mein-dashboard`,
  });
}
