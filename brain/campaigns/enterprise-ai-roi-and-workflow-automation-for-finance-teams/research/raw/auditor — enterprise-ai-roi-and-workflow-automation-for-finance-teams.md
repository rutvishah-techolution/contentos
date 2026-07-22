---
campaign: "[[enterprise-ai-roi-and-workflow-automation-for-finance-teams]]"
persona: Auditor
personaId: auditor-persona
stream: campaign
model: claude
generatedAt: 2026-07-22T11:32:42.232Z
findingCount: 8
---

# Auditor — Raw Research

## Summary

The numbers say the AI 'value gap' is now a spread between a thin frontier and a flat median: the top 1% of firms spend $7,449 per employee per month while the median spends $11.38 — roughly a 680x gap that is not evidence of ROI, only of spend. On the return side, MIT's NANDA data shows 95% of enterprise generative-AI pilots deliver zero measurable P&L impact, and Gartner expects over 40% of agentic projects canceled by end-2027 on escalating cost and unclear value. The real audit risk sits in two footnotes CFOs skip: procurement waste (30-40% of Copilot seats unused within 90 days; ~51% of SaaS licenses idle) and cost quality — agentic workflows now cost ~$1.20 per interaction versus $0.04 in 2023, so token spend scales non-linearly and blew through Uber's 2026 AI budget by April. Meanwhile the vendors selling the tools are entangled in $800B+ of circular financing, where the same money loops chipmaker-to-lab-to-cloud, inflating apparent demand. The finance-team ROI that survives is narrow, workflow-level, and measurable — Singular Bank's 60-90 minutes saved per banker per day is the shape of a defensible line item; a keynote valuation is not.

## Findings

### 1. The gap between the heaviest AI adopters and the typical firm is a spending gap, not a proven-return gap: top-1% firms spend roughly $7,449 per employee per month while the median spends $11.38 — about 680x apart.

- **Evidence:** Ramp AI Index (June 10, 2026): top 1% ~$7,449/employee/month; median $11.38; ~680x gap; drawn from transaction data of 70,000+ businesses; power-user spend grew 14.1% month-over-month.
- **Source:** https://ramp.com/data/ai-index-june-2026
- **Why it matters:** A CFO cannot benchmark 'competitive' against the $7,500 headline without knowing that figure describes the top 1% and says nothing about return. The median firm spends the cost of one seat. Before matching frontier spend, pull your own utilization logs — the gap to justify is ROI, not budget.

### 2. 95% of enterprise generative-AI pilots deliver zero measurable P&L impact, despite $30-40 billion in enterprise investment; only about 5% reach production with measurable value.

- **Evidence:** MIT NANDA 'The GenAI Divide: State of AI in Business 2025' — 95% of pilots show no measurable P&L impact; based on 300 public deployments, 52 interviews, 153 executive surveys; failure attributed to integration and workflow, not model quality.
- **Source:** https://finance.yahoo.com/news/mit-report-95-generative-ai-105412686.html
- **Why it matters:** This is the footnote on page 34. The keynote sells transformation; the data shows 19 of every 20 pilots produce no earnings movement. The differentiator was not the vendor — it was whether AI was redesigned into the workflow versus bolted onto it. Ask for the P&L line before renewing, not the demo.

### 3. Procurement waste is the fastest recoverable line item: 30-40% of Copilot licenses go unused within the first 90 days, and roughly 51% of enterprise SaaS licenses sit idle, wasting an average enterprise ~$18 million annually.

- **Evidence:** Microsoft 365 Copilot at ~$30/user/month with 30-40% of seats unused in 90 days (EPC Group, June 2026); ~51% of SaaS licenses unused and ~$18M average annual waste per enterprise (Varisource, 2026).
- **Source:** https://www.varisource.com/blog/eliminate-unused-software-licenses-guide
- **Why it matters:** This is the audit I run first because it is pure recovery. If 60% of your AI keys show zero login activity at 90 days, you are not scaling — you are funding shelfware. Reclaim inactive seats before the next renewal cycle and reallocate; the recovered budget funds the pilots that actually work.

### 4. AI cost does not scale linearly with 'cheap tokens': an orchestrated agentic workflow now costs roughly $1.20 per interaction versus about $0.04 in 2023 — a ~30x jump — and this consumption pattern is exhausting AI budgets ahead of schedule.

