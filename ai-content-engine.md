# Product Requirements Document
## AI Content Engine
**Autonomous, self-improving research → storyline → drafting → calendar pipeline for B2B campaign content**

| Field | Detail |
|---|---|
| **Status** | Draft — V1 build in progress |
| **Owner** | GTM / Marketing |
| **Last updated** | July 20, 2026 |
| **Build environment** | Claude Code · Next.js (app UI + orchestration) · Anthropic API (Claude) + Gemini API as the V1 model backbone |
| **Related doc** | AI Content Engine — System Design & Architecture Report |

---

## 1. Overview

The AI Content Engine is an autonomous, self-improving content production system that takes a campaign brief and carries it end-to-end — research, storyline, drafting, scheduling, and publishing — for B2B content aimed at Fortune 500 decision-makers (CEOs, CFOs, CXOs).

It is being built in Claude Code, using the Anthropic API and the Gemini API, with an Obsidian-based knowledge base acting as the system's persistent "brain" — the shared memory that every phase reads from and writes back to.

This PRD documents the full product as designed across all five phases, and defines the V1 release scope, functional requirements, success metrics, and risks for the initial build.

*Figure 1. End-to-end system overview — all five phases, feeding back into the knowledge base.*

---

## 2. Problem Statement

The team needs to produce more content — at higher and more consistent quality — without a proportional increase in manual hours. Today, research, drafting, and quality-checking are manual and sequential, which caps output volume and makes quality dependent on whoever happens to be writing that day.

There's also no systematic source validation before content gets built on top of research, which is a quality and credibility risk given the ICP: senior executives who will notice weak or unsupported claims.

---

## 3. Goals & Objectives

- Increase content output volume without sacrificing quality.
- Standardize research validation so every piece is built on checked sources.
- Reduce manual drafting time with a disciplined, repeatable multi-pass writing process instead of ad hoc editing.
- Run a fixed weekly content rhythm (campaign + informative content) instead of ad hoc scheduling.
- Build a system that improves over time by learning from what performs and what doesn't, instead of starting from zero on every campaign.

---

## 4. Success Metrics

Primary success signal is a combination of output volume and quality of that output — not volume at the cost of quality, and not quality at the cost of volume.

| Metric | What it tells us |
|---|---|
| Pieces of content produced per week vs. current manual baseline | Whether volume actually increased |
| % of drafts approved with light / no human rework at Draft 3 | Whether quality holds without heavy manual cleanup |
| Source validation catch rate | Whether the fact-check layer is doing its job, not rubber-stamping |
| Time from campaign brief → published piece | Whether the full cycle compresses, not just the writing step |
| Calendar fill rate (both factories, no collisions) | Whether the weekly rhythm runs without manual patching |

**Secondary metric (post-V1):** downstream engagement/performance of published content, once there's enough volume to compare against historical baselines — this becomes a primary input once the Phase 5 feedback loop is built.

---

## 5. Target Users

**Primary user:** the marketing/GTM team producing campaign and informative content for Fortune 500 / C-suite audiences. This is an internal tool. Whether it's offered externally is a later decision, outside this PRD.

**End audience the content is built for (ICP):** Fortune 500 companies and senior decision-makers — CEOs, CFOs, and other CXOs. This ICP is baked into every research persona's instructions, not just applied at the editing stage.

---

## 6. Scope

### 6.1 Already in place

- 5 of the 10 research personas are written and ready to drop into the Brain. The remaining personas and the source-validation persona are still to be added. The pipeline is built folder-driven, so it runs with whatever personas exist at run time — no code change to add the rest.
- Knowledge base architecture (Obsidian) is designed — this is the system's "brain," where validated research, drafts, and outcomes will live.

### 6.2 V1 scope

V1 covers the full working pipeline through publishing readiness — Phases 0 through 4 — built in simplified form where it speeds up delivery. The feedback loop (Phase 5) and full design-system automation are fast-follows, not because they don't matter, but because they depend on V1 actually running first and producing outcomes to learn from.

