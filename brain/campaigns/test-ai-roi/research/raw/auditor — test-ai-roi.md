---
campaign: "[[test-ai-roi]]"
persona: Auditor
personaId: auditor-persona
stream: campaign
model: claude (azure)
generatedAt: 2026-07-20T14:07:00.536Z
findingCount: 8
---

# Auditor — Raw Research

## Summary

The headline number that matters: 95% of enterprise generative AI pilots deliver zero measurable P&L impact against $30-40 billion in spend, per MIT's NANDA study. But that figure has a methodology problem worth flagging to any board — it measured only direct P&L within six months off 52 interviews the report itself calls 'directionally accurate,' a phrase I do not accept as a substitute for audited numbers. The real story sits in three line items nobody puts on a keynote slide: token bills that scale with usage rather than value (Uber burned its full-year AI budget in four months; one firm hit half a billion dollars in a single month), circular vendor financing that manufactures the illusion of demand (Nvidia's up-to-$100B into OpenAI, which recycles back as GPU purchases), and shelfware — 53% to 66% of SaaS licenses sit unused, roughly $20 million wasted per enterprise per year. Bottom line: unit token costs fell 67% year over year, yet 73% of enterprises blew their AI budgets. Falling prices do not equal falling bills. Audit the utilization logs, not the pricing page.

## Findings

### 1. The widely cited '95% of AI pilots fail' figure rests on a thin, self-qualified evidence base, and executives should treat it as directional rather than audited fact.

- **Evidence:** MIT's 'The GenAI Divide' zero-return finding was based on 52 interviews the report itself admits are 'directionally accurate based on individual interviews rather than official company reporting,' measuring only direct P&L impact within six months.
- **Source:** https://www.marketingaiinstitute.com/blog/mit-study-ai-pilots
- **Why it matters:** The truth of an enterprise sits in the audited numbers, not the viral headline. A study that admits its own numbers are 'directionally accurate' is using the exact hedge I refuse to accept. The 95% figure may still be roughly right, but a CFO citing it in a budget meeting should know it rests on 52 conversations, not P&L filings.

### 2. The MIT study quantifies the spend behind the failure and shows where the ROI actually lives — not in the functions receiving most of the budget.

- **Evidence:** Despite $30-40 billion in enterprise GenAI investment, 95% of pilots delivered no measurable P&L impact; more than half of budgets went to sales and marketing tools, yet the biggest ROI was found in back-office automation.
- **Source:** https://fortune.com/2025/08/18/mit-report-95-percent-generative-ai-pilots-at-companies-failing-cfo/
- **Why it matters:** This is a capital misallocation problem, plain and simple. Money is flowing to the function with the flashiest demos and the lowest return. If you are a CFO, the audit question is whether your AI budget is aligned to where the dollars actually come back — back-office process elimination — or to where the vendor's slide deck pointed you.

### 3. Token-based pricing scales with usage, not value, and is producing catastrophic budget overruns at named Fortune 500 firms.

- **Evidence:** An AI consultant told Axios a client spent half a billion dollars in a single month after failing to cap Claude licenses; Uber exhausted its full-year 2026 AI budget in four months; Microsoft cancelled internal Claude Code licenses and Amazon shut down an internal token-consumption leaderboard.
- **Source:** https://www.axios.com/2026/05/28/ai-spending-roi-enterprise-costs
- **Why it matters:** This is the offshore-subsidiary-lease footnote of AI — the liability nobody advertises. Per-seat budgeting logic breaks completely when agents consume tokens continuously against every event. If your contract is consumption-based and you have no throttle, you have written a blank check. Pull the usage logs before you renew.

### 4. The central financial paradox of AI is that unit costs are collapsing while total bills climb, which invalidates any ROI case built on falling token prices.

