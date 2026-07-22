---
campaign: "[[ai-value-finder-a-three-day-workshop-where-we-help-companies]]"
topic: AI Value Finder. a three day workshop where we help companies map out their workflows based on their departments and give a ready roadmap for ai automations
generatedAt: 2026-07-20T15:04:07.019Z
---

# Source Validation Log

Record of what the source-check stripped or flagged, and why. Feeds the source-validation catch-rate metric.

## Campaign stream

- Verified: **3** · Flagged: **15** · Stripped: **6**

- **STRIP** — The single strongest correlation with enterprise EBIT impact is fundamental workflow redesign, and high performers are roughly 3x more likely to have redesigned workflows (55% versus ~20% of other firms).
  - Persona: Auditor
  - Reason: McKinsey URL returns 403 Access Denied; source does not resolve.
  - Source: https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai

- **FLAG** — Budgets are misallocated: more than half of GenAI spend goes to sales and marketing, yet the biggest measurable ROI sits in back-office automation—cutting outsourcing, agency costs, and operational overhead.
  - Persona: Auditor
  - Reason: Source resolves but snippet shows only headline navigation, not the specific budget/success-rate figures cited.
  - Source: https://fortune.com/2025/08/18/mit-report-95-percent-generative-ai-pilots-at-companies-failing-cfo/

- **FLAG** — The dominant 2025 failure mode is picking the AI use case before understanding the process underneath it—a department head selects the most visible or painful work and frames it as 'we should use AI to do X,' then secures budget for something never scoped.
  - Persona: Auditor
  - Reason: Source resolves but is a low-quality secondary blog; snippet does not surface the specific RAND figures cited.
  - Source: https://mybusinessfuture.com/en/80-ai-failure-rate-2026-how-rand-and-gartner-expose-the-ai/

- **STRIP** — Speed is a measurable competitive lever: top-performing firms move from pilot to full implementation in an average of 90 days, while large enterprises typically take nine months or longer.
  - Persona: Auditor
  - Reason: MIT PDF source returns 403 Cloudflare block; source does not resolve.
  - Source: https://mlq.ai/media/quarterly_decks/v0.1_State_of_AI_in_Business_2025_Report.pdf

- **FLAG** — Function-level ROI is real and quantifiable where workflows are properly targeted: software engineering and IT report 10-20% cost reductions, and marketing and product development show revenue uplift above 10%.
  - Persona: Auditor
  - Reason: Vendor marketing site resolves but is a weak secondary source and snippet does not show the specific cost-reduction figures.
  - Source: https://www.libertify.com/interactive-library/mckinsey-state-of-ai-2025-agents-innovation-transformation/

- **STRIP** — Cost overruns kill technically successful projects: negligible per-token pricing becomes a total-cost-of-ownership problem when multiplied across thousands of users, turning viable proofs of concept into budget black holes that get abruptly cancelled.
  - Persona: Auditor
  - Reason: Gartner URL returns 403 verification block; source does not resolve.
  - Source: https://www.gartner.com/en/articles/genai-project-failure

- **FLAG** — Buyers have been repeatedly burned, so demand is shifting toward outcome-accountable, vendor-partnered engagements: only about one in five organizations qualify as 'AI ROI Leaders,' and abandonment jumped from 17% to 42% of companies scrapping most initiatives in a single year.
  - Persona: Auditor
  - Reason: Deloitte page resolves but snippet shows only nav chrome, not the specific 20%/17%-to-42% figures; S&P claim unverifiable here.
  - Source: https://www.deloitte.com/global/en/issues/generative-ai/ai-roi-the-paradox-of-rising-investment-and-elusive-returns.html

- **FLAG** — Of 25 organizational attributes McKinsey tested, redesigning workflows had the single biggest effect on an organization's ability to see EBIT impact from generative AI.
  - Persona: Doctor
  - Reason: Official McKinsey PDF resolves (200) but returned empty snippet, so the specific 55%/20% figures cannot be confirmed from the fetch.
  - Source: https://www.mckinsey.com/~/media/mckinsey/business%20functions/quantumblack/our%20insights/the%20state%20of%20ai/2025/the-state-of-ai-how-organizations-are-rewiring-to-capture-value_final.pdf

- **FLAG** — Organizations that report significant financial returns are twice as likely to have redesigned workflows before selecting AI tools, inverting the typical 'buy tool, then find a use' sequence.
  - Persona: Doctor
  - Reason: Vendor blog resolves and cites RAND 80% figure but the specific McKinsey 'twice as likely' claim is not shown in snippet; weak secondary source.
  - Source: https://talyx.ai/insights/enterprise-ai-implementation-failure

