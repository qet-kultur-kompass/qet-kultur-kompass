import Link from "next/link";
import { QetLogo } from "@/components/QetLogo";
import { QetSymbol } from "@/components/QetSymbol";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="absolute right-6 top-6">
        <QetLogo className="h-7 w-auto sm:h-8" />
      </div>

      <div className="max-w-lg">
        <div className="mx-auto mb-6 h-14 w-14" aria-hidden>
          <QetSymbol />
        </div>
        <div className="text-xs font-medium uppercase tracking-wide text-quality-600">
          Die 12-Monats-Kulturreise
        </div>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">QET Kultur-Kompass</h1>
        <p className="mt-4 font-display text-xl font-medium text-ink/90">
          Mach Mitarbeiter, Kunden und Partner zu Fans deines Unternehmens.
        </p>
        <p className="mt-3 text-sm text-ink/60">
          In 60 Kriterien messbar, in 12 Monaten sichtbar. Registrieren Sie sich kostenlos – für sich
          allein oder mit Team – und legen Sie sofort los.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/start"
            className="inline-block rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition hover:bg-ink/90"
          >
            Kostenlos starten
          </Link>
          <Link
            href="/login"
            className="inline-block rounded-full border border-ink/15 px-6 py-3 text-sm font-medium text-ink/80 transition hover:bg-ink/5"
          >
            Ich habe schon ein Konto
          </Link>
        </div>

        <Link
          href="/admin/login"
          className="mt-8 inline-block text-xs font-medium text-ink/40 transition hover:text-ink/70"
        >
          Admin-Login (QET-Team)
        </Link>
      </div>
    </main>
  );
}