- **Evidence:** Blended AI token cost fell 67% year over year — from $18.40 to $6.07 per million tokens between Q1 2025 and Q1 2026 — yet the FinOps Foundation's 2026 report found 73% of enterprises exceeded their original AI cost projections; firms routing everything to frontier models paid $18.40 per million tokens versus $2.31 for tiered architectures.
- **Source:** https://optimumpartners.com/insight/ai-token-costs-and-how-they-might-wreck-your-budget/
- **Why it matters:** Total spend equals price times volume. The vendor points at the falling price; the invoice reflects exploding volume. This is exactly the kind of gap between the headline claim and the actual line item that I look for. A tiered routing architecture cuts blended cost roughly 8x versus defaulting every query to a frontier model — that is a real, measurable margin lever a board can act on.

### 5. Agentic AI per-task economics have already surpassed the cost of offshore human labor in some functions, and providers will not pass falling costs to customers.

- **Evidence:** Bain & Company noted that agent and token costs for some business areas have already surpassed the cost of offshore human resources; Gartner predicts 90% cheaper inference by 2030 but warned the savings 'will not be fully passed on to enterprise customers.'
- **Source:** https://www.fierce-network.com/cloud/enterprise-ai-boom-comes-token-cost-trap
- **Why it matters:** The entire automation ROI thesis assumes AI is cheaper than the human it replaces. When multistep agent reasoning costs more per task than offshore labor, the math inverts. And the vendor pocketing the efficiency gains rather than passing them on means your future cost curve is set by their margin targets, not by chip improvements. Model the cost per successful task, not the cost per token.

### 6. The AI boom is propped up by circular financing that inflates apparent demand — the exact pattern that has haunted prior tech bubbles.

- **Evidence:** Nvidia agreed to invest up to $100 billion in OpenAI, which committed to deploying millions of Nvidia GPUs in return; NewStreet Research estimated every $10 billion Nvidia invests in OpenAI yields roughly $35 billion in GPU purchases or leases. OpenAI is reportedly on track to lose around $14 billion in 2026.
- **Source:** https://finance.yahoo.com/news/nvidia-100-billion-openai-investment-110000256.html
- **Why it matters:** Circular financing is not revenue. When a chipmaker funds its own customer who then buys its chips, that money can appear as a vendor's revenue, a lab's funding, and a cloud's backlog simultaneously. If you are evaluating an AI vendor's growth story, the question is what share of its revenue comes from independent end-users versus recycled investor capital. A demand shortfall tightens this loop fast — watch the infrastructure providers' debt loads and CDS spreads.

### 7. The Stargate structure shows the circularity extends across three counterparties, with a single break point that could halt the entire capital flow.

- **Evidence:** OpenAI struck a $300 billion cloud deal with Oracle, which plans to spend roughly $40 billion on about 400,000 Nvidia GB200 chips; Oracle carries a $523 billion backlog of remaining performance obligations, and if Nvidia stops funding OpenAI, OpenAI cannot pay Oracle and Oracle stops buying Nvidia chips.
- **Source:** https://tech-ish.com/2026/02/03/nvidia-openai-oracle-circular-financing-loop/
- **Why it matters:** A $523 billion backlog is only as good as the counterparty's ability to pay. This is a chain of interlocking obligations where each link depends on the last, and Oracle's cloud division already reported thinner margins than analysts expected. Any board underwriting AI infrastructure exposure needs to trace this chain and stress-test the weakest link, not take the backlog number at face value.

### 8. Over half of enterprise SaaS licenses generate zero return, and AI add-ons are quietly inflating that waste — a measurable, recoverable cost sitting on every enterprise balance sheet.

- **Evidence:** Zylo's 2026 data shows 53% of SaaS licenses are unused or underused, with the average organization wasting $19.8 million per year; Vertice's Q1 2026 data on $30 billion of processed spend found 66% of licenses are untouched or surplus, with 15% pure shelfware (zero activity).
- **Source:** https://zylo.com/blog/shelfware
- **Why it matters:** This is the cheapest ROI win available and nobody puts it on a slide. If 15% of your licenses show zero login activity and half are barely touched, you are funding shelfware while chasing new AI spend. Before approving a single new AI contract, pull the ninety-day utilization logs on what you already own — that is roughly $20 million per enterprise recoverable without buying anything.

## Data