- **FLAG** — Most generative AI budgets go to sales and marketing, but the highest returns sit in back-office automation — meaning most companies fund the most visible use cases, not the ones that pay for themselves.
  - Persona: Doctor
  - Reason: Vendor blog resolves but snippet shows generic 75% framing, not the specific MIT budget/vendor-success figures cited.
  - Source: https://www.arcastgroup.com/insights/the-roi-of-ai-75-of-projects-fail.-build-a-business-case-that-works

- **FLAG** — In healthcare specifically, administrative AI (billing, scheduling, coding) delivers 200-400% ROI within 12 months and typically breaks even in 4-8 months, while clinical AI takes 24-60 months — proving process-level automation pays fastest.
  - Persona: Doctor
  - Reason: Snippet supports the 200-400% admin ROI and 150% average, but source is a vendor guide and clinical timeline shown as 24-36 not the claimed 24-60 months.
  - Source: https://thinking.inc/en/industry-service/healthcare-ai-roi/

- **STRIP** — AI eligibility verification connected to the scheduling workflow cut denial rates by up to 42%, and organizations that standardized workflows before automating outperformed peers who went technology-first.
  - Persona: Doctor
  - Reason: Source snippet cites 'Source: ChatGPT' and does not support the 42% denial reduction or the named-health-system claims.
  - Source: https://aegishealth.us/blog/5-ways-hospitals-can-use-ai-to-save-money

- **FLAG** — Even where companies have deployed AI, adoption collapses at the user level — 85% of employees can use AI tools but only 25% use them regularly, and 39% of organizations have no formal plan to drive business value from tools they already bought.
  - Persona: Doctor
  - Reason: Secondary aggregator resolves but snippet does not show the specific 85%/25%/39% figures attributed to IBM and Writer.
  - Source: https://connectedpaths.com/insights/ai-project-failure-statistics/

- **FLAG** — The failure is a process problem, not a technology problem, and the same three patterns explain nearly every failure: poor data readiness, weak organizational maturity, and use-case drift.
  - Persona: Doctor
  - Reason: Low-quality secondary blog resolves but snippet does not surface the specific RAND 80.3%/33.8%/28.4%/18.1% breakdown.
  - Source: https://mybusinessfuture.com/en/80-ai-failure-rate-2026-how-rand-and-gartner-expose-the-ai/

- **FLAG** — MIT attributes the failure not to model quality but to a 'learning gap' in enterprise integration—tools that cannot retain feedback, adapt to context, or fit real workflows stall regardless of how capable the underlying model is.
  - Persona: Policy Insider
  - Reason: Claim attributes a direct quote to author Challapally but snippet shows only nav chrome, not the 'learning gap' quote.
  - Source: https://fortune.com/2025/08/18/mit-report-95-percent-generative-ai-pilots-at-companies-failing-cfo/

- **STRIP** — McKinsey's regression analysis found that fundamental workflow redesign has the single largest effect on whether an organization sees EBIT impact from generative AI—out of 25 organizational attributes tested.
  - Persona: Policy Insider
  - Reason: McKinsey URL returns 403 Access Denied; source does not resolve.
  - Source: https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai-how-organizations-are-rewiring-to-capture-value

- **STRIP** — Only 21% of organizations using generative AI have fundamentally redesigned any of their workflows, meaning the practice most correlated with returns is also the one most companies have not yet done.
  - Persona: Policy Insider
  - Reason: McKinsey URL returns 403 Access Denied; source does not resolve.
  - Source: https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai-how-organizations-are-rewiring-to-capture-value

- **FLAG** — AI budgets are systematically misallocated: more than half go to sales and marketing tools, while the highest returns sit in back-office automation, where successful implementations generate an estimated $2-10 million annually in cost reductions.
  - Persona: Policy Insider
  - Reason: Fortune source resolves but snippet does not show the specific >50% budget or $2M-$10M savings figures cited.
  - Source: https://fortune.com/2025/08/18/mit-report-95-percent-generative-ai-pilots-at-companies-failing-cfo/

- **FLAG** — For Fortune 500 buyers, how AI is acquired matters as much as what is acquired: purchasing from specialized vendors and building partnerships succeeds about 67% of the time, while internal builds succeed only one-third as often.
  - Persona: Policy Insider
  - Reason: Fortune source resolves but snippet does not surface the 67%/33% vendor-vs-build figures or the attributed quote.
  - Source: https://fortune.com/2025/08/18/mit-report-95-percent-generative-ai-pilots-at-companies-failing-cfo/

