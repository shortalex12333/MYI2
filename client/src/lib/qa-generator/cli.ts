#!/usr/bin/env npx tsx
/**
 * Consolidated Q&A Generation Pipeline CLI
 *
 * The ONLY entry point for running the Q&A pipeline.
 *
 * Usage:
 *   npx tsx cli.ts tag [tier]      - Tag questions with intent tier and risk topic
 *   npx tsx cli.ts generate [tier] - Generate answers for tagged questions
 *   npx tsx cli.ts eval            - Evaluate all answers against 4 gates
 *   npx tsx cli.ts inject          - Run REVISE auto-injection
 *   npx tsx cli.ts stats           - Show current stats (PUBLISH/REVISE/REJECT by tier)
 *   npx tsx cli.ts test "question" - Test single question through full pipeline
 */

import { db } from './db';
import { tagQuestion, tagBatch, QuestionTags } from './tagger';
import { generateAnswer, processBatch, storeAnswers, QAInput } from './generate';
import { evaluateAnswer } from './eval-gates';
import { getReferencesForQuestion } from './reference-selector';

// =============================================================================
// TAG COMMAND
// =============================================================================

async function tagCommand(tierFilter?: string) {
  console.log('\n=== TAG COMMAND ===');

  // Build query
  let query = db
    .from('qa_candidates')
    .select('id, question')
    .eq('publish_status', 'raw');

  // Optional tier filter (for re-tagging specific tier)
  if (tierFilter) {
    query = query.eq('intent_tier', tierFilter);
  }

  const { data: questions, error } = await query.limit(500);

  if (error) {
    console.error('Error fetching questions:', error.message);
    process.exit(1);
  }

  if (!questions || questions.length === 0) {
    console.log('No raw questions to tag.');
    return;
  }

  console.log(`Found ${questions.length} questions to tag${tierFilter ? ` (filter: ${tierFilter})` : ''}`);

  const tagged = await tagBatch(questions, (done, total) => {
    process.stdout.write(`\rTagging: ${done}/${total}`);
  });

  console.log('\n\nStoring tags...');

  let stored = 0;
  for (const t of tagged) {
    const { error: updateError } = await db
      .from('qa_candidates')
      .update({
        intent_tier: t.tags.intent_tier,
        risk_topic: t.tags.risk_topic,
        persona_guess: t.tags.persona,
        scenario_stage: t.tags.scenario_stage,
        jurisdiction_guess: t.tags.jurisdiction,
        publish_status: 'tagged',
      })
      .eq('id', t.id);

    if (!updateError) stored++;
  }

  console.log(`Tagged and stored ${stored}/${tagged.length} questions`);

  // Summary by tier
  const tierCounts = tagged.reduce((acc, t) => {
    acc[t.tags.intent_tier] = (acc[t.tags.intent_tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\nTier distribution:');
  for (const [tier, count] of Object.entries(tierCounts)) {
    console.log(`  ${tier}: ${count}`);
  }
}

// =============================================================================
// GENERATE COMMAND
// =============================================================================

async function generateCommand(tierFilter?: string) {
  console.log('\n=== GENERATE COMMAND ===');

  const tier = tierFilter || 'T1';
  console.log(`Generating answers for tier: ${tier}`);

  const { data: questions, error } = await db
    .from('qa_candidates')
    .select('id, question, risk_topic, intent_tier, persona_guess, scenario_stage, jurisdiction_guess')
    .eq('publish_status', 'tagged')
    .eq('intent_tier', tier)
    .limit(100);

  if (error) {
    console.error('Error fetching questions:', error.message);
    process.exit(1);
  }

  if (!questions || questions.length === 0) {
    console.log(`No tagged questions found for tier ${tier}.`);
    return;
  }

  console.log(`Found ${questions.length} questions to process`);

  // Build QAInput array
  const inputs: QAInput[] = questions.map(q => ({
    id: q.id,
    question: q.question,
    risk_topic: q.risk_topic || 'other',
    jurisdiction: q.jurisdiction_guess || 'unknown',
    persona: q.persona_guess || 'unknown',
    scenario_stage: q.scenario_stage || 'unknown',
    intent_tier: q.intent_tier as 'T1' | 'T2' | 'T3',
  }));

  const answers = await processBatch(inputs, db, (done, total) => {
    process.stdout.write(`\rGenerating: ${done}/${total}`);
  });

  console.log('\n\nStoring answers...');
  await storeAnswers(db, answers);

  console.log(`Generated ${answers.length} answers`);

  // Quick quality check on sample
  if (answers.length > 0) {
    const sample = answers[0];
    const sampleInput = inputs.find(i => i.id === sample.id);
    const evalResult = evaluateAnswer(sample.answer, sample.question, sampleInput?.risk_topic);
    console.log(`\nSample evaluation (${evalResult.recommendation.toUpperCase()}):`);
    console.log(`  Q: ${sample.question.slice(0, 60)}...`);
    console.log(`  Score: ${evalResult.score}/5`);
  }
}

// =============================================================================
// EVAL COMMAND
// =============================================================================

async function evalCommand() {
  console.log('\n=== EVAL COMMAND ===');
  console.log('Evaluating all drafted answers against 5 quality gates\n');

  for (const tier of ['T1', 'T2', 'T3']) {
    const { data: answers, error } = await db
      .from('qa_candidates')
      .select('id, question, answer, risk_topic')
      .eq('publish_status', 'drafted')
      .eq('intent_tier', tier)
      .not('answer', 'is', null);

    if (error) {
      console.error(`Error fetching ${tier} answers:`, error.message);
      continue;
    }

    if (!answers || answers.length === 0) {
      console.log(`${tier}: No answers to evaluate`);
      continue;
    }

    const stats = { g1: 0, g2: 0, g3: 0, g4: 0, g5: 0, publish: 0, revise: 0, reject: 0 };

    for (const a of answers) {
      const r = evaluateAnswer(a.answer, a.question, a.risk_topic);
      if (r.gates.namedReference.passed) stats.g1++;
      if (r.gates.numericalAnchor.passed) stats.g2++;
      if (r.gates.genericHedge.passed) stats.g3++;
      if (r.gates.fabricatedReference.passed) stats.g4++;
      if (r.gates.referenceRelevance.passed) stats.g5++;
      stats[r.recommendation]++;
    }

    const n = answers.length;
    const pct = (x: number) => Math.round(x / n * 100);

    console.log(`=== ${tier} (${n} answers) ===`);
    console.log(`  Gate 1 (Named Ref):  ${pct(stats.g1)}% (${stats.g1}/${n})`);
    console.log(`  Gate 2 (Numerical):  ${pct(stats.g2)}% (${stats.g2}/${n})`);
    console.log(`  Gate 3 (No Hedges):  ${pct(stats.g3)}% (${stats.g3}/${n})`);
    console.log(`  Gate 4 (No Fabric):  ${pct(stats.g4)}% (${stats.g4}/${n})`);
    console.log(`  Gate 5 (Ref Relev):  ${pct(stats.g5)}% (${stats.g5}/${n})`);
    console.log(`  PUBLISH: ${pct(stats.publish)}% | REVISE: ${pct(stats.revise)}% | REJECT: ${pct(stats.reject)}%`);
    console.log();
  }
}

// =============================================================================
// INJECT COMMAND
// =============================================================================

// Reject injection if it produces awkward patterns
const AWKWARD_PATTERNS = [
  /under .+, under /i,
  /under .+, the under/i,
  /under .+, it is /i,
  /under .+, this /i,
  /under .+, there /i,
];

function isNaturalInjection(sentence: string): boolean {
  return !AWKWARD_PATTERNS.some(p => p.test(sentence));
}

async function injectReference(
  answer: string,
  riskTopic: string,
  jurisdiction: string
): Promise<{ injected: string; ref: string } | null> {
  const { references } = await getReferencesForQuestion(db, riskTopic, jurisdiction);

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
  const injectedOpener = `Under ${bestRef.citation_text}, ${
    firstSentence.charAt(0).toLowerCase() + firstSentence.slice(1)
  }`;

  if (!isNaturalInjection(injectedOpener)) return null;

  const injected = injectedOpener + remainder;

  return { injected, ref: bestRef.citation_text };
}

async function injectCommand() {
  console.log('\n=== INJECT COMMAND ===');
  console.log('Processing REVISE answers for reference auto-injection\n');

  const { data: answers, error } = await db
    .from('qa_candidates')
    .select('id, question, answer, risk_topic, jurisdiction_guess, intent_tier')
    .eq('publish_status', 'drafted')
    .not('answer', 'is', null);

  if (error) {
    console.error('Error fetching answers:', error.message);
    process.exit(1);
  }

  if (!answers || answers.length === 0) {
    console.log('No drafted answers to process.');
    return;
  }

  // Filter to REVISE only
  const reviseAnswers = answers.filter(a =>
    evaluateAnswer(a.answer, a.question, a.risk_topic).recommendation === 'revise'
  );

  console.log(`Found ${reviseAnswers.length} REVISE answers to process`);

  let promoted = 0;
  let failed = 0;
  let noRef = 0;

  for (const a of reviseAnswers) {
    const result = await injectReference(
      a.answer,
      a.risk_topic || 'other',
      a.jurisdiction_guess || 'unknown'
    );

    if (!result) {
      noRef++;
      continue;
    }

    // Re-evaluate injected answer
    const reeval = evaluateAnswer(result.injected, a.question, a.risk_topic);

    if (reeval.recommendation === 'publish') {
      const { error: updateError } = await db
        .from('qa_candidates')
        .update({ answer: result.injected })
        .eq('id', a.id);

      if (!updateError) {
        promoted++;
        console.log(`  [${a.intent_tier}] Promoted with "${result.ref}"`);
      } else {
        failed++;
      }
    } else {
      failed++;
    }
  }

  console.log('\n--- INJECTION RESULTS ---');
  console.log(`Promoted to PUBLISH: ${promoted}`);
  console.log(`No registry match:   ${noRef}`);
  console.log(`Failed post-inject:  ${failed}`);
}

// =============================================================================
// STATS COMMAND
// =============================================================================

async function statsCommand() {
  console.log('\n=== STATS COMMAND ===');
  console.log('Current Q&A Pipeline Statistics\n');

  // Get all answers with their status
  const { data: all, error } = await db
    .from('qa_candidates')
    .select('id, publish_status, intent_tier, answer, question, risk_topic');

  if (error) {
    console.error('Error fetching data:', error.message);
    process.exit(1);
  }

  if (!all || all.length === 0) {
    console.log('No data in qa_candidates table.');
    return;
  }

  // Pipeline status counts
  const statusCounts: Record<string, number> = {};
  for (const row of all) {
    const status = row.publish_status || 'unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  }

  console.log('--- Pipeline Status ---');
  for (const [status, count] of Object.entries(statusCounts).sort()) {
    console.log(`  ${status.padEnd(12)}: ${count}`);
  }
  console.log(`  ${'TOTAL'.padEnd(12)}: ${all.length}`);

  // Quality gate stats by tier (for drafted answers only)
  const drafted = all.filter(a => a.publish_status === 'drafted' && a.answer);

  if (drafted.length > 0) {
    console.log('\n--- Quality Gate Results (Drafted Answers) ---');

    const stats: Record<string, { publish: number; revise: number; reject: number; total: number }> = {
      T1: { publish: 0, revise: 0, reject: 0, total: 0 },
      T2: { publish: 0, revise: 0, reject: 0, total: 0 },
      T3: { publish: 0, revise: 0, reject: 0, total: 0 },
    };

    for (const a of drafted) {
      const tier = a.intent_tier || 'T3';
      if (!stats[tier]) continue;

      const r = evaluateAnswer(a.answer, a.question, a.risk_topic);
      stats[tier][r.recommendation]++;
      stats[tier].total++;
    }

    console.log('\nTier  | Total | PUBLISH | REVISE | REJECT');
    console.log('------|-------|---------|--------|-------');

    for (const tier of ['T1', 'T2', 'T3']) {
      const s = stats[tier];
      if (s.total === 0) {
        console.log(`${tier}    |   0   |    -    |   -    |   -`);
        continue;
      }
      const pct = (n: number) => `${Math.round(n / s.total * 100)}%`.padStart(4);
      console.log(`${tier}    | ${String(s.total).padStart(5)} | ${pct(s.publish).padStart(7)} | ${pct(s.revise).padStart(6)} | ${pct(s.reject).padStart(5)}`);
    }

    // Overall
    const totalPublish = stats.T1.publish + stats.T2.publish + stats.T3.publish;
    const totalDrafted = drafted.length;
    console.log(`\nOverall PUBLISH rate: ${totalPublish}/${totalDrafted} (${Math.round(totalPublish / totalDrafted * 100)}%)`);
  }
}

// =============================================================================
// TEST COMMAND (single question through full pipeline)
// =============================================================================

async function testCommand(question: string) {
  console.log('\n=== TEST COMMAND ===');
  console.log(`Q: ${question}\n`);

  // Step 1: Tag
  console.log('Step 1: Tagging...');
  const tags = await tagQuestion(question);
  console.log('Tags:', JSON.stringify(tags, null, 2));

  // Step 2: Reference Selection
  console.log('\nStep 2: Reference Selection...');
  const { references, promptSection } = await getReferencesForQuestion(
    db,
    tags.risk_topic,
    tags.jurisdiction
  );
  if (references.length > 0) {
    console.log('Selected refs:', references.map(r => r.citation_text).join(', '));
  } else {
    console.log('No matching refs - will describe principles without clause numbers');
  }

  // Step 3: Generate Answer
  console.log('\nStep 3: Generating answer...');
  const input: QAInput = {
    id: 'test-' + Date.now(),
    question,
    risk_topic: tags.risk_topic,
    jurisdiction: tags.jurisdiction,
    persona: tags.persona,
    scenario_stage: tags.scenario_stage,
    intent_tier: tags.intent_tier,
  };
  const answer = await generateAnswer(input, db);
  console.log(`\nA: ${answer}`);
  console.log(`\nWord count: ${answer.split(/\s+/).length}`);

  // Step 4: Evaluate
  console.log('\n--- Quality Gates ---');
  const evalResult = evaluateAnswer(answer, question, tags.risk_topic);
  console.log(`Score: ${evalResult.score}/5`);
  console.log(`  Gate 1 (Named Ref): ${evalResult.gates.namedReference.passed ? 'PASS' : 'FAIL'} - ${evalResult.gates.namedReference.details}`);
  console.log(`  Gate 2 (Numerical): ${evalResult.gates.numericalAnchor.passed ? 'PASS' : 'FAIL'} - ${evalResult.gates.numericalAnchor.details}`);
  console.log(`  Gate 3 (No Hedges): ${evalResult.gates.genericHedge.passed ? 'PASS' : 'FAIL'} - ${evalResult.gates.genericHedge.details}`);
  console.log(`  Gate 4 (No Fabric): ${evalResult.gates.fabricatedReference.passed ? 'PASS' : 'FAIL'} - ${evalResult.gates.fabricatedReference.details}`);
  console.log(`  Gate 5 (Ref Relev): ${evalResult.gates.referenceRelevance.passed ? 'PASS' : 'FAIL'} - ${evalResult.gates.referenceRelevance.details}`);

  if (!evalResult.gates.fabricatedReference.passed) {
    console.log(`    Fabricated: ${evalResult.gates.fabricatedReference.matches?.join(', ')}`);
  }

  if (!evalResult.gates.referenceRelevance.passed) {
    console.log(`    Misapplied: ${evalResult.gates.referenceRelevance.matches?.join(', ')}`);
  }

  console.log(`\nRecommendation: ${evalResult.recommendation.toUpperCase()}`);
}

// =============================================================================
// REGEN COMMAND (regenerate REJECT answers)
// =============================================================================

async function regenCommand(tierFilter?: string) {
  console.log('\n=== REGEN COMMAND ===');
  console.log('Regenerating REJECT answers with improved reference selection\n');

  // Fetch all drafted answers
  let query = db
    .from('qa_candidates')
    .select('id, question, answer, risk_topic, intent_tier, jurisdiction_guess, persona_guess, scenario_stage')
    .eq('publish_status', 'drafted')
    .not('answer', 'is', null);

  if (tierFilter) {
    query = query.eq('intent_tier', tierFilter);
  }

  const { data: answers, error } = await query;

  if (error) {
    console.error('Error fetching answers:', error.message);
    process.exit(1);
  }

  if (!answers || answers.length === 0) {
    console.log('No drafted answers to check.');
    return;
  }

  // Find REJECT answers
  const rejectAnswers = answers.filter(a =>
    evaluateAnswer(a.answer, a.question, a.risk_topic).recommendation === 'reject'
  );

  console.log(`Found ${rejectAnswers.length} REJECT answers to regenerate${tierFilter ? ` (tier: ${tierFilter})` : ''}`);

  if (rejectAnswers.length === 0) {
    console.log('No REJECT answers to regenerate.');
    return;
  }

  // Reset to tagged status (keep answer as placeholder, will be overwritten)
  const ids = rejectAnswers.map(a => a.id);
  const { error: resetError } = await db
    .from('qa_candidates')
    .update({ publish_status: 'tagged' })
    .in('id', ids);

  if (resetError) {
    console.error('Error resetting answers:', resetError.message);
    process.exit(1);
  }

  console.log(`Reset ${ids.length} answers to 'tagged' status`);

  // Group by tier and regenerate
  const byTier: Record<string, typeof rejectAnswers> = {};
  for (const a of rejectAnswers) {
    const tier = a.intent_tier || 'T3';
    if (!byTier[tier]) byTier[tier] = [];
    byTier[tier].push(a);
  }

  for (const [tier, tierAnswers] of Object.entries(byTier)) {
    console.log(`\nRegenerating ${tierAnswers.length} ${tier} answers...`);

    const inputs: QAInput[] = tierAnswers.map(a => ({
      id: a.id,
      question: a.question,
      risk_topic: a.risk_topic || 'other',
      jurisdiction: a.jurisdiction_guess || 'unknown',
      persona: a.persona_guess || 'unknown',
      scenario_stage: a.scenario_stage || 'unknown',
      intent_tier: tier as 'T1' | 'T2' | 'T3',
    }));

    const newAnswers = await processBatch(inputs, db, (done, total) => {
      process.stdout.write(`\rGenerating: ${done}/${total}`);
    });

    console.log('\nStoring...');
    await storeAnswers(db, newAnswers);

    // Check improvement
    let improved = 0;
    for (const na of newAnswers) {
      const input = inputs.find(i => i.id === na.id);
      const r = evaluateAnswer(na.answer, na.question, input?.risk_topic);
      if (r.recommendation !== 'reject') improved++;
    }

    console.log(`  ${tier}: ${improved}/${newAnswers.length} now pass (${Math.round(improved/newAnswers.length*100)}%)`);
  }

  console.log('\nRegeneration complete. Run "eval" to see updated stats.');
}

// =============================================================================
// HELP
// =============================================================================

function showHelp() {
  console.log(`
Q&A Generation Pipeline CLI
============================

Usage:
  npx tsx cli.ts <command> [options]

Commands:
  tag [tier]       Tag raw questions with intent tier and risk topic
                   Optional tier filter for re-tagging specific tier

  generate [tier]  Generate answers for tagged questions
                   Defaults to T1 if tier not specified

  eval             Evaluate all drafted answers against 5 quality gates
                   Shows per-tier breakdown of gate pass rates

  inject           Run REVISE auto-injection to promote answers to PUBLISH
                   Injects verified references into opening sentences

  stats            Show current pipeline statistics
                   Displays PUBLISH/REVISE/REJECT rates by tier

  regen [tier]     Regenerate REJECT answers with improved reference selection
                   Resets failed answers to 'tagged' and re-generates them

  test "question"  Test single question through full pipeline
                   Useful for debugging and quality checks

Examples:
  npx tsx cli.ts tag                    # Tag all raw questions
  npx tsx cli.ts tag T2                 # Re-tag T2 questions only
  npx tsx cli.ts generate T1            # Generate T1 answers
  npx tsx cli.ts generate               # Generate T1 answers (default)
  npx tsx cli.ts eval                   # Run full evaluation
  npx tsx cli.ts inject                 # Auto-inject references
  npx tsx cli.ts stats                  # Show statistics
  npx tsx cli.ts test "Is hurricane damage covered?"

Environment Variables Required:
  SUPABASE_URL           - Supabase project URL
  SUPABASE_SERVICE_KEY   - Supabase service role key
  OLLAMA_URL             - Ollama API URL (default: http://localhost:11434)
`);
}

// =============================================================================
// CLI ENTRY POINT
// =============================================================================

async function main() {
  const [, , command, ...args] = process.argv;

  try {
    switch (command) {
      case 'tag':
        await tagCommand(args[0]);
        break;

      case 'generate':
        await generateCommand(args[0]);
        break;

      case 'eval':
        await evalCommand();
        break;

      case 'inject':
        await injectCommand();
        break;

      case 'stats':
        await statsCommand();
        break;

      case 'regen':
        await regenCommand(args[0]);
        break;

      case 'test':
        if (args.length === 0) {
          console.error('Error: Please provide a question to test.');
          console.log('Usage: npx tsx cli.ts test "Your question here"');
          process.exit(1);
        }
        await testCommand(args.join(' '));
        break;

      case 'help':
      case '--help':
      case '-h':
        showHelp();
        break;

      default:
        if (command) {
          console.error(`Unknown command: ${command}`);
        }
        showHelp();
        process.exit(command ? 1 : 0);
    }
  } catch (error) {
    console.error('\nError:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
