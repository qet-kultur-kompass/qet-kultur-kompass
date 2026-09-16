"use client";

import { useRouter } from "next/navigation";
import { t } from "@/lib/content/i18n";
import type { Locale } from "@/lib/content/types";

export function SelfLogoutButton({ locale = "de" }: { locale?: Locale }) {
  const router = useRouter();

  async function onClick() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-4 py-2 text-sm font-medium text-ink/60 transition hover:bg-ink/5"
    >
      {t(locale, "dashboardLogout")}
    </button>
  );
}
