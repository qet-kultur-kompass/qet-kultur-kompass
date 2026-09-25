import { t } from "@/lib/content/i18n";
import type { Locale } from "@/lib/content/types";

// Optionaler E-Mail-Versand für persönliche Einladungen. Bewusst OHNE neue
// npm-Abhängigkeit umgesetzt (einfacher HTTP-Aufruf an die Resend-API), und
// bewusst OPTIONAL: ist RESEND_API_KEY nicht gesetzt, wird nichts verschickt
// und der Aufrufer bekommt das über `sent:false` mit – die Oberfläche zeigt
// dann weiterhin den Link zum manuellen Kopieren an (wie bisher).
export async function sendInviteEmail(opts: {
  to: string;
  companyName: string;
  inviteUrl: string;
  locale?: Locale;
}): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    return { sent: false, reason: "not_configured" };
  }

  const locale = opts.locale ?? "de";
  const subject = t(locale, "mailInviteSubject", { company: opts.companyName });
  const text = t(locale, "mailInviteBody", { company: opts.companyName, link: opts.inviteUrl });

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [opts.to],
        subject,
        text,
      }),
    });
    if (!res.ok) return { sent: false, reason: `resend_error_${res.status}` };
    return { sent: true };
  } catch {
    return { sent: false, reason: "network_error" };
  }
}

// Willkommens-E-Mail nach einem Digistore24-Kauf: aktiviert wie
// sendInviteEmail nur, wenn RESEND_API_KEY/RESEND_FROM_EMAIL gesetzt sind.
// Ist das nicht der Fall, bekommt der Käufer trotz erfolgreicher Zahlung
// keine automatische Nachricht – der Zugang existiert dann zwar bereits in
// der Datenbank, aber Ralph muss den Aktivierungslink manuell nachsenden
// (siehe Admin-Firmenübersicht). Für den Produktivbetrieb daher unbedingt
// RESEND_API_KEY setzen, siehe DIGISTORE24_SETUP.md.
export async function sendPurchaseWelcomeEmail(opts: {
    to: string;
    companyName: string;
    activateUrl: string;
    planLabel: string;
    locale?: Locale;
}): Promise<{ sent: boolean; reason?: string }> {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    if (!apiKey || !from) {
          return { sent: false, reason: "not_configured" };
    }

    const locale = opts.locale ?? "de";
    const subject = t(locale, "mailPurchaseWelcomeSubject");
    const text = t(locale, "mailPurchaseWelcomeBody", {
          plan: opts.planLabel,
          link: opts.activateUrl,
    });

    try {
          const res = await fetch("https://api.resend.com/emails", {
                  method: "POST",
                  headers: {
                            Authorization: `Bearer ${apiKey}`,
                            "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ from, to: [opts.to], subject, text }),
          });
          if (!res.ok) return { sent: false, reason: `resend_error_${res.status}` };
          return { sent: true };
    } catch {
          return { sent: false, reason: "network_error" };
    }
}
