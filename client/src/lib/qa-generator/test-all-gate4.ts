/**
 * Test Gate 4 against ALL existing T1 answers from database
 */
import { createClient } from '@supabase/supabase-js';
import { evaluateAnswer } from './eval-gates';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testAllAnswers() {
  const { data: answers, error } = await supabase
    .from('qa_candidates')
    .select('id, question, answer')
    .eq('publish_status', 'drafted')
    .not('answer', 'is', null);

  if (error || !answers) {
    console.error('Failed to fetch answers:', error);
    return;
  }

  console.log(`\n=== Gate 4 Test: ${answers.length} T1 Answers ===\n`);

  let passed = 0;
  let failed = 0;
  const allFabrications: string[] = [];

  for (const a of answers) {
    const result = evaluateAnswer(a.answer);
    const fabrication = result.gates.fabricatedReference;

    if (fabrication.passed) {
      passed++;
    } else {
      failed++;
      if (fabrication.matches) {
        allFabrications.push(...fabrication.matches);
      }
    }
  }

  const passRate = Math.round(passed / answers.length * 100);
  const failRate = Math.round(failed / answers.length * 100);

  console.log(`PASSED: ${passed}/${answers.length} (${passRate}%)`);
  console.log(`FAILED: ${failed}/${answers.length} (${failRate}%)`);

  // Dedupe and show most common fabrications
  const fabricationCounts: Record<string, number> = {};
  for (const f of allFabrications) {
    fabricationCounts[f] = (fabricationCounts[f] || 0) + 1;
  }

  const sorted = Object.entries(fabricationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  console.log('\n--- Most Common Fabrications ---');
  for (const [fab, count] of sorted) {
    console.log(`  ${count}x: "${fab}"`);
  }
}

testAllAnswers();
