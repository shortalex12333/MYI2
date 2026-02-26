import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase credentials');
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// Same patterns as validator
const FABRICATION_PATTERNS = [
  /\b(Section|Article|Clause)\s+\d+(\.\d+)*/gi,
  /\b(Paragraph|Part)\s+\d+(\.\d+)*/gi,
];

async function findRemaining() {
  console.log('\n=== FINDING REMAINING FABRICATIONS ===\n');

  const { data: papers } = await db
    .from('papers')
    .select('id, title, body_markdown')
    .eq('review_status', 'draft');

  if (!papers) return;

  for (const paper of papers) {
    const body = paper.body_markdown || '';
    const allMatches: string[] = [];

    for (const pattern of FABRICATION_PATTERNS) {
      const matches = body.match(pattern) || [];
      allMatches.push(...matches);
    }

    if (allMatches.length > 0) {
      const unique = [...new Set(allMatches)];
      console.log(`${paper.title.slice(0, 50)}...`);
      unique.forEach((m: string) => {
        // Find context around the match
        const idx = body.indexOf(m);
        const context = body.slice(Math.max(0, idx - 30), Math.min(body.length, idx + m.length + 30));
        console.log(`  "${m}" in: ...${context.replace(/\n/g, ' ')}...`);
      });
      console.log('');
    }
  }
}

findRemaining().catch((e: Error) => console.error('Error:', e.message));