- **FLAG** — The value gap is widening, not closing: BCG's September 2025 survey of 1,250 respondents found roughly 60% generate no material value from AI while only about 5% create substantial value at scale, and S&P Global found 42% of companies abandoned most AI initiatives in 2025, up from 17% the prior year.
  - Persona: Policy Insider
  - Reason: Vendor blog resolves and references RAND/MIT numbers but does not show the specific BCG n=1,250 or S&P 17%-to-42% figures in snippet.
  - Source: https://coworker.ai/blog/why-enterprise-ai-fails

- **FLAG** — A three-day roadmap should be positioned as the first step, not the return, because production AI that reaches measurable value typically requires 8-18 months, and one credible critique holds that the 95% figure partly reflects premature measurement against traditional software payback expectations.
  - Persona: Policy Insider
  - Reason: Vendor blog resolves and mentions 90-day/failure framing but snippet does not confirm the 8-18 month or UC Berkeley reframing claims.
  - Source: https://talyx.ai/insights/enterprise-ai-implementation-failure

## Scout stream

- Verified: **3** · Flagged: **19** · Stripped: **0**

- **FLAG** — Only 25.5% of AI pilots or deployments across surveyed organizations achieved measurable profit and loss (P&L) impact.
  - Persona: Ai For Humans
  - Reason: Source redirect failed to resolve; claim is plausible but unverified.
  - Source: https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGM298VyvZOQEuCfUClGt7hdtvHUS15xSDMNFeiD7DRs2apG74hNJfBH6HRONa4WQCv2Wm7Y4Y5rwRFzD9ifSb8nXcSjJOs6Hby_cIJAgosvMaEf13adwhjn2xFFM-oMOrnwVHX-gC-Bf5eLWOQ==

- **FLAG** — Fragmented systems, disconnected workflows, and integration debt are major barriers to AI ROI, with 59% of organizations struggling with integration complexity and 65% with integrating legacy systems.
  - Persona: Ai For Humans
  - Reason: Redirect failed to resolve; integration barrier figures plausible but unverified.
  - Source: https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGM298VyvZOQEuCfUClGt7hdtvHUS15xSDMNFeiD7DRs2apG74hNJfBH6HRONa4WQCv2Wm7Y4Y5rwRFzD9ifSb8nXcSjJOs6Hby_cIJAgosvMaEf13adwhjn2xFFM-oMOrnwVHX-gC-Bf5eLWOQ==

- **FLAG** — AI workflow automation can improve worker performance by nearly 40%, leading to significant productivity gains and cost savings.
  - Persona: Ai For Humans
  - Reason: Redirect failed; 40% productivity uplift plausible but unverified.
  - Source: https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEDmbnCz_V9OGfxi8sBz-jz9lNQSsGpsAK2eHKuz4l9wj71RIouT4qTnWt8CBg1PWywBgyG9KYbIKWyiuacwMZDwlUk6trkHoO542GNIkHjfCaj-Q-Sd_Xq65TZ8wsOWRXKB41bx9LXK46SeV4jDZflsjTmome4pI7FV-SEE3nNF6wCzQnN1xBLmsKQDK7UCQ5FjYXk8avsK2wS3q35y-NxjVE==

- **FLAG** — Most companies are struggling to find and define ROI, even as AI usage scales, with only 51% quantifying the results of their AI adoption.
  - Persona: Ai For Humans
  - Reason: Redirect failed; SAP 51% quantifying figure plausible but unverified.
  - Source: https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEK6lBrwsKVCdEmLA7pi64Du6zyNhXQaON4vNJc5kxJfrEC7qzrWakLaOetORXR_0o0kZZXToS0PhqNT5VFOjj_RW1-mXX6VVkYu0g-3GKVrXmePkhK1i890V4KWt93hSJcqMWjqxcmCgqxr25s2TjDNkhsRvht3zOqxwI==

- **FLAG** — 82% of C-suite leaders claim their organizations use AI solutions in workflows, but only 34% have equipped employees with AI tools, and most professionals report receiving no training.
  - Persona: Ai For Humans
  - Reason: Redirect failed; C-suite vs employee AI training gap plausible but unverified.
  - Source: https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQF3-YJfOnNTcTcX84SM2p35Z4GyARdQEvhj8-1FAAy_Xj85IJGIE-UpL154MD1IhSkFatZDlBbkZZ6S5g3DaTTU0wO2MxYf_yRaHuoB5OVdiYpHZT91RFGA_K3S_nZCb-MZ5l_dywb1PNZNoKjCynqpOtSoHPYqfAafbbZ3xo0-0lEEdgw==

