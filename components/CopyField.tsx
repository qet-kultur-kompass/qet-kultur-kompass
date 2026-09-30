"use client";

import { useState } from "react";

export function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard-API kann in manchen Umgebungen fehlen – dann bleibt nur manuelles Markieren.
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium uppercase tracking-wide text-ink/50">{label}</div>
        <div className="truncate font-mono text-sm text-ink/80">{value}</div>
      </div>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-full border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink/80 transition hover:bg-ink/5"
      >
        {copied ? "Kopiert ✓" : "Kopieren"}
      </button>
    </div>
  );
}
