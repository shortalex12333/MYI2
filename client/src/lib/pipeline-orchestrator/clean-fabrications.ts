/**
 * Paper Fabrication Cleaner
 * Replaces generic clause/section references with contextual language
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase credentials');
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

interface CleaningRule {
  pattern: RegExp;
  replacement: string;
}

const CLEANING_RULES: CleaningRule[] = [
  // First, fix our previous broken replacements that created new false positives
  { pattern: /the relevant regulatory part\b/gi, replacement: 'the corresponding regulatory requirements' },
  { pattern: /the applicable part\b/gi, replacement: 'the corresponding regulatory requirements' },
  { pattern: /the relevant part\b/gi, replacement: 'the corresponding regulatory requirements' },

  // Then handle any remaining original patterns
  // Clause patterns
  { pattern: /\bClause\s+\d+(\.\d+)*\b/gi, replacement: 'the relevant coverage provision' },
  // Section patterns
  { pattern: /\b[Ss]ection\s+\d+(\.\d+)*\b/gi, replacement: 'the applicable regulatory requirements' },
  // Part patterns
  { pattern: /\bPart\s+[IVX]+\b/gi, replacement: 'the corresponding regulatory requirements' },
  { pattern: /\bPart\s+[A-Z]\b/gi, replacement: 'the corresponding regulatory requirements' },
  { pattern: /\bPart\s+\d+(\.\d+)*\b/gi, replacement: 'the corresponding regulatory requirements' },
  // Article patterns
  { pattern: /\bArticle\s+[IVX]+\b/gi, replacement: 'the applicable convention requirements' },
  { pattern: /\bArticle\s+\d+(\.\d+)*\b/gi, replacement: 'the applicable convention requirements' },
  // Paragraph patterns
  { pattern: /\bParagraph\s+[A-Z0-9]+(\.\d+)*\b/gi, replacement: 'the relevant policy provisions' },
  // PG codes
  { pattern: /\bPG\d+\b/gi, replacement: 'the policy provision' },
];

const LEGITIMATE_CONTEXTS: RegExp[] = [
  /46 CFR/i,
  /33 CFR/i,
  /SOLAS/i,
  /ISM Code/i,
  /MLC,?\s*2006/i,
  /IYC Form/i,
  /BIMCO/i,
  /Lloyd's/i,
  /Institute Yacht Clauses/i,
];

function cleanText(text: string): { cleaned: string; changeCount: number } {
  let result = text;
  let changeCount = 0;

  for (const rule of CLEANING_RULES) {
    // Count matches before replacement
    const matches = result.match(rule.pattern);
    if (matches) {
      // Replace all occurrences globally
      const beforeLen = result.length;
      result = result.replace(new RegExp(rule.pattern.source, 'gi'), rule.replacement);
      // Count how many were replaced (approximate by counting original matches)
      changeCount += matches.length;
    }
  }

  return { cleaned: result, changeCount };
}

async function main() {
  const shouldExecute = process.argv.includes('--execute');
  console.log('\n=== PAPER FABRICATION CLEANER ===');
  console.log(shouldExecute ? 'Mode: EXECUTE\n' : 'Mode: DRY RUN\n');

  const { data: papers } = await db
    .from('papers')
    .select('id, title, body_markdown')
    .eq('review_status', 'draft');

  if (!papers || papers.length === 0) {
    console.log('No draft papers found');
    return;
  }

  let papersChanged = 0;
  let totalChanges = 0;

  for (const paper of papers) {
    const body = paper.body_markdown || '';
    const { cleaned, changeCount } = cleanText(body);

    if (changeCount > 0) {
      papersChanged++;
      totalChanges += changeCount;
      console.log(`${paper.title.slice(0, 55)}... (${changeCount} changes)`);

      if (shouldExecute) {
        const { error } = await db
          .from('papers')
          .update({ body_markdown: cleaned })
          .eq('id', paper.id);

        if (error) {
          console.log(`  ERROR: ${error.message}`);
        } else {
          console.log(`  Updated successfully`);
        }
      }
    }
  }

  console.log('\n─────────────────────────────────────────────────────────');
  console.log(`Papers with fabrications: ${papersChanged}`);
  console.log(`Total changes: ${totalChanges}`);
  if (!shouldExecute) {
    console.log('\nRun with --execute to apply changes');
  }
}

main().catch((e: Error) => {
  console.error('Error:', e.message);
  process.exit(1);
});
