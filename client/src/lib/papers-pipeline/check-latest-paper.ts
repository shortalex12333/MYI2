import { db } from './db';

async function check() {
  // Get the newest paper
  const { data: paper } = await db
    .from('papers')
    .select('id, title, body_markdown, word_count')
    .order('last_updated', { ascending: false })
    .limit(1)
    .single();

  if (paper === null) {
    console.log('No paper found');
    process.exit(1);
  }

  console.log('Paper:', paper.title);
  console.log('Words:', paper.word_count);
  console.log('ID:', paper.id);

  // Check for inline [ref_id] citations
  const inlineCites = paper.body_markdown.match(/\[[A-Z][A-Z0-9-]+\]/g) || [];
  console.log('\nInline citations found:', inlineCites.length);
  console.log('Citations:', [...new Set(inlineCites)].join(', '));

  // Show TL;DR section
  const tldr = paper.body_markdown.match(/\*\*TL;DR\*\*\s*([\s\S]*?)(?:\n---|\n##)/)?.[1]?.trim();
  console.log('\nTL;DR:\n' + tldr?.slice(0, 500));

  process.exit(0);
}

check();