```json
{
  "summary": "The headline number that matters: 95% of enterprise generative AI pilots deliver zero measurable P&L impact against $30-40 billion in spend, per MIT's NANDA study. But that figure has a methodology problem worth flagging to any board — it measured only direct P&L within six months off 52 interviews the report itself calls 'directionally accurate,' a phrase I do not accept as a substitute for audited numbers. The real story sits in three line items nobody puts on a keynote slide: token bills that scale with usage rather than value (Uber burned its full-year AI budget in four months; one firm hit half a billion dollars in a single month), circular vendor financing that manufactures the illusion of demand (Nvidia's up-to-$100B into OpenAI, which recycles back as GPU purchases), and shelfware — 53% to 66% of SaaS licenses sit unused, roughly $20 million wasted per enterprise per year. Bottom line: unit token costs fell 67% year over year, yet 73% of enterprises blew their AI budgets. Falling prices do not equal falling bills. Audit the utilization logs, not the pricing page.",
  "findings": [
    {
      "claim": "The widely cited '95% of AI pilots fail' figure rests on a thin, self-qualified evidence base, and executives should treat it as directional rather than audited fact.",
      "evidence": "MIT's 'The GenAI Divide' zero-return finding was based on 52 interviews the report itself admits are 'directionally accurate based on individual interviews rather than official company reporting,' measuring only direct P&L impact within six months.",
      "sourceUrl": "https://www.marketingaiinstitute.com/blog/mit-study-ai-pilots",
      "whyItMatters": "The truth of an enterprise sits in the audited numbers, not the viral headline. A study that admits its own numbers are 'directionally accurate' is using the exact hedge I refuse to accept. The 95% figure may still be roughly right, but a CFO citing it in a budget meeting should know it rests on 52 conversations, not P&L filings."
    },
    {
      "claim": "The MIT study quantifies the spend behind the failure and shows where the ROI actually lives — not in the functions receiving most of the budget.",
      "evidence": "Despite $30-40 billion in enterprise GenAI investment, 95% of pilots delivered no measurable P&L impact; more than half of budgets went to sales and marketing tools, yet the biggest ROI was found in back-office automation.",
      "sourceUrl": "https://fortune.com/2025/08/18/mit-report-95-percent-generative-ai-pilots-at-companies-failing-cfo/",
      "whyItMatters": "This is a capital misallocation problem, plain and simple. Money is flowing to the function with the flashiest demos and the lowest return. If you are a CFO, the audit question is whether your AI budget is aligned to where the dollars actually come back — back-office process elimination — or to where the vendor's slide deck pointed you."
    },
    {
      "claim": "Token-based pricing scales with usage, not value, and is producing catastrophic budget overruns at named Fortune 500 firms.",
      "evidence": "An AI consultant told Axios a client spent half a billion dollars in a single month after failing to cap Claude licenses; Uber exhausted its full-year 2026 AI budget in four months; Microsoft cancelled internal Claude Code licenses and Amazon shut down an internal token-consumption leaderboard.",
      "sourceUrl": "https://www.axios.com/2026/05/28/ai-spending-roi-enterprise-costs",
      "whyItMatters": "This is the offshore-subsidiary-lease footnote of AI — the liability nobody advertises. Per-seat budgeting logic breaks completely when agents consume tokens continuously against every event. If your contract is consumption-based and you have no throttle, you have written a blank check. Pull the usage logs before you renew."
    },
    {
      "claim": "The central financial paradox of AI is that unit costs are collapsing while total bills climb, which invalidates any ROI case built on falling token prices.",
      "evidence": "Blended AI token cost fell 67% year over year — from $18.40 to $6.07 per million tokens between Q1 2025 and Q1 2026 — yet the FinOps Foundation's 2026 report found 73% of enterprises exceeded their original AI cost projections; firms routing everything to frontier models paid $18.40 per million tokens versus $2.31 for tiered architectures.",
      "sourceUrl": "https://optimumpartners.com/insight/ai-token-costs-and-how-they-might-wreck-your-budget/",
      "whyItMatters": "Total spend equals price times volume. The vendor points at the falling price; the invoice reflects exploding volume. This is exactly the kind of gap between the headline claim and the actual line item that I look for. A tiered routing architecture cuts blended cost roughly 8x versus defaulting every query to a frontier model — that is a real, measurable margin lever a board can act on."
    },
    {
      "claim": "Agentic AI per-task economics have already surpassed the cost of offshore human labor in some functions, and providers will not pass falling costs to customers.",
      "evidence": "Bain & Company noted that agent and token costs for some business areas have already surpassed the cost of offshore human resources; Gartner predicts 90% cheaper inference by 2030 but warned the savings 'will not be fully passed on to enterprise customers.'",
      "sourceUrl": "https://www.fierce-network.com/cloud/enterprise-ai-boom-comes-token-cost-trap",
      "whyItMatters": "The entire automation ROI thesis assumes AI is cheaper than the human it replaces. When multistep agent reasoning costs more per task than offshore labor, the math inverts. And the vendor pocketing the efficiency gains rather than passing them on means your future cost curve is set by their margin targets, not by chip improvements. Model the cost per successful task, not the cost per token."
    },
    {
      "claim": "The AI boom is propped up by circular financing that inflates apparent demand — the exact pattern that has haunted prior tech bubbles.",
      "evidence": "Nvidia agreed to invest up to $100 billion in OpenAI, which committed to deploying millions of Nvidia GPUs in return; NewStreet Research estimated every $10 billion Nvidia invests in OpenAI yields roughly $35 billion in GPU purchases or leases. OpenAI is reportedly on track to lose around $14 billion in 2026.",
      "sourceUrl": "https://finance.yahoo.com/news/nvidia-100-billion-openai-investment-110000256.html",
      "whyItMatters": "Circular financing is not revenue. When a chipmaker funds its own customer who then buys its chips, that money can appear as a vendor's revenue, a lab's funding, and a cloud's backlog simultaneously. If you are evaluating an AI vendor's growth story, the question is what share of its revenue comes from independent end-users versus recycled investor capital. A demand shortfall tightens this loop fast — watch the infrastructure providers' debt loads and CDS spreads."
    },
    {
      "claim": "The Stargate structure shows the circularity extends across three counterparties, with a single break point that could halt the entire capital flow.",
      "evidence": "OpenAI struck a $300 billion cloud deal with Oracle, which plans to spend roughly $40 billion on about 400,000 Nvidia GB200 chips; Oracle carries a $523 billion backlog of remaining performance obligations, and if Nvidia stops funding OpenAI, OpenAI cannot pay Oracle and Oracle stops buying Nvidia chips.",
      "sourceUrl": "https://tech-ish.com/2026/02/03/nvidia-openai-oracle-circular-financing-loop/",
      "whyItMatters": "A $523 billion backlog is only as good as the counterparty's ability to pay. This is a chain of interlocking obligations where each link depends on the last, and Oracle's cloud division already reported thinner margins than analysts expected. Any board underwriting AI infrastructure exposure needs to trace this chain and stress-test the weakest link, not take the backlog number at face value."
    },
    {
      "claim": "Over half of enterprise SaaS licenses generate zero return, and AI add-ons are quietly inflating that waste — a measurable, recoverable cost sitting on every enterprise balance sheet.",
      "evidence": "Zylo's 2026 data shows 53% of SaaS licenses are unused or underused, with the average organization wasting $19.8 million per year; Vertice's Q1 2026 data on $30 billion of processed spend found 66% of licenses are untouched or surplus, with 15% pure shelfware (zero activity).",
      "sourceUrl": "https://zylo.com/blog/shelfware",
      "whyItMatters": "This is the cheapest ROI win available and nobody puts it on a slide. If 15% of your licenses show zero login activity and half are barely touched, you are funding shelfware while chasing new AI spend. Before approving a single new AI contract, pull the ninety-day utilization logs on what you already own — that is roughly $20 million per enterprise recoverable without buying anything."
    }
  ],
  "error": null
}
```