- **Evidence:** Per interaction cost rose from ~$0.04 (2023 linear workflow) to ~$1.20 (2026 agentic system), ~30x; Microsoft found engineers spending $500-$2,000/month on Claude Code tokens; Uber exhausted its entire 2026 AI coding budget by April.
- **Source:** https://thenextweb.com/news/ai-pilled-firms-7500-per-employee-spending
- **Why it matters:** Vendors quote the sticker price per token; the invoice arrives priced per orchestrated workflow. When query volume jumps from ten thousand to one million, unit margins move against you unless you instrument end-to-end consumption. Track marginal cost per completed task, not per API call, and set spend caps before deployment — not after the overage.

### 5. Over 40% of agentic AI projects will be canceled by end of 2027 due to escalating costs, unclear business value, and inadequate risk controls — and much of what is sold as 'agentic' is rebranded chatbots ('agent washing').

- **Evidence:** Gartner forecast: >40% of agentic AI projects canceled by end-2027; only ~130 of thousands of self-described agentic vendors are 'real'; based on a poll of 3,412 attendees; reaffirmed in 2026 coverage.
- **Source:** https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027
- **Why it matters:** 'Agent washing' is the workslop of procurement — a feature update dressed as autonomy. Before signing, make the vendor demonstrate autonomous multi-step completion and a named override switch. If the 'agent' cannot do that, you are paying an agentic premium for a chatbot. Contract on measurable task completion, not the label.

### 6. The AI vendors selling these tools are entangled in over $800 billion of circular financing, where a chip or cloud supplier invests in an AI lab that immediately spends the money buying the supplier's products — inflating apparent demand.

- **Evidence:** 2026 analyses estimate $800B+ in circular arrangements; Nvidia announced up to $100B into OpenAI, which committed spend to Nvidia chips; OpenAI struck a reported $300B Oracle cloud deal; OpenAI reportedly on track to lose ~$14B in 2026; by Q1 2026 investors are demanding 'clean' revenue not tied to internal subsidies.
- **Source:** https://blockeden.xyz/blog/2026/03/06/ai-circular-financing-loop-vendor-financing/
- **Why it matters:** This is the Hype Bubble Meeting at industry scale — circular financing is not revenue. The deciding factor is how much cash comes from outside the circle. It matters to a buyer because a vendor propped up by round-tripped capital and losing $14B a year carries continuity risk: pricing, support, and roadmap can all reprice if the loop tightens. Diversify providers and avoid deep lock-in.

### 7. The AI ROI that survives audit is narrow, workflow-level, and time-quantified: Singular Bank's internal assistant saves bankers 60-90 minutes per day on meeting prep, portfolio analysis, and follow-up.

- **Evidence:** Singular Bank built an assistant on ChatGPT and Codex saving bankers 60-90 minutes daily (OpenAI, May 7, 2026); BBVA separately scaled ChatGPT Enterprise to 100,000 employees (June 12, 2026), though measurable ROI is not yet disclosed.
- **Source:** https://openai.com/index/singular-bank
- **Why it matters:** This is the shape of a defensible line item: a specific task, a measured time saving, a countable population. Sixty to ninety minutes per banker per day converts directly to overhead you can put on the balance sheet. Contrast BBVA's 100,000-seat headline — impressive scale, but until ROI is disclosed it is a deployment metric, not a return. Fund the tools that reduce measured cost on the floor; audit the rest at renewal.

### 8. Organizations capture less than one-third of the expected value from digital investments because they start with technology capabilities rather than customer needs — a failure mode that maps directly onto bolted-on AI.

- **Evidence:** McKinsey research cited by MIT Technology Review (May 12, 2026): organizations capture less than one-third of expected value from digital investments, largely from leading with technology capabilities instead of customer outcomes.
- **Source:** https://www.technologyreview.com/2026/05/11/1136967/fostering-breakthrough-ai-innovation-through-customer-back-engineering/
- **Why it matters:** This is the same discrepancy MIT's 95% figure exposes, stated as a value-capture ratio. Companies that buy the capability first and hunt for a use case second forfeit two-thirds of the projected return. The audit recommendation follows directly: fund AI against a redesigned workflow with a named owner and a target metric, or expect the same value shortfall the McKinsey data predicts.

## Data

