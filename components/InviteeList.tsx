"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CopyField } from "./CopyField";
import { ROLE_LABELS, t } from "@/lib/content/i18n";
import type { Locale } from "@/lib/content/types";

export interface InviteeRow {
  id: string;
  name: string | null;
  email: string | null;
  department: string | null;
  role: "employee" | "customer" | "partner";
  status: string;
  source: string;
  inviteToken: string;
}

export function InviteeList({
  companyId,
  invitees,
  origin,
  locale = "de",
}: {
  companyId: string;
  invitees: InviteeRow[];
  origin: string;
  locale?: Locale;
}) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"employee" | "customer" | "partner">("employee");
  const [sendEmail, setSendEmail] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastEmailNotice, setLastEmailNotice] = useState<string | null>(null);

  async function addInvitee(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setLastEmailNotice(null);
    const res = await fetch(`/api/companies/${companyId}/invitees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, role, sendEmail: sendEmail && Boolean(email), locale }),
    });
    const data = await res.json().catch(() => null);
    setSaving(false);
    setName("");
    setEmail("");
    setShowAdd(false);
    if (sendEmail && email) {
      if (data?.emailResult?.sent) {
        setLastEmailNotice("sent");
      } else {
        setLastEmailNotice("link_only");
      }
    }
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ink">
          {t(locale, "dashboardInviteTeam")} ({invitees.length})
        </h2>
        <button
          type="button"
          onClick={() => setShowAdd((s) => !s)}
          className="text-sm font-medium text-quality-600 hover:underline"
        >
          {showAdd ? "×" : "+ " + t(locale, "dashboardInviteTeam")}
        </button>
      </div>

      {lastEmailNotice && (
        <p className="mt-3 text-xs text-ink/50">
          {lastEmailNotice === "sent"
            ? "✓ E-Mail wurde verschickt."
            : "Link wurde angelegt – E-Mail-Versand ist nicht eingerichtet, bitte Link manuell teilen."}
        </p>
      )}

      {showAdd && (
        <form onSubmit={addInvitee} className="mt-4 flex flex-wrap items-end gap-3 rounded-xl bg-ink/[0.03] p-4">
          <label className="text-xs font-medium text-ink/60">
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm" />
          </label>
          <label className="text-xs font-medium text-ink/60">
            {t(locale, "emailLabel")}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs font-medium text-ink/60">
            {t(locale, "chooseRole")}
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as typeof role)}
              className="mt-1 block rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm"
            >
              {(["employee", "customer", "partner"] as const).map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r][locale]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-1.5 pb-1.5 text-xs font-medium text-ink/60">
            <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
            Per E-Mail versenden
          </label>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-ink px-4 py-2 text-xs font-medium text-paper disabled:opacity-50"
          >
            {saving ? "…" : "+"}
          </button>
        </form>
      )}

      {invitees.length === 0 ? (
        <p className="mt-4 text-sm text-ink/50">
          Noch keine personalisierten Einladungen. Fügen Sie manuell Personen hinzu oder richten Sie
          oben den SAP-Mitarbeiterimport ein.
        </p>
      ) : (
        <div className="mt-4 flex flex-col divide-y divide-ink/10">
          {invitees.map((inv) => (
            <div key={inv.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <div className="text-sm font-medium text-ink">{inv.name || inv.email || "Ohne Namen"}</div>
                <div className="text-xs text-ink/50">
                  {ROLE_LABELS[inv.role][locale]}
                  {inv.department ? ` · ${inv.department}` : ""} ·{" "}
                  {inv.status === "completed" ? "beantwortet" : "ausstehend"} ·{" "}
                  {inv.source === "sap_sync" ? "aus SAP" : inv.source === "self_service" ? "Selbstregistrierung" : "manuell"}
                </div>
              </div>
              <div className="w-full max-w-xs sm:w-auto">
                <CopyField label="Persönlicher Link" value={`${origin}/invite/${inv.inviteToken}`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
