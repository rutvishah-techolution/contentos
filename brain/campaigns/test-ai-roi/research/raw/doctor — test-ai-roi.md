---
campaign: "[[test-ai-roi]]"
persona: Doctor
personaId: doctor-persona
stream: campaign
model: claude (azure)
generatedAt: 2026-07-20T14:07:00.537Z
findingCount: 8
---

# Doctor — Raw Research

## Summary

The vendor decks will tell you healthcare AI delivers 451% ROI and $2.4M in savings. The peer-reviewed trials tell a quieter story: an ambient scribe study across 1,800 clinicians and five academic centers found 16 minutes saved per eight-hour shift, and a rapid review found physician billing productivity was unchanged. Both things can be true, and the gap between them is exactly where a CFO gets burned. The number that should keep you up is this: roughly four out of five healthcare AI projects never reach a single patient, and they die not because the model is wrong but because the data pipeline, the workflow, and the interoperability underneath were never built. Before you sign, calculate ROI on the specific stakeholder you actually control, demand external validation on your own patient data the way Epic's sepsis model failed to get, and confirm the tool works on a cheap tablet when the network drops. If the answer to any of those is a slide deck instead of a saved dataset, you do not have a business case. You have a pitch.

## Findings

### 1. Vendor and consulting sources routinely advertise healthcare AI returns in the 200-791% range, with one blueprint claiming a documented 451% ROI over five years and $2.4M in savings for mid-sized facilities.

- **Evidence:** Axis Intelligence: 35% cost reduction within 18 months, $2.4M savings, 451% ROI over 5 years across 150 deployments; Strativera: 200-791% ROI over 3-5 years, $3.20 return per $1 within 14 months
- **Source:** https://axis-intelligence.com/healthcare-ai-implementation-ai-health-2025/
- **Why it matters:** This is the pitch-deck register, and it is the one the procurement committee sees first. I have sat in those reviews. These numbers get presented without a chain of custody I can verify against a locked dataset. When I place them next to the actual trial data below, the spread is enormous. A CFO who signs on the 451% figure is buying a projection, not a result.

### 2. A large study of AI scribe use across 1,800 clinicians at five academic medical centers found the tools saved only about 16 minutes of documentation per eight hours of patient care.

- **Evidence:** STAT/NEJM AI-adjacent study, 1,800 clinicians, five academic medical centers, 2023-2025: 16 minutes documentation time saved and 13 fewer minutes in the record per 8 hours of care
- **Source:** https://www.statnews.com/2026/04/01/ai-ambient-scribes-modest-time-savings-clinical-documentation/
- **Why it matters:** Sixteen minutes over a full shift is not the burnout revolution the vendor promised. But convert it to the ward: that is roughly two minutes back per patient at a 20-patient clinic day. For a physician composing notes at 9pm after the kids are asleep, two minutes a patient is real. The point is you must know which number you are buying. The pitch sells transformation; the trial delivers a modest, real, defensible gain. Buy the trial number, not the pitch.

### 3. A peer-reviewed real-world evidence review found that while AI scribes cut self-reported documentation time, physician productivity measured by billing was unchanged and standardized burnout scores were unaffected.

- **Evidence:** JMIR AI rapid review (2014-2024 studies): decreased self-reported documentation time with longer notes; burnout unchanged on standardized scales; billing-measured productivity unchanged
- **Source:** https://ai.jmir.org/2025/1/e76743
- **Why it matters:** This is the finding that should stop a revenue-cycle projection cold. If the ROI model assumes the scribe generates more billable throughput, and the peer-reviewed billing metric shows no change, the model is built on air. Self-reported time saved is a survey. wRVUs are a receipt. When they disagree, believe the receipt.

### 4. Some health systems have documented concrete, large AI returns in 2025, including a Mount Sinai malnutrition-detection tool generating roughly $20 million in revenue impact and Nebraska Medicine cutting length of stay by 5%, equivalent to 37 added inpatient beds.

