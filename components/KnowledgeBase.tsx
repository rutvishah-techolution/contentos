"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { KnowledgeDoc } from "@/lib/knowledge";

export default function KnowledgeBase({
  initialDocs,
}: {
  initialDocs: KnowledgeDoc[];
}) {
  const router = useRouter();
  const [docs, setDocs] = useState<KnowledgeDoc[]>(initialDocs);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/knowledge", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Failed on ${file.name}`);
        setDocs((cur) => [data.doc, ...cur.filter((d) => d.id !== data.doc.id)]);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function del(id: string) {
    const res = await fetch(`/api/knowledge/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDocs((cur) => cur.filter((d) => d.id !== id));
      router.refresh();
    }
  }

  return (
    <aside className="flex flex-col">
      <h2 className="mb-3 text-sm font-medium text-muted">Knowledge base</h2>
      <div className="card">
        <p className="text-xs text-faint">
          Company docs, decks, meeting transcripts. Stored in the Brain and used to
          ground every campaign.
        </p>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.txt,.md"
          className="hidden"
          onChange={(e) => upload(e.target.files)}
        />
        <button
          className="btn-ghost mt-3 w-full"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          {busy ? "Uploading…" : "+ Upload document"}
        </button>
        <p className="mt-2 text-center text-[11px] text-faint">PDF, DOCX, TXT, MD</p>

        {error && <p className="alert-error mt-3">{error}</p>}

        {docs.length > 0 && (
          <ul className="mt-4 flex flex-col divide-y divide-border border-t border-border">
            {docs.map((d) => (
              <li
                key={d.id}
                className="group flex items-center justify-between gap-2 py-2.5"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm text-fg">{d.title}</span>
                  <span className="text-[11px] uppercase text-faint">
                    {d.type} · {(d.chars / 1000).toFixed(0)}k chars
                  </span>
                </span>
                <button
                  onClick={() => del(d.id)}
                  title="Remove"
                  className="shrink-0 text-faint opacity-0 transition hover:text-warn group-hover:opacity-100"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
