#!/usr/bin/env node
/**
 * Batch Verification Script
 *
 * Verifies generated content passes quality gates and is properly linked.
 * Usage:
 *   npx tsx src/lib/keyword-queue/verify-batch.ts
 *
 * Checks:
 * - keyword_queue status distribution
 * - Content count by type (papers, Q&A, topics)
 * - Word count minimums per content type
 * - Quality gate pass/fail rate
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { db } from './db';

async function main() {
  console.log('=== Batch Verification ===\n');

  // 1. Check keyword_queue status distribution
  console.log('--- Keyword Queue Status ---');
  const { data: statusData } = await db
    .from('keyword_queue')
    .select('status');

  const statusCounts = new Map<string, number>();
  for (const row of statusData || []) {
    statusCounts.set(row.status, (statusCounts.get(row.status) || 0) + 1);
  }

  for (const [status, count] of statusCounts.entries()) {
    console.log(`  ${status}: ${count}`);
  }

  const generatedCount = statusCounts.get('generated') || 0;
  console.log(`\nKeywords with status='generated': ${generatedCount}`);

  // 2. Check papers with keyword_queue_id
  const { data: papers } = await db
    .from('papers')
    .select('id, title, word_count, keyword_queue_id, body_markdown')
    .not('keyword_queue_id', 'is', null);

  console.log(`Papers with keyword_queue_id: ${papers?.length || 0}`);

  // 3. Check Q&A with keyword_queue_id
  const { data: qa } = await db
    .from('qa_candidates')
    .select('id, question, keyword_queue_id, answer')
    .not('keyword_queue_id', 'is', null);

  console.log(`Q&A with keyword_queue_id: ${qa?.length || 0}`);

  // 4. Check topics with keyword_queue_id
  const { data: topics } = await db
    .from('consumer_topics')
    .select('id, title, keyword_queue_id, content')
    .not('keyword_queue_id', 'is', null);

  console.log(`Topics with keyword_queue_id: ${topics?.length || 0}`);

  const totalContent = (papers?.length || 0) + (qa?.length || 0) + (topics?.length || 0);
  console.log(`\nTotal content pieces: ${totalContent}`);

  // 5. Quality gate checks
  console.log('\n--- Quality Gate Checks ---\n');

  let passed = 0;
  let failed = 0;
  const failures: Array<{ type: string; title: string; issues: string[] }> = [];

  // Check papers (min 1200 words)
  for (const paper of papers || []) {
    const issues: string[] = [];
    const wordCount = paper.word_count || 0;

    if (wordCount < 1200) {
      issues.push(`word_count=${wordCount} (min 1200)`);
    }

    if (!paper.body_markdown || paper.body_markdown.trim().length === 0) {
      issues.push('Empty body_markdown');
    }

    if (issues.length > 0) {
      const title = paper.title?.slice(0, 40) || 'Untitled';
      console.log(`FAIL Paper: "${title}..."`);
      issues.forEach((issue) => console.log(`  - ${issue}`));
      failed++;
      failures.push({ type: 'paper', title, issues });
    } else {
      passed++;
    }
  }

  // Check Q&A (min 250 words)
  for (const item of qa || []) {
    const issues: string[] = [];
    const wordCount = item.answer?.split(/\s+/).length || 0;

    if (wordCount < 250) {
      issues.push(`word_count=${wordCount} (min 250)`);
    }

    if (!item.answer || item.answer.trim().length === 0) {
      issues.push('Empty answer');
    }

    if (issues.length > 0) {
      const question = item.question?.slice(0, 40) || 'No question';
      console.log(`FAIL Q&A: "${question}..."`);
      issues.forEach((issue) => console.log(`  - ${issue}`));
      failed++;
      failures.push({ type: 'qa', title: question, issues });
    } else {
      passed++;
    }
  }

  // Check topics (min 500 words)
  for (const topic of topics || []) {
    const issues: string[] = [];
    const wordCount = topic.content?.split(/\s+/).length || 0;

    if (wordCount < 500) {
      issues.push(`word_count=${wordCount} (min 500)`);
    }

    if (!topic.content || topic.content.trim().length === 0) {
      issues.push('Empty content');
    }

    if (issues.length > 0) {
      const title = topic.title?.slice(0, 40) || 'Untitled';
      console.log(`FAIL Topic: "${title}..."`);
      issues.forEach((issue) => console.log(`  - ${issue}`));
      failed++;
      failures.push({ type: 'topic', title, issues });
    } else {
      passed++;
    }
  }

  console.log('\n=== Results ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (passed + failed > 0) {
    const passRate = (passed / (passed + failed)) * 100;
    console.log(`Pass rate: ${passRate.toFixed(1)}%`);

    if (passRate < 90) {
      console.log('\n⚠️  Warning: Pass rate below 90% threshold');
    } else {
      console.log('\n✓ Pass rate meets 90% quality threshold');
    }
  }

  if (failures.length > 0) {
    console.log('\n--- Failed Items Summary ---');
    const byType = new Map<string, number>();
    for (const failure of failures) {
      byType.set(failure.type, (byType.get(failure.type) || 0) + 1);
    }
    for (const [type, count] of byType.entries()) {
      console.log(`  ${type}: ${count} failures`);
    }
  }

  console.log('\nVerification complete.');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
