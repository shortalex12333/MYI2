#!/usr/bin/env ts-node
/**
 * MYI Papers Pipeline CLI
 *
 * All commands for the long-form article generation system.
 * Runs on Qwen3-32B. Parallel to Q&A pipeline.
 *
 * Commands:
 *   seed         Convert scraped questions → paper_topics
 *   score        GEO-score all unseeded topics
 *   generate     Generate one paper from top-scored topic
 *   validate     Run quality gates on draft papers
 *   schedule     Build publication calendar
 *   next         Show next paper due for publication
 *   status       Pipeline health dashboard
 *
 * Examples:
 *   npx ts-node cli.ts seed --limit=50
 *   npx ts-node cli.ts score --limit=100
 *   npx ts-node cli.ts generate
 *   npx ts-node cli.ts generate --topic-id=uuid
 *   npx ts-node cli.ts validate --all-drafts
 *   npx ts-node cli.ts validate --paper-id=uuid
 *   npx ts-node cli.ts schedule --weeks=4
 *   npx ts-node cli.ts next
 *   npx ts-node cli.ts status
 */

import { db } from './db';
import { seedTopics }         from './topic-seeder';
import { scoreTopics }        from './retrieval-scorer';
import { generatePaper }      from './paper-generator';
import { validatePaper, validateAllDrafts, GateResult } from './paper-gates';
import { scheduleWeeks, getTodaysPaper, scheduleNextPaper } from './scheduler';
import { injectAndSave, extractSignals } from './reference-injector';
import { generatePaperSectional, generateBatch } from './sectional-generator';
import { runValidateRefs } from './allowlist-validator';
import { measureClaimViolations, formatMeasurementReport } from './citation-requirement-validator';