```json
{
  "summary": "The numbers say the AI 'value gap' is now a spread between a thin frontier and a flat median: the top 1% of firms spend $7,449 per employee per month while the median spends $11.38 — roughly a 680x gap that is not evidence of ROI, only of spend. On the return side, MIT's NANDA data shows 95% of enterprise generative-AI pilots deliver zero measurable P&L impact, and Gartner expects over 40% of agentic projects canceled by end-2027 on escalating cost and unclear value. The real audit risk sits in two footnotes CFOs skip: procurement waste (30-40% of Copilot seats unused within 90 days; ~51% of SaaS licenses idle) and cost quality — agentic workflows now cost ~$1.20 per interaction versus $0.04 in 2023, so token spend scales non-linearly and blew through Uber's 2026 AI budget by April. Meanwhile the vendors selling the tools are entangled in $800B+ of circular financing, where the same money loops chipmaker-to-lab-to-cloud, inflating apparent demand. The finance-team ROI that survives is narrow, workflow-level, and measurable — Singular Bank's 60-90 minutes saved per banker per day is the shape of a defensible line item; a keynote valuation is not.",
  "findings": [
    {
      "claim": "The gap between the heaviest AI adopters and the typical firm is a spending gap, not a proven-return gap: top-1% firms spend roughly $7,449 per employee per month while the median spends $11.38 — about 680x apart.",
      "evidence": "Ramp AI Index (June 10, 2026): top 1% ~$7,449/employee/month; median $11.38; ~680x gap; drawn from transaction data of 70,000+ businesses; power-user spend grew 14.1% month-over-month.",
      "sourceUrl": "https://ramp.com/data/ai-index-june-2026",
      "sourceTitle": "How much does it cost to be AI-pilled?",
      "whyItMatters": "A CFO cannot benchmark 'competitive' against the $7,500 headline without knowing that figure describes the top 1% and says nothing about return. The median firm spends the cost of one seat. Before matching frontier spend, pull your own utilization logs — the gap to justify is ROI, not budget."
    },
    {
      "claim": "95% of enterprise generative-AI pilots deliver zero measurable P&L impact, despite $30-40 billion in enterprise investment; only about 5% reach production with measurable value.",
      "evidence": "MIT NANDA 'The GenAI Divide: State of AI in Business 2025' — 95% of pilots show no measurable P&L impact; based on 300 public deployments, 52 interviews, 153 executive surveys; failure attributed to integration and workflow, not model quality.",
      "sourceUrl": "https://finance.yahoo.com/news/mit-report-95-generative-ai-105412686.html",
      "sourceTitle": "MIT report: 95% of generative AI pilots at companies are failing",
      "whyItMatters": "This is the footnote on page 34. The keynote sells transformation; the data shows 19 of every 20 pilots produce no earnings movement. The differentiator was not the vendor — it was whether AI was redesigned into the workflow versus bolted onto it. Ask for the P&L line before renewing, not the demo."
    },
    {
      "claim": "Procurement waste is the fastest recoverable line item: 30-40% of Copilot licenses go unused within the first 90 days, and roughly 51% of enterprise SaaS licenses sit idle, wasting an average enterprise ~$18 million annually.",
      "evidence": "Microsoft 365 Copilot at ~$30/user/month with 30-40% of seats unused in 90 days (EPC Group, June 2026); ~51% of SaaS licenses unused and ~$18M average annual waste per enterprise (Varisource, 2026).",
      "sourceUrl": "https://www.varisource.com/blog/eliminate-unused-software-licenses-guide",
      "sourceTitle": "Eliminate Unused Software Licenses: 2026 Guide to ROI",
      "whyItMatters": "This is the audit I run first because it is pure recovery. If 60% of your AI keys show zero login activity at 90 days, you are not scaling — you are funding shelfware. Reclaim inactive seats before the next renewal cycle and reallocate; the recovered budget funds the pilots that actually work."
    },
    {
      "claim": "AI cost does not scale linearly with 'cheap tokens': an orchestrated agentic workflow now costs roughly $1.20 per interaction versus about $0.04 in 2023 — a ~30x jump — and this consumption pattern is exhausting AI budgets ahead of schedule.",
      "evidence": "Per interaction cost rose from ~$0.04 (2023 linear workflow) to ~$1.20 (2026 agentic system), ~30x; Microsoft found engineers spending $500-$2,000/month on Claude Code tokens; Uber exhausted its entire 2026 AI coding budget by April.",
      "sourceUrl": "https://thenextweb.com/news/ai-pilled-firms-7500-per-employee-spending",
      "sourceTitle": "The most AI-obsessed companies spend $7,500 per employee per month. The median spends $11.",
      "whyItMatters": "Vendors quote the sticker price per token; the invoice arrives priced per orchestrated workflow. When query volume jumps from ten thousand to one million, unit margins move against you unless you instrument end-to-end consumption. Track marginal cost per completed task, not per API call, and set spend caps before deployment — not after the overage."
    },
    {
      "claim": "Over 40% of agentic AI projects will be canceled by end of 2027 due to escalating costs, unclear business value, and inadequate risk controls — and much of what is sold as 'agentic' is rebranded chatbots ('agent washing').",
      "evidence": "Gartner forecast: >40% of agentic AI projects canceled by end-2027; only ~130 of thousands of self-described agentic vendors are 'real'; based on a poll of 3,412 attendees; reaffirmed in 2026 coverage.",
      "sourceUrl": "https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027",
      "sourceTitle": "Gartner Predicts Over 40% of Agentic AI Projects Will Be Canceled by End of 2027",
      "whyItMatters": "'Agent washing' is the workslop of procurement — a feature update dressed as autonomy. Before signing, make the vendor demonstrate autonomous multi-step completion and a named override switch. If the 'agent' cannot do that, you are paying an agentic premium for a chatbot. Contract on measurable task completion, not the label."
    },
    {
      "claim": "The AI vendors selling these tools are entangled in over $800 billion of circular financing, where a chip or cloud supplier invests in an AI lab that immediately spends the money buying the supplier's products — inflating apparent demand.",
      "evidence": "2026 analyses estimate $800B+ in circular arrangements; Nvidia announced up to $100B into OpenAI, which committed spend to Nvidia chips; OpenAI struck a reported $300B Oracle cloud deal; OpenAI reportedly on track to lose ~$14B in 2026; by Q1 2026 investors are demanding 'clean' revenue not tied to internal subsidies.",
      "sourceUrl": "https://blockeden.xyz/blog/2026/03/06/ai-circular-financing-loop-vendor-financing/",
      "sourceTitle": "The Great AI Circular Financing Loop: When Vendors Fund Their Own Customers",
      "whyItMatters": "This is the Hype Bubble Meeting at industry scale — circular financing is not revenue. The deciding factor is how much cash comes from outside the circle. It matters to a buyer because a vendor propped up by round-tripped capital and losing $14B a year carries continuity risk: pricing, support, and roadmap can all reprice if the loop tightens. Diversify providers and avoid deep lock-in."
    },
    {
      "claim": "The AI ROI that survives audit is narrow, workflow-level, and time-quantified: Singular Bank's internal assistant saves bankers 60-90 minutes per day on meeting prep, portfolio analysis, and follow-up.",
      "evidence": "Singular Bank built an assistant on ChatGPT and Codex saving bankers 60-90 minutes daily (OpenAI, May 7, 2026); BBVA separately scaled ChatGPT Enterprise to 100,000 employees (June 12, 2026), though measurable ROI is not yet disclosed.",
      "sourceUrl": "https://openai.com/index/singular-bank",
      "sourceTitle": "Singular Bank helps bankers move fast with ChatGPT and Codex",
      "whyItMatters": "This is the shape of a defensible line item: a specific task, a measured time saving, a countable population. Sixty to ninety minutes per banker per day converts directly to overhead you can put on the balance sheet. Contrast BBVA's 100,000-seat headline — impressive scale, but until ROI is disclosed it is a deployment metric, not a return. Fund the tools that reduce measured cost on the floor; audit the rest at renewal."
    },
    {
      "claim": "Organizations capture less than one-third of the expected value from digital investments because they start with technology capabilities rather than customer needs — a failure mode that maps directly onto bolted-on AI.",
      "evidence": "McKinsey research cited by MIT Technology Review (May 12, 2026): organizations capture less than one-third of expected value from digital investments, largely from leading with technology capabilities instead of customer outcomes.",
      "sourceUrl": "https://www.technologyreview.com/2026/05/11/1136967/fostering-breakthrough-ai-innovation-through-customer-back-engineering/",
      "sourceTitle": "Fostering breakthrough AI innovation through customer-back engineering",
      "whyItMatters": "This is the same discrepancy MIT's 95% figure exposes, stated as a value-capture ratio. Companies that buy the capability first and hunt for a use case second forfeit two-thirds of the projected return. The audit recommendation follows directly: fund AI against a redesigned workflow with a named owner and a target metric, or expect the same value shortfall the McKinsey data predicts."
    }
  ],
  "error": null
}
```

