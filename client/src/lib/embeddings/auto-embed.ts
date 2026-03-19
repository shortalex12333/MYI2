/**
 * Auto-embed helper — call after saving content to DB.
 * Non-fatal: if embedding fails, content is still saved.
 */

import { createClient } from '@supabase/supabase-js';

const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';
const EMBED_MODEL = 'nomic-embed-text';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function embedText(text: string): Promise<number[] | null> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: EMBED_MODEL, input: `search_document: ${text}` }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.embeddings?.[0] ?? null;
  } catch {
    return null;
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function embedPaper(paperId: string, title: string, body: string, tldr?: string, primaryQuery?: string): Promise<boolean> {
  const text = [title, tldr || '', primaryQuery || '', stripHtml(body).slice(0, 2000)].filter(Boolean).join(' | ');
  const vec = await embedText(text);
  if (!vec) { console.log('[AUTO-EMBED] Ollama unavailable, skipping paper embed'); return false; }
  const { error } = await getSupabase().from('papers').update({ embedding: JSON.stringify(vec) }).eq('id', paperId);
  if (error) { console.log(`[AUTO-EMBED] Paper embed failed: ${error.message}`); return false; }
  console.log(`[AUTO-EMBED] Paper ${paperId} embedded`);
  return true;
}

export async function embedTopic(topicId: string, title: string, content: string, summary?: string, category?: string): Promise<boolean> {
  const text = [title, summary || '', category || '', stripHtml(content).slice(0, 2000)].filter(Boolean).join(' | ');
  const vec = await embedText(text);
  if (!vec) { console.log('[AUTO-EMBED] Ollama unavailable, skipping topic embed'); return false; }
  const { error } = await getSupabase().from('consumer_topics').update({ embedding: JSON.stringify(vec) }).eq('id', topicId);
  if (error) { console.log(`[AUTO-EMBED] Topic embed failed: ${error.message}`); return false; }
  console.log(`[AUTO-EMBED] Topic ${topicId} embedded`);
  return true;
}

export async function embedQA(qaId: string, question: string, answer: string, tags?: string[]): Promise<boolean> {
  const text = [question, answer, (tags || []).join(', ')].filter(Boolean).join(' | ');
  const vec = await embedText(text);
  if (!vec) { console.log('[AUTO-EMBED] Ollama unavailable, skipping Q&A embed'); return false; }
  const { error } = await getSupabase().from('qa_entries').update({ embedding: JSON.stringify(vec) }).eq('id', qaId);
  if (error) { console.log(`[AUTO-EMBED] Q&A embed failed: ${error.message}`); return false; }
  console.log(`[AUTO-EMBED] Q&A ${qaId} embedded`);
  return true;
}
