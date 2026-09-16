"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewCompanyForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, contactName, contactEmail }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Firma konnte nicht angelegt werden. Bitte Angaben prüfen.");
      return;
    }
    setName("");
    setContactName("");
    setContactEmail("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition hover:bg-ink/90"
      >
        + Neue Firma anlegen
      </button>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-md rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-card"
    >
      <h2 className="font-display text-lg font-semibold text-ink">Neue Firma anlegen</h2>
      <label className="mt-4 block text-sm font-medium text-ink/80">
        Firmenname *
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-quality-500"
        />
      </label>
      <label className="mt-3 block text-sm font-medium text-ink/80">
        Ansprechpartner (optional)
        <input
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-quality-500"
        />
      </label>
      <label className="mt-3 block text-sm font-medium text-ink/80">
        E-Mail (optional)
        <input
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-quality-500"
        />
      </label>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <div className="mt-5 flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition hover:bg-ink/90 disabled:opacity-50"
        >
          {loading ? "Wird angelegt …" : "Anlegen"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full px-5 py-2.5 text-sm font-medium text-ink/60 hover:bg-ink/5"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}
