import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase credentials');
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// More precise patterns to catch fabricated clause numbers
const FABRICATION_PATTERNS = [
  /\b(Section|Article|Clause)\s+\d+(\.\d+)*/gi,
  /\b(Paragraph|Part)\s+\d+(\.\d+)*/gi,
];

// Legitimate patterns - these are OK
const LEGITIMATE_PATTERNS = [
  /46 CFR Part \d+/i,   // Real CFR citations
  /CFR \d+\.\d+/i,      // Real CFR citations
  /SOLAS Chapter/i,     // Real SOLAS
  /ISM Code Section/i,  // Real ISM
  /MLC Article/i,       // Real MLC
];

function isFabrication(text: string, match: string): boolean {
  // Get context around the match
  const idx = text.indexOf(match);
  const context = text.slice(Math.max(0, idx - 50), idx + match.length + 50);

  // If it's within a legitimate pattern context, not a fabrication
  for (const legit of LEGITIMATE_PATTERNS) {
    if (legit.test(context)) return false;
  }

  // Generic clause/section numbers without document context are fabrications
  return true;
}

async function analyze() {
  console.log('\n=== FABRICATION ANALYSIS ===\n');

  const { data: papers } = await db
    .from('papers')
    .select('id, title, body_markdown')
    .eq('review_status', 'draft');

  if (!papers || papers.length === 0) {
    console.log('No papers found');
    return;
  }

  const stats = {
    total: papers.length,
    withFabrications: 0,
    cleanable: 0,
    totalFabrications: 0
  };

  const fabricationCounts: Record<string, number> = {};

  for (const paper of papers) {
    const body = paper.body_markdown || '';
    const fabrications: string[] = [];

    for (const pattern of FABRICATION_PATTERNS) {
      const matches = body.match(pattern) || [];
      for (const m of matches) {
        if (isFabrication(body, m)) {
          fabrications.push(m);
        }
      }
    }

    const uniqueFabs = [...new Set(fabrications)];

    if (uniqueFabs.length > 0) {
      stats.withFabrications++;
      stats.totalFabrications += uniqueFabs.length;

      // Cleanable if 5 or fewer unique fabrications
      if (uniqueFabs.length <= 5) {
        stats.cleanable++;
      }

      console.log(`${paper.title.slice(0, 50)}...`);
      console.log(`  Fabrications: ${uniqueFabs.length}`);
      uniqueFabs.slice(0, 5).forEach((f: string) => {
        fabricationCounts[f] = (fabricationCounts[f] || 0) + 1;
        console.log(`    - ${f}`);
      });
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Total papers:        ${stats.total}`);
  console.log(`With fabrications:   ${stats.withFabrications}`);
  console.log(`Cleanable (≤5 fabs): ${stats.cleanable}`);
  console.log(`Total fabrications:  ${stats.totalFabrications}`);

  console.log('\nMost common fabricated patterns:');
  Object.entries(fabricationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([pattern, count]) => console.log(`  ${pattern}: ${count} papers`));
}

analyze().catch(e => console.error('Error:', e.message));
