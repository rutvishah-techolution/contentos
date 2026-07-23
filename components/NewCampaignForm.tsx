"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewCampaignForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [objective, setObjective] = useState("");
  const [icp, setIcp] = useState("");
  const [constraints, setConstraints] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractNote, setExtractNote] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const canSubmit = name.trim() && topic.trim() && !submitting;

  async function extractFromDoc(file: File | undefined) {
    if (!file) return;
    setExtracting(true);
    setError(null);
    setExtractNote(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/campaigns/extract", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't read that document.");
      const b = data.brief;
      if (b.name) setName(b.name);
      if (b.topic) setTopic(b.topic);
      if (b.objective) setObjective(b.objective);
      if (b.icp) setIcp(b.icp);
      if (b.constraints) setConstraints(b.constraints);
      setExtractNote(`Filled from ${file.name} — review and edit before creating.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't read that document.");
    } finally {
      setExtracting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, topic, objective, icp, constraints }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create campaign.");
      router.push(`/campaigns/${data.campaign.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* upload-a-brief shortcut */}
      <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-border bg-surface-2 px-4 py-3">
        <div className="min-w-0">
          <div className="text-sm font-medium text-fg">
            Have a brief document?
          </div>
          <div className="text-xs text-faint">
            Upload a PDF or DOC and we&rsquo;ll auto-fill the form.
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt,.md"
          className="hidden"
          onChange={(e) => extractFromDoc(e.target.files?.[0])}
        />
        <button
          type="button"
          className="btn-ghost shrink-0"
          onClick={() => fileRef.current?.click()}
          disabled={extracting}
        >
          {extracting ? "Reading…" : "Upload brief"}
        </button>
      </div>
      {extractNote && (
        <p className="rounded-lg bg-surface-2 px-3 py-2 text-xs text-ok">
          {extractNote}
        </p>
      )}

      <Field label="Campaign name" hint="A short name for this campaign." required>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Q3 CFO AI-ROI Push"
          className="input"
          autoFocus
        />
      </Field>

      <Field label="What it's about" hint="The topic to research." required>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. AI adoption and ROI in enterprise finance teams"
          rows={2}
          className="input resize-none"
        />
      </Field>

      <Field label="Objective" hint="What should this content achieve?">
        <textarea
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          placeholder="e.g. Position us as the trusted voice for CFOs evaluating AI spend, and drive demo requests."
          rows={2}
          className="input resize-none"
        />
      </Field>

      <Field
        label="Target ICP"
        hint="Who must this land with? Roles, seniority, company profile."
      >
        <textarea
          value={icp}
          onChange={(e) => setIcp(e.target.value)}
          placeholder="e.g. CFOs and VP Finance at Fortune 500 companies evaluating AI tooling."
          rows={2}
          className="input resize-none"
        />
      </Field>

      <Field label="Constraints" hint="Anything to avoid or must-haves. Optional.">
        <textarea
          value={constraints}
          onChange={(e) => setConstraints(e.target.value)}
          placeholder="e.g. No competitor names. Keep claims defensible."
          rows={2}
          className="input resize-none"
        />
      </Field>

      {error && <p className="alert-error">{error}</p>}

      <button type="submit" disabled={!canSubmit} className="btn-primary mt-1">
        {submitting ? "Creating campaign…" : "Create campaign"}
      </button>
    </form>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-baseline gap-2">
        <span className="text-sm font-medium text-fg">{label}</span>
        {required && <span className="text-xs text-accent">required</span>}
      </span>
      {hint && <span className="text-xs text-faint">{hint}</span>}
      {children}
    </label>
  );
}