- **Evidence:** Becker's, Jan 2026: Mount Sinai malnutrition AI ~$20M revenue impact; Nebraska Medicine 5% length-of-stay reduction equal to 37 beds without physical expansion
- **Source:** https://www.beckershospitalreview.com/healthcare-information-technology/ai/700-lives-100m-saved-healthcare-ai-roi-in-25/
- **Why it matters:** This is what a real win looks like, and it is worth naming because I am skeptical, not cynical. Notice the pattern: both wins are internally built tools tied to a specific operational chokepoint, not an off-the-shelf 451% miracle. Thirty-seven beds without pouring concrete is the kind of figure a hospital administrator can actually take to a board. The lesson is targeting, not magic.

### 5. The Epic Sepsis Model, deployed at hundreds of US hospitals, missed roughly two-thirds of sepsis cases and required clinicians to review about 109 alerts to find one true patient when externally validated.

- **Evidence:** JAMA Internal Medicine, June 2021 (Wong et al., Michigan Medicine): missed 67% of sepsis cases, AUC 0.63 vs Epic's claimed 0.76-0.83, alert fatigue burden; validated across every adult admission Dec 2018-Oct 2019
- **Source:** https://pubmed.ncbi.nlm.nih.gov/34152373/
- **Why it matters:** This is the whole argument in one case. A tool that looked good on the vendor's internal data ran live in hundreds of hospitals before anyone independent checked it. Ninety-five percent accuracy on clean data means nothing until you see how it performs on incomplete records at 2am. Every alert a nurse chases and finds nothing is time stolen from a patient who is actually crashing. Demand external validation on your own patient population before deployment, not after. Epic now recommends exactly that, but only after the damage was public.

### 6. Roughly 78-80% of healthcare AI projects never deliver their intended value or never reach production, a rate that has not improved despite record investment.

- **Evidence:** RAND/McKinsey 2025 analysis: ~78.9% failure rate, second only to financial services; IDC 2025: 88% fail prototype-to-production; MIT NANDA July 2025: ~95% of GenAI pilots fail to deliver measurable value
- **Source:** https://nirmitee.io/blog/why-80-percent-healthcare-ai-projects-fail-pilot-technical-post-mortem/
- **Why it matters:** Four out of five projects never reach a patient. And the cause is almost never the model. It is fragmented EHR data, the integration seam, and workflows nobody stress-tested. I know infrastructure work takes real time, and I am not pretending compliance is optional. I am asking who is protecting the ROI case for the patients already in the queue while the data pipeline gets built. If a vendor cannot show me what happens on day 90 in a real ward, that budget line is a coin flip with a 20% payout.

### 7. Field deployments fail on physical reality the demo hides: one AI imaging tool rejected 21% of real-world images as unusable due to poor lighting and lower resolution, and required cloud upload that slowed clinic throughput.

- **Evidence:** GeekyAnts analysis: 21% of field images rejected as unsuitable; cloud dependency slowed throughput; benchmark-to-reality gap driven by data infrastructure failure
- **Source:** https://geekyants.com/blog/why-healthcare-ai-initiatives-fail-before-they-reach-clinical-impact
- **Why it matters:** This is why I unplug the router during the demo. A tool that needs the cloud to function will fail in a rural district clinic during a power cut, which is precisely where the access gap is widest and the patient has nowhere else to go. If one in five images gets rejected in the field, the effective accuracy on your actual patients is not the number on the slide. Ask what happens offline before you ask about accuracy.

### 8. Poor interoperability costs the US healthcare system an estimated $30 billion annually, and claim denials tied to data errors cost hospitals roughly $20 billion a year.

- **Evidence:** Health Affairs 2024 study cited: ~$30B annual loss from poor interoperability; iFive Global/2024 study: data-error claim denials ~$20B/year, and inaccurate EHR entries contributed to preventable adverse events in ~15% of hospitalized cancer patients
- **Source:** https://www.medesk.net/en/blog/ehr-interoperability-solutions/
- **Why it matters:** This is where the business case and the ward converge. Interoperability is not an IT abstraction; it is a radiology scan sitting in a basement fax machine while the team upstairs makes a call without it. Fifteen percent of hospitalized cancer patients touched by a preventable adverse event from a bad record is not a data point to me, it is a Tuesday. The strongest ROI in healthcare AI is often not a flashy diagnostic model but making information move between two facilities without manual re-entry. Fix the seam before you buy the shiny thing on top of it.