// ─── ARG PARSER ──────────────────────────────────────────────
function getArg(name: string): string | undefined {
  const arg = process.argv.find(a => a.startsWith(`--${name}=`));
  return arg?.split('=')[1];
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function getIntArg(name: string, fallback: number): number {
  return parseInt(getArg(name) ?? '', 10) || fallback;
}

// ─── SEED ────────────────────────────────────────────────────
async function runSeed() {
  const limit = getIntArg('limit', 50);
  console.log(`\nSeeding up to ${limit} topics with contamination blocking...\n`);

  const { data: questions, error } = await db
    .from('qa_candidates')
    .select('id, question, risk_topic')
    .limit(limit);

  if (error || !questions) {
    console.error('Failed to fetch questions:', error?.message);
    process.exit(1);
  }

  const result = await seedTopics(questions);

  console.log(`Seeded:              ${result.seeded}`);
  console.log(`Blocked (contamination): ${result.blocked_contamination}`);
  console.log(`Failed transform:    ${result.failed_transform}`);
  console.log(`Skipped (duplicate): ${result.skipped_duplicate}`);
}

// ─── SCORE ───────────────────────────────────────────────────
async function runScore() {
  const limit = getIntArg('limit', 100);
  console.log(`\nScoring up to ${limit} topics with GROUNDED Retrieval Score...\n`);

  const result = await scoreTopics(limit);

  console.log(`Scored:  ${result.scored}`);
  console.log('\nTop 10 by Retrieval Score:');
  console.log('─'.repeat(70));
  console.log('Score | Band   | Freq | Urg | Liab | Jur | Topic');
  console.log('─'.repeat(70));

  for (const t of result.results.slice(0, 10)) {
    const b = t.breakdown;
    console.log(
      `  ${String(t.retrieval_score).padStart(2)} | ${t.band.padEnd(6)} | ` +
      `${String(b.frequency).padStart(4)} | ${String(b.urgency).padStart(3)} | ` +
      `${String(b.liability).padStart(4)} | ${String(b.jurisdiction).padStart(3)} | ${t.topic_id.slice(0,8)}`
    );
  }
}

// ─── GENERATE ────────────────────────────────────────────────
async function runGenerate() {
  const topicId = getArg('topic-id');

  let targetId = topicId;

  if (!targetId) {
    // Pick top-scored unassigned topic
    const { data, error } = await db
      .from('paper_topics')
      .select('id, canonical_title, geo_score')
      .eq('status', 'scored')
      .order('geo_score', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.error('No scored topics available. Run: npx ts-node cli.ts score');
      process.exit(1);
    }

    targetId = data.id;
    console.log(`\nSelected top topic: ${data.canonical_title} (GEO: ${data.geo_score})\n`);
  }

  if (!targetId) {
    console.error('No topic ID available');
    process.exit(1);
  }

  console.log(`Generating paper for topic ${targetId}...`);
  console.log('Model: qwen3:32b  Temperature: 0.15');
  console.log('─'.repeat(60));

  const result = await generatePaper(targetId);

  console.log(`\n✓ Generated: ${result.title}`);
  console.log(`  Slug:       /briefs/${result.slug}`);
  console.log(`  Words:      ${result.wordCount}`);
  console.log(`  Refs:       ${result.refCount}`);
  console.log(`  Paper ID:   ${result.paperId}`);
  console.log(`\nRun: npx ts-node cli.ts validate --paper-id=${result.paperId}`);
}

// ─── VALIDATE ────────────────────────────────────────────────
async function runValidate() {
  if (hasFlag('all-drafts')) {
    console.log('\nValidating all draft papers...\n');
    const results = await validateAllDrafts();

    console.log('─'.repeat(60));
    console.log(`PUBLISH: ${results.publish}`);
    console.log(`REVISE:  ${results.revise}`);
    console.log(`REJECT:  ${results.reject}`);
    console.log('─'.repeat(60));

    for (const r of results.results) {
      const icon = r.verdict === 'publish' ? '✓'
                 : r.verdict === 'revise'  ? '~' : '✗';
      console.log(`${icon} ${r.paperId.slice(0, 8)} → ${r.verdict.toUpperCase()}`);
      for (const g of r.gates.filter((g: GateResult) => !g.passed)) {
        console.log(`  ✗ ${g.gate}: ${g.detail}`);
      }
    }
    return;
  }

  const paperId = getArg('paper-id');
  if (!paperId) {
    console.error('Provide --paper-id=uuid or --all-drafts');
    process.exit(1);
  }

  const result = await validatePaper(paperId);
  console.log(`\nPaper: ${paperId}`);
  console.log(`Verdict: ${result.verdict.toUpperCase()}\n`);

  for (const g of result.gates) {
    const icon = g.passed ? '✓' : g.fatal ? '✗' : '~';
    console.log(`${icon} [${g.gate}] ${g.detail}`);
  }
}

// ─── SCHEDULE ────────────────────────────────────────────────
async function runSchedule() {
  const weeks = getIntArg('weeks', 4);
  console.log(`\nScheduling ${weeks} weeks of papers (every ${2} days)...\n`);

  const result = await scheduleWeeks(weeks);

  console.log(`Scheduled: ${result.scheduled} papers`);
  console.log('\nDates:');
  for (const d of result.dates) {
    console.log(`  ${d}`);
  }
}

// ─── NEXT ────────────────────────────────────────────────────
async function runNext() {
  const paper = await getTodaysPaper();

  if (!paper) {
    console.log('\nNo paper due today.');
    const r = await scheduleNextPaper();
    if (r.scheduled) {
      console.log(`Next scheduled: ${r.publishDate} — ${r.paperTitle}`);
    }
    return;
  }

  console.log('\nDue for publication:');
  console.log('─'.repeat(60));
  console.log(`Title:   ${paper.title}`);
  console.log(`Slug:    /briefs/${paper.slug}`);
  console.log(`Date:    ${paper.publishDate}`);
  console.log(`Status:  ${paper.status}`);
}

// ─── STATUS ──────────────────────────────────────────────────
async function runStatus() {
  const [topics, papers, calendar] = await Promise.all([
    db.from('paper_topics').select('status', { count: 'exact', head: false }),
    db.from('papers').select('review_status', { count: 'exact', head: false }),
    db.from('paper_calendar').select('status', { count: 'exact', head: false }),
  ]);

  const topicCounts   = countBy(topics.data  ?? [], 'status');
  const paperCounts   = countBy(papers.data  ?? [], 'review_status');
  const calendarCounts = countBy(calendar.data ?? [], 'status');

  console.log('\n╔═ MYI Papers Pipeline Status ══════════════════════╗');
  console.log('║                                                     ║');
  console.log(`║  TOPICS                                             ║`);
  console.log(`║  Seed:     ${String(topicCounts['seed']     ?? 0).padEnd(5)} Scored: ${String(topicCounts['scored']   ?? 0).padEnd(5)} Assigned: ${String(topicCounts['assigned'] ?? 0).padEnd(5)} ║`);
  console.log('║                                                     ║');
  console.log(`║  PAPERS                                             ║`);
  console.log(`║  Draft:    ${String(paperCounts['draft']     ?? 0).padEnd(5)} Reviewed: ${String(paperCounts['reviewed'] ?? 0).padEnd(4)} Published: ${String(paperCounts['published'] ?? 0).padEnd(4)} ║`);
  console.log('║                                                     ║');
  console.log(`║  CALENDAR                                           ║`);
  console.log(`║  Scheduled: ${String(calendarCounts['scheduled'] ?? 0).padEnd(4)} Published: ${String(calendarCounts['published'] ?? 0).padEnd(4)}               ║`);
  console.log('╚═════════════════════════════════════════════════════╝\n');
}

function countBy<T extends Record<string, unknown>>(
  arr: T[],
  key: string
): Record<string, number> {
  return arr.reduce((acc, item) => {
    const val = String(item[key] ?? 'unknown');
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

// ─── INJECT ─────────────────────────────────────────────────
async function runInject() {
  const paperId = getArg('paper-id');

  if (!paperId) {
    // Inject all drafts without references
    const { data: papers, error } = await db
      .from('papers')
      .select('id, title')
      .eq('review_status', 'draft')
      .limit(20);

    if (error || !papers?.length) {
      console.log('No draft papers to inject.');
      return;
    }

    console.log(`\nInjecting references into ${papers.length} draft papers...\n`);

    for (const paper of papers) {
      try {
        const result = await injectAndSave(paper.id);
        console.log(`✓ ${paper.title.slice(0, 50)}... → ${result.refs_matched} refs`);
        if (result.signals.frameworks.length > 0) {
          console.log(`  Frameworks: ${result.signals.frameworks.join(', ')}`);
        }
        if (result.signals.tags.length > 0) {
          console.log(`  Tags: ${result.signals.tags.slice(0, 5).join(', ')}`);
        }
      } catch (e) {
        console.log(`✗ ${paper.title.slice(0, 50)}... → ${e instanceof Error ? e.message : 'failed'}`);
      }
    }
    return;
  }

  // Single paper injection
  console.log(`\nInjecting references into paper ${paperId}...\n`);

  const result = await injectAndSave(paperId);

  console.log('Signals extracted:');
  console.log(`  Frameworks:    ${result.signals.frameworks.join(', ') || '(none)'}`);
  console.log(`  Tags:          ${result.signals.tags.join(', ') || '(none)'}`);
  console.log(`  Jurisdictions: ${result.signals.jurisdictions.join(', ') || '(none)'}`);
  console.log('');
  console.log(`References injected: ${result.refs_matched}`);
  result.refs.forEach((ref, i) => {
    console.log(`  ${i + 1}. ${ref.short_title} (${ref.citation_category})`);
  });
}

// ─── GENERATE-SECTIONAL ─────────────────────────────────────
async function runGenerateSectional() {
  const topicId = getArg('topic-id');

  if (!topicId) {
    // Pick top-scored unassigned topic
    const { data, error } = await db
      .from('paper_topics')
      .select('id, canonical_title, geo_score')
      .eq('status', 'scored')
      .order('geo_score', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.error('No scored topics available. Run: npx tsx cli.ts score');
      process.exit(1);
    }

    console.log(`\nSelected topic: ${data.canonical_title}\n`);
    const result = await generatePaperSectional(data.id);
    console.log(`\n✓ Generated: ${result.title}`);
    console.log(`  Words:  ${result.wordCount}`);
    console.log(`  Refs:   ${result.refCount}`);
    console.log(`  Sections: ${JSON.stringify(result.sectionWordCounts)}`);
    console.log(`  Paper ID: ${result.paperId}`);
    return;
  }

  console.log(`\nGenerating sectional paper for topic ${topicId}...\n`);
  const result = await generatePaperSectional(topicId);
  console.log(`\n✓ Generated: ${result.title}`);
  console.log(`  Words:  ${result.wordCount}`);
  console.log(`  Refs:   ${result.refCount}`);
  console.log(`  Sections: ${JSON.stringify(result.sectionWordCounts)}`);
  console.log(`  Paper ID: ${result.paperId}`);
}

// ─── BATCH ──────────────────────────────────────────────────
async function runBatch() {
  const limit = getIntArg('limit', 10);
  console.log(`\n=== BATCH GENERATION: ${limit} papers ===\n`);

  const startTime = Date.now();
  const result = await generateBatch(limit);
  const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

  console.log('\n' + '═'.repeat(60));
  console.log(`BATCH COMPLETE`);
  console.log(`  Success: ${result.success}`);
  console.log(`  Failed:  ${result.failed}`);
  console.log(`  Duration: ${duration} minutes`);
  console.log('═'.repeat(60));
}

// ─── VALIDATE-CLAIMS ─────────────────────────────────────────
async function runValidateClaims() {
  console.log('\n=== Citation Requirement Validation ===\n');
  console.log('Checking all draft papers for uncited claims and invalid standards...\n');

  const report = await measureClaimViolations();
  console.log(formatMeasurementReport(report));
}

// ─── ROUTER ──────────────────────────────────────────────────
async function main() {
  const command = process.argv[2];

  const commands: Record<string, () => Promise<void>> = {
    seed:           runSeed,
    score:          runScore,
    generate:       runGenerate,
    sectional:      runGenerateSectional,
    batch:          runBatch,
    validate:       runValidate,
    'validate-refs': runValidateRefs,
    'validate-claims': runValidateClaims,
    inject:         runInject,
    schedule:       runSchedule,
    next:           runNext,
    status:         runStatus,
  };

  const handler = commands[command];
  if (!handler) {
    console.log('\nMYI Papers Pipeline\n');
    console.log('Commands:');
    console.log('  seed          --limit=50');
    console.log('  score         --limit=100');
    console.log('  generate      [--topic-id=uuid] (single-shot)');
    console.log('  sectional     [--topic-id=uuid] (multi-turn, longer)');
    console.log('  batch         --limit=50 (sectional generation)');
    console.log('  validate      --paper-id=uuid | --all-drafts');
    console.log('  validate-refs    (check ref IDs against allowlist)');
    console.log('  validate-claims  (check uncited numbers/standards)');
    console.log('  inject           [--paper-id=uuid] (or all drafts)');
    console.log('  schedule      --weeks=4');
    console.log('  next');
    console.log('  status');
    process.exit(0);
  }

  try {
    await handler();
  } catch (err) {
    console.error('\nError:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
