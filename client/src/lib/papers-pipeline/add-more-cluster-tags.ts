import { db } from './db';

// Map of cluster_id -> existing cluster_tags that should be associated
const CLUSTER_MAPPINGS: Record<string, string[]> = {
  'hurricane-storm': ['storm', 'hurricane', 'hull-damage', 'total-loss', 'claims'],
  'salvage-navigation': ['salvage', 'towing', 'navigation', 'hull-damage'],
  'crew-liability': ['crew', 'injury', 'liability'],
  'shipyard-refit': ['shipyard-refit', 'hot-work', 'fire-safety', 'welding'],
  'charter-commercial': ['yacht-charter', 'commercial', 'liability'],
};

async function addClusterTags() {
  for (const [newTag, existingTags] of Object.entries(CLUSTER_MAPPINGS)) {
    console.log(`\nAdding "${newTag}" to refs with: ${existingTags.join(', ')}`);

    // Get refs that have any of the existing tags
    const { data: refs } = await db
      .from('reference_registry')
      .select('ref_id, cluster_tags');

    let updated = 0;
    for (const ref of refs || []) {
      const tags = ref.cluster_tags || [];

      // Check if ref has any of the existing tags
      const hasMatchingTag = existingTags.some(t => tags.includes(t));
      const alreadyHasNewTag = tags.includes(newTag);

      if (hasMatchingTag && alreadyHasNewTag === false) {
        const newTags = [...tags, newTag];
        await db.from('reference_registry').update({ cluster_tags: newTags }).eq('ref_id', ref.ref_id);
        updated++;
      }
    }

    console.log(`  Updated ${updated} refs`);

    // Verify
    const { data: check } = await db
      .from('reference_registry')
      .select('ref_id')
      .contains('cluster_tags', [newTag]);
    console.log(`  Total refs with "${newTag}": ${check?.length || 0}`);
  }

  process.exit(0);
}

addClusterTags();
