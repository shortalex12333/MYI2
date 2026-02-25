import { db } from './db';

async function addTag() {
  // Get refs that have claims or claims-denial tags
  const { data: refs } = await db
    .from('reference_registry')
    .select('ref_id, cluster_tags')
    .or('cluster_tags.cs.{claims},cluster_tags.cs.{claims-denial}');

  console.log('Found', refs?.length, 'refs with claims tags');

  // Add claims-disputes to each
  for (const ref of refs || []) {
    const tags = ref.cluster_tags || [];
    const hasTag = tags.includes('claims-disputes');
    if (hasTag === false) {
      const newTags = [...tags, 'claims-disputes'];
      await db.from('reference_registry').update({ cluster_tags: newTags }).eq('ref_id', ref.ref_id);
      console.log('Updated:', ref.ref_id);
    }
  }

  // Verify
  const { data: check } = await db
    .from('reference_registry')
    .select('ref_id')
    .contains('cluster_tags', ['claims-disputes']);
  console.log('\nRefs now with claims-disputes tag:', check?.length);
  process.exit(0);
}

addTag();
