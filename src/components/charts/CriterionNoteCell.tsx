"use client";

import { useState } from "react";
import { t } from "@/lib/content/i18n";
import type { Locale } from "@/lib/content/types";

export interface CriterionNoteValue {
  text: string;
  done: boolean;
}

/**
 * Persönliches Notiz-/Todo-Element für EIN Kriterium: ein eckiges Kästchen
 * zum Abhaken ("erledigt") plus ein Stift-Icon, das einen kleinen
 * Text-Editor für eine formlose Notiz öffnet. Nur sichtbar, wenn die Person
 * eingeloggt ist (siehe `notesEnabled` in CriterionBars) – auf den
 * anonymen/öffentlichen Ansichten (Umfrage-Link, Firmen-Dashboard) gibt es
 * keine feste Identität, an die eine Notiz gehängt werden könnte.
 */
export function CriterionNoteCell({
  criterionId,
  name,
  note,
  locale,
  onToggleDone,
  onSaveText,
}: {
  criterionId: string;
  name: string;
  note: CriterionNoteValue | undefined;
  locale: Locale;
  onToggleDone: (next: boolean) => void;
  onSaveText: (text: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note?.text ?? "");

  const done = note?.done ?? false;
  const text = note?.text ?? "";

  function openEditor() {
    setDraft(text);
    setEditing(true);
  }

  function save() {
    onSaveText(draft.trim());
    setEditing(false);
  }

  function cancel() {
    setDraft(text);
    setEditing(false);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          role="checkbox"
          aria-checked={done}
          aria-label={t(locale, "criterionNoteDoneAria", { name })}
          onClick={() => onToggleDone(!done)}
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border transition ${
            done ? "border-ink bg-ink" : "border-ink/30 bg-white hover:border-ink/60"
          }`}
        >
          {done && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
              <path d="M1.5 5.2L4 7.7L8.5 2.3" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <button
          type="button"
          onClick={openEditor}
          aria-label={t(locale, "criterionNoteEditAria", { name })}
          className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
        >
          <svg width="12" height="12" viewBox="0 0 15 15" fill="none" className="shrink-0 text-ink/40" aria-hidden>
            <path
              d="M11 2l2 2-7.5 7.5-2.6.6.6-2.6L11 2z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className={`truncate text-xs ${text ? "text-ink/70" : "text-ink/35 italic"}`}>
            {text || t(locale, "criterionNoteEmpty")}
          </span>
        </button>
      </div>

      {editing && (
        <div className="rounded-lg border border-ink/15 bg-white p-2 shadow-card">
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t(locale, "criterionNotePlaceholder")}
            rows={3}
            className="w-full resize-none rounded-md border border-ink/10 bg-paper/40 p-2 text-xs text-ink outline-none focus:border-quality-500"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={cancel}
              className="rounded-full px-3 py-1 text-[11px] font-medium text-ink/50 transition hover:text-ink"
            >
              {t(locale, "criterionNoteCancel")}
            </button>
            <button
              type="button"
              onClick={save}
              className="rounded-full bg-ink px-3 py-1 text-[11px] font-medium text-paper transition hover:bg-ink/90"
            >
              {t(locale, "criterionNoteSave")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
