/**
 * Regenerate T1 answers that failed Gate 4
 *
 * 1. Find answers that failed fabrication check
 * 2. Reset to 'tagged' status
 * 3. Regenerate with new two-stage pipeline
 * 4. Re-evaluate
 */
import { createClient } from '@supabase/supabase-js';
import { evaluateAnswer } from './eval-gates';
import { generateAnswer, storeAnswers, QAInput, QAOutput } from './generate';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function regenerateFailed() {
  console.log('\n=== Regenerating Failed Gate 4 Answers ===\n');

  // Step 1: Fetch all drafted T1 answers
  const { data: answers, error } = await supabase
    .from('qa_candidates')
    .select('id, question, answer, risk_topic, intent_tier, persona_guess, scenario_stage, jurisdiction_guess')
    .eq('publish_status', 'drafted')
    .eq('intent_tier', 'T1')
    .not('answer', 'is', null);

  if (error || !answers) {
    console.error('Failed to fetch answers:', error);
    return;
  }

  console.log(`Found ${answers.length} T1 answers to check`);

  // Step 2: Identify failures
  const failed: typeof answers = [];
  for (const a of answers) {
    const result = evaluateAnswer(a.answer);
    if (!result.gates.fabricatedReference.passed) {
      failed.push(a);
    }
  }

  console.log(`${failed.length} answers failed Gate 4 - will regenerate\n`);

  if (failed.length === 0) {
    console.log('No answers to regenerate!');
    return;
  }

  // Step 3: Mark as needing regeneration (keep old answer for now)
  console.log('Marking failed answers for regeneration...');
  const failedIds = failed.map(f => f.id);

  // Step 4: Regenerate with new pipeline
  console.log('\nRegenerating with two-stage pipeline...\n');

  const results: QAOutput[] = [];
  let passCount = 0;
  let failCount = 0;

  for (let i = 0; i < failed.length; i++) {
    const q = failed[i];
    const input: QAInput = {
      id: q.id,
      question: q.question,
      risk_topic: q.risk_topic || 'other',
      jurisdiction: q.jurisdiction_guess || 'unknown',
      persona: q.persona_guess || 'unknown',
      scenario_stage: q.scenario_stage || 'unknown',
      intent_tier: q.intent_tier as 'T1' | 'T2' | 'T3',
    };

    try {
      process.stdout.write(`\r[${i + 1}/${failed.length}] Regenerating: ${q.question.slice(0, 50)}...`);

      const answer = await generateAnswer(input, supabase);
      const wordCount = answer.split(/\s+/).length;

      // Evaluate immediately
      const evalResult = evaluateAnswer(answer);

      if (evalResult.gates.fabricatedReference.passed) {
        passCount++;
      } else {
        failCount++;
        console.log(`\n  STILL FAILED: ${evalResult.gates.fabricatedReference.matches?.join(', ')}`);
      }

      results.push({
        id: q.id,
        question: q.question,
        answer,
        word_count: wordCount,
        generated_at: new Date().toISOString(),
        model: 'ministral-3:8b',
      });

    } catch (err) {
      console.error(`\nFailed to regenerate ${q.id}:`, err);
    }

    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Step 5: Store results
  console.log('\n\nStoring regenerated answers...');
  await storeAnswers(supabase, results);

  // Summary
  console.log('\n=== Regeneration Complete ===');
  console.log(`Regenerated: ${results.length}/${failed.length}`);
  console.log(`Gate 4 Pass: ${passCount}`);
  console.log(`Gate 4 Fail: ${failCount}`);

  if (failCount > 0) {
    console.log('\nSome answers still failing - may need registry expansion or prompt tuning');
  }
}

regenerateFailed();
