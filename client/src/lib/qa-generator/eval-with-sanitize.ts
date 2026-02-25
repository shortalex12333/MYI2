/**
 * Evaluate existing T1 answers WITH sanitization applied
 * Shows impact of post-processing on Gate 3
 */
import { createClient } from '@supabase/supabase-js';
import { evaluateAnswer } from './eval-gates';
import { sanitizeAnswer } from './sanitize';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function evalWithSanitize() {
  const { data: answers, error } = await supabase
    .from('qa_candidates')
    .select('id, question, answer')
    .eq('publish_status', 'drafted')
    .eq('intent_tier', 'T1')
    .not('answer', 'is', null);

  if (error || !answers) {
    console.error('Failed to fetch:', error);
    return;
  }

  console.log(`\n=== Evaluation WITH Sanitization: ${answers.length} T1 Answers ===\n`);

  const beforeStats = { g1: 0, g2: 0, g3: 0, g4: 0, publish: 0, revise: 0, reject: 0 };
  const afterStats = { g1: 0, g2: 0, g3: 0, g4: 0, publish: 0, revise: 0, reject: 0 };

  for (const a of answers) {
    // Before sanitization
    const before = evaluateAnswer(a.answer);
    if (before.gates.namedReference.passed) beforeStats.g1++;
    if (before.gates.numericalAnchor.passed) beforeStats.g2++;
    if (before.gates.genericHedge.passed) beforeStats.g3++;
    if (before.gates.fabricatedReference.passed) beforeStats.g4++;
    beforeStats[before.recommendation]++;

    // After sanitization
    const sanitized = sanitizeAnswer(a.answer);
    const after = evaluateAnswer(sanitized);
    if (after.gates.namedReference.passed) afterStats.g1++;
    if (after.gates.numericalAnchor.passed) afterStats.g2++;
    if (after.gates.genericHedge.passed) afterStats.g3++;
    if (after.gates.fabricatedReference.passed) afterStats.g4++;
    afterStats[after.recommendation]++;
  }

  const total = answers.length;
  const pct = (n: number) => Math.round(n / total * 100);

  console.log('                    BEFORE    AFTER     CHANGE');
  console.log('Gate 1 (Named Ref):  ' + `${pct(beforeStats.g1)}%`.padEnd(10) + `${pct(afterStats.g1)}%`.padEnd(10) + `${pct(afterStats.g1) - pct(beforeStats.g1)}%`);
  console.log('Gate 2 (Numerical):  ' + `${pct(beforeStats.g2)}%`.padEnd(10) + `${pct(afterStats.g2)}%`.padEnd(10) + `${pct(afterStats.g2) - pct(beforeStats.g2)}%`);
  console.log('Gate 3 (No Hedges):  ' + `${pct(beforeStats.g3)}%`.padEnd(10) + `${pct(afterStats.g3)}%`.padEnd(10) + `+${pct(afterStats.g3) - pct(beforeStats.g3)}%`);
  console.log('Gate 4 (No Fabric):  ' + `${pct(beforeStats.g4)}%`.padEnd(10) + `${pct(afterStats.g4)}%`.padEnd(10) + `${pct(afterStats.g4) - pct(beforeStats.g4)}%`);
  console.log('');
  console.log('PUBLISH:             ' + `${pct(beforeStats.publish)}%`.padEnd(10) + `${pct(afterStats.publish)}%`.padEnd(10) + `+${pct(afterStats.publish) - pct(beforeStats.publish)}%`);
  console.log('REVISE:              ' + `${pct(beforeStats.revise)}%`.padEnd(10) + `${pct(afterStats.revise)}%`.padEnd(10));
  console.log('REJECT:              ' + `${pct(beforeStats.reject)}%`.padEnd(10) + `${pct(afterStats.reject)}%`.padEnd(10));
}

evalWithSanitize();
