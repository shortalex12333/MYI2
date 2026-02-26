/**
 * MYI Pipeline Orchestrator
 * Unified script that handles all pipeline operations
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase credentials');
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 2: GAP RESOLUTION
// ═══════════════════════════════════════════════════════════════════════════

async function showDetailedInventory() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║           MYI PIPELINE ORCHESTRATOR - PHASE 2                  ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  // Q&A Pipeline State
  console.log('─── Q&A PIPELINE ────────────────────────────────────────────────');
  const { data: qaData } = await db.from('qa_candidates').select('publish_status, intent_tier, answer');

  const qaStats = {
    raw: 0, tagged: 0, drafted: 0, published: 0,
    T1: 0, T2: 0, T3: 0,
    withAnswer: 0
  };

  (qaData || []).forEach((q: any) => {
    const status = q.publish_status || 'unknown';
    if (status === 'raw') qaStats.raw++;
    if (status === 'tagged') qaStats.tagged++;
    if (status === 'drafted') qaStats.drafted++;
    if (status === 'published') qaStats.published++;
    if (q.intent_tier === 'T1') qaStats.T1++;
    if (q.intent_tier === 'T2') qaStats.T2++;
    if (q.intent_tier === 'T3') qaStats.T3++;
    if (q.answer) qaStats.withAnswer++;
  });

  console.log(`  Total:      ${qaData?.length || 0}`);
  console.log(`  Raw:        ${qaStats.raw}`);
  console.log(`  Tagged:     ${qaStats.tagged}`);
  console.log(`  Drafted:    ${qaStats.drafted} (with answers: ${qaStats.withAnswer})`);
  console.log(`  Published:  ${qaStats.published}`);
  console.log(`  By Tier:    T1=${qaStats.T1}, T2=${qaStats.T2}, T3=${qaStats.T3}`);

  // Papers Pipeline State
  console.log('\n─── PAPERS PIPELINE ─────────────────────────────────────────────');
  const { data: paperData } = await db.from('papers').select('review_status, word_count, cluster_id');

  const paperStats = { draft: 0, reviewed: 0, published: 0 };
  const clusterPapers: Record<string, number> = {};

  (paperData || []).forEach((p: any) => {
    const status = p.review_status || 'unknown';
    if (status === 'draft') paperStats.draft++;
    if (status === 'reviewed') paperStats.reviewed++;
    if (status === 'published') paperStats.published++;
    if (p.cluster_id) {
      clusterPapers[p.cluster_id] = (clusterPapers[p.cluster_id] || 0) + 1;
    }
  });

  console.log(`  Total:      ${paperData?.length || 0}`);
  console.log(`  Draft:      ${paperStats.draft}`);
  console.log(`  Reviewed:   ${paperStats.reviewed}`);
  console.log(`  Published:  ${paperStats.published}`);
  console.log(`  By Cluster:`);
  Object.entries(clusterPapers).forEach(([c, n]) => console.log(`    ${c}: ${n}`));

  // Paper Topics State
  console.log('\n─── PAPER TOPICS ────────────────────────────────────────────────');
  const { data: topicData } = await db.from('paper_topics').select('status');

  const topicStats: Record<string, number> = {};
  (topicData || []).forEach((t: any) => {
    topicStats[t.status || 'unknown'] = (topicStats[t.status || 'unknown'] || 0) + 1;
  });

  console.log(`  Total:      ${topicData?.length || 0}`);
  Object.entries(topicStats).forEach(([s, n]) => console.log(`    ${s}: ${n}`));

  // Reference Registry
  console.log('\n─── REFERENCE REGISTRY ──────────────────────────────────────────');
  const { count: regCount } = await db.from('reference_registry')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);
  console.log(`  Active refs: ${regCount}`);

  // Clusters
  console.log('\n─── CLUSTERS ────────────────────────────────────────────────────');
  const { data: clusters } = await db.from('clusters').select('cluster_id, cluster_name');
  console.log(`  Total: ${clusters?.length || 0}`);
  clusters?.forEach((c: any) => console.log(`    ${c.cluster_id}: ${c.cluster_name}`));

  // Cluster Balance View
  console.log('\n─── CLUSTER BALANCE ─────────────────────────────────────────────');
  const { data: balance } = await db.from('cluster_balance').select('*');
  if (balance && balance.length > 0) {
    console.log('  cluster_id              | published | draft');
    console.log('  ------------------------|-----------|------');
    balance.forEach((b: any) => {
      console.log(`  ${(b.cluster_id || 'null').padEnd(24)}| ${String(b.published || 0).padStart(9)} | ${b.in_draft || 0}`);
    });
  }

  // Paper Calendar
  console.log('\n─── PAPER CALENDAR ──────────────────────────────────────────────');
  const { data: calendar } = await db.from('paper_calendar')
    .select('status, publish_date')
    .order('publish_date', { ascending: true });

  const scheduled = calendar?.filter((c: any) => c.status === 'scheduled') || [];
  const published = calendar?.filter((c: any) => c.status === 'published') || [];

  console.log(`  Scheduled:  ${scheduled.length}`);
  console.log(`  Published:  ${published.length}`);
  if (scheduled.length > 0) {
    console.log(`  Next:       ${scheduled[0].publish_date}`);
    console.log(`  Last:       ${scheduled[scheduled.length - 1].publish_date}`);
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('GAPS TO RESOLVE:');
  console.log('═══════════════════════════════════════════════════════════════');

  const gaps = [];

  if (qaStats.raw > 0) {
    gaps.push(`• ${qaStats.raw} Q&A candidates need tagging`);
  }

  if (qaStats.tagged > 0) {
    gaps.push(`• ${qaStats.tagged} tagged Q&A candidates need answer generation`);
  }

  if (qaStats.published < 100) {
    gaps.push(`• Only ${qaStats.published} Q&A published (need publication drip)`);
  }

  if (paperStats.draft > 0 && paperStats.reviewed === 0) {
    gaps.push(`• ${paperStats.draft} papers in draft need review gates`);
  }

  if (scheduled.length < 14) {
    gaps.push(`• Paper calendar needs ${14 - scheduled.length} more days scheduled`);
  }

  if ((clusters?.length || 0) < 6) {
    gaps.push(`• Missing clusters (have ${clusters?.length || 0}/6)`);
  }

  if (gaps.length === 0) {
    console.log('  ✓ No critical gaps identified');
  } else {
    gaps.forEach(g => console.log(g));
  }

  console.log('\n');
}

// ═══════════════════════════════════════════════════════════════════════════
// EVALUATE Q&A QUALITY GATES
// ═══════════════════════════════════════════════════════════════════════════

// Gate definitions inline to avoid type issues
const BANNED_HEDGES = [
  'typically', 'usually', 'generally', 'often', 'most policies',
  'coverage varies', 'depends on', 'consult your', 'contact your insurer',
  'may vary', 'could be', 'might be', 'in most cases', 'it depends'
];

const FABRICATION_PATTERNS = [
  /\b(Section|Article|Clause)\s+\d+(\.\d+)*/i,
  // Exclude "part of" which is legitimate English
  /\b(Paragraph|Part)\s+(?!of\b)[A-Z0-9]+(\.\d+)*/i,
  /\bPG\d+\b/i,
];

