import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase credentials');
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// EXACT patterns from the validator
const FABRICATION_PATTERNS = [
  /\b(Section|Article|Clause)\s+\d+(\.\d+)*/i,
  /\b(Paragraph|Part)\s+[A-Z0-9]+(\.\d+)*/i,
  /\bPG\d+\b/i,
];

async function debug() {
  console.log('\n=== DEBUG VALIDATOR ===\n');

  const { data: papers } = await db
    .from('papers')
    .select('id, title, body_markdown')
    .eq('review_status', 'draft');

  if (!papers) return;

  let failCount = 0;

  for (const paper of papers) {
    const body = paper.body_markdown || '';

    // Check each pattern exactly as validator does
    let hasFab = false;
    let matchedPattern = '';
    let matchedText = '';

    for (const pattern of FABRICATION_PATTERNS) {
      // Create fresh regex to avoid lastIndex issues
      const freshPattern = new RegExp(pattern.source, pattern.flags);
      if (freshPattern.test(body)) {
        hasFab = true;
        matchedPattern = pattern.source;
        // Find what matched
        const match = body.match(freshPattern);
        if (match) matchedText = match[0];
        break;
      }
    }

    if (hasFab) {
      failCount++;
      console.log(`FAIL: ${paper.title.slice(0, 50)}...`);
      console.log(`  Pattern: ${matchedPattern}`);
      console.log(`  Match: "${matchedText}"`);
      // Find context
      const idx = body.indexOf(matchedText);
      if (idx >= 0) {
        const context = body.slice(Math.max(0, idx - 40), Math.min(body.length, idx + matchedText.length + 40));
        console.log(`  Context: ...${context.replace(/\n/g, ' ')}...`);
      }
      console.log('');
    }
  }

  console.log(`\nTotal failing: ${failCount}/${papers.length}`);
}

debug().catch((e: Error) => console.error('Error:', e.message));
