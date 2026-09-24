import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { NewCompanyForm } from "@/components/NewCompanyForm";
import { SignOutButton } from "@/components/SignOutButton";
import { BrandHeaderLink } from "@/components/BrandHeaderLink";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { submissions: true } } },
  });

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-12">
      <header className="flex items-center justify-between">
        <div>
          <BrandHeaderLink size={22} />
          <p className="mt-1 text-sm text-ink/60">Admin-Übersicht Ihrer Firmen</p>
        </div>
        <SignOutButton />
      </header>

      <div className="mt-8">
        <NewCompanyForm />
      </div>

      <ul className="mt-8 flex flex-col gap-3">
        {companies.length === 0 && (
          <li className="rounded-2xl border border-dashed border-ink/20 p-8 text-center text-sm text-ink/50">
            Noch keine Firma angelegt. Legen Sie oben Ihre erste Firma an, um einen
            Umfrage-Link zu erzeugen.
          </li>
        )}
        {companies.map((c) => (
          <li key={c.id}>
            <Link
              href={`/admin/company/${c.id}`}
              className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white/60 p-5 shadow-card transition hover:border-quality-500/40"
            >
              <div>
                <div className="font-display text-lg font-semibold text-ink">{c.name}</div>
                <div className="text-sm text-ink/50">
                  {c._count.submissions}{" "}
                  {c._count.submissions === 1 ? "Einreichung" : "Einreichungen"}
                  {!c.isActive && " · deaktiviert"}
                </div>
              </div>
              <span className="text-sm font-medium text-quality-600">Dashboard ansehen →</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
