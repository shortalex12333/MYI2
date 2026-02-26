import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase credentials');
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkSchema() {
  console.log('\n=== CHECKING TABLE SCHEMAS ===\n');

  // Try to get one row from each table to see what columns exist
  const tables = [
    'clusters',
    'paper_calendar',
    'papers',
    'paper_topics',
    'qa_candidates',
    'reference_registry',
    'pipeline_checkpoints'
  ];

  for (const table of tables) {
    console.log(`\n${table}:`);
    const { data, error } = await db.from(table).select('*').limit(1);

    if (error) {
      console.log(`  ERROR: ${error.message}`);
    } else if (data && data.length > 0) {
      console.log(`  Columns: ${Object.keys(data[0]).join(', ')}`);
    } else {
      console.log(`  (empty table)`);
      // Try to get columns from insert error
      const { error: insertErr } = await db.from(table).insert({}).select();
      if (insertErr?.message) {
        // Extract column info from error if possible
        console.log(`  Schema hint: ${insertErr.message.slice(0, 100)}`);
      }
    }
  }

  // Check cluster_balance view
  console.log('\n\ncluster_balance:');
  const { data: balance, error: balanceErr } = await db.from('cluster_balance').select('*').limit(5);
  if (balanceErr) {
    console.log(`  ERROR: ${balanceErr.message}`);
  } else {
    console.log(`  Data: ${JSON.stringify(balance, null, 2)}`);
  }
}

checkSchema().catch(e => console.error('Error:', e.message));
