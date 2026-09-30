import { t } from "@/lib/content/i18n";
import type { Locale } from "@/lib/content/types";

/** Gültigkeitsdauer des Kontoeinrichtungs-Links (Kauf ohne vorherige
 * Registrierung), verwendet sowohl hier (E-Mail-Text) als auch in
 * /api/account-setup/[token] (tatsächliche Ablaufprüfung). */
export const ACCOUNT_SETUP_TOKEN_VALID_HOURS = 72;

// E-Mail-Versand für Einladungen UND für die Abrechnung/Kundenkommunikation
// rund ums Abo (Willkommen, Kontingent erhöht, Verlängerungs-Erinnerung,
// Zahlung fehlgeschlagen, Abo beendet). Bewusst OHNE neue npm-Abhängigkeit
// umgesetzt (einfacher HTTP-Aufruf an die Resend-API), und bewusst OPTIONAL:
// ist RESEND_API_KEY nicht gesetzt, wird nichts verschickt und der Aufrufer
// bekommt das über `sent:false` mit.
async function sendRaw(opts: { to: string; subject: string; text: string }): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    return { sent: false, reason: "not_configured" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [opts.to], subject: opts.subject, text: opts.text }),
    });
    if (!res.ok) return { sent: false, reason: `resend_error_${res.status}` };
    return { sent: true };
  } catch {
    return { sent: false, reason: "network_error" };
  }
}

export async function sendInviteEmail(opts: {
  to: string;
  companyName: string;
  inviteUrl: string;
  locale?: Locale;
}): Promise<{ sent: boolean; reason?: string }> {
  const locale = opts.locale ?? "de";
  return sendRaw({
    to: opts.to,
    subject: t(locale, "mailInviteSubject", { company: opts.companyName }),
    text: t(locale, "mailInviteBody", { company: opts.companyName, link: opts.inviteUrl }),
  });
}

/** Begrüßungsschreiben nach einem Kauf ohne vorherige Registrierung – die
 * Firma wurde gerade erst durch den Stripe-Webhook angelegt. Enthält den
 * Link, um das eigene Passwort zu setzen und direkt loszulegen. */
export async function sendWelcomeEmail(opts: {
  to: string;
  companyName: string;
  tier: string;
  participants: number;
  setupUrl?: string;
  locale?: Locale;
}): Promise<{ sent: boolean; reason?: string }> {
  const locale = opts.locale ?? "de";
  const vars = {
    company: opts.companyName,
    tier: opts.tier,
    count: opts.participants,
    link: opts.setupUrl ?? "",
    hours: ACCOUNT_SETUP_TOKEN_VALID_HOURS,
  };
  return sendRaw({
    to: opts.to,
    subject: t(locale, "mailWelcomeSubject", vars),
    text: t(locale, opts.setupUrl ? "mailWelcomeBodySetup" : "mailWelcomeBodyExisting", vars),
  });
}

/** Bestätigung, wenn eine bereits bestehende, bezahlende Firma ihr
 * Kontingent erhöht (weiteres Abo/Upgrade über den Checkout oder das
 * Stripe-Kundenportal). */
export async function sendUpgradeEmail(opts: {
  to: string;
  companyName: string;
  tier: string;
  participants: number;
  locale?: Locale;
}): Promise<{ sent: boolean; reason?: string }> {
  const locale = opts.locale ?? "de";
  const vars = { company: opts.companyName, tier: opts.tier, count: opts.participants, limit: opts.participants };
  return sendRaw({
    to: opts.to,
    subject: t(locale, "mailUpgradeSubject", vars),
    text: t(locale, "mailUpgradeBody", vars),
  });
}

/** Erinnerung rechtzeitig vor der automatischen Verlängerung des Abos
 * (ausgelöst durch Stripes "invoice.upcoming"-Webhook, standardmäßig ca. 7
 * Tage vorher – einstellbar in den Stripe-Rechnungseinstellungen). */