## Data

```json
{
  "summary": "The vendor decks will tell you healthcare AI delivers 451% ROI and $2.4M in savings. The peer-reviewed trials tell a quieter story: an ambient scribe study across 1,800 clinicians and five academic centers found 16 minutes saved per eight-hour shift, and a rapid review found physician billing productivity was unchanged. Both things can be true, and the gap between them is exactly where a CFO gets burned. The number that should keep you up is this: roughly four out of five healthcare AI projects never reach a single patient, and they die not because the model is wrong but because the data pipeline, the workflow, and the interoperability underneath were never built. Before you sign, calculate ROI on the specific stakeholder you actually control, demand external validation on your own patient data the way Epic's sepsis model failed to get, and confirm the tool works on a cheap tablet when the network drops. If the answer to any of those is a slide deck instead of a saved dataset, you do not have a business case. You have a pitch.",
  "findings": [
    {
      "claim": "Vendor and consulting sources routinely advertise healthcare AI returns in the 200-791% range, with one blueprint claiming a documented 451% ROI over five years and $2.4M in savings for mid-sized facilities.",
      "evidence": "Axis Intelligence: 35% cost reduction within 18 months, $2.4M savings, 451% ROI over 5 years across 150 deployments; Strativera: 200-791% ROI over 3-5 years, $3.20 return per $1 within 14 months",
      "sourceUrl": "https://axis-intelligence.com/healthcare-ai-implementation-ai-health-2025/",
      "whyItMatters": "This is the pitch-deck register, and it is the one the procurement committee sees first. I have sat in those reviews. These numbers get presented without a chain of custody I can verify against a locked dataset. When I place them next to the actual trial data below, the spread is enormous. A CFO who signs on the 451% figure is buying a projection, not a result."
    },
    {
      "claim": "A large study of AI scribe use across 1,800 clinicians at five academic medical centers found the tools saved only about 16 minutes of documentation per eight hours of patient care.",
      "evidence": "STAT/NEJM AI-adjacent study, 1,800 clinicians, five academic medical centers, 2023-2025: 16 minutes documentation time saved and 13 fewer minutes in the record per 8 hours of care",
      "sourceUrl": "https://www.statnews.com/2026/04/01/ai-ambient-scribes-modest-time-savings-clinical-documentation/",
      "whyItMatters": "Sixteen minutes over a full shift is not the burnout revolution the vendor promised. But convert it to the ward: that is roughly two minutes back per patient at a 20-patient clinic day. For a physician composing notes at 9pm after the kids are asleep, two minutes a patient is real. The point is you must know which number you are buying. The pitch sells transformation; the trial delivers a modest, real, defensible gain. Buy the trial number, not the pitch."
    },
    {
      "claim": "A peer-reviewed real-world evidence review found that while AI scribes cut self-reported documentation time, physician productivity measured by billing was unchanged and standardized burnout scores were unaffected.",
      "evidence": "JMIR AI rapid review (2014-2024 studies): decreased self-reported documentation time with longer notes; burnout unchanged on standardized scales; billing-measured productivity unchanged",
      "sourceUrl": "https://ai.jmir.org/2025/1/e76743",
      "whyItMatters": "This is the finding that should stop a revenue-cycle projection cold. If the ROI model assumes the scribe generates more billable throughput, and the peer-reviewed billing metric shows no change, the model is built on air. Self-reported time saved is a survey. wRVUs are a receipt. When they disagree, believe the receipt."
    },
    {
      "claim": "Some health systems have documented concrete, large AI returns in 2025, including a Mount Sinai malnutrition-detection tool generating roughly $20 million in revenue impact and Nebraska Medicine cutting length of stay by 5%, equivalent to 37 added inpatient beds.",
      "evidence": "Becker's, Jan 2026: Mount Sinai malnutrition AI ~$20M revenue impact; Nebraska Medicine 5% length-of-stay reduction equal to 37 beds without physical expansion",
      "sourceUrl": "https://www.beckershospitalreview.com/healthcare-information-technology/ai/700-lives-100m-saved-healthcare-ai-roi-in-25/",
      "whyItMatters": "This is what a real win looks like, and it is worth naming because I am skeptical, not cynical. Notice the pattern: both wins are internally built tools tied to a specific operational chokepoint, not an off-the-shelf 451% miracle. Thirty-seven beds without pouring concrete is the kind of figure a hospital administrator can actually take to a board. The lesson is targeting, not magic."
    },
    {
      "claim": "The Epic Sepsis Model, deployed at hundreds of US hospitals, missed roughly two-thirds of sepsis cases and required clinicians to review about 109 alerts to find one true patient when externally validated.",
      "evidence": "JAMA Internal Medicine, June 2021 (Wong et al., Michigan Medicine): missed 67% of sepsis cases, AUC 0.63 vs Epic's claimed 0.76-0.83, alert fatigue burden; validated across every adult admission Dec 2018-Oct 2019",
      "sourceUrl": "https://pubmed.ncbi.nlm.nih.gov/34152373/",
      "whyItMatters": "This is the whole argument in one case. A tool that looked good on the vendor's internal data ran live in hundreds of hospitals before anyone independent checked it. Ninety-five percent accuracy on clean data means nothing until you see how it performs on incomplete records at 2am. Every alert a nurse chases and finds nothing is time stolen from a patient who is actually crashing. Demand external validation on your own patient population before deployment, not after. Epic now recommends exactly that, but only after the damage was public."
    },
    {
      "claim": "Roughly 78-80% of healthcare AI projects never deliver their intended value or never reach production, a rate that has not improved despite record investment.",
      "evidence": "RAND/McKinsey 2025 analysis: ~78.9% failure rate, second only to financial services; IDC 2025: 88% fail prototype-to-production; MIT NANDA July 2025: ~95% of GenAI pilots fail to deliver measurable value",
      "sourceUrl": "https://nirmitee.io/blog/why-80-percent-healthcare-ai-projects-fail-pilot-technical-post-mortem/",
      "whyItMatters": "Four out of five projects never reach a patient. And the cause is almost never the model. It is fragmented EHR data, the integration seam, and workflows nobody stress-tested. I know infrastructure work takes real time, and I am not pretending compliance is optional. I am asking who is protecting the ROI case for the patients already in the queue while the data pipeline gets built. If a vendor cannot show me what happens on day 90 in a real ward, that budget line is a coin flip with a 20% payout."
    },
    {
      "claim": "Field deployments fail on physical reality the demo hides: one AI imaging tool rejected 21% of real-world images as unusable due to poor lighting and lower resolution, and required cloud upload that slowed clinic throughput.",
      "evidence": "GeekyAnts analysis: 21% of field images rejected as unsuitable; cloud dependency slowed throughput; benchmark-to-reality gap driven by data infrastructure failure",
      "sourceUrl": "https://geekyants.com/blog/why-healthcare-ai-initiatives-fail-before-they-reach-clinical-impact",
      "whyItMatters": "This is why I unplug the router during the demo. A tool that needs the cloud to function will fail in a rural district clinic during a power cut, which is precisely where the access gap is widest and the patient has nowhere else to go. If one in five images gets rejected in the field, the effective accuracy on your actual patients is not the number on the slide. Ask what happens offline before you ask about accuracy."
    },
    {
      "claim": "Poor interoperability costs the US healthcare system an estimated $30 billion annually, and claim denials tied to data errors cost hospitals roughly $20 billion a year.",
      "evidence": "Health Affairs 2024 study cited: ~$30B annual loss from poor interoperability; iFive Global/2024 study: data-error claim denials ~$20B/year, and inaccurate EHR entries contributed to preventable adverse events in ~15% of hospitalized cancer patients",
      "sourceUrl": "https://www.medesk.net/en/blog/ehr-interoperability-solutions/",
      "whyItMatters": "This is where the business case and the ward converge. Interoperability is not an IT abstraction; it is a radiology scan sitting in a basement fax machine while the team upstairs makes a call without it. Fifteen percent of hospitalized cancer patients touched by a preventable adverse event from a bad record is not a data point to me, it is a Tuesday. The strongest ROI in healthcare AI is often not a flashy diagnostic model but making information move between two facilities without manual re-entry. Fix the seam before you buy the shiny thing on top of it."
    }
  ],
  "error": null
}
```

