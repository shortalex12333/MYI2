/**
 * Q&A Publish Drip
 *
 * Moves quality-gated Q&As from qa_candidates to faqs table at a controlled rate.
 * Default: 7/day
 *
 * Usage:
 *   npx tsx publish-drip.ts [--limit=7] [--dry-run]
 */

import { db } from './db';
import { evaluateAnswer } from './eval-gates';

// Risk topic → Category mapping
const TOPIC_TO_CATEGORY: Record<string, string> = {
  navigation_limits: 'Regulations',
  survey: 'Maintenance',
  hurricane: 'Safety',
  claims_denial: 'Claims',
  charter_exclusion: 'Policies',
  crew_coverage: 'Policies',
  hull_damage: 'Claims',
  liability: 'Policies',
  deductible: 'Policies',
  policy_void: 'Policies',
  total_loss: 'Claims',
  salvage: 'Claims',
  towing: 'Safety',
  theft: 'Claims',
  fire: 'Safety',
  grounding: 'Claims',
  lay_up: 'Maintenance',
  racing: 'Policies',
  liveaboard: 'Policies',
  financing: 'Policies',
  other: 'General',
};

interface PublishResult {
  published: number;
  skipped: number;
  errors: string[];
}

async function getCategoryId(categoryName: string): Promise<string | null> {
  const { data } = await db
    .from('categories')
    .select('id')
    .eq('name', categoryName)
    .single();
  return data?.id ?? null;
}

async function getNextDisplayOrder(): Promise<number> {
  const { data } = await db
    .from('faqs')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)
    .single();
  return (data?.display_order ?? 0) + 1;
}

export async function publishDrip(limit = 7, dryRun = false): Promise<PublishResult> {
  const result: PublishResult = { published: 0, skipped: 0, errors: [] };

  // Fetch drafted answers
  const { data: candidates, error } = await db
    .from('qa_candidates')
    .select('id, question, answer, risk_topic, intent_tier')
    .eq('publish_status', 'drafted')
    .not('answer', 'is', null)
    .order('intent_tier', { ascending: true }) // T1 first
    .limit(limit * 3); // Fetch extra to account for quality gate failures

  if (error || !candidates) {
    result.errors.push(`Failed to fetch candidates: ${error?.message}`);
    return result;
  }

  // Filter to PUBLISH-worthy
  const publishable = candidates.filter(c => {
    const evalResult = evaluateAnswer(c.answer, c.question, c.risk_topic);
    return evalResult.recommendation === 'publish';
  });

  console.log(`Found ${publishable.length} publishable from ${candidates.length} candidates`);

  // Take up to limit
  const toPublish = publishable.slice(0, limit);

  // Pre-fetch category IDs
  const categoryCache: Record<string, string | null> = {};
  for (const cat of Object.values(TOPIC_TO_CATEGORY)) {
    if (!categoryCache[cat]) {
      categoryCache[cat] = await getCategoryId(cat);
    }
  }

  let displayOrder = await getNextDisplayOrder();

  for (const candidate of toPublish) {
    const categoryName = TOPIC_TO_CATEGORY[candidate.risk_topic] || 'General';
    const categoryId = categoryCache[categoryName];

    if (!categoryId) {
      result.errors.push(`No category found for: ${categoryName}`);
      result.skipped++;
      continue;
    }

    if (dryRun) {
      console.log(`[DRY RUN] Would publish: ${candidate.question.slice(0, 50)}...`);
      result.published++;
      continue;
    }

    // Insert into faqs
    const { error: insertError } = await db.from('faqs').insert({
      question: candidate.question,
      answer: candidate.answer,
      category_id: categoryId,
      display_order: displayOrder++,
    });

    if (insertError) {
      result.errors.push(`Insert failed: ${insertError.message}`);
      result.skipped++;
      continue;
    }

    // Update qa_candidates status
    const { error: updateError } = await db
      .from('qa_candidates')
      .update({ publish_status: 'published' })
      .eq('id', candidate.id);

    if (updateError) {
      result.errors.push(`Status update failed: ${updateError.message}`);
    }

    result.published++;
    console.log(`✓ [${candidate.intent_tier}] ${candidate.question.slice(0, 50)}...`);
  }

  return result;
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.find(a => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 7;
  const dryRun = args.includes('--dry-run');

  console.log(`\n=== Q&A PUBLISH DRIP ===`);
  console.log(`Limit: ${limit} | Dry run: ${dryRun}\n`);

  const result = await publishDrip(limit, dryRun);

  console.log(`\n--- RESULTS ---`);
  console.log(`Published: ${result.published}`);
  console.log(`Skipped:   ${result.skipped}`);
  if (result.errors.length > 0) {
    console.log(`Errors:`);
    result.errors.forEach(e => console.log(`  - ${e}`));
  }
}

main().catch(console.error);