export async function sendRenewalReminderEmail(opts: {
  to: string;
  companyName: string;
  amount: string; // bereits formatiert, z.B. "179,00"
  renewalDate: Date | null;
  locale?: Locale;
}): Promise<{ sent: boolean; reason?: string }> {
  const locale = opts.locale ?? "de";
  const localeTag = { de: "de-DE", en: "en-GB", tr: "tr-TR", ro: "ro-RO" }[locale];
  const dateLabel = opts.renewalDate ? opts.renewalDate.toLocaleDateString(localeTag) : "";
  const vars = { company: opts.companyName, amount: opts.amount, date: dateLabel };
  return sendRaw({
    to: opts.to,
    subject: t(locale, "mailRenewalSubject", vars),
    text: t(locale, "mailRenewalBody", vars),
  });
}

/** Hinweis bei fehlgeschlagener Zahlung (z.B. abgelaufene Karte) – mit
 * Verweis auf das Dashboard, wo das Stripe-Kundenportal die
 * Zahlungsmethode aktualisieren lässt. */
export async function sendPaymentFailedEmail(opts: {
  to: string;
  companyName: string;
  portalUrl: string;
  locale?: Locale;
}): Promise<{ sent: boolean; reason?: string }> {
  const locale = opts.locale ?? "de";
  const vars = { company: opts.companyName, link: opts.portalUrl };
  return sendRaw({
    to: opts.to,
    subject: t(locale, "mailPaymentFailedSubject", vars),
    text: t(locale, "mailPaymentFailedBody", vars),
  });
}

/** Bestätigung, dass ein Abo beendet wurde (gekündigt oder nach
 * wiederholt fehlgeschlagener Zahlung durch Stripe automatisch beendet).
 * Der Zugang bleibt bestehen, fällt aber auf FREE_PARTICIPANT_LIMIT zurück. */
export async function sendSubscriptionCanceledEmail(opts: {
  to: string;
  companyName: string;
  locale?: Locale;
}): Promise<{ sent: boolean; reason?: string }> {
  const locale = opts.locale ?? "de";
  const vars = { company: opts.companyName };
  return sendRaw({
    to: opts.to,
    subject: t(locale, "mailCanceledSubject", vars),
    text: t(locale, "mailCanceledBody", vars),
  });
}

/** Bestätigung an eine Enterprise-Interessentin/einen Enterprise-Interessenten
 * (500+ Teilnehmende), nachdem sie/er das Kontaktformular auf der Landingpage
 * abgeschickt hat – siehe /api/enterprise-contact. */
export async function sendEnterpriseLeadConfirmation(opts: {
  to: string;
  companyName: string;
  participants: number;
  locale?: Locale;
}): Promise<{ sent: boolean; reason?: string }> {
  const locale = opts.locale ?? "de";
  const vars = { company: opts.companyName, count: opts.participants };
  return sendRaw({
    to: opts.to,
    subject: t(locale, "mailEnterpriseConfirmSubject", vars),
    text: t(locale, "mailEnterpriseConfirmBody", vars),
  });
}

/** Benachrichtigung an Ralph selbst über eine neue Enterprise-Anfrage, damit
 * er sie manuell nachverfolgen kann (individuelle Preisverhandlung ab 500
 * Teilnehmenden läuft bewusst nicht automatisiert, sondern persönlich). */
export async function sendEnterpriseLeadNotification(opts: {
  companyName: string;
  contactName: string;
  contactEmail: string;
  participants: number;
  message?: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const notifyTo = process.env.ENTERPRISE_LEAD_NOTIFY_EMAIL || process.env.SEED_ADMIN_EMAIL;
  if (!notifyTo) return { sent: false, reason: "not_configured" };
  const lines = [
    `Firma: ${opts.companyName}`,
    `Ansprechpartner:in: ${opts.contactName} <${opts.contactEmail}>`,
    `Ungefähre Teilnehmerzahl: ${opts.participants}`,
    opts.message ? `Nachricht:\n${opts.message}` : "Keine zusätzliche Nachricht.",
  ];
  return sendRaw({
    to: notifyTo,
    subject: `Neue QET-Compass-Enterprise-Anfrage: ${opts.companyName}`,
    text: lines.join("\n\n"),
  });
}
