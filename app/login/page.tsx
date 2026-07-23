"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import AuthShell from "@/components/AuthShell";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError("Wrong email or password.");
      setBusy(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <AuthShell>
      <h2 className="mb-4 text-base font-semibold text-fg">Log in</h2>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="alert-error">{error}</p>}
        <button
          className="btn-primary mt-1"
          disabled={busy || !email || !password}
        >
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        No account?{" "}
        <Link href="/signup" className="font-medium text-fg hover:underline">
          Sign up
        </Link>
      </p>
    </AuthShell>
  );
}
