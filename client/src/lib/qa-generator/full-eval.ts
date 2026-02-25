/**
 * Full 4-gate evaluation of all T1 answers
 */
import { createClient } from '@supabase/supabase-js';
import { evaluateAnswer } from './eval-gates';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fullEval() {
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

  console.log(`\n=== Full 4-Gate Evaluation: ${answers.length} T1 Answers ===\n`);

  const stats = {
    namedRef: { pass: 0, fail: 0 },
    numerical: { pass: 0, fail: 0 },
    noHedge: { pass: 0, fail: 0 },
    noFabrication: { pass: 0, fail: 0 },
    recommendations: { publish: 0, revise: 0, reject: 0 }
  };

  for (const a of answers) {
    const result = evaluateAnswer(a.answer);

    if (result.gates.namedReference.passed) stats.namedRef.pass++;
    else stats.namedRef.fail++;

    if (result.gates.numericalAnchor.passed) stats.numerical.pass++;
    else stats.numerical.fail++;

    if (result.gates.genericHedge.passed) stats.noHedge.pass++;
    else stats.noHedge.fail++;

    if (result.gates.fabricatedReference.passed) stats.noFabrication.pass++;
    else stats.noFabrication.fail++;

    stats.recommendations[result.recommendation]++;
  }

  const total = answers.length;
  const pct = (n: number) => Math.round(n / total * 100);

  console.log('Gate Results:');
  console.log(`  Gate 1 (Named Ref):     ${stats.namedRef.pass}/${total} (${pct(stats.namedRef.pass)}%)`);
  console.log(`  Gate 2 (Numerical):     ${stats.numerical.pass}/${total} (${pct(stats.numerical.pass)}%)`);
  console.log(`  Gate 3 (No Hedges):     ${stats.noHedge.pass}/${total} (${pct(stats.noHedge.pass)}%)`);
  console.log(`  Gate 4 (No Fabrication): ${stats.noFabrication.pass}/${total} (${pct(stats.noFabrication.pass)}%)`);

  console.log('\nRecommendations:');
  console.log(`  PUBLISH: ${stats.recommendations.publish} (${pct(stats.recommendations.publish)}%)`);
  console.log(`  REVISE:  ${stats.recommendations.revise} (${pct(stats.recommendations.revise)}%)`);
  console.log(`  REJECT:  ${stats.recommendations.reject} (${pct(stats.recommendations.reject)}%)`);
}

fullEval();