- **FLAG** — AI process optimization involves using AI to analyze, automate, and continuously improve how business processes run, applying technologies like machine learning, natural language processing, and generative AI.
  - Persona: Ai For Humans
  - Reason: Redirect failed; definitional claim is plausible and non-controversial but unverified.
  - Source: https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGahKHxgH0oO3TJMSVbhQshkCV-i6Dd-OvJofn3-XtUF6-OJf3x7mZasz2V_a2J7e_hsODHqtTT2sCBOI0cjQjLOuuiL6DsHz9P29aAdgIj5idkrgVEC7GadNM8RcAob3BJ4kTKlGCNB_LGeDk7ZWV3w==

- **FLAG** — Only 1 in 5 C-suite executives have a clear plan for AI implementation, despite 85% anticipating major business transformation from AI.
  - Persona: Feed
  - Reason: Redirect failed; 85% transformation / 1-in-5 plan figures plausible but unverified.
  - Source: https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFsjq5jZwEsP-8gAskToQg5Y0UP54OaUfIt35tiYb8N2x9FlUZ3CRTl4i9P_6Ol3mah4oMXClnmyPKJbtXRZr4Yt0PhJLfAFgHx1ivDtcwUNFPQOdkygZXsvGTkt0UIZlOVLG4Wrl0prn7MAEwWR9zfUdW8eBiIIxD2lQiE6yUxJlLztsFpj7I1boo2s7L1MRIz0XHcQ==

- **FLAG** — Approximately 95% of organizations investing in Generative AI are seeing little to no measurable return on their investments.
  - Persona: Feed
  - Reason: Redirect failed but widely reported MIT 95% figure is plausible; unverified here.
  - Source: https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQG4fWKqeAd4Xgy-IBbcPtVuxJ3jsRk7l0vVIT0fieY8TtU2MhTxcPIeJmUu2duWvURQnHtjNImlLvkjhoJNGBXLCXku6a7c5_8odvJOxBR4rl_9pKyytoYApYlTMVVSabN4cHMo6gXsvX87PlV2lW5wuv1vgb6R8jbQ0YRMxJBWyn_9bLKeyV8qAfmb9sQyK7IWg0mG_-Mktd1iQyCUq2GpZ-ulkCWo4yMq1w==

- **FLAG** — Despite high adoption rates (91% of businesses use AI in at least one capacity in 2026), only 39% of organizations report measurable enterprise-level EBIT impact from AI.
  - Persona: Feed
  - Reason: Redirect failed; McKinsey EBIT / adoption figures plausible but unverified.
  - Source: https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHc0nJPHljY_wADDsEQmMdIYKJPAW815_zim1K8IrhprKFPjT9xblJq3QLH2u7C_50NdtCyQAhRTGeJKnyXOgr5bTrWX8R-fFfkY4Djs8n7KJJBzoWyVOGcGAJsP9MkpubYVbP5OSYxp4rtsFL2-Vg==

- **FLAG** — Companies that implemented AI governance structures reported a 40% improvement in AI project outcomes.
  - Persona: Feed
  - Reason: Resolves to Wharton C-suite AI page but snippet does not show the specific 40% governance figure.
  - Source: https://ai-analytics.wharton.upenn.edu/uncategorized/ai-for-the-c-suite-implementing-strategy-and-change/

- **FLAG** — The average ROI for AI solutions is $3.70 for every $1 invested, with some companies seeing average ROI of 420% within 12 months.
  - Persona: Feed
  - Reason: Redirect failed; $3.70/$1 and 420% ROI figures plausible marketing stats but unverified.
  - Source: https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGq_QiG4NkH5DHyUoUWj2nyUpq2sd70BRSqHLBFKe1c2GMVTCZOqPUK_-eE782NTm7fmXyb-wHH5KYD0cMGb4Sq8pqMlPGjD53nYeS2Ks4Am6XquY6ZCTBHY_FBrFl-UGFPpvcR3uuOSmNbMb0M3GX9QFVWQun1rKSkrMrJcL1pP7rLC4SqUC_xVpEH2Eee

