"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="rounded-full px-4 py-2 text-sm font-medium text-ink/60 transition hover:bg-ink/5"
    >
      Abmelden
    </button>
  );
}
