/**
 * Q&A Answer Generator using Ministral 8B
 *
 * Two-stage pipeline:
 * Stage 1: Reference selection from registry based on risk_topic
 * Stage 2: Answer generation with injected verified references
 *
 * The model can ONLY cite references provided in Stage 1.
 */

import { createClient } from '@supabase/supabase-js';
import { getReferencesForQuestion, SelectedReference } from './reference-selector';
import { sanitizeAnswer } from './sanitize';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = 'ministral-3:8b';

const SYSTEM_PROMPT = `You are a competent marine professional answering questions in a serious forum.

TONE:
- Neutral
- Calm
- Direct
- No drama

RULES:
- Direct answer in first sentence
- Max 250 words
- No rhetorical questions
- No promotional language
- No "I" statements
- No "Great question!" or similar
- No "it depends" without immediate context
- No legal disclaimers
- No "consult a professional" deflections

STRUCTURE:
- Opening: Direct answer to the question
- Body: 2-4 key points with specifics
- Close: One actionable next step (optional)

FORMAT:
- Use bullet points for lists
- Bold key terms only when necessary
- No markdown headers
- No emojis

REFERENCE CONSTRAINT (CRITICAL - FOLLOW EXACTLY):
You will be provided with a list of APPROVED REFERENCES for each question.
You may ONLY cite references from that approved list.

If no approved references are provided, describe the principle WITHOUT citing any clause numbers.

NEVER invent clause numbers (e.g., "Section 1.1.1", "Clause 12.1").
NEVER quote verbatim policy language.
NEVER construct a clause reference not in the approved list.

When you need to reference a policy principle without an approved reference:
- WRONG: "Under Section III, Clause 1.2 of IYIC..."
- RIGHT: "Under standard sue-and-labor provisions..."
- RIGHT: "Per industry standard practice..."

SIGNAL REQUIREMENTS:
- Named reference from the approved list above (or describe the principle without clause numbers)
- At least one numerical anchor (deductible %, date, threshold, range)
- Condition boundary: when coverage applies and when it does not

BANNED PHRASES (never use these words):
- "It depends"
- "Consult a professional"
- "Generally speaking"
- "In most cases"
- "You should seek advice"
- "This is not legal advice"
- "Every situation is different"
- "Contact your broker"
- "Speak with your underwriter"
- "typically"
- "usually"
- "often"
- "may or may not"
- "might be covered"
- "could potentially"
- "most policies"
- "coverage depends"
- "verify with your insurer"

Instead of hedging, state the SPECIFIC condition that determines the outcome.

EXAMPLES OF BANNED → CORRECT:

WRONG: "Hurricane damage typically requires a named storm deductible."
RIGHT: "Hurricane damage triggers a named storm deductible upon NOAA declaration."

WRONG: "Coverage usually depends on whether the vessel was in navigable waters."
RIGHT: "Coverage applies when the vessel is in navigable waters as defined in the declarations page."`;

interface QAInput {
  id: string;
  question: string;
  risk_topic: string;
  jurisdiction: string;
  persona: string;
  scenario_stage: string;
  intent_tier: 'T1' | 'T2' | 'T3';
}

interface QAOutput {
  id: string;
  question: string;
  answer: string;
  word_count: number;
  generated_at: string;
  model: string;
}

/**
 * Generate answer for a single question with full tagged context
 * Two-stage pipeline:
 * 1. Select references from registry based on risk_topic + jurisdiction
 * 2. Generate answer with injected reference constraints
 */
async function generateAnswer(
  input: QAInput,
  supabase?: ReturnType<typeof createClient>
): Promise<string> {
  // Stage 1: Reference Selection
  let referencePrompt = '';
  if (supabase) {
    const { promptSection } = await getReferencesForQuestion(
      supabase,
      input.risk_topic,
      input.jurisdiction
    );
    referencePrompt = promptSection;
  } else {
    // Fallback if no supabase client - use strict constraint
    referencePrompt = `
REFERENCE GUIDANCE:
Describe principles and standard practices without citing specific clause numbers.
Focus on condition boundaries (when coverage applies vs. does not apply).`;
  }

  // Stage 2: Answer Generation with injected references
  const prompt = `Question: ${input.question}
Risk Topic: ${input.risk_topic}
Jurisdiction: ${input.jurisdiction}
Persona: ${input.persona}
Scenario Stage: ${input.scenario_stage}
${referencePrompt}

Answer must include:
- Reference from the approved list above (or describe the principle if none apply)
- At least one numerical anchor (deductible %, date, threshold, range)
- Condition boundary: when coverage applies and when it does not

Answer:`;

  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      system: SYSTEM_PROMPT,
      stream: false,
      options: {
        temperature: 0.1,      // Very low - strict constraint following
        top_p: 0.9,
        num_predict: 350,      // ~250 words max
        stop: ['\n\nQuestion:', '\n\n---'],
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status}`);
  }

  const data = await response.json();
  const rawAnswer = data.response.trim();

  // Post-process to strip any remaining hedge phrases
  return sanitizeAnswer(rawAnswer);
}

/**
 * Process batch of questions with two-stage pipeline
 */
async function processBatch(
  questions: QAInput[],
  supabase: ReturnType<typeof createClient>,
  onProgress?: (completed: number, total: number) => void
): Promise<QAOutput[]> {
  const results: QAOutput[] = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];

    try {
      const answer = await generateAnswer(q, supabase);
      const wordCount = answer.split(/\s+/).length;

      results.push({
        id: q.id,
        question: q.question,
        answer,
        word_count: wordCount,
        generated_at: new Date().toISOString(),
        model: MODEL,
      });

      onProgress?.(i + 1, questions.length);
    } catch (error) {
      console.error(`Failed to generate answer for: ${q.question}`, error);
    }

    // Rate limit: 1 request per second
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return results;
}

/**
 * Store generated answers in database
 */
async function storeAnswers(
  supabase: ReturnType<typeof createClient>,
  answers: QAOutput[]
): Promise<void> {
  for (const answer of answers) {
    const { error } = await supabase
      .from('qa_candidates')
      .update({
        answer: answer.answer,
        word_count: answer.word_count,
        generation_model: answer.model,
        generated_at: answer.generated_at,
        publish_status: 'drafted',
      })
      .eq('id', answer.id);

    if (error) {
      console.error(`Failed to store answer for ${answer.id}:`, error);
    }
  }
}

export {
  generateAnswer,
  processBatch,
  storeAnswers,
  SYSTEM_PROMPT,
  MODEL,
  QAInput,
  QAOutput,
};
