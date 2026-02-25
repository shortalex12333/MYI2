import { db } from './db';

async function count() {
  const { count: scored } = await db.from('paper_topics').select('*', { count: 'exact', head: true }).eq('status', 'scored');
  const { count: assigned } = await db.from('paper_topics').select('*', { count: 'exact', head: true }).eq('status', 'assigned');
  const { count: total } = await db.from('paper_topics').select('*', { count: 'exact', head: true });
  const { count: papers } = await db.from('papers').select('*', { count: 'exact', head: true });

  console.log(`Topics: scored=${scored}, assigned=${assigned}, total=${total}`);
  console.log(`Papers in DB: ${papers}`);
  process.exit(0);
}

count();
