---
campaign: "[[test-ai-roi]]"
topic: Test AI ROI
generatedAt: 2026-07-20T14:27:58.364Z
---

# Source Validation Log

Record of what the source-check stripped or flagged, and why. Feeds the source-validation catch-rate metric.

## Campaign stream

- Verified: **4** · Flagged: **15** · Stripped: **5**

- **FLAG** — The widely cited '95% of AI pilots fail' figure rests on a thin, self-qualified evidence base, and executives should treat it as directional rather than audited fact.
  - Persona: Auditor
  - Reason: Source resolves and matches the debunking angle but is a marketing/blog outlet; snippet doesn't confirm the specific 52-interview or 'directionally accurate' quote.
  - Source: https://www.marketingaiinstitute.com/blog/mit-study-ai-pilots

- **FLAG** — The MIT study quantifies the spend behind the failure and shows where the ROI actually lives — not in the functions receiving most of the budget.
  - Persona: Auditor
  - Reason: Reputable outlet resolves and headline supports the 95% figure, but snippet does not confirm the $30-40B, sales/marketing-budget, or back-office specifics.
  - Source: https://fortune.com/2025/08/18/mit-report-95-percent-generative-ai-pilots-at-companies-failing-cfo/

- **STRIP** — Token-based pricing scales with usage, not value, and is producing catastrophic budget overruns at named Fortune 500 firms.
  - Persona: Auditor
  - Reason: Source returns HTTP 403 and is not reachable; cannot verify the half-billion-dollar or named-firm claims.
  - Source: https://www.axios.com/2026/05/28/ai-spending-roi-enterprise-costs

- **STRIP** — The central financial paradox of AI is that unit costs are collapsing while total bills climb, which invalidates any ROI case built on falling token prices.
  - Persona: Auditor
  - Reason: Snippet shows a vendor product page unrelated to the specific figures (67%, $18.40/$6.07, 73% FinOps); source does not support the precise claims.
  - Source: https://optimumpartners.com/insight/ai-token-costs-and-how-they-might-wreck-your-budget/

- **STRIP** — Agentic AI per-task economics have already surpassed the cost of offshore human labor in some functions, and providers will not pass falling costs to customers.
  - Persona: Auditor
  - Reason: Source returns HTTP 403 (Cloudflare block); cannot verify Bain or Gartner claims.
  - Source: https://www.fierce-network.com/cloud/enterprise-ai-boom-comes-token-cost-trap

- **FLAG** — The AI boom is propped up by circular financing that inflates apparent demand — the exact pattern that has haunted prior tech bubbles.
  - Persona: Auditor
  - Reason: Yahoo Finance resolves and headline supports the $100B Nvidia-OpenAI investment, but snippet does not confirm the NewStreet $35B ratio or $14B 2026 loss figures.
  - Source: https://finance.yahoo.com/news/nvidia-100-billion-openai-investment-110000256.html

- **FLAG** — The Stargate structure shows the circularity extends across three counterparties, with a single break point that could halt the entire capital flow.
  - Persona: Auditor
  - Reason: Source resolves and topic matches the circular-financing loop, but it is a regional tech blog and snippet doesn't confirm the $300B, $40B, or $523B backlog figures.
  - Source: https://tech-ish.com/2026/02/03/nvidia-openai-oracle-circular-financing-loop/

- **FLAG** — Over half of enterprise SaaS licenses generate zero return, and AI add-ons are quietly inflating that waste — a measurable, recoverable cost sitting on every enterprise balance sheet.
  - Persona: Auditor
  - Reason: Zylo (vendor) shelfware page resolves but is a self-interested source; snippet does not confirm the 53%, $19.8M, or Vertice 66%/15% figures.
  - Source: https://zylo.com/blog/shelfware

- **FLAG** — A peer-reviewed real-world evidence review found that while AI scribes cut self-reported documentation time, physician productivity measured by billing was unchanged and standardized burnout scores were unaffected.
  - Persona: Doctor
  - Reason: JMIR URL resolves but returns a JS/robot-check page (202); underlying content not visible to confirm burnout/billing findings.
  - Source: https://ai.jmir.org/2025/1/e76743

- **STRIP** — Some health systems have documented concrete, large AI returns in 2025, including a Mount Sinai malnutrition-detection tool generating roughly $20 million in revenue impact and Nebraska Medicine cutting length of stay by 5%, equivalent to 37 added inpatient beds.
  - Persona: Doctor
  - Reason: Becker's returns HTTP 403 and content is inaccessible; cannot verify Mount Sinai $20M or Nebraska 37-bed figures.
  - Source: https://www.beckershospitalreview.com/healthcare-information-technology/ai/700-lives-100m-saved-healthcare-ai-roi-in-25/

