#!/usr/bin/env npx tsx
/**
 * Generate new marine insurance questions using Ollama
 *
 * Usage: npx tsx generate-questions.ts <count> [batch_size]
 */

import { db } from './db';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

const QUESTION_CATEGORIES = [
  { category: 'coverage_types', topics: ['hull coverage', 'liability coverage', 'personal effects', 'tender coverage', 'crew coverage', 'pollution liability'] },
  { category: 'claims', topics: ['filing claims', 'claim denials', 'claim documentation', 'total loss', 'partial loss', 'salvage claims'] },
  { category: 'policy_terms', topics: ['deductibles', 'exclusions', 'warranties', 'agreed value', 'actual cash value', 'policy limits'] },
  { category: 'vessel_types', topics: ['sailboats', 'powerboats', 'yachts', 'personal watercraft', 'houseboats', 'commercial vessels'] },
  { category: 'risks', topics: ['hurricane damage', 'theft', 'fire', 'collision', 'grounding', 'sinking'] },
  { category: 'operations', topics: ['chartering', 'racing', 'liveaboard', 'international cruising', 'coastal navigation', 'inland waterways'] },
  { category: 'regulations', topics: ['USCG requirements', 'state regulations', 'documentation', 'registration', 'safety equipment', 'crew certifications'] },
  { category: 'special_situations', topics: ['hurricane season', 'lay-up periods', 'surveys', 'valuations', 'financing', 'ownership changes'] },
];

const SYSTEM_PROMPT = `You are generating questions that yacht and boat owners would ask about marine insurance.

Generate questions that are:
- Specific and actionable (not vague)
- Between 40-120 characters
- End with a question mark
- Cover practical scenarios boat owners face
- Varied in complexity (some simple, some detailed)

Format: Return ONLY the questions, one per line. No numbering, no explanations.`;

async function generateQuestionsForTopic(category: string, topic: string, count: number): Promise<string[]> {
  const prompt = `Generate ${count} unique questions about "${topic}" in the context of yacht/boat insurance.

Category: ${category}
Topic: ${topic}

Examples of good questions:
- Does my yacht insurance cover damage from hitting a submerged object?
- What happens if my boat is stolen while in storage?
- Are crew injuries covered under my yacht policy?

Generate ${count} NEW questions about ${topic}:`;

  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'ministral-3:8b',
        prompt: `${SYSTEM_PROMPT}\n\n${prompt}`,
        stream: false,
        options: { temperature: 0.8 }
      }),
    });

    if (!response.ok) {
      console.error(`Ollama error for ${topic}: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const text = data.response || '';

    // Parse questions from response
    const questions = text
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.endsWith('?') && line.length > 30 && line.length < 200)
      .map((line: string) => line.replace(/^\d+[\.\)]\s*/, '')); // Remove numbering

    return questions;
  } catch (error) {
    console.error(`Error generating for ${topic}:`, error);
    return [];
  }
}

async function insertQuestions(questions: string[]): Promise<number> {
  let inserted = 0;

  for (const question of questions) {
    const q_hash = require('crypto').createHash('sha256').update(question).digest('hex');
    const a_hash = require('crypto').createHash('sha256').update('[PENDING]').digest('hex');

    const { error } = await db
      .from('qa_candidates')
      .insert({
        question,
        publish_status: 'raw',
        source_url: 'generated_batch',
        answer: '[PENDING]',
        question_hash: q_hash,
        answer_hash: a_hash,
      });

    if (!error) {
      inserted++;
    }
  }

  return inserted;
}

async function main() {
  const targetCount = parseInt(process.argv[2]) || 100;
  const batchSize = parseInt(process.argv[3]) || 10;

  console.log(`\n=== QUESTION GENERATOR ===`);
  console.log(`Target: ${targetCount} questions`);
  console.log(`Questions per topic: ${batchSize}`);

  // Get existing questions for deduplication
  const { data: existing } = await db
    .from('qa_candidates')
    .select('question');

  const existingSet = new Set((existing || []).map(e => e.question.toLowerCase()));
  console.log(`Existing questions: ${existingSet.size}`);

  let totalGenerated = 0;
  let totalInserted = 0;

  // Iterate through categories and topics
  for (const { category, topics } of QUESTION_CATEGORIES) {
    if (totalInserted >= targetCount) break;

    for (const topic of topics) {
      if (totalInserted >= targetCount) break;

      console.log(`\nGenerating for: ${category} / ${topic}...`);

      const questions = await generateQuestionsForTopic(category, topic, batchSize);
      totalGenerated += questions.length;

      // Dedupe
      const unique = questions.filter(q => !existingSet.has(q.toLowerCase()));

      // Insert
      const inserted = await insertQuestions(unique);
      totalInserted += inserted;

      // Add to existing set
      unique.forEach(q => existingSet.add(q.toLowerCase()));

      console.log(`  Generated: ${questions.length}, Unique: ${unique.length}, Inserted: ${inserted}`);
      console.log(`  Total progress: ${totalInserted}/${targetCount}`);

      // Rate limit delay
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log(`\n=== COMPLETE ===`);
  console.log(`Total generated: ${totalGenerated}`);
  console.log(`Total inserted: ${totalInserted}`);
}

main().catch(console.error);
