---
campaign: "[[test-ai-roi]]"
stream: campaign
topic: Test AI ROI
verified: 4
flagged: 15
stripped: 5
generatedAt: 2026-07-20T14:27:58.363Z
---

# Campaign Research Base
## Overview

This research base examines the gap between claimed and demonstrated returns on enterprise AI investment. The evidence spans macro-level financing dynamics, sector-specific failure rates (with healthcare as the deepest case study), and the structural measurement failures that prevent organizations from testing ROI credibly. A recurring pattern emerges: enterprises acquire AI before defining how they will evidence its value, underestimate true costs, and measure adoption instead of business outcomes. Several findings below carry significant caveats about their evidence base and are labelled accordingly.

## The "95% Failure" Narrative and Its Evidence Base

The most widely cited AI failure statistic rests on a thin, self-qualified foundation and should be treated as directional rather than audited fact. MIT's "The GenAI Divide" zero-return finding was based on 52 interviews the report itself admits are "directionally accurate based on individual interviews rather than official company reporting," measuring only direct P&L impact within six months ([source](https://www.marketingaiinstitute.com/blog/mit-study-ai-pilots)).

The same study quantifies the spend behind the failure and reveals a misallocation of budget: despite $30-40 billion in enterprise GenAI investment, 95% of pilots delivered no measurable P&L impact; more than half of budgets went to sales and marketing tools, yet the biggest ROI was found in back-office automation ([source](https://fortune.com/2025/08/18/mit-report-95-percent-generative-ai-pilots-at-companies-failing-cfo/)).

A separate framing of MIT's Project NANDA study (July 2025), covering 300+ AI initiatives, found 95% saw zero measurable return, and argues the failure is structural: enterprises buy the technology before deciding how they will capture and evidence its value, while the disciplined 5% do the work of baselining, holdouts, and total cost transparency ([source](https://www.ellvero.com/insights/ai-roi-in-2026-why-95-percent-of-pilots-fail-and-how-to-measure-what-matters)).

## Macro Financing Risk Behind AI Demand

The AI boom is propped up by circular financing that inflates apparent demand — the pattern seen in prior tech bubbles. Nvidia agreed to invest up to $100 billion in OpenAI, which committed to deploying millions of Nvidia GPUs in return; NewStreet Research estimated every $10 billion Nvidia invests in OpenAI yields roughly $35 billion in GPU purchases or leases, while OpenAI is reportedly on track to lose around $14 billion in 2026 ([source](https://finance.yahoo.com/news/nvidia-100-billion-openai-investment-110000256.html)).

The Stargate structure extends this circularity across three counterparties with a single break point. OpenAI struck a $300 billion cloud deal with Oracle, which plans to spend roughly $40 billion on about 400,000 Nvidia GB200 chips; Oracle carries a $523 billion backlog of remaining performance obligations, and if Nvidia stops funding OpenAI, OpenAI cannot pay Oracle and Oracle stops buying Nvidia chips ([source](https://tech-ish.com/2026/02/03/nvidia-openai-oracle-circular-financing-loop/)).

## Hidden Costs and Unmeasured Spend

Most organizations underestimate their true AI spend before attempting to measure return. Advisors report routinely finding 2 to 4 times more AI spend than the CFO initially believed, with inference costs, GPU spend, vendor contracts, governance overhead, and shadow AI usage scattered across budgets; S&P Global found 42% of companies abandoned most AI projects in 2025, up from 17% the prior year ([source](https://www.ellvero.com/insights/ai-roi-in-2026-why-95-percent-of-pilots-fail-and-how-to-measure-what-matters)).

Recoverable waste already sits on enterprise balance sheets, and AI add-ons are inflating it. Zylo's 2026 data shows 53% of SaaS licenses are unused or underused, with the average organization wasting $19.8 million per year; Vertice's Q1 2026 data on $30 billion of processed spend found 66% of licenses are untouched or surplus, with 15% pure shelfware ([source](https://zylo.com/blog/shelfware)).

## Healthcare AI: Claimed vs. Demonstrated Returns

Vendor and consulting sources advertise healthcare AI returns in the 200-791% range. Axis Intelligence claims a 35% cost reduction within 18 months, $2.4M savings, and 451% ROI over 5 years across 150 deployments; Strativera cites 200-791% ROI over 3-5 years and $3.20 return per $1 within 14 months ([source](https://axis-intelligence.com/healthcare-ai-implementation-ai-health-2025/)).

Independent measurement tells a more modest story. A study across 1,800 clinicians at five academic medical centers found AI scribe tools saved only about 16 minutes of documentation per eight hours of patient care, with 13 fewer minutes in the record ([source](https://www.statnews.com/2026/04/01/ai-ambient-scribes-modest-time-savings-clinical-documentation/)). A peer-reviewed real-world evidence review reinforced this: while AI scribes cut self-reported documentation time, physician productivity measured by billing was unchanged and standardized burnout scores were unaffected ([source](https://ai.jmir.org/2025/1/e76743)).

Clinical performance can degrade sharply outside the vendor's claims. The Epic Sepsis Model, deployed at hundreds of US hospitals, missed roughly two-thirds of sepsis cases (67%) with an AUC of 0.63 versus Epic's claimed 0.76-0.83, and required clinicians to review about 109 alerts to find one true patient when externally validated ([source](https://pubmed.ncbi.nlm.nih.gov/34152373/)).

Healthcare AI projects also fail at high rates that have not improved with investment. A RAND/McKinsey 2025 analysis cites a ~78.9% failure rate; IDC 2025 reports 88% fail prototype-to-production; and MIT NANDA July 2025 puts GenAI pilot failure at ~95% ([source](https://nirmitee.io/blog/why-80-percent-healthcare-ai-projects-fail-pilot-technical-post-mortem/)).

Physical and data-infrastructure realities that demos hide drive many failures. One AI imaging tool rejected 21% of real-world images as unusable due to poor lighting and lower resolution, and required cloud upload that slowed clinic throughput ([source](https://geekyants.com/blog/why-healthcare-ai-initiatives-fail-before-they-reach-clinical-impact)). Underlying data problems are costly: poor interoperability costs the US healthcare system an estimated $30 billion annually, and claim denials tied to data errors cost hospitals roughly $20 billion a year, with inaccurate EHR entries contributing to preventable adverse events in ~15% of hospitalized cancer patients ([source](https://www.medesk.net/en/blog/ehr-interoperability-solutions/)).

## Why ROI Testing Fails — and What Discipline Looks Like

The most common ROI-testing error is measuring adoption instead of business outcomes, and most organizations do not measure returns at all. Bank Director's 2025 survey of 141 directors at banks under $100 billion found 82% do not measure ROI on any technology investment, and Morgan Stanley found only 21% of S&P 500 companies could cite a measurable AI benefit at all ([source](https://www.terminal-x.ai/research/ai-roi-in-2026-why-most-enterprise-ai-fails-and-what-actually-works)).

Problem selection and time horizon — not model quality — are the largest determinants of success. Analysis finds a 12% productivity gain on a $500,000 process can never justify the build-and-run cost regardless of model performance, and realistic payback for transformational AI runs 2-4 years (month 14-28), making one-year ROI calculations unreliable in both directions ([source](https://www.sthambh.com/blog/ai-roi-measurement-enterprise)).

A disciplined counter-example shows credible ROI is designed before the spend. DBS Bank reported approximately SGD 1 billion in economic value from AI/ML in FY2025 (up from S$370 million by end-FY2023), against an aspiration stated in 2022 of SGD 1 billion within five years, verified by comparing AI-powered customer outcomes against matched control groups ([source](https://www.cdotrends.com/story/4914/dbs-banks-billion-dollar-ai-dream-realized)).

## Public-Sector Blind Spots

In government, the ability to test AI ROI is undermined at the root. GAO report GAO-26-107859 (April 13, 2026) found selected agencies were not systematically collecting lessons learned, that GSA, DOD, DHS, and VA could not comply with OMB's knowledge-sharing rule due to internal policies, and that officials found it hard to understand AI-related costs and lacked access to technical experts to evaluate vendor proposals ([source](https://www.gao.gov/products/gao-26-107859)).

Public-sector AI also increasingly bypasses procurement, removing the oversight point where ROI should be tested. The Open Contracting Partnership documented that AI "sneaks in through side doors" via free pilots, grants, and features in existing tools — including a case where Palantir donated software to New Orleans, sidestepping city council debate because no money changed hands; UK government AI contracts nonetheless hit £573 million by August 2025, exceeding all of 2024 ([source](https://www.open-contracting.org/2025/11/10/the-surprising-shifts-in-how-the-public-sector-is-buying-ai-and-what-policymakers-can-do-about-it/)).
