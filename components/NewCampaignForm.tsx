"use client";

import { useState } from "react";
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

  const canSubmit = name.trim() && topic.trim() && !submitting;

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
