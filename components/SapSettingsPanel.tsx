"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SapSystemType = "successfactors" | "s4hana" | "";
type SapAuthMode = "oauth2_client_credentials" | "basic_auth" | "";

export interface SapSettingsInitial {
  sapEnabled: boolean;
  sapSystemType: string | null;
  sapTenantUrl: string | null;
  sapAuthMode: string | null;
  sapClientId: string | null;
  sapCompanyId: string | null;
  sapExportEnabled: boolean;
  sapExportWebhookUrl: string | null;
  sapSsoEnabled: boolean;
  sapSsoIssuerUrl: string | null;
  sapSsoClientId: string | null;
  sapLastSyncAt: string | null;
  sapLastExportAt: string | null;
}

export function SapSettingsPanel({ companyId, initial }: { companyId: string; initial: SapSettingsInitial }) {
  const router = useRouter();
  const [open, setOpen] = useState(initial.sapEnabled);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [sapEnabled, setSapEnabled] = useState(initial.sapEnabled);
  const [sapSystemType, setSapSystemType] = useState<SapSystemType>((initial.sapSystemType as SapSystemType) || "");
  const [sapTenantUrl, setSapTenantUrl] = useState(initial.sapTenantUrl ?? "");
  const [sapAuthMode, setSapAuthMode] = useState<SapAuthMode>(
    (initial.sapAuthMode as SapAuthMode) || "oauth2_client_credentials"
  );
  const [sapClientId, setSapClientId] = useState(initial.sapClientId ?? "");
  const [sapClientSecret, setSapClientSecret] = useState("");
  const [sapCompanyId, setSapCompanyId] = useState(initial.sapCompanyId ?? "");

  const [sapExportEnabled, setSapExportEnabled] = useState(initial.sapExportEnabled);
  const [sapExportWebhookUrl, setSapExportWebhookUrl] = useState(initial.sapExportWebhookUrl ?? "");
  const [sapExportWebhookSecret, setSapExportWebhookSecret] = useState("");

  const [sapSsoEnabled, setSapSsoEnabled] = useState(initial.sapSsoEnabled);
  const [sapSsoIssuerUrl, setSapSsoIssuerUrl] = useState(initial.sapSsoIssuerUrl ?? "");
  const [sapSsoClientId, setSapSsoClientId] = useState(initial.sapSsoClientId ?? "");
  const [sapSsoClientSecret, setSapSsoClientSecret] = useState("");

  async function save() {
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/companies/${companyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sapEnabled,
        sapSystemType,
        sapTenantUrl,
        sapAuthMode,
        sapClientId,
        sapClientSecret: sapClientSecret || undefined,
        sapCompanyId,
        sapExportEnabled,
        sapExportWebhookUrl,
        sapExportWebhookSecret: sapExportWebhookSecret || undefined,
        sapSsoEnabled,
        sapSsoIssuerUrl,
        sapSsoClientId,
        sapSsoClientSecret: sapSsoClientSecret || undefined,
      }),
    });
    setSaving(false);
    setSapClientSecret("");
    setSapExportWebhookSecret("");
    setSapSsoClientSecret("");
    if (res.ok) {
      setMessage("Gespeichert.");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setMessage(data.message || "Speichern fehlgeschlagen.");
    }
  }

  async function triggerSync() {
    setSyncing(true);
    setMessage(null);
    const res = await fetch(`/api/companies/${companyId}/sap/sync`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setSyncing(false);
    setMessage(
      res.ok
        ? `Sync erfolgreich: ${data.imported} neu, ${data.updated} aktualisiert.`
        : data.message || "SAP-Sync fehlgeschlagen."
    );
    router.refresh();
  }

  async function triggerExport() {
    setExporting(true);
    setMessage(null);
    const res = await fetch(`/api/companies/${companyId}/sap/export`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setExporting(false);
    setMessage(res.ok ? "Export erfolgreich gesendet." : data.message || "SAP-Export fehlgeschlagen.");
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-medium text-ink/70 transition hover:bg-ink/5"
      >
        SAP-Integration einrichten
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ink">SAP-Integration</h2>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-ink/40 hover:text-ink/70">
          Einklappen
        </button>
      </div>
      <p className="mt-1 text-xs text-ink/50">
        Jede Firma hat ihr eigenes SAP-System – Zugangsdaten werden verschlüsselt gespeichert und nie
        im Klartext angezeigt.
      </p>

      {/* Mitarbeiterimport */}
      <fieldset className="mt-5 border-t border-ink/10 pt-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          <input type="checkbox" checked={sapEnabled} onChange={(e) => setSapEnabled(e.target.checked)} />
          Mitarbeiterimport aktivieren
        </label>
        {initial.sapLastSyncAt && (
          <p className="mt-1 text-xs text-ink/40">
            Letzter Sync: {new Date(initial.sapLastSyncAt).toLocaleString("de-DE")}
          </p>
        )}
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="System">
            <select
              value={sapSystemType}
              onChange={(e) => setSapSystemType(e.target.value as SapSystemType)}
              className="qet-input"
            >
              <option value="">– wählen –</option>
              <option value="successfactors">SAP SuccessFactors</option>
              <option value="s4hana">SAP S/4HANA</option>
            </select>
          </Field>
          <Field label="Auth-Methode">
            <select value={sapAuthMode} onChange={(e) => setSapAuthMode(e.target.value as SapAuthMode)} className="qet-input">
              <option value="oauth2_client_credentials">OAuth2 Client Credentials</option>
              <option value="basic_auth">Basic Auth (API-User)</option>
            </select>
          </Field>
          <Field label="Tenant-URL">
            <input
              value={sapTenantUrl}
              onChange={(e) => setSapTenantUrl(e.target.value)}
              placeholder="https://<tenant>.successfactors.eu"
              className="qet-input"
            />
          </Field>
          <Field label="SF Company ID (optional)">
            <input value={sapCompanyId} onChange={(e) => setSapCompanyId(e.target.value)} className="qet-input" />
          </Field>
          <Field label="Client-ID / API-User">
            <input value={sapClientId} onChange={(e) => setSapClientId(e.target.value)} className="qet-input" />
          </Field>
          <Field label="Client-Secret / Passwort">
            <input
              type="password"
              value={sapClientSecret}
              onChange={(e) => setSapClientSecret(e.target.value)}
              placeholder={initial.sapClientId ? "unverändert lassen = leer" : ""}
              className="qet-input"
            />
          </Field>
        </div>
        <button
          type="button"
          onClick={triggerSync}
          disabled={syncing || !sapEnabled}
          className="mt-3 rounded-full border border-ink/15 px-4 py-2 text-xs font-medium text-ink/70 transition hover:bg-ink/5 disabled:opacity-40"
        >
          {syncing ? "Synchronisiert …" : "Jetzt synchronisieren"}
        </button>
      </fieldset>

      {/* Export */}
      <fieldset className="mt-5 border-t border-ink/10 pt-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            checked={sapExportEnabled}
            onChange={(e) => setSapExportEnabled(e.target.checked)}
          />
          Ergebnis-Export nach SAP aktivieren
        </label>
        {initial.sapLastExportAt && (
          <p className="mt-1 text-xs text-ink/40">
            Letzter Export: {new Date(initial.sapLastExportAt).toLocaleString("de-DE")}
          </p>
        )}
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Ziel-Webhook-URL (SAP-Middleware)">
            <input
              value={sapExportWebhookUrl}
              onChange={(e) => setSapExportWebhookUrl(e.target.value)}
              placeholder="https://…/qet-kpi-import"
              className="qet-input"
            />
          </Field>
          <Field label="Webhook-Secret (HMAC-Signatur)">
            <input
              type="password"
              value={sapExportWebhookSecret}
              onChange={(e) => setSapExportWebhookSecret(e.target.value)}
              placeholder={initial.sapExportWebhookUrl ? "unverändert lassen = leer" : ""}
              className="qet-input"
            />
          </Field>
        </div>
        <button
          type="button"
          onClick={triggerExport}
          disabled={exporting || !sapExportEnabled}
          className="mt-3 rounded-full border border-ink/15 px-4 py-2 text-xs font-medium text-ink/70 transition hover:bg-ink/5 disabled:opacity-40"
        >
          {exporting ? "Exportiert …" : "Jetzt exportieren"}
        </button>
      </fieldset>

      {/* SSO */}
      <fieldset className="mt-5 border-t border-ink/10 pt-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          <input type="checkbox" checked={sapSsoEnabled} onChange={(e) => setSapSsoEnabled(e.target.checked)} />
          Login über SAP (SSO) für Einladungslinks verlangen
        </label>
        <p className="mt-1 text-xs text-ink/40">
          Bestätigt nur die Teilnahmeberechtigung – die gespeicherten Antworten bleiben anonym.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="IAS Issuer-URL">
            <input
              value={sapSsoIssuerUrl}
              onChange={(e) => setSapSsoIssuerUrl(e.target.value)}
              placeholder="https://<tenant>.accounts.ondemand.com"
              className="qet-input"
            />
          </Field>
          <Field label="Client-ID">
            <input value={sapSsoClientId} onChange={(e) => setSapSsoClientId(e.target.value)} className="qet-input" />
          </Field>
          <Field label="Client-Secret">
            <input
              type="password"
              value={sapSsoClientSecret}
              onChange={(e) => setSapSsoClientSecret(e.target.value)}
              placeholder={initial.sapSsoClientId ? "unverändert lassen = leer" : ""}
              className="qet-input"
            />
          </Field>
        </div>
      </fieldset>

      {message && <p className="mt-4 text-sm text-ink/70">{message}</p>}

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="mt-5 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-paper transition hover:bg-ink/90 disabled:opacity-50"
      >
        {saving ? "Speichert …" : "SAP-Einstellungen speichern"}
      </button>

      <style jsx>{`
        .qet-input {
          margin-top: 0.25rem;
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgba(33, 29, 23, 0.15);
          background: white;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .qet-input:focus {
          border-color: #3d54b0;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-ink/60">
      {label}
      {children}
    </label>
  );
}
