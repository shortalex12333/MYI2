/**
 * Content Embedding Pipeline
 *
 * Embeds all published content (papers, topics, Q&A) using nomic-embed-text via Ollama.
 * Stores 768-dimension vectors in Supabase pgvector columns.
 *
 * Usage:
 *   npx tsx src/lib/embeddings/embed-content.ts              # embed all missing
 *   npx tsx src/lib/embeddings/embed-content.ts --force      # re-embed everything
 *   npx tsx src/lib/embeddings/embed-content.ts --table=papers  # specific table only
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';
const EMBED_MODEL = 'nomic-embed-text';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function embed(text: string): Promise<number[]> {
  const input = `search_document: ${text}`;
  const res = await fetch(`${OLLAMA_URL}/api/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: EMBED_MODEL, input }),
  });
  if (!res.ok) throw new Error(`Ollama embed error: ${res.status}`);
  const data = await res.json();
  return data.embeddings[0];
}

export async function embedQuery(text: string): Promise<number[]> {
  const input = `search_query: ${text}`;
  const res = await fetch(`${OLLAMA_URL}/api/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: EMBED_MODEL, input }),
  });
  if (!res.ok) throw new Error(`Ollama embed error: ${res.status}`);
  const data = await res.json();
  return data.embeddings[0];
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function embedPapers(force: boolean): Promise<number> {
  const query = supabase.from('papers').select('id, title, body_markdown, tldr, primary_query').eq('review_status', 'published');
  if (!force) query.is('embedding', null);
  const { data, error } = await query;
  if (error) throw new Error(`Papers: ${error.message}`);
  if (!data?.length) return 0;
  console.log(`  Embedding ${data.length} papers...`);
  let count = 0;
  for (const p of data) {
    const text = [p.title, p.tldr || '', p.primary_query || '', stripHtml(p.body_markdown || '').slice(0, 2000)].filter(Boolean).join(' | ');
    try {
      const vec = await embed(text);
      const { error: e } = await supabase.from('papers').update({ embedding: JSON.stringify(vec) }).eq('id', p.id);
      if (e) console.log(`    x ${p.title}: ${e.message}`);
      else { count++; if (count % 10 === 0) console.log(`    ...${count}/${data.length}`); }
    } catch (err) { console.log(`    x ${p.title}: ${err}`); }
  }
  return count;
}

async function embedTopics(force: boolean): Promise<number> {
  const query = supabase.from('consumer_topics').select('id, title, summary, content, category').eq('status', 'published');
  if (!force) query.is('embedding', null);
  const { data, error } = await query;
  if (error) throw new Error(`Topics: ${error.message}`);
  if (!data?.length) return 0;
  console.log(`  Embedding ${data.length} topics...`);
  let count = 0;
  for (const t of data) {
    const text = [t.title, t.summary || '', t.category || '', stripHtml(t.content || '').slice(0, 2000)].filter(Boolean).join(' | ');
    try {
      const vec = await embed(text);
      const { error: e } = await supabase.from('consumer_topics').update({ embedding: JSON.stringify(vec) }).eq('id', t.id);
      if (e) console.log(`    x ${t.title}: ${e.message}`);
      else { count++; if (count % 10 === 0) console.log(`    ...${count}/${data.length}`); }
    } catch (err) { console.log(`    x ${t.title}: ${err}`); }
  }
  return count;
}

async function embedQA(force: boolean): Promise<number> {
  const query = supabase.from('qa_entries').select('id, question, answer, tags').eq('active', true);
  if (!force) query.is('embedding', null);
  const { data, error } = await query;
  if (error) throw new Error(`Q&A: ${error.message}`);
  if (!data?.length) return 0;
  console.log(`  Embedding ${data.length} Q&A entries...`);
  let count = 0;
  for (const q of data) {
    const text = [q.question, q.answer, (q.tags || []).join(', ')].filter(Boolean).join(' | ');
    try {
      const vec = await embed(text);
      const { error: e } = await supabase.from('qa_entries').update({ embedding: JSON.stringify(vec) }).eq('id', q.id);
      if (e) console.log(`    x ${q.question.slice(0, 50)}: ${e.message}`);
      else { count++; if (count % 50 === 0) console.log(`    ...${count}/${data.length}`); }
    } catch (err) { console.log(`    x ${q.question.slice(0, 50)}: ${err}`); }
  }
  return count;
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const tableArg = args.find(a => a.startsWith('--table='));
  const table = tableArg ? tableArg.split('=')[1] : 'all';

  console.log('=== CONTENT EMBEDDING PIPELINE ===');
  console.log(`Model: ${EMBED_MODEL} (768d) | Force: ${force} | Table: ${table}\n`);

  try { const v = await embed('test'); console.log(`Ollama OK. Dim: ${v.length}\n`); }
  catch { console.error(`Ollama not reachable at ${OLLAMA_URL}`); process.exit(1); }

  const start = Date.now();
  let p = 0, t = 0, q = 0;
  if (table === 'all' || table === 'papers') { p = await embedPapers(force); console.log(`  Papers done: ${p}\n`); }
  if (table === 'all' || table === 'topics') { t = await embedTopics(force); console.log(`  Topics done: ${t}\n`); }
  if (table === 'all' || table === 'qa') { q = await embedQA(force); console.log(`  Q&A done: ${q}\n`); }

  console.log(`Total: ${p + t + q} embeddings in ${Math.round((Date.now() - start) / 1000)}s`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
