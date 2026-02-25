/**
 * Q&A Tagger using Ministral 8B
 *
 * Lightweight tagging pass - no answer generation.
 * Tags questions with: risk_topic, scenario_stage, persona, jurisdiction, intent_tier
 */

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = 'ministral-3:8b';

const TAGGING_PROMPT = `You are a marine insurance classifier. Analyze the question and output ONLY a JSON object with these fields:

- risk_topic: One of [navigation_limits, survey, hurricane, claims_denial, charter_exclusion, crew_coverage, hull_damage, liability, deductible, policy_void, total_loss, salvage, towing, theft, fire, grounding, lay_up, racing, liveaboard, financing, other]
- scenario_stage: One of [quote_bind, active_season, incident, claim, renewal, shopping]
- persona: One of [owner, captain, chief_engineer, family_office, broker, unknown]
- jurisdiction: One of [us, florida, caribbean, mediterranean, global, unknown]
- intent_tier: T1 (high intent: void/deny/notify/limits/requirements), T2 (medium: coverage/cost), T3 (low: definitions/education)

Output ONLY valid JSON, no explanation.`;

interface QuestionTags {
  risk_topic: string;
  scenario_stage: string;
  persona: string;
  jurisdiction: string;
  intent_tier: 'T1' | 'T2' | 'T3';
}

interface TaggedQuestion {
  id: string;
  question: string;
  tags: QuestionTags;
}

/**
 * Tag a single question
 */
async function tagQuestion(question: string): Promise<QuestionTags> {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      prompt: `Question: ${question}\n\nJSON:`,
      system: TAGGING_PROMPT,
      stream: false,
      options: {
        temperature: 0.1,      // Very low for deterministic tagging
        top_p: 0.9,
        num_predict: 200,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status}`);
  }

  const data = await response.json();
  const jsonStr = data.response.trim();

  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    return JSON.parse(jsonMatch[0]) as QuestionTags;
  } catch (error) {
    console.error('Failed to parse tags:', jsonStr);
    // Return defaults on parse failure
    return {
      risk_topic: 'other',
      scenario_stage: 'unknown',
      persona: 'unknown',
      jurisdiction: 'unknown',
      intent_tier: 'T3',
    };
  }
}

/**
 * Tag batch of questions
 */
async function tagBatch(
  questions: { id: string; question: string }[],
  onProgress?: (completed: number, total: number) => void
): Promise<TaggedQuestion[]> {
  const results: TaggedQuestion[] = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];

    try {
      const tags = await tagQuestion(q.question);
      results.push({
        id: q.id,
        question: q.question,
        tags,
      });
      onProgress?.(i + 1, questions.length);
    } catch (error) {
      console.error(`Failed to tag: ${q.question}`, error);
    }

    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}

export {
  tagQuestion,
  tagBatch,
  QuestionTags,
  TaggedQuestion,
  TAGGING_PROMPT,
};
