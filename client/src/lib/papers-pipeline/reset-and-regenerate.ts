/**
 * Reset all papers for regeneration with improved prompts
 * 
 * 1. Deletes all papers and citation maps
 * 2. Resets assigned topics back to 'scored'
 * 3. Ready for batch regeneration
 */

import { db } from './db';

async function resetForRegeneration() {
  console.log('\n=== RESETTING PAPERS FOR REGENERATION ===\n');
  
  // Get count of papers to delete
  const { count: paperCount } = await db
    .from('papers')
    .select('*', { count: 'exact', head: true });
  
  console.log(`Papers to delete: ${paperCount}`);
  
  // Delete citation maps first (foreign key constraint)
  const { error: citationError } = await db
    .from('paper_citation_map')
    .delete()
    .neq('paper_id', '00000000-0000-0000-0000-000000000000'); // delete all
    
  if (citationError) {
    console.error('Failed to delete citation maps:', citationError.message);
  } else {
    console.log('✓ Deleted all citation maps');
  }
  
  // Delete all papers
  const { error: paperError } = await db
    .from('papers')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all
    
  if (paperError) {
    console.error('Failed to delete papers:', paperError.message);
  } else {
    console.log('✓ Deleted all papers');
  }
  
  // Reset assigned topics back to scored
  const { data: updated, error: topicError } = await db
    .from('paper_topics')
    .update({ status: 'scored', assigned_at: null })
    .eq('status', 'assigned')
    .select('id');
    
  if (topicError) {
    console.error('Failed to reset topics:', topicError.message);
  } else {
    console.log(`✓ Reset ${updated?.length ?? 0} topics from 'assigned' to 'scored'`);
  }
  
  // Check final state
  const { count: remainingPapers } = await db
    .from('papers')
    .select('*', { count: 'exact', head: true });
    
  const { count: scoredTopics } = await db
    .from('paper_topics')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'scored');
    
  console.log('\n=== READY FOR REGENERATION ===');
  console.log(`Papers remaining: ${remainingPapers}`);
  console.log(`Topics ready (scored): ${scoredTopics}`);
  console.log('\nRun: npx tsx cli.ts batch --limit=50');
}

resetForRegeneration().catch(console.error);
