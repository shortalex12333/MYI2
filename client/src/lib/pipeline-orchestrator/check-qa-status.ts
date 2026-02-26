import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase credentials');
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
  const { data } = await db.from('qa_candidates').select('publish_status');

  const counts: Record<string, number> = {};
  (data || []).forEach((r: any) => {
    const status = r.publish_status || 'null';
    counts[status] = (counts[status] || 0) + 1;
  });

  console.log('Q&A publish_status breakdown:');
  Object.entries(counts).forEach(([s, c]) => console.log(`  ${s}: ${c}`));
}

check();
