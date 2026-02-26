import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase credentials');
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

const CLUSTERS = [
  {
    id: 'hurricane-storm',
    name: 'Hurricane & Storm',
    description: 'Named storm coverage, lay-up warranties, seasonal risk, windstorm deductibles',
    slug: 'hurricane-storm'
  },
  {
    id: 'claims-disputes',
    name: 'Claims & Disputes',
    description: 'Deductibles, claim denials, policy voidance, total loss settlements',
    slug: 'claims-disputes'
  },
  {
    id: 'shipyard-refit',
    name: 'Shipyard & Refit',
    description: 'Hull damage during repairs, fire and hot work, surveys, grounding',
    slug: 'shipyard-refit'
  },
  {
    id: 'charter-commercial',
    name: 'Charter & Commercial',
    description: 'Charter exclusions, racing clauses, liveaboard policies, commercial use',
    slug: 'charter-commercial'
  },
  {
    id: 'crew-liability',
    name: 'Crew & Liability',
    description: 'Crew injury coverage, P&I liability, pollution incidents, Jones Act',
    slug: 'crew-liability'
  },
  {
    id: 'salvage-navigation',
    name: 'Salvage & Navigation',
    description: 'Salvage rights, towing disputes, navigation limits, cruising territories',
    slug: 'salvage-navigation'
  }
];

async function createInfrastructure() {
  console.log('\n=== CREATING MISSING INFRASTRUCTURE ===\n');

  // 1. Create pipeline_checkpoints table via RPC or raw SQL
  // Supabase doesn't allow CREATE TABLE via REST, so we'll use existing table or document the need
  console.log('1. Checking pipeline_checkpoints table...');
  const { error: checkErr } = await db.from('pipeline_checkpoints').select('id').limit(1);

  if (checkErr?.code === 'PGRST200' || checkErr?.message?.includes('does not exist')) {
    console.log('   pipeline_checkpoints table does not exist.');
    console.log('   Creating table via Supabase SQL Editor is required:');
    console.log(`
CREATE TABLE IF NOT EXISTS pipeline_checkpoints (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id      uuid NOT NULL,
  job_type    text NOT NULL,
  stage       text NOT NULL,
  item_id     uuid,
  started_at  timestamptz DEFAULT now(),
  completed   boolean DEFAULT false,
  completed_at timestamptz,
  error_msg   text,
  UNIQUE (job_id, item_id)
);
`);
    console.log('   For now, continuing without checkpoints table...');
  } else if (checkErr) {
    console.log('   Error checking table:', checkErr.message);
  } else {
    console.log('   ✓ pipeline_checkpoints table exists');
  }

  // 2. Create/upsert clusters
  console.log('\n2. Creating clusters...');
  for (const cluster of CLUSTERS) {
    const { error } = await db.from('clusters').upsert(cluster, {
      onConflict: 'id',
      ignoreDuplicates: false
    });

    if (error) {
      // Try insert instead
      const { error: insertErr } = await db.from('clusters').insert(cluster);
      if (insertErr && !insertErr.message.includes('duplicate')) {
        console.log(`   Error creating ${cluster.name}:`, insertErr.message);
      } else if (!insertErr) {
        console.log(`   ✓ Created cluster: ${cluster.name}`);
      } else {
        console.log(`   ✓ Cluster exists: ${cluster.name}`);
      }
    } else {
      console.log(`   ✓ Upserted cluster: ${cluster.name}`);
    }
  }

  // 3. Verify clusters
  const { data: clusters, error: clusterErr } = await db.from('clusters').select('id, name');
  if (clusterErr) {
    console.log('\n   Error fetching clusters:', clusterErr.message);
  } else {
    console.log('\n   Clusters now:', clusters?.length || 0);
    clusters?.forEach(c => console.log(`     - ${c.name} (${c.id})`));
  }

  // 4. Check paper_calendar table
  console.log('\n3. Checking paper_calendar table...');
  const { error: calErr } = await db.from('paper_calendar').select('id').limit(1);
  if (calErr) {
    console.log('   paper_calendar may need creation:', calErr.message);
  } else {
    console.log('   ✓ paper_calendar table exists');
  }

  console.log('\n=== INFRASTRUCTURE CHECK COMPLETE ===\n');
}

createInfrastructure().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
