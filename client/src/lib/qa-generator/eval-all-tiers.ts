/**
 * Evaluate all tiers against quality gates
 */
import { createClient } from '@supabase/supabase-js';
import { evaluateAnswer } from './eval-gates';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function evalAllTiers() {
  for (const tier of ['T1', 'T2', 'T3']) {
    const { data: answers, error } = await supabase
      .from('qa_candidates')
      .select('id, answer')
      .eq('publish_status', 'drafted')
      .eq('intent_tier', tier)
      .not('answer', 'is', null);

    if (error || !answers || answers.length === 0) {
      console.log(`${tier}: No answers found`);
      continue;
    }

    const stats = { g1: 0, g2: 0, g3: 0, g4: 0, publish: 0, revise: 0, reject: 0 };

    for (const a of answers) {
      const r = evaluateAnswer(a.answer);
      if (r.gates.namedReference.passed) stats.g1++;
      if (r.gates.numericalAnchor.passed) stats.g2++;
      if (r.gates.genericHedge.passed) stats.g3++;
      if (r.gates.fabricatedReference.passed) stats.g4++;
      stats[r.recommendation]++;
    }

    const n = answers.length;
    const pct = (x: number) => Math.round(x / n * 100);

    console.log(`\n=== ${tier} (${n} answers) ===`);
    console.log(`Gate 1 (Named Ref):  ${pct(stats.g1)}%`);
    console.log(`Gate 2 (Numerical):  ${pct(stats.g2)}%`);
    console.log(`Gate 3 (No Hedges):  ${pct(stats.g3)}%`);
    console.log(`Gate 4 (No Fabric):  ${pct(stats.g4)}%`);
    console.log(`PUBLISH: ${pct(stats.publish)}% | REVISE: ${pct(stats.revise)}% | REJECT: ${pct(stats.reject)}%`);
  }
}

evalAllTiers();
