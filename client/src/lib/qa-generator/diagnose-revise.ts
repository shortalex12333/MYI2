/**
 * Diagnose REVISE bucket to determine Type A vs Type B split
 * Type A: Clean answer, no registry match — needs injection
 * Type B: Has weak policy term match — needs regeneration
 */
import { createClient } from '@supabase/supabase-js';
import { evaluateAnswer } from './eval-gates';

const supabase = createClient(
  'https://gelaikvydtlktpsryucc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlbGFpa3Z5ZHRsa3Rwc3J5dWNjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk5MDk3NCwiZXhwIjoyMDc4NTY2OTc0fQ.Yni4c8vfWMaGTgDJ6WU9RELyo-SceREahZUFg8OLr8w'
);

// Short policy terms that shouldn't carry an answer alone
const WEAK_TERMS = ['acv', 'p&i', 'h&m', 'mlc', 'opa'];

async function diagnoseRevise() {
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

  console.log(`\n=== REVISE Bucket Analysis (${reviseAnswers.length} answers) ===\n`);

  let typeA = 0;  // Clean, no match — inject
  let typeB = 0;  // Has weak term — regenerate

  const typeAList: any[] = [];
  const typeBList: any[] = [];

  for (const a of reviseAnswers) {
    const result = evaluateAnswer(a.answer);
    const matches = result.gates.namedReference.matches || [];
    const wordCount = a.answer.split(/\s+/).length;

    // Check if matches are only weak terms
    const onlyWeakTerms = matches.length > 0 &&
      matches.every(m => WEAK_TERMS.includes(m.toLowerCase()));

    const entry = {
      tier: a.intent_tier,
      question: a.question.slice(0, 60),
      risk_topic: a.risk_topic,
      matches: matches.slice(0, 3),
      word_count: wordCount
    };

    if (matches.length === 0) {
      // Type A: No matches at all
      typeA++;
      typeAList.push(entry);
    } else if (onlyWeakTerms) {
      // Type B: Only weak terms
      typeB++;
      typeBList.push({ ...entry, weak_only: true });
    } else {
      // Has strong reference but still REVISE — investigate
      typeA++;  // Treat as Type A, the reference should pass
      typeAList.push({ ...entry, has_strong: true });
    }
  }

  console.log('=== SUMMARY ===');
  console.log(`Type A (inject): ${typeA} (${Math.round(typeA/reviseAnswers.length*100)}%)`);
  console.log(`Type B (regen):  ${typeB} (${Math.round(typeB/reviseAnswers.length*100)}%)`);

  console.log('\n=== TYPE A — INJECT CANDIDATES ===\n');
  for (const a of typeAList.slice(0, 10)) {
    console.log(`[${a.tier}] ${a.risk_topic}: "${a.question}..."`);
    console.log(`    Matches: ${a.matches.length > 0 ? a.matches.join(', ') : 'NONE'}`);
  }
  if (typeAList.length > 10) {
    console.log(`    ... and ${typeAList.length - 10} more`);
  }

  console.log('\n=== TYPE B — REGENERATE CANDIDATES ===\n');
  for (const b of typeBList.slice(0, 10)) {
    console.log(`[${b.tier}] ${b.risk_topic}: "${b.question}..."`);
    console.log(`    Weak matches: ${b.matches.join(', ')}`);
  }
  if (typeBList.length > 10) {
    console.log(`    ... and ${typeBList.length - 10} more`);
  }

  // By tier breakdown
  console.log('\n=== BY TIER ===');
  const byTier: Record<string, { a: number; b: number }> = {};
  for (const a of typeAList) {
    byTier[a.tier] = byTier[a.tier] || { a: 0, b: 0 };
    byTier[a.tier].a++;
  }
  for (const b of typeBList) {
    byTier[b.tier] = byTier[b.tier] || { a: 0, b: 0 };
    byTier[b.tier].b++;
  }
  for (const [tier, counts] of Object.entries(byTier)) {
    console.log(`${tier}: Type A=${counts.a}, Type B=${counts.b}`);
  }

  // By topic breakdown
  console.log('\n=== TYPE A BY TOPIC ===');
  const topicCounts: Record<string, number> = {};
  for (const a of typeAList) {
    topicCounts[a.risk_topic] = (topicCounts[a.risk_topic] || 0) + 1;
  }
  const sorted = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]);
  for (const [topic, count] of sorted) {
    console.log(`  ${topic}: ${count}`);
  }
}

diagnoseRevise();
