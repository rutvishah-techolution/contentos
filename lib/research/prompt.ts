import { Campaign } from "@/lib/brain";
import { Finding, Stream } from "@/lib/research/types";
import { DigestItem } from "@/lib/integrations/digest";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * The persona file IS the system prompt. We append the research task, the
 * anti-vagueness / citation / recency rules, and the required JSON output shape.
 */
export function buildSystemPrompt(personaContent: string): string {
  const date = today();
  const year = date.slice(0, 4);
  return `${personaContent.trim()}

────────────────────────────────────────
YOU ARE NOW RESEARCHING.
You are the persona described above. Research the topic entirely through that
persona's lens, priorities, and voice. Two researchers given the same brief
should diverge — lean fully into who you are.

NON-NEGOTIABLE RESEARCH RULES (so the output is useful, not vague):
1. Use web_search. Ground every claim in a real, current, resolvable source.
2. Every claim must carry a real source URL. No URL → do not include the claim.
3. sourceUrl MUST be the actual published article URL on the publisher's own
   domain (e.g. https://www.reuters.com/...). NEVER output a redirect, search,
   google, or vertexaisearch URL.
4. Today is ${date}. Strongly prefer sources from the last 3–6 months. Treat
   anything before ${year} as background only, unless genuinely foundational.
5. Be specific — every claim needs a hard figure, a named company/person/body,
   or a dated event. Ban generic filler like "AI is transforming business."
6. Prefer PRIMARY sources: the original report/study, the company's own
   announcement, an official filing, or a top-tier outlet (Reuters, Bloomberg,
   MIT, Gartner, HBR). Do NOT cite an SEO/vendor blog that merely restates a
   statistic — track down and cite whoever reported it first.
7. Do multi-step research: search, follow up, verify — not one shallow pass.
8. Stay in character. "Why it matters" must reflect THIS persona's priorities.`;
}

export function buildUserPrompt(
  campaign: Campaign,
  stream: Stream,
  digest: DigestItem[] = [],
  feedback = "",
): string {
  const brief = `CAMPAIGN BRIEF
Campaign: ${campaign.name}
Topic: ${campaign.topic}
Objective: ${campaign.objective}${
    campaign.icp ? `\nTarget ICP (who this must land with): ${campaign.icp}` : ""
  }${campaign.constraints ? `\nConstraints: ${campaign.constraints}` : ""}`;

  const revision = feedback
    ? `\n\n⚠️ REVISION NOTE FROM THE HUMAN REVIEWER — the previous research was sent back for this reason. Address it directly this time:\n"${feedback}"\n`
    : "";

  const task =
    stream === "campaign"
      ? `Research this campaign topic in depth, through your persona's lens.`
      : `You are a SCOUT. Research the broader current AI / industry landscape
relevant to this space — trends, notable launches, what's landing socially,
ROI signals. You do NOT need to tie strictly to the campaign; surface what
keeps an account current and interesting. Use the brief only as context.`;

  return `${brief}${revision}

${task}
${digestBlock(digest)}
Return ONLY a JSON object (no prose before or after, no code fences) with this shape:
{
  "summary": "3-5 sentence synthesis of your key takeaways, in your voice",
  "findings": [
    {
      "claim": "a specific, defensible claim",
      "evidence": "the hard figure / named entity / date that backs it",
      "sourceUrl": "https://real-publisher-domain/actual-article",
      "sourceTitle": "the exact headline/title of the article you are citing",
      "whyItMatters": "why this matters through your persona's lens"
    }
  ]
}
Aim for 5-8 strong findings. Quality and specificity over quantity.`;
}

/** A trusted, pre-verified block from the internal digest, if any items match. */
function digestBlock(digest: DigestItem[]): string {
  if (!digest.length) return "\n";
  const lines = digest.map((d) => {
    const notes = d.keyNotes?.length
      ? ` — ${d.keyNotes.slice(0, 2).join(" ")}`
      : d.summary
        ? ` — ${d.summary}`
        : "";
    return `- [${d.date}] ${d.headline} (${d.source}) ${d.url}${notes}`;
  });
  return `
VERIFIED DIGEST — pre-checked, current items from our internal AI intelligence feed.
These sources are already validated: you may cite them directly with their URLs
and treat them as trusted. Use them as grounding IN ADDITION to your own web_search.
${lines.join("\n")}
`;
}

/** Extracts the findings JSON from a model response, tolerant of stray prose. */
export function parseResearch(text: string): {
  summary: string;
  findings: Finding[];
} {
  const json = extractJson(text);
  if (!json) return { summary: "", findings: [] };

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { summary: "", findings: [] };
  }

  const obj = parsed as { summary?: unknown; findings?: unknown };
  const summary = typeof obj.summary === "string" ? obj.summary : "";
  const findings: Finding[] = Array.isArray(obj.findings)
    ? obj.findings
        .map((f) => f as Record<string, unknown>)
        .filter((f) => typeof f.claim === "string")
        .map((f) => ({
          claim: String(f.claim || ""),
          evidence: String(f.evidence || ""),
          sourceUrl: String(f.sourceUrl || ""),
          sourceTitle: f.sourceTitle ? String(f.sourceTitle) : undefined,
          whyItMatters: String(f.whyItMatters || ""),
        }))
    : [];

  return { summary, findings };
}

function extractJson(text: string): string | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return candidate.slice(start, end + 1);
}
