import { db } from './db';

async function showNulls() {
  const { data: nullRows, error } = await db
    .from('reference_registry')
    .select('ref_id, short_title, url, citation_category, created_at')
    .or('short_title.is.null,url.is.null');

  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }

  console.log('=== reference_registry rows with NULL values ===\n');
  console.log('Total rows with nulls:', nullRows?.length);

  const bothNull = (nullRows || []).filter(r => r.short_title === null && r.url === null);
  const urlOnly = (nullRows || []).filter(r => r.short_title === null && r.url !== null);
  const titleOnly = (nullRows || []).filter(r => r.short_title !== null && r.url === null);

  console.log('Both null:', bothNull.length);
  console.log('Missing short_title only:', urlOnly.length);
  console.log('Missing url only:', titleOnly.length);

  console.log('\n--- BOTH NULL (skeleton rows) ---');
  for (const r of bothNull) {
    console.log(`  ${r.ref_id} | category: ${r.citation_category} | created: ${r.created_at?.slice(0, 10)}`);
  }

  console.log('\n--- MISSING short_title (has url) ---');
  for (const r of urlOnly) {
    console.log(`  ${r.ref_id} | url: ${r.url?.slice(0, 60)}...`);
  }

  console.log('\n--- MISSING url (has short_title) ---');
  for (const r of titleOnly) {
    console.log(`  ${r.ref_id} | title: ${r.short_title?.slice(0, 60)}`);
  }

  process.exit(0);
}

showNulls();