- Phase 0 — Campaign input
- Phase 1 — Market research (10 personas + validation gate)
- The Brain — Obsidian knowledge base wired in as the synthesis layer
- Phase 2 — Storyline generation with human chat-revision loop
- Phase 3 — Three-draft pipeline + final adversarial fact-check
- Phase 4 — Content calendar: weekly rhythm scheduler + dual-factory system (campaign 70% / informative 30%)

### 6.3 V2 / fast-follow (not in V1)

- Full design system automation (image/carousel/video asset generation) — V1 hands off approved copy manually for now; noted in the source architecture as its own brand-consistency scope.
- Phase 5 — fully automated self-improving feedback loop (engagement-based retrieval, critic scoring). V1 logs outcomes manually into the knowledge base; automated retrieval/critique comes once there's enough data to learn from.
- Publishing automation to platforms — V1 output is approved, platform-ready copy; posting stays manual.
- Any external/client-facing version of the tool.

---

## 7. Functional Requirements

### 7.1 Phase 0 — Campaign Input

- User submits campaign details (topic, objective, constraints) in the app and presses **Market Research** to kick off Phase 1.
- Brief persists and is referenced at every downstream approval gate (research, storyline, each draft) to keep output on-tangent.

### 7.2 Phase 1 — Market Research Engine