- **FLAG** — Roughly 78-80% of healthcare AI projects never deliver their intended value or never reach production, a rate that has not improved despite record investment.
  - Persona: Doctor
  - Reason: Vendor blog resolves with matching headline but aggregates multiple third-party stats (RAND/McKinsey, IDC, MIT) not verifiable in snippet; weak single source.
  - Source: https://nirmitee.io/blog/why-80-percent-healthcare-ai-projects-fail-pilot-technical-post-mortem/

- **FLAG** — Field deployments fail on physical reality the demo hides: one AI imaging tool rejected 21% of real-world images as unusable due to poor lighting and lower resolution, and required cloud upload that slowed clinic throughput.
  - Persona: Doctor
  - Reason: GeekyAnts blog resolves but is a low-authority vendor source; snippet does not confirm the 21% image-rejection figure.
  - Source: https://geekyants.com/blog/why-healthcare-ai-initiatives-fail-before-they-reach-clinical-impact

- **FLAG** — Poor interoperability costs the US healthcare system an estimated $30 billion annually, and claim denials tied to data errors cost hospitals roughly $20 billion a year.
  - Persona: Doctor
  - Reason: Medesk vendor page resolves but only restates figures attributed to Health Affairs/iFive; primary sources not verifiable and snippet lacks the numbers.
  - Source: https://www.medesk.net/en/blog/ehr-interoperability-solutions/

- **FLAG** — Roughly 95% of generative AI pilots deliver zero measurable P&L impact, but the failure is structural — enterprises buy the technology before deciding how they will capture and evidence its value.
  - Persona: Policy Insider
  - Reason: Vendor blog resolves and cites the MIT 95% figure, but it is a secondary self-interested source; snippet doesn't confirm the 300+ initiatives detail.
  - Source: https://www.ellvero.com/insights/ai-roi-in-2026-why-95-percent-of-pilots-fail-and-how-to-measure-what-matters

- **STRIP** — The core problem in testing AI ROI is that most projects launch with no agreed definition of success and no validation of the ROI they were approved on.
  - Persona: Policy Insider
  - Reason: Vendor blog cites specific 61%/73% 'MIT Sloan' stats not confirmable in snippet; attribution to MIT Sloan via a marketing blog is unverifiable and likely misattributed.
  - Source: https://www.sthambh.com/blog/ai-roi-measurement-enterprise

- **FLAG** — Measuring adoption instead of business outcomes is the most common ROI-testing error, and the majority of organizations do not measure returns on technology investment at all.
  - Persona: Policy Insider
  - Reason: Terminal-X blog resolves and confirms the 95% MIT figure in snippet, but the Bank Director 82% and Morgan Stanley 21% claims are not confirmed and rely on a secondary source.
  - Source: https://www.terminal-x.ai/research/ai-roi-in-2026-why-most-enterprise-ai-fails-and-what-actually-works

- **FLAG** — The single largest determinant of whether an AI ROI test succeeds is problem selection and time horizon, not model quality — and single-year ROI math systematically produces misleading answers.
  - Persona: Policy Insider
  - Reason: Vendor blog resolves but the illustrative figures are the author's framing, not audited facts; a read, not a fact.
  - Source: https://www.sthambh.com/blog/ai-roi-measurement-enterprise

- **FLAG** — The clearest large-scale example of a disciplined, defensible AI ROI test uses control-group benchmarking against a target set years in advance — proving that credible ROI is designed before the spend.
  - Persona: Policy Insider
  - Reason: CDOTrends resolves with matching DBS billion-dollar AI headline, but snippet doesn't confirm the SGD 1B/S$370M figures or control-group methodology.
  - Source: https://www.cdotrends.com/story/4914/dbs-banks-billion-dollar-ai-dream-realized

- **FLAG** — Public-sector AI increasingly bypasses procurement entirely — through free pilots, donated software, and shadow AI — which removes the very oversight point where ROI and accountability should be tested.
  - Persona: Policy Insider
  - Reason: Open Contracting Partnership source resolves and matches the 'side doors' theme, but snippet doesn't confirm the Palantir/New Orleans case or £573M UK figure.
  - Source: https://www.open-contracting.org/2025/11/10/the-surprising-shifts-in-how-the-public-sector-is-buying-ai-and-what-policymakers-can-do-about-it/

- **FLAG** — The 'test AI ROI' problem is being amplified by hidden and scattered costs, meaning most organizations underestimate their true AI spend before they even attempt to measure return.
  - Persona: Policy Insider
  - Reason: Vendor blog resolves but the '2-4x more spend' is anecdotal advisor framing and the S&P 42% stat is unconfirmed in snippet; a read, not a fact.
  - Source: https://www.ellvero.com/insights/ai-roi-in-2026-why-95-percent-of-pilots-fail-and-how-to-measure-what-matters

