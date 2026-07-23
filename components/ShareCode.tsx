"use client";

import { useState } from "react";

export default function ShareCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — the code is still visible to copy manually */
    }
  }

  return (
    <button
      onClick={copy}
      title="Copy — share this so teammates can join"
      className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-surface-2 px-3 py-1.5 text-xs text-muted transition hover:text-fg"
    >
      <span className="text-faint">Join code</span>
      <span className="font-mono font-medium text-fg">{code}</span>
      <span className="text-faint">{copied ? "copied ✓" : "copy"}</span>
    </button>
  );
}