- Triggered when the user presses **Market Research** on a submitted campaign.
- Personas run **fully in parallel and independent** — no persona reads, waits on, or depends on another. Each researches the same input through its own personality, so outputs genuinely diverge (like handing the same brief to different researchers).
- The orchestrator is **folder-driven / count-agnostic**: it runs whatever persona files exist in the Brain at run time. Adding or removing a persona is a file change, not a code change.
- **Seven campaign-based personas** research the topic itself: AI-specialist, CFO, CEO, CXO/operations, technical-buyer, competitor-analysis, and regulatory/risk lenses.
- **Three scout personas** research the broader landscape — trending AI / ROI topics, social conversation, competitor posting patterns. Scout research is **not required to tie to the specific campaign**; its job is to keep the account current, which is why it is kept as a separate stream.
- **Source-validation is the only shared step.** After all personas finish, a single validation pass source-checks and citation-checks the research. It is implemented as a **no-fluff rules file** (`brain/rules/source-check.md`), not a character persona — a strict protocol the model executes identically every time. It runs **per stream** — harder source-checking on the campaign stream, a plausibility/recency check on the scout stream.
- On a bad source the validator **strips the individual claim**, it does not kill the persona's whole contribution. It has explicit authority to send research back, not just flag.
- **Research-quality rules (so output is useful, not vague):** every claim must carry a real source URL or it is stripped; personas return structured findings (claim → specific evidence such as a figure / named company / date → source → why it matters through that persona's lens); generic filler is banned; personas do multi-step (agentic) research rather than one-shot queries.
- Output is **two validated files written into the Brain**: one campaign research base (from the 7 campaign personas) and one scout research base (from the 3 scouts). The campaign base feeds Phase 2 storyline; the scout base feeds Phase 4 calendar / factories.
- **Research is displayed to the user as a human approval gate before Phase 2.** By default the user sees the **two synthesized research bases** (campaign + scout). They can optionally **drill into the individual per-persona findings** to audit why a claim is there — supporting the "useful, verifiable, not vague" priority. From here the user approves (→ Phase 2 storyline) or sends research back.

*Figure 2. The parallel persona research layer with its shared validation gate producing two research bases, displayed to the user for approval.*

### 7.3 Phase 2 — Storyline Generation

- System generates a villain → hero → conclusion narrative arc from validated research — not full copy.
- Human can approve as-is or redirect via a conversational, chat-style revision loop before drafting starts.
- Target: a human can approve or redirect a storyline in under 3 turns.

### 7.4 Phase 3 — Three-Step Drafting Pipeline

- Draft 1: generated from the approved storyline, invoking the system's Claude Skills and personas.
- Draft 2: validation + tone/style check; writing principles enforced — KISS, Occam's Razor, Omit Needless Words, One Idea per Sentence.
- Draft 3: final pass for clarity, accuracy, and brand voice.
- Final fact-check: adversarial bot stress-tests the finished copy (e.g. "why would someone forward this to their team?") before it's marked release-ready.
- Each draft stage has a human approve/reject gate; rejection sends work back to the appropriate earlier step, not just a flag.

*Figure 3. Storyline approval feeding the three-draft loop and final fact-check.*

### 7.5 Phase 4 — Content Calendar & Dual-Factory System

- Weekly rhythm scheduler: a fixed calendar mapping day → content type → platform, driven by a config file rather than hard-coded logic.
- Factory 1 (Campaign, ~70%): atomizes the approved hero piece into reusable stat/story fragments, rewrites them per platform and angle, then runs them back through the three-draft loop.
- Factory 2 (Informative, ~30%): scout personas monitor trending AI and industry topics to generate content that keeps the account active between campaign beats, also run through the three-draft loop.
- Both factories populate the same calendar without collision — this is the V1 exit criteria for this phase.
- Approved copy scheduled for a visual platform (LinkedIn/Instagram) is handed off for design — manual handoff in V1, automated design system in V2.

*Figure 4. The weekly rhythm scheduler driving two parallel content factories.*

### 7.6 The Brain — Knowledge Base

- Stores validated research, storylines, drafts, and (V2) outcomes.
- Feeds Phase 2 storyline generation and, in V2, feeds Phase 5 retrieval.
- Built on Obsidian for V1; architecture already designed.
- **Brain-level (shared across campaigns):** `personas/campaign-based/` + `personas/scouts/` (research personas), `rules/` (e.g. `source-check.md`, writing principles), `agents/`, `system/`.
- **Per-campaign (dynamic — one self-contained folder per campaign, created at run time):**

```
campaigns/<campaign>/
├── campaigndetails.md              # Phase 0 brief
├── research/
│   ├── raw/                        # per-persona findings, readable names (doctor.md, feed.md, ...)
│   ├── master/
│   │   ├── campaign-research-base.md   # synthesized from the 7 campaign personas
│   │   └── scout-research-base.md      # synthesized from the 3 scouts
│   └── validation-log.md          # what source-check stripped/flagged + why
├── storyline/storyline.md
├── drafts/ (draft1.md · draft2.md · final.md)
├── channels/ (LinkedIn · Instagram · Website · X)
├── content-calendar/ (subtopics/ · content)
└── feedback/ (goodoutput · badoutput)
```

- The system is **multi-campaign**: `campaigns/` holds many self-contained campaign folders with no cross-campaign collision; only Brain-level personas/rules are shared.

### 7.7 Phase 5 — Self-Improving Feedback Loop (V2)

Documented here for completeness since it's core to the product vision, but scheduled for V2 once V1 has produced enough real outcomes to learn from.

- Published content is evaluated — by a human, a multi-agent critique step, or real-world engagement data — and the outcome (good or bad, with reasons) is recorded.
- Memory / knowledge base stores every research base, draft, and outcome.
- Critic step checks whether sources were real and whether the piece actually matched the ICP.
- Feedback signal distills what worked and what failed into a reusable signal.
- Retrieval surfaces the most relevant past precedent for the next generation cycle, closing the loop back into the Brain.

*Figure 5. The continuous feedback loop connecting publication back to research (V2).*

---

## 8. Non-Functional / Technical Notes

| Layer | Recommended tool / model |
|---|---|
| Orchestration | Claude Code as build environment; a Next.js app (UI + API routes) sequences the phases, holds state, and writes results into the Brain. |
| Campaign personas (7) | Anthropic API (Claude) with a web-search tool — deep executive / business reasoning grounded in real sources. |
| Scout personas (3) | Gemini API with Google Search grounding — recency, trends, and social awareness. |
| Source validation / fact-check | Anthropic API (Claude) with a strict, narrow, conservative system prompt — skeptical by design; re-checks every cited URL. Ideally a different model than generated the claim, so it doesn't share the writer's blind spots. |
| Storyline + drafting | Anthropic API (Claude) as primary writer, invoking custom Claude Skills. |
| Tone / style / writing-principles pass | Anthropic API, separate call with a dedicated editing-only system prompt so it never introduces new claims. |
| Design system (V2) | Dedicated image-generation API (FLUX.2-pro available; also Gemini image models); Claude writes the creative brief, the image model renders it. Not used in V1 research. |
| Memory / knowledge base | Obsidian for V1 (architecture already designed); revisit vector DB (pgvector/Chroma) if V2 retrieval needs outgrow it. |
| Scheduling / calendar | Rules engine (day → type → platform) driven by a config file, invoked by the orchestrator each cycle. |

- Keep every persona's system prompt narrow and role-specific — a CFO persona should only ever answer as a CFO would; this keeps the Phase 1 aggregation step manageable.
- Treat the source-validation persona and final fact-check bot as guardrails, not formalities — give them explicit authority to send work backward.
- Version every storyline and draft in the knowledge base with its outcome, so V2 retrieval can surface concrete precedent rather than generic advice.
- Build the weekly rhythm as configuration, not hard-coded logic, so the day/type/platform mix can be tuned without touching the pipeline.
- V1 model backbone is **Claude + Gemini only**. DeepSeek-V4-Pro, Kimi-K2.6, and FLUX.2-pro API keys are available but deliberately parked — adding models with uncertain web-search support buys risk, not research quality, at this stage.
- Ensure every research persona has a grounding path (native web search or a shared search tool) so it returns real, checkable sources. "Useful, not vague" is enforced by citation-per-claim + structured output + anti-filler rules, not by model choice alone.
- Build the research orchestrator folder-driven: it runs whatever persona files exist in the Brain, so personas can be added or swapped without code changes.

---

## 9. Assumptions & Dependencies

- Research personas (already built) can be reused as-is inside the new pipeline without a rebuild.
- Obsidian knowledge base architecture is stable enough to wire into Phases 1–4 without redesign mid-build.
- Anthropic API and Gemini API access/credentials are available for the full build.
- V1 is judged on internal use and internal review — no external client involved at this stage.

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Delivery pressure is tight for a 10-persona + 3-draft + calendar pipeline | Reuse already-built personas and knowledge base architecture; V2 items (feedback loop, full design automation) are explicitly deferred |
| Source-validation gate becomes a rubber stamp under time pressure | Keep its system prompt narrow and conservative; give it explicit reject/send-back authority; track catch rate as a metric |
| Quality drops as volume increases | Success metric is explicitly volume and quality together; Draft 3 rework rate is a tripwire |
| Two factories collide on the same calendar slot | Weekly rhythm built as config-driven rules, tested against exit criteria: both factories populate the calendar without collision |
| Knowledge base (Obsidian) hits scaling limits once the Phase 5 feedback loop is added | Flagged as an open decision, not solved in V1 — revisit before building Phase 5 |

---

## 11. Open Questions

- How many approval gates (storyline, Draft 1/2/3, calendar) stay human-in-the-loop long-term vs. auto-approve once the system has a track record?
- What does "good quality" get measured against once there's enough volume to review — a rubric, or comparison to current manually-written content?
- When does the full design system get scoped — immediately after V1, or after a full campaign cycle proves out Phases 0–4?
- Vector DB vs. continuing with Obsidian — decide once Phase 5 is actually being built, based on data volume at that point.