## Scout stream

- Verified: **1** · Flagged: **14** · Stripped: **5**

- **STRIP** — Enterprise AI adoption reached 88% in 2025, with nearly nine out of ten organizations using AI in at least one business function.
  - Persona: Ai For Humans
  - Reason: Source URL returns 404 and does not resolve.
  - Source: https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEthq2mbAAPjWV6rofuisGwJhAsNS2apco_N_d6BuqRX1GOYkgSTRLHovPbVHFtbK_4yylKUnjEBZelENbUxRDznnQmHAU4GP9X55wHsyiwjgM4u7q700QpZRl-Ev-9aI8s8-tQdHEj0W48Xx4bAYOXZfAbu1Fx8hIbTfKQwW02QU0rmOb5eh0

- **FLAG** — Despite high adoption, only 5% of enterprises are seeing substantial AI ROI, with 35% reporting partial returns.
  - Persona: Ai For Humans
  - Reason: Source resolves and title matches the 5% ROI claim, but it is a vendor blog (marketing content), a read not a fact.
  - Source: https://masterofcode.com/blog/ai-roi

- **STRIP** — Worldwide end-user spending on AI models and platforms is projected to total $64 billion in 2026, a 63.4% increase from 2025.
  - Persona: Ai For Humans
  - Reason: Source URL returns 404 and does not resolve.
  - Source: https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGuNFTwyne-f0wMEnBQoJ4q3Jb9aoVwL4C2zf32xX2od2wGu6FadNAJTfj0DRWB5FdQ-u3xQ_wyHdKD17gnm1KcQVR99SH6RCsA6kvwQPxNNUpszngv3I=

- **FLAG** — Agentic AI, systems that can set goals, make decisions, and execute complex multi-step tasks autonomously, is a major trend for 2026.
  - Persona: Ai For Humans
  - Reason: Medium source blocked (403) so agentic-AI trend cannot be confirmed from snippet; plausible but unverified.
  - Source: https://medium.com/@aiauthority/5-biggest-ai-trends-taking-over-2026-and-what-they-mean-for-you-0a59b1d8751b

- **STRIP** — 76% of digital leaders plan to increase AI spending in 2026, with adoption expanding beyond pilots into enterprise-wide use across big data analytics (53%), general AI (51%), and automation technologies (48%).
  - Persona: Ai For Humans
  - Reason: Source URL returns 404 and does not resolve.
  - Source: https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEmJNvdW2WCQ70eK0YIdT0M5fPyDJSv24lcrcQgeELU07C_9e6fVx-SAZseGVbAgD4xzAGPAeE-NflXwFPl4pduMTBC_4CuXP5fLybFBsDzn-EJQvSrTD_qKrMccY5rU4W2-vg62BILMu2wXtDwzkBd3Ct4cqHJvPdowWMZHl98BmU3cEyyONoMw==

- **FLAG** — More than 90% of CEOs plan to continue investing in AI at current or higher levels, even if immediate ROI isn't realized in the next year, with nearly all believing AI agents will produce measurable returns in 2026.
  - Persona: Ai For Humans
  - Reason: BCG page resolves and title supports CEO AI investment theme, but snippet doesn't confirm the specific 90%/2,400 figures.
  - Source: https://www.bcg.com/publications/2026/as-ai-investments-surge-ceos-take-the-lead

- **FLAG** — 80-95% of AI projects fail to deliver on their promised ROI, mainly due to poor data quality and weak integration, not model quality.
  - Persona: Feed
  - Reason: Vendor blog resolves with matching ROI-failure topic but snippet doesn't show exact 80-95% figure; weak source, a read not a fact.
  - Source: https://unicoconnect.com/blogs/ai-statistics-2026

- **FLAG** — Only about 6% of organizations that use AI in at least one business function are capturing significant enterprise value from it, despite near-universal adoption (88%).
  - Persona: Feed
  - Reason: Same vendor blog resolves on topic but exact 6%/88% figures not confirmed in snippet; weak source.
  - Source: https://unicoconnect.com/blogs/ai-statistics-2026

- **FLAG** — The cost of AI is skyrocketing, with some companies like Uber blowing through their entire 2026 AI coding budget in just four months.
  - Persona: Feed
  - Reason: Forbes article resolves with matching title, but Uber budget specifics not visible in snippet; plausible trend signal.
  - Source: https://www.forbes.com/sites/jemmagreen/2026/07/02/ai-costs-more-than-the-people-it-replaced/

