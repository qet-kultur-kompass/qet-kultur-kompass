"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("E-Mail oder Passwort ist falsch.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-ink/10 bg-white/60 p-8 shadow-card"
      >
        <h1 className="font-display text-2xl font-semibold text-ink">Admin-Login</h1>
        <p className="mt-1 text-sm text-ink/60">QET Kultur-Kompass</p>

        <label className="mt-6 block text-sm font-medium text-ink/80">
          E-Mail
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-quality-500"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-ink/80">
          Passwort
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-quality-500"
          />
        </label>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-ink/90 disabled:opacity-50"
        >
          {loading ? "Anmelden …" : "Anmelden"}
        </button>
      </form>
    </main>
  );
}
