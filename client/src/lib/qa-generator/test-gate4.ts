/**
 * Test Gate 4 against existing T1 answers
 */
import { evaluateAnswer, checkFabricatedReference } from './eval-gates';

// The 3 sample answers from the database
const testAnswers = [
  {
    q: "How do I file a yacht insurance claim?",
    a: `Document the incident within **72 hours** of discovery under **Section III, Part A of the Institute Yacht Insurance Clauses (IYIC)**, which governs claims handling. Coverage applies only if the loss or damage is **sudden and accidental** and occurs **while the yacht is in navigable waters**—exclusions apply for wear and tear, pre-existing conditions, or acts of war.

- **Immediate steps**:
  - Secure the vessel and prevent further damage; take photos/videos with timestamps.
  - Notify your insurer **in writing** (email or letter) within **72 hours** of incident discovery, including:
    - Policy number, vessel details, and incident date/time/location.
    - A **detailed description** of the damage or loss (use the insurer's claim form if provided).
    - Any third-party reports (e.g., marine surveyor, law enforcement, or salvage operator).

- **Deductible threshold**: Most policies require a **$500–$5,000 deductible** (varies by coverage tier). Failure to comply with the 72-hour notice may void coverage under **Section III, Clause 1.2 of IYIC**, which mandates prompt reporting.`
  },
  {
    q: "Are racing and regattas covered by standard yacht policies?",
    a: `Racing and regattas are **not** covered under standard yacht insurance policies unless explicitly endorsed.

Key policy clauses and conditions:
- **Exclusion Clause 12.1 (Recreational Racing):** Most policies exclude coverage for **any organized racing event**, including regattas, unless a **Race Event Endorsement** is purchased. This applies to both professional and amateur events.
- **Policy Condition 5.3 (Participation in Competitions):** Coverage terminates if the vessel is used in **any competitive racing event**, including but not limited to, offshore races, coastal regattas, or organized fleet races.

Numerical anchor:
- A **Race Event Endorsement** typically incurs an **additional premium of 20-50%** of the base policy cost, depending on the event's duration, distance, and class of competition.`
  },
  {
    q: "How long do I have to file a claim after a loss?",
    a: `The timeframe to file a claim after a loss is governed by the **policy's "Notice of Loss" clause** and, in some jurisdictions, **state/country-specific statutes of limitations**. Most marine insurance policies require notification within **15–30 days** of discovery of the loss, though this can vary by policy or underwriting terms.

- **Policy clause reference**: The **Institute Time Clause (IT 1 1995)**—a standard marine insurance term—typically mandates notice within **15 days** of the insured discovering or having a reasonable opportunity to discover the loss. Failure to comply may result in denial under **Section 1.1.1**, which states: *"The insurer shall be discharged from all liability under this insurance if the insured fails to give notice within 15 days of discovery of the loss."*`
  }
];

console.log('=== Gate 4 Test: Fabricated Reference Detection ===\n');

for (const test of testAnswers) {
  console.log(`Q: ${test.q}`);
  const fabrication = checkFabricatedReference(test.a);
  const full = evaluateAnswer(test.a);
  
  console.log(`Gate 4 Passed: ${fabrication.passed ? '✓' : '✗'}`);
  if (!fabrication.passed) {
    console.log(`  FABRICATIONS DETECTED:`);
    fabrication.matches?.forEach(m => console.log(`    - "${m}"`));
  }
  console.log(`Full Score: ${full.score}/4 - ${full.recommendation.toUpperCase()}`);
  console.log('---\n');
}
