import { db } from './db';
import * as fs from 'fs';

async function exportLatest() {
  // Get 5 newest papers
  const { data: papers } = await db
    .from('papers')
    .select('id, title, slug, body_markdown, word_count, last_updated')
    .order('last_updated', { ascending: false })
    .limit(5);

  if (!papers || papers.length === 0) {
    console.log('No papers found');
    process.exit(1);
  }

  // Create output directory
  const outDir = '/tmp/papers-output';
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log(`Exporting ${papers.length} papers to ${outDir}/\n`);

  for (let i = 0; i < papers.length; i++) {
    const paper = papers[i];
    const filename = `${i + 1}-${paper.slug.slice(0, 50)}.md`;
    const filepath = `${outDir}/${filename}`;

    fs.writeFileSync(filepath, paper.body_markdown);

    // Count inline citations
    const cites = paper.body_markdown.match(/\[[A-Z][A-Z0-9-]+\]/g) || [];
    const uniqueCites = [...new Set(cites)];

    console.log(`${i + 1}. ${paper.title.slice(0, 60)}`);
    console.log(`   Words: ${paper.word_count} | Citations: ${cites.length} (${uniqueCites.length} unique)`);
    console.log(`   File: ${filename}`);
    console.log('');
  }

  console.log(`\nOpen with: open ${outDir}`);
  process.exit(0);
}

exportLatest();
