import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase credentials');
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inventory() {
  console.log('\n=== PHASE 0/1: INVENTORY ASSESSMENT ===\n');

  // Reference Registry
  const { count: regCount } = await db.from('reference_registry').select('*', { count: 'exact', head: true }).eq('is_active', true);
  console.log('Reference Registry (active):', regCount);

  // Registry by cluster
  const { data: regByCluster } = await db.from('reference_registry')
    .select('cluster_tags, quality_tier')
    .eq('is_active', true);

  const clusterCounts: Record<string, { total: number; primary: number }> = {};
  (regByCluster || []).forEach((r: any) => {
    const tags = r.cluster_tags || ['uncategorized'];
    const arr = Array.isArray(tags) ? tags : [tags];
    arr.forEach((tag: string) => {
      if (!clusterCounts[tag]) clusterCounts[tag] = { total: 0, primary: 0 };
      clusterCounts[tag].total++;
      if (r.quality_tier === 'primary') clusterCounts[tag].primary++;
    });
  });
  console.log('Registry by cluster:', JSON.stringify(clusterCounts, null, 2));

  // Clusters
  const { data: clusters } = await db.from('clusters').select('id, name');
  console.log('\nClusters:', clusters?.length || 0);
  if (clusters) clusters.forEach(c => console.log('  -', c.name));

  // QA Candidates by status
  const { data: qaStats } = await db.from('qa_candidates').select('publish_status, intent_tier');
  const qaByStatus: Record<string, number> = {};
  const qaByTier: Record<string, number> = {};
  (qaStats || []).forEach((q: any) => {
    qaByStatus[q.publish_status || 'null'] = (qaByStatus[q.publish_status || 'null'] || 0) + 1;
    qaByTier[q.intent_tier || 'null'] = (qaByTier[q.intent_tier || 'null'] || 0) + 1;
  });
  console.log('\nQA Candidates total:', qaStats?.length || 0);
  console.log('  by status:', JSON.stringify(qaByStatus));
  console.log('  by tier:', JSON.stringify(qaByTier));

  // Papers by status
  const { data: paperStats } = await db.from('papers').select('review_status');
  const papersByStatus: Record<string, number> = {};
  (paperStats || []).forEach((p: any) => {
    papersByStatus[p.review_status || 'null'] = (papersByStatus[p.review_status || 'null'] || 0) + 1;
  });
  console.log('\nPapers total:', paperStats?.length || 0);
  console.log('  by status:', JSON.stringify(papersByStatus));

  // Paper Topics by status
  const { data: topicStats } = await db.from('paper_topics').select('status');
  const topicsByStatus: Record<string, number> = {};
  (topicStats || []).forEach((t: any) => {
    topicsByStatus[t.status || 'null'] = (topicsByStatus[t.status || 'null'] || 0) + 1;
  });
  console.log('\nPaper Topics total:', topicStats?.length || 0);
  console.log('  by status:', JSON.stringify(topicsByStatus));

  // Consumer Topics
  const { data: consumerData } = await db.from('consumer_topics').select('status');
  const consumerByStatus: Record<string, number> = {};
  (consumerData || []).forEach((t: any) => {
    consumerByStatus[t.status || 'null'] = (consumerByStatus[t.status || 'null'] || 0) + 1;
  });
  console.log('\nConsumer Topics total:', consumerData?.length || 0);
  console.log('  by status:', JSON.stringify(consumerByStatus));

  // Paper Calendar
  const { data: calData } = await db.from('paper_calendar').select('status, publish_date').order('publish_date', { ascending: true });
  const scheduled = calData?.filter((c: any) => c.status === 'scheduled').length || 0;
  const published = calData?.filter((c: any) => c.status === 'published').length || 0;
  const nextPub = calData?.find((c: any) => c.status === 'scheduled')?.publish_date;
  const lastSched = [...(calData || [])].reverse().find((c: any) => c.status === 'scheduled')?.publish_date;
  console.log('\nPaper Calendar:');
  console.log('  scheduled:', scheduled);
  console.log('  published:', published);
  console.log('  next_publish:', nextPub || 'none');
  console.log('  last_scheduled:', lastSched || 'none');

  // Check pipeline_checkpoints table
  const { error: checkpointErr, data: incompleteJobs } = await db
    .from('pipeline_checkpoints')
    .select('job_id, job_type, stage, item_id')
    .eq('completed', false);

  if (checkpointErr) {
    console.log('\npipeline_checkpoints table: MISSING - needs creation');
  } else {
    console.log('\npipeline_checkpoints table: exists');
    console.log('  incomplete jobs:', incompleteJobs?.length || 0);
    if (incompleteJobs && incompleteJobs.length > 0) {
      incompleteJobs.slice(0, 5).forEach(j => console.log('   -', j.job_type, j.stage));
    }
  }

  console.log('\n=== END INVENTORY ===\n');
}

inventory().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
