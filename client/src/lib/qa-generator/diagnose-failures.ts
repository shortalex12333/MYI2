/**
 * Diagnose failure patterns across all tiers
 * - T2/T3 rejects by risk_topic (Gate 4 fabrication)
 * - T1 Gate 1 failures by risk_topic
 * - T1 Gate 4 failures with actual fabricated content
 */
import { createClient } from '@supabase/supabase-js';
import { evaluateAnswer } from './eval-gates';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function diagnose() {
  // === T2/T3 REJECTS BY TOPIC ===
  console.log('\n=== T2/T3 REJECTS BY RISK_TOPIC (Gate 4 Fabrication) ===\n');

  for (const tier of ['T2', 'T3']) {
    const { data: answers } = await supabase
      .from('qa_candidates')
      .select('id, question, answer, risk_topic')
      .eq('publish_status', 'drafted')
      .eq('intent_tier', tier)
      .not('answer', 'is', null);

    if (!answers) continue;

    const rejectsByTopic: Record<string, { count: number; examples: string[] }> = {};

    for (const a of answers) {
      const result = evaluateAnswer(a.answer);
      if (result.recommendation === 'reject') {
        const topic = a.risk_topic || 'unknown';
        if (!rejectsByTopic[topic]) {
          rejectsByTopic[topic] = { count: 0, examples: [] };
        }
        rejectsByTopic[topic].count++;
        if (rejectsByTopic[topic].examples.length < 2) {
          const fabricated = result.gates.fabricatedReference.matches || [];
          rejectsByTopic[topic].examples.push(
            `Q: ${a.question.slice(0, 60)}... | Fabricated: ${fabricated.join(', ')}`
          );
        }
      }
    }

    console.log(`${tier} Rejects by Topic:`);
    const sorted = Object.entries(rejectsByTopic).sort((a, b) => b[1].count - a[1].count);
    for (const [topic, data] of sorted) {
      console.log(`  ${topic}: ${data.count}`);
      for (const ex of data.examples) {
        console.log(`    - ${ex}`);
      }
    }
    console.log('');
  }

  // === T1 GATE 1 FAILURES BY TOPIC ===
  console.log('\n=== T1 GATE 1 FAILURES BY RISK_TOPIC ===\n');

  const { data: t1Answers } = await supabase
    .from('qa_candidates')
    .select('id, question, answer, risk_topic')
    .eq('publish_status', 'drafted')
    .eq('intent_tier', 'T1')
    .not('answer', 'is', null);

  if (t1Answers) {
    const g1FailsByTopic: Record<string, { count: number; questions: string[] }> = {};

    for (const a of t1Answers) {
      const result = evaluateAnswer(a.answer);
      if (!result.gates.namedReference.passed) {
        const topic = a.risk_topic || 'unknown';
        if (!g1FailsByTopic[topic]) {
          g1FailsByTopic[topic] = { count: 0, questions: [] };
        }
        g1FailsByTopic[topic].count++;
        if (g1FailsByTopic[topic].questions.length < 2) {
          g1FailsByTopic[topic].questions.push(a.question.slice(0, 80));
        }
      }
    }

    console.log('T1 Gate 1 Failures by Topic:');
    const sorted = Object.entries(g1FailsByTopic).sort((a, b) => b[1].count - a[1].count);
    for (const [topic, data] of sorted) {
      console.log(`  ${topic}: ${data.count}`);
      for (const q of data.questions) {
        console.log(`    - ${q}`);
      }
    }
  }

  // === T1 GATE 4 FAILURES (FABRICATED CONTENT) ===
  console.log('\n\n=== T1 GATE 4 FAILURES (Actual Fabricated Content) ===\n');

  if (t1Answers) {
    for (const a of t1Answers) {
      const result = evaluateAnswer(a.answer);
      if (!result.gates.fabricatedReference.passed) {
        console.log(`Q: ${a.question}`);
        console.log(`Topic: ${a.risk_topic}`);
        console.log(`Fabricated: ${result.gates.fabricatedReference.matches?.join(', ')}`);
        console.log(`Answer excerpt: ${a.answer.slice(0, 300)}...`);
        console.log('---');
      }
    }
  }
}

diagnose();
