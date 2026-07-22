# ContentOS

An autonomous, self-improving content engine for B2B campaigns. It takes a
campaign brief and carries it through **research → storyline → drafting**, aimed
at Fortune 500 / C-suite audiences. Built with Next.js on top of an Obsidian
vault (`brain/`) that acts as the system's shared knowledge base.

## What it does

```
Campaign brief
  → Market Research  — 10 expert personas research in parallel (Claude/Gemini/Grok),
                       pull from a verified daily news digest, and every claim is
                       source-checked. Output: two verified research bases + a
                       source Index.
  → Storyline        — one campaign "spine" + a flagship longform and one distinct
                       angle per channel, each owned by a persona. Chat-with-memory
                       revision + human approval.
  → Drafting         — 3-draft pipeline (write → edit → humanize) + a fact-trace
                       guard that checks every figure against the research.
```

Every stage is grounded strictly in the approved research (no hallucinated
facts), and every stage has a human approve / send-back gate.

## The Brain (Obsidian vault)

`brain/` is an Obsidian vault — open it in Obsidian to browse everything:

```
brain/
├── personas/           the research personas (campaign-based + scouts)
│   ├── campaign-based/  Auditor, Doctor, Policy Insider
│   └── scouts/          Feed, Interviewer, AI-for-Humans
├── rules/              source-check.md (the validation rules)
├── writing/            storyline structure, content angles, format rules,
│                       craft rules, reader psychology, brand context, humanizer
├── reference/digest/   snapshot of the verified daily news digest
└── campaigns/          one self-contained folder per campaign (created at runtime)
```

Personas are **folder-driven** — drop a new `.md` into `personas/` and it's picked
up on the next run, no code change.

## Prerequisites

- Node.js 20+ (developed on 22)
- Access to: Azure AI Foundry (Claude + Grok), Google Vertex AI (Gemini),
  and the daily news-digest repo (read-only)

## Setup

```bash
git clone https://github.com/rutvishah-techolution/ContentOS.git
cd ContentOS
npm install
cp .env.example .env      # then fill in real values (see below)
# place your Google service-account JSON at ./gcp-service-account.json
npm run dev               # http://localhost:3000
```

## Environment variables

Copy `.env.example` to `.env` and fill in real values. **Never commit `.env` or
`gcp-service-account.json`** — they're gitignored.

| Variable | What it's for |
|---|---|
| `AZURE_AI_FOUNDRY_ENDPOINT` / `AZURE_AI_FOUNDRY_API_KEY` | Claude (Azure Foundry, Anthropic passthrough) |
| `AZURE_CLAUDE_DEPLOYMENT` | Claude deployment name (e.g. `claude-opus-4-8`) |
| `AZURE_GROK_FOUNDRY_ENDPOINT` / `AZURE_GROK_FOUNDRY_API_KEY` | Grok (Azure Foundry, OpenAI-compatible) |
| `GOOGLE_APPLICATION_CREDENTIALS` | path to the GCP service-account JSON |
| `GCP_PROJECT_ID` / `GCP_LOCATION` | Vertex AI (Gemini + grounding) |
| `DIGEST_REPO_PATH` | local path to the daily news-digest repo |

## How it works (the short version)

- **Models per persona** — each persona declares its model in frontmatter
  (`model: claude | gemini | grok`). A router dispatches to the right client.
- **Grounding** — campaign personas web-search (Claude native / Gemini grounding /
  a hybrid for Grok); everything is then source-checked deterministically.
- **Anti-hallucination** — storyline + drafting run with **no web search**; they
  reason only over the approved research, and a fact-trace guard flags any figure
  that doesn't trace back to it.

## Notes

- Secrets live only in `.env` / `gcp-service-account.json` (never committed).
- The Brain is safe to edit in Obsidian; the app reads it live.
