import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase credentials');
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// The actual schema uses cluster_id, cluster_name, cluster_slug, description_short
const CLUSTERS = [
  {
    cluster_id: 'hurricane-storm',
    cluster_name: 'Hurricane & Storm',
    cluster_slug: 'hurricane-storm',
    description_short: 'Named storm coverage, lay-up warranties, seasonal risk',
    status: 'active'
  },
  {
    cluster_id: 'claims-disputes',
    cluster_name: 'Claims & Disputes',
    cluster_slug: 'claims-disputes',
    description_short: 'Deductibles, claim denials, policy voidance, total loss',
    status: 'active'
  },
  {
    cluster_id: 'shipyard-refit',
    cluster_name: 'Shipyard & Refit',
    cluster_slug: 'shipyard-refit',
    description_short: 'Hull damage during repairs, fire and hot work, surveys',
    status: 'active'
  },
  {
    cluster_id: 'charter-commercial',
    cluster_name: 'Charter & Commercial',
    cluster_slug: 'charter-commercial',
    description_short: 'Charter exclusions, racing clauses, liveaboard policies',
    status: 'active'
  },
  {
    cluster_id: 'crew-liability',
    cluster_name: 'Crew & Liability',
    cluster_slug: 'crew-liability',
    description_short: 'Crew injury coverage, P&I liability, pollution incidents',
    status: 'active'
  },
  {
    cluster_id: 'salvage-navigation',
    cluster_name: 'Salvage & Navigation',
    cluster_slug: 'salvage-navigation',
    description_short: 'Salvage rights, towing disputes, navigation limits',
    status: 'active'
  }
];

async function fixClusters() {
  console.log('\n=== FIXING CLUSTERS ===\n');

  // Check existing clusters
  const { data: existing } = await db.from('clusters').select('cluster_id, cluster_name');
  const existingIds = new Set((existing || []).map(c => c.cluster_id));

  console.log('Existing clusters:', existing?.length || 0);
  existing?.forEach(c => console.log(`  - ${c.cluster_name}`));

  // Add missing clusters
  for (const cluster of CLUSTERS) {
    if (existingIds.has(cluster.cluster_id)) {
      console.log(`✓ Exists: ${cluster.cluster_name}`);
      continue;
    }

    const { error } = await db.from('clusters').insert(cluster);
    if (error) {
      console.log(`✗ Failed to add ${cluster.cluster_name}: ${error.message}`);
    } else {
      console.log(`✓ Added: ${cluster.cluster_name}`);
    }
  }

  // Verify final count
  const { data: final } = await db.from('clusters').select('cluster_id, cluster_name');
  console.log(`\nFinal cluster count: ${final?.length || 0}/6`);
}

fixClusters().catch(e => console.error('Error:', e.message));