- **FLAG** — AI model pricing is becoming highly task-dependent, with specialized models and usage-based billing replacing flat rates, leading to potential 30-50% cost increases for enterprises.
  - Persona: Feed
  - Reason: Forbes article resolves but 30-50% cost figure and second source not confirmed in snippet.
  - Source: https://www.forbes.com/sites/jemmagreen/2026/07/02/ai-costs-more-than-the-people-it-replaced/

- **FLAG** — Agentic AI is a major trend for 2026, with enterprises shifting AI spend towards autonomous multi-step actions and expecting agentic projects to make up over 40% of their AI budgets.
  - Persona: Feed
  - Reason: Source is a self-published .pages.dev site (low quality); agentic trend plausible but 40% budget figure unconfirmed.
  - Source: https://ai-industry-2026.pages.dev/

- **FLAG** — Sovereign AI is expanding beyond governments to become a mainstream enterprise strategy, with large organizations wanting to own every critical layer of their AI stack.
  - Persona: Feed
  - Reason: Forbes article resolves and matches sovereign-AI enterprise theme; plausible trend signal, specifics not in snippet.
  - Source: https://www.forbes.com/sites/viviantoh/2026/07/20/the-enterprise-ai-reckoning-the-next-phase-of-the-ai-economy/

- **FLAG** — AI adoption has reached near-universal levels in businesses, with 91% of organizations reporting AI use in at least one capacity in 2026, an increase from 78% in 2024.
  - Persona: Interviewer
  - Reason: Resolved page cites 91% AI use but snippet shows different source (aibusinessweekly, not Azumo) and doesn't confirm 78%-2024 figure.
  - Source: https://aibusinessweekly.net/p/ai-productivity-statistics

- **FLAG** — Despite widespread adoption, 80-95% of AI projects fail to deliver measurable ROI, primarily due to poor data quality and weak integration rather than model performance.
  - Persona: Interviewer
  - Reason: Vendor blog resolves on topic but exact 80-95% and MIT/RAND figures not shown in snippet; weak source.
  - Source: https://unicoconnect.com/blogs/ai-statistics-2026

- **FLAG** — Agentic AI is transitioning from experimentation to real-world operations in 2026, with 52% of enterprises having actively deployed AI agents as of September 2025.
  - Persona: Interviewer
  - Reason: Cited source (Tool Fountain/Google Cloud) doesn't match resolved URL; 52% agentic figure unconfirmed in snippet.
  - Source: https://aibusinessweekly.net/p/ai-productivity-statistics

- **FLAG** — Global corporate AI investment more than doubled in 2025, with spending projected to exceed $2.02 trillion in 2026, and 86% of organizations planning to increase their AI budgets.
  - Persona: Interviewer
  - Reason: Self-published Hashnode blog resolves but $2.02T and 86% figures not confirmed; low-quality source.
  - Source: https://blog.shayaikehassan.com/the-artificial-intelligence-industry-an-in-depth-overview-in-2026

- **FLAG** — AI productivity gains are largest in structured, measurable work, with studies reporting gains of 14-15% in customer support, 26% in software development, and 50% in marketing output.
  - Persona: Interviewer
  - Reason: Stanford HAI economy page resolves (credible) but snippet shows only navigation, not the specific 14/26/50% figures.
  - Source: https://hai.stanford.edu/ai-index/2026-ai-index-report/economy

- **STRIP** — The rapid advancement of AI, particularly in models like Google Gemini, OpenAI's ChatGPT, and Anthropic's Claude, is accelerating innovation and compressing the utility window of benchmarks.
  - Persona: Interviewer
  - Reason: Source URL returns 404 and does not resolve.
  - Source: https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQERPmFjOKBi65nzdcFxD6W_wOCIXPPGS0B28MGpNqHsqMj92ws6POKjXB1VtN0T5p8zMl1e7NjpIvfWloPjeK3zTB35eGbYzFjBW8t7MjszxarvE1IbBKYx485Bolw_uR7ZGVbBXObNwXRV-1ZAa92hd3UPety2r5MKGF0sTgKFbEaMjH2g

- **STRIP** — Ethical and governance frameworks for AI are transitioning from aspirational guidelines to enforceable standards in 2026, with a focus on fairness, transparency, data privacy, and accountability for autonomous agents.
  - Persona: Interviewer
  - Reason: Source URL returns 404 and does not resolve.
  - Source: https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFOnArHYSlG5LzmI9ZIGed7NyZhYanCpfHq2fDvGNocvZrQH-cGBtX_6crvTbKm4i8zhN2sBH_9FKh3qpK6DEwIbae2R1MKUcGJ6qODEB48a6DGhVAOXjFJ-VUF0KBH0Co594b-5d8phqNftgI5QHxAdvtni7bequJjTsQhmb95JaJVjBFHew0dwVFxVzeHotKROJBdQI4Eu_98aw6vsfiecbKvrLzXqZdp

