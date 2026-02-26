import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase credentials');
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

const FABRICATION_PATTERNS = [
  /\b(Section|Article|Clause)\s+\d+(\.\d+)*/gi,
  /\b(Paragraph|Part)\s+[A-Z0-9]+(\.\d+)*/gi,
  /\bPG\d+\b/gi,
];

async function checkPapers() {
  console.log('\n=== PAPER FABRICATION ANALYSIS ===\n');

  // Get a sample paper
  const { data: papers } = await db
    .from('papers')
    .select('id, title, body_markdown')
    .eq('review_status', 'draft')
    .limit(3);

  if (!papers || papers.length === 0) {
    console.log('No papers found');
    return;
  }

  for (const paper of papers) {
    console.log(`\n── ${paper.title.slice(0, 60)}... ──\n`);

    const body = paper.body_markdown || '';

    // Find all fabricated references
    for (const pattern of FABRICATION_PATTERNS) {
      const matches = body.match(pattern);
      if (matches) {
        console.log(`  Fabrications found:`);
        const unique = [...new Set(matches)];
        unique.slice(0, 10).forEach(m => console.log(`    - ${m}`));
        if (unique.length > 10) {
          console.log(`    ... and ${unique.length - 10} more`);
        }
      }
    }

    // Show first 500 chars of body to see structure
    console.log(`\n  First 500 chars of body:`);
    console.log(body.slice(0, 500).split('\n').map((l: string) => '  ' + l).join('\n'));
  }
}

checkPapers().catch(e => console.error('Error:', e.message));
