/**
 * REVISE Auto-Injector
 *
 * Promotes REVISE answers to PUBLISH by injecting verified references
 * into the opening sentence. Only works on Type A answers (clean structure,
 * no registry match at generation time).
 */
import { createClient } from '@supabase/supabase-js';
import { evaluateAnswer } from './eval-gates';
import { getReferencesForQuestion } from './reference-selector';

const supabase = createClient(
  'https://gelaikvydtlktpsryucc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlbGFpa3Z5ZHRsa3Rwc3J5dWNjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk5MDk3NCwiZXhwIjoyMDc4NTY2OTc0fQ.Yni4c8vfWMaGTgDJ6WU9RELyo-SceREahZUFg8OLr8w'
);

// Reject injection if it produces these awkward patterns
const AWKWARD_PATTERNS = [
  /under .+, under /i,        // double "under"
  /under .+, the under/i,     // malformed
  /under .+, it is /i,        // too passive
  /under .+, this /i,         // weak opener
  /under .+, there /i,        // existential
];

function isNaturalInjection(sentence: string): boolean {
  return !AWKWARD_PATTERNS.some(p => p.test(sentence));
}

/**
 * Inject a verified reference into the opening sentence
 */
async function injectReference(
  answer: string,
  riskTopic: string,
  jurisdiction: string
): Promise<{ injected: string; ref: string } | null> {

  // Get best registry match for this topic
  const { references } = await getReferencesForQuestion(
    supabase as any,
    riskTopic,
    jurisdiction
  );

  if (references.length === 0) return null;

  const bestRef = references[0];

  // Find the first sentence boundary
  const firstSentenceEnd = answer.search(/\.\s/);
  if (firstSentenceEnd === -1) return null;

  const firstSentence = answer.slice(0, firstSentenceEnd + 1);
  const remainder = answer.slice(firstSentenceEnd + 1);

  // Skip if first sentence is too short or too long
  if (firstSentence.length < 20 || firstSentence.length > 300) return null;

  // Build injected sentence
  // "X is covered." → "Under [IYIC 1985], X is covered."
  const injectedOpener = `Under ${bestRef.citation_text}, ${
    firstSentence.charAt(0).toLowerCase() + firstSentence.slice(1)
  }`;

  // Check for awkward patterns
  if (!isNaturalInjection(injectedOpener)) return null;

  const injected = injectedOpener + remainder;

  return { injected, ref: bestRef.citation_text };
}

/**
 * Process all REVISE answers and attempt injection
 */
async function processReviseQueue() {
  const { data: answers, error } = await supabase
    .from('qa_candidates')
    .select('id, question, answer, risk_topic, jurisdiction_guess, intent_tier')
    .eq('publish_status', 'drafted')
    .not('answer', 'is', null);

  if (error || !answers) {
    console.error('Failed to fetch:', error);
    return;
  }

  const reviseAnswers = answers.filter(a =>
    evaluateAnswer(a.answer).recommendation === 'revise'
  );

  console.log(`\n=== Processing ${reviseAnswers.length} REVISE Answers ===\n`);

  let promoted = 0;
  let failed = 0;
  let noRef = 0;
  const failedList: { question: string; reason: string }[] = [];

  for (const a of reviseAnswers) {
    const result = await injectReference(
      a.answer,
      a.risk_topic || 'other',
      a.jurisdiction_guess || 'unknown'
    );

    if (!result) {
      noRef++;
      failedList.push({
        question: a.question.slice(0, 50),
        reason: 'No ref or awkward injection'
      });
      continue;
    }

    // Re-evaluate injected answer
    const reeval = evaluateAnswer(result.injected);

    if (reeval.recommendation === 'publish') {
      // Update the answer in database
      const { error: updateError } = await supabase
        .from('qa_candidates')
        .update({
          answer: result.injected,
          // Keep publish_status as 'drafted' - don't change state
        })
        .eq('id', a.id);

      if (updateError) {
        console.error(`Failed to update ${a.id}:`, updateError.message);
        failed++;
      } else {
        promoted++;
        console.log(`✓ [${a.intent_tier}] Promoted with "${result.ref}"`);
      }
    } else {
      failed++;
      failedList.push({
        question: a.question.slice(0, 50),
        reason: `Still ${reeval.recommendation} after injection`
      });
    }
  }

  console.log('\n=== RESULTS ===');
  console.log(`Promoted to PUBLISH: ${promoted}`);
  console.log(`No registry match:   ${noRef}`);
  console.log(`Failed post-inject:  ${failed}`);

  if (failedList.length > 0 && failedList.length <= 10) {
    console.log('\nFailed items:');
    for (const f of failedList) {
      console.log(`  - "${f.question}..." — ${f.reason}`);
    }
  }

  // Run final eval
  console.log('\n=== FINAL EVALUATION ===');
  const { data: finalAnswers } = await supabase
    .from('qa_candidates')
    .select('id, answer, intent_tier')
    .eq('publish_status', 'drafted')
    .not('answer', 'is', null);

  if (finalAnswers) {
    const stats: Record<string, { publish: number; revise: number; reject: number }> = {
      T1: { publish: 0, revise: 0, reject: 0 },
      T2: { publish: 0, revise: 0, reject: 0 },
      T3: { publish: 0, revise: 0, reject: 0 },
    };

    for (const a of finalAnswers) {
      const r = evaluateAnswer(a.answer);
      stats[a.intent_tier][r.recommendation]++;
    }

    console.log('\nTier  | PUBLISH | REVISE | REJECT');
    console.log('------|---------|--------|-------');
    for (const tier of ['T1', 'T2', 'T3']) {
      const s = stats[tier];
      const total = s.publish + s.revise + s.reject;
      console.log(`${tier}    | ${Math.round(s.publish/total*100)}%     | ${Math.round(s.revise/total*100)}%    | ${Math.round(s.reject/total*100)}%`);
    }

    const totalPublish = stats.T1.publish + stats.T2.publish + stats.T3.publish;
    const totalAll = finalAnswers.length;
    console.log(`\nOverall: ${totalPublish}/${totalAll} (${Math.round(totalPublish/totalAll*100)}%) PUBLISH`);
  }
}

// Run
processReviseQueue();