function evaluateQAGates(answer: string, question: string): {
  gates: { name: string; passed: boolean; detail: string }[];
  recommendation: 'publish' | 'revise' | 'reject';
} {
  const gates = [];

  // Gate 1: Named Reference (must cite something)
  const hasNamedRef = /\b(under|per|according to|as per)\s+[A-Z][a-z]+/i.test(answer) ||
    /\b(USCG|CFR|SOLAS|ISM|BIMCO|IYC|Lloyd's|MLC|IMO)\b/i.test(answer);
  gates.push({
    name: 'Named Reference',
    passed: hasNamedRef,
    detail: hasNamedRef ? 'Found named reference' : 'No named reference'
  });

  // Gate 2: Numerical Anchor (must have a number)
  const hasNumber = /\d+(\.\d+)?(%|\s?(hours?|days?|feet|meters?|nm|miles?|USD|\$|EUR|£))/i.test(answer) ||
    /\d{4}/.test(answer); // Years count too
  gates.push({
    name: 'Numerical Anchor',
    passed: hasNumber,
    detail: hasNumber ? 'Found numerical anchor' : 'No numerical anchor'
  });

  // Gate 3: No Hedges (must not use banned phrases)
  const foundHedges = BANNED_HEDGES.filter(h => answer.toLowerCase().includes(h.toLowerCase()));
  gates.push({
    name: 'No Hedges',
    passed: foundHedges.length === 0,
    detail: foundHedges.length === 0 ? 'Clean' : `Found: ${foundHedges.join(', ')}`
  });

  // Gate 4: No Fabrication (no fake clause numbers)
  const fabrications = FABRICATION_PATTERNS.filter(p => p.test(answer));
  gates.push({
    name: 'No Fabrication',
    passed: fabrications.length === 0,
    detail: fabrications.length === 0 ? 'Clean' : 'Fabricated clause number detected'
  });

  // Determine recommendation
  const passedCount = gates.filter(g => g.passed).length;
  const hasFabrication = !gates.find(g => g.name === 'No Fabrication')!.passed;

  let recommendation: 'publish' | 'revise' | 'reject';
  if (hasFabrication) {
    recommendation = 'reject';
  } else if (passedCount >= 3) {
    recommendation = 'publish';
  } else if (passedCount >= 2) {
    recommendation = 'revise';
  } else {
    recommendation = 'reject';
  }

  return { gates, recommendation };
}

async function runQAEvaluation() {
  console.log('\n─── Q&A QUALITY GATE EVALUATION ────────────────────────────────\n');

  const { data: answers } = await db
    .from('qa_candidates')
    .select('id, question, answer, intent_tier, risk_topic')
    .eq('publish_status', 'drafted')
    .not('answer', 'is', null);

  if (!answers || answers.length === 0) {
    console.log('No drafted answers to evaluate.');
    return;
  }

  const stats = {
    total: answers.length,
    publish: 0, revise: 0, reject: 0,
    gate1: 0, gate2: 0, gate3: 0, gate4: 0,
    byTier: {
      T1: { publish: 0, revise: 0, reject: 0, total: 0 },
      T2: { publish: 0, revise: 0, reject: 0, total: 0 },
      T3: { publish: 0, revise: 0, reject: 0, total: 0 }
    } as Record<string, { publish: number; revise: number; reject: number; total: number }>
  };

  for (const a of answers) {
    const result = evaluateQAGates(a.answer, a.question);

    if (result.gates[0].passed) stats.gate1++;
    if (result.gates[1].passed) stats.gate2++;
    if (result.gates[2].passed) stats.gate3++;
    if (result.gates[3].passed) stats.gate4++;

    stats[result.recommendation]++;

    const tier = a.intent_tier || 'T3';
    if (stats.byTier[tier]) {
      stats.byTier[tier][result.recommendation]++;
      stats.byTier[tier].total++;
    }
  }

  const pct = (n: number) => Math.round(n / stats.total * 100);

  console.log(`Evaluated ${stats.total} drafted answers:\n`);
  console.log(`Gate Pass Rates:`);
  console.log(`  Gate 1 (Named Ref):    ${pct(stats.gate1)}% (${stats.gate1}/${stats.total})`);
  console.log(`  Gate 2 (Numerical):    ${pct(stats.gate2)}% (${stats.gate2}/${stats.total})`);
  console.log(`  Gate 3 (No Hedges):    ${pct(stats.gate3)}% (${stats.gate3}/${stats.total})`);
  console.log(`  Gate 4 (No Fabrication): ${pct(stats.gate4)}% (${stats.gate4}/${stats.total})`);

  console.log(`\nRecommendations:`);
  console.log(`  PUBLISH: ${stats.publish} (${pct(stats.publish)}%)`);
  console.log(`  REVISE:  ${stats.revise} (${pct(stats.revise)}%)`);
  console.log(`  REJECT:  ${stats.reject} (${pct(stats.reject)}%)`);

  console.log(`\nBy Tier:`);
  for (const tier of ['T1', 'T2', 'T3']) {
    const t = stats.byTier[tier];
    if (t.total > 0) {
      console.log(`  ${tier}: PUBLISH=${t.publish} REVISE=${t.revise} REJECT=${t.reject} (total=${t.total})`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATE PAPERS
// ═══════════════════════════════════════════════════════════════════════════

async function runPapersValidation() {
  console.log('\n─── PAPERS QUALITY GATE VALIDATION ─────────────────────────────\n');

  const { data: papers } = await db
    .from('papers')
    .select('id, title, body_markdown, word_count, review_status, cluster_id')
    .eq('review_status', 'draft');

  if (!papers || papers.length === 0) {
    console.log('No draft papers to validate.');
    return;
  }

  console.log(`Validating ${papers.length} draft papers...\n`);

  let canReview = 0;
  let needsWork = 0;
  let criticalFail = 0;

  for (const paper of papers) {
    const body = paper.body_markdown || '';
    const actualWords = body.split(/\s+/).filter((w: string) => w.length > 0).length;

    // Gate 1: Structure (has key sections - either ## headers or ### headers)
    const hasStructure = body.includes('## ') || body.includes('### ');

    // Gate 2: Word count
    const wordCountOk = actualWords >= 1000 && actualWords <= 2000;
    const wordCountCritical = actualWords < 600 || actualWords > 2500;

    // Gate 3: Entity density (named entities)
    const entities = body.match(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g) || [];
    const orgEntities = body.match(/\b(USCG|CFR|SOLAS|ISM|BIMCO|IYC|Lloyd's|MLC|IMO|NFPA|ABYC)\b/gi) || [];
    const entityDensity = entities.length + orgEntities.length;
    const hasEntities = entityDensity >= 3;

    // Gate 4: No fabrication
    const hasFabrication = FABRICATION_PATTERNS.some(p => p.test(body));

    // Gate 5: Has references section
    const hasRefs = body.includes('## References') || body.includes('## Sources');

    // Determine verdict
    let verdict: 'can_review' | 'needs_work' | 'critical';
    if (hasFabrication || wordCountCritical) {
      verdict = 'critical';
      criticalFail++;
    } else if (hasStructure && wordCountOk && hasEntities && hasRefs) {
      verdict = 'can_review';
      canReview++;
    } else {
      verdict = 'needs_work';
      needsWork++;
    }

    const icon = verdict === 'can_review' ? '✓' : verdict === 'critical' ? '✗' : '~';
    console.log(`${icon} ${paper.title.slice(0, 50)}...`);
    console.log(`    Words: ${actualWords}, Entities: ${entityDensity}, Struct: ${hasStructure ? 'Y' : 'N'}, Refs: ${hasRefs ? 'Y' : 'N'}`);
    if (verdict !== 'can_review') {
      if (!wordCountOk) console.log(`    ↳ Word count issue: ${actualWords} (need 1000-2000)`);
      if (!hasEntities) console.log(`    ↳ Low entity density: ${entityDensity} (need ≥3)`);
      if (!hasStructure) console.log(`    ↳ Missing section structure`);
      if (hasFabrication) console.log(`    ↳ CRITICAL: Fabricated clause numbers detected`);
    }
  }

  console.log(`\n═══════════════════════════════════════════════════════════════`);
  console.log(`PAPERS VALIDATION SUMMARY`);
  console.log(`═══════════════════════════════════════════════════════════════`);
  console.log(`  Can Review:    ${canReview}`);
  console.log(`  Needs Work:    ${needsWork}`);
  console.log(`  Critical Fail: ${criticalFail}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// PROMOTE TO PUBLISH (Q&A answers that pass gates)
// ═══════════════════════════════════════════════════════════════════════════

async function promoteQAToPublish(dryRun = true) {
  console.log(`\n─── Q&A PUBLISH PROMOTION ${dryRun ? '(DRY RUN)' : ''} ───────────────────────\n`);

  const { data: answers } = await db
    .from('qa_candidates')
    .select('id, question, answer, intent_tier')
    .eq('publish_status', 'drafted')
    .not('answer', 'is', null);

  if (!answers || answers.length === 0) {
    console.log('No drafted answers to evaluate.');
    return;
  }

  const toPromote = [];
  const toReject = [];

  for (const a of answers) {
    const result = evaluateQAGates(a.answer, a.question);
    if (result.recommendation === 'publish') {
      toPromote.push(a.id);
    } else if (result.recommendation === 'reject') {
      toReject.push(a.id);
    }
  }

  console.log(`Candidates to promote: ${toPromote.length}`);
  console.log(`Candidates to reject:  ${toReject.length}`);

  if (!dryRun && toPromote.length > 0) {
    // Batch update to 'published' status
    const { error } = await db
      .from('qa_candidates')
      .update({
        publish_status: 'published',
        generated_at: new Date().toISOString()
      })
      .in('id', toPromote);

    if (error) {
      console.log(`Error promoting: ${error.message}`);
    } else {
      console.log(`✓ Promoted ${toPromote.length} answers to 'published' status`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PROMOTE PAPERS TO REVIEWED
// ═══════════════════════════════════════════════════════════════════════════

async function promotePapersToReviewed(dryRun = true) {
  console.log(`\n─── PAPERS REVIEW PROMOTION ${dryRun ? '(DRY RUN)' : ''} ─────────────────────\n`);

  const { data: papers } = await db
    .from('papers')
    .select('id, title, body_markdown, word_count')
    .eq('review_status', 'draft');

  if (!papers || papers.length === 0) {
    console.log('No draft papers.');
    return;
  }

  const toPromote = [];

  for (const paper of papers) {
    const body = paper.body_markdown || '';
    const actualWords = body.split(/\s+/).filter((w: string) => w.length > 0).length;

    const hasStructure = body.includes('## ') || body.includes('### ');
    const wordCountOk = actualWords >= 1000 && actualWords <= 2000;
    const entities = body.match(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g) || [];
    const orgEntities = body.match(/\b(USCG|CFR|SOLAS|ISM|BIMCO|IYC|Lloyd's|MLC|IMO|NFPA|ABYC)\b/gi) || [];
    const hasEntities = (entities.length + orgEntities.length) >= 3;
    // Use fresh regex to avoid lastIndex issues
    const hasFabrication = FABRICATION_PATTERNS.some(p => new RegExp(p.source, p.flags).test(body));
    const hasRefs = body.includes('## References') || body.includes('## Sources');

    if (hasStructure && wordCountOk && hasEntities && !hasFabrication && hasRefs) {
      toPromote.push(paper.id);
      console.log(`  ✓ ${paper.title.slice(0, 50)}...`);
    }
  }

  console.log(`\nPapers ready for review: ${toPromote.length}`);

  if (!dryRun && toPromote.length > 0) {
    const { error } = await db
      .from('papers')
      .update({
        review_status: 'reviewed',
        gates_passed_at: new Date().toISOString()
      })
      .in('id', toPromote);

    if (error) {
      console.log(`Error promoting: ${error.message}`);
    } else {
      console.log(`✓ Promoted ${toPromote.length} papers to 'reviewed' status`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  const command = process.argv[2];
  const flag = process.argv[3];

  switch (command) {
    case 'inventory':
      await showDetailedInventory();
      break;

    case 'eval-qa':
      await runQAEvaluation();
      break;

    case 'validate-papers':
      await runPapersValidation();
      break;

    case 'promote-qa':
      await promoteQAToPublish(flag !== '--execute');
      break;

    case 'promote-papers':
      await promotePapersToReviewed(flag !== '--execute');
      break;

    case 'full':
      await showDetailedInventory();
      await runQAEvaluation();
      await runPapersValidation();
      break;

    default:
      console.log(`
MYI Pipeline Orchestrator

Commands:
  inventory         Show detailed pipeline state
  eval-qa           Evaluate Q&A answers against quality gates
  validate-papers   Validate papers against quality gates
  promote-qa        Promote passing Q&A to published (add --execute to apply)
  promote-papers    Promote passing papers to reviewed (add --execute to apply)
  full              Run full inventory + evaluation
      `);
  }
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