- **FLAG** — Employee productivity has increased by up to 40% in Fortune 500 companies leveraging AI solutions.
  - Persona: Feed
  - Reason: Redirect failed; up to 40% productivity figure plausible but unverified.
  - Source: https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGq_QiG4NkH5DHyUoUWj2nyUpq2sd70BRSqHLBFKe1c2GMVTCZOqPUK_-eE782NTm7fmXyb-wHH5KYD0cMGb4Sq8pqMlPGjD53nYeS2Ks4Am6XquY6ZCTBHY_FBrFl-UGFPpvcR3uuOSmNbMb0M3GX9QFVWQun1rKSkrMrJcL1pP7rLC4SqUC_xVpEH2Eee

- **FLAG** — A major barrier to AI adoption among employees is a lack of clarity around its use case or value proposition.
  - Persona: Feed
  - Reason: Redirect failed; qualitative barrier claim plausible but unverified.
  - Source: https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFsjq5jZwEsP-8gAskToQg5Y0UP54OaUfIt35tiYb8N2x9FlUZ3CRTl4i9P_6Ol3mah4oMXClnmyPKJbtXRZr4Yt0PhJLfAFgHx1ivDtcwUNFPQOdkygZXsvGTkt0UIZlOVLG4Wrl0prn7MAEwWR9zfUdW8eBiIIxD2lQiE6yUxJlLztsFpj7I1boo2s7L1MRIz0XHcQ==

- **FLAG** — 72% of enterprise AI investments are currently destroying value due to waste.
  - Persona: Interviewer
  - Reason: Resolves to Larridin AI ROI blog but snippet does not show the specific 72% value-destruction figure.
  - Source: https://larridin.com/blog/ai-roi-measurement

- **FLAG** — 87% of AI projects never reach production, and up to 70% of companies see minimal impact from AI.
  - Persona: Interviewer
  - Reason: Resolves to relevant TechClass AI adoption article but snippet does not show 87%/70% figures.
  - Source: https://www.techclass.com/resources/learning-and-development-articles/risks-of-poor-ai-adoption-in-businesses-common-mistakes-to-avoid

- **FLAG** — 99% of C-suite executives have rebuilt or significantly changed their AI strategy within the last 24 months, with 67% believing their current business model may not be viable by 2029 due to AI disruption.
  - Persona: Interviewer
  - Reason: Redirect failed; Wakefield survey figures plausible but unverified.
  - Source: https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHPse4DFxXngNLZKN9fHJXeaaXdWUHMeT6XGw4HlO2UuonRSmysxRMaSEOIuNNo7xu4kC61Hf5mp_jIRnn11dSTfrlGFyNvIyST-TtxKG1fbumCGxICPQWOJdUZSbLQt2du97-mbquJn4QC-vYk_t53lsLDMrSyUwbY96TKslcW8dz2LGJIz1HNpzkrR_E0hWispzFoh2t8Fwi32VF76p1i4QpxtnJpqpjmE=

- **FLAG** — Lack of clear strategy and objectives is the biggest reason AI initiatives fail, with Gartner projecting over 40% of ambitious 'agentic' AI projects will be canceled by 2027 due to escalating costs and unclear business value.
  - Persona: Interviewer
  - Reason: Relevant article resolves but snippet does not show the Gartner 40% agentic cancellation figure.
  - Source: https://www.techclass.com/resources/learning-and-development-articles/risks-of-poor-ai-adoption-in-businesses-common-mistakes-to-avoid

- **FLAG** — Organizations that adopt AI-powered workflows report up to 346% ROI over 3 years.
  - Persona: Interviewer
  - Reason: Resolves to monday.com AI workflow tools article but snippet does not show the 346% ROI figure.
  - Source: https://monday.com/blog/project-management/ai-workflow-automation-14-tools-to-boost-team-productivity-and-scale-faster/

- **FLAG** — Fortune 500 companies like Booking Holdings are targeting $450 million in savings by the end of 2027 through AI-led internal process automation, reinvesting savings into future growth.
  - Persona: Interviewer
  - Reason: Redirect failed; Booking Holdings $450M savings target plausible but unverified.
  - Source: https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHF-VhIIgNJK2CVJIyEeEEcSsBKSTEMigNCXkyE0nJFihDX6U4wlMYuS8lxr-jAEU0LFOdPfkkhqDQoH4DVvLW3RLCTs8Zhr7U-Tferdzt9ljR0IhbT-YNTduhLBlstYyG5blWUcebPPr3XYyI6_zHyPk-Te1EgiLnxTnrwCTKTJ-6s-L-k8dTFqA7y9oEOtnaYhYoVkWFO-cnFLe5EeqOpDg==

