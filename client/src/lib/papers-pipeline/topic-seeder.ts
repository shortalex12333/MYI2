/**
 * Topic Seeder with Contamination Blocking
 *
 * Converts scraped questions into paper_topics.
 * CRITICAL: Applies strict contamination filters.
 * 71% of qa_candidates contain forum contamination.
 */

import { db } from './db';

const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';
const MODEL = 'qwen3:32b';

// ─── CONTAMINATION BLOCKS ────────────────────────────────────
const CONTAMINATION_PATTERNS: RegExp[] = [
  // First person
  /\b(I|my|me|mine)\b/i,
  /\b(my boat|my yacht|my policy|my insurer|my claim)\b/i,

  // Forum style
  /\b(anyone know|has anyone|does anyone|can anyone|help!)\b/i,
  /\b(any advice|any tips|what do you think|what would you)\b/i,
  /\b(thanks|thank you|TIA|thx|appreciate)\b/i,
  /\b(just wondering|curious if|quick question)\b/i,

  // Second person
  /\byou\b/i,
  /\byour\b/i,

  // Colloquial
  /\b(gonna|wanna|kinda|sorta|gotta|cuz)\b/i,
  /\b(lol|omg|btw|imo|imho|fyi|thx|pls|plz)\b/i,

  // Structural issues
  /^-/,                    // leading dash
  /[?!]{2,}/,              // excessive punctuation
  /\.{4,}/,                // ellipsis abuse

  // Company/brand names
  /\b(BoatUS|Pantaenius|Markel|Chubb|Geico|Progressive)\b/i,
  /\b(Allstate|State Farm|Nationwide|AXA|Allianz|Zurich)\b/i,
  /\b(Beneteau|Jeanneau|Bavaria|Sunseeker|Princess|Azimut)\b/i,
  /\b(Ferretti|Lagoon|Fountaine|Viking|Bertram|Hatteras)\b/i,
];

// Exception patterns (allow these even if they match above)
const EXCEPTION_PATTERNS: RegExp[] = [
  /\bP&I\b/,   // P&I insurance
  /\bIMO\b/,   // International Maritime Organization
];

// Canonical question starters (whitelist)
const CANONICAL_STARTERS: RegExp[] = [
  /^What is\b/i,
  /^What are\b/i,
  /^How does\b/i,
  /^How do\b/i,
  /^Are \w+/i,
  /^Is \w+/i,
  /^Does \w+/i,
  /^Do \w+/i,
  /^Which \w+/i,
  /^When is\b/i,
  /^When does\b/i,
  /^Why is\b/i,
  /^Why does\b/i,
];

function isContaminated(question: string): boolean {
  // Check exceptions first
  for (const exception of EXCEPTION_PATTERNS) {
    if (exception.test(question)) {
      // Remove the exception match and continue checking
      question = question.replace(exception, '');
    }
  }

  // Check contamination patterns
  for (const pattern of CONTAMINATION_PATTERNS) {
    if (pattern.test(question)) {
      return true;
    }
  }

  // Check length (scraped paragraphs)
  if (question.length > 200) {
    return true;
  }

  return false;
}

function hasCanonicalStart(question: string): boolean {
  return CANONICAL_STARTERS.some(pattern => pattern.test(question));
}

// ─── CLUSTER MAP ─────────────────────────────────────────────
const TOPIC_TO_CLUSTER: Record<string, string> = {
  hurricane: 'hurricane-storm',
  lay_up: 'hurricane-storm',
  storm: 'hurricane-storm',
  deductible: 'claims-disputes',
  claims_denial: 'claims-disputes',
  policy_void: 'claims-disputes',
  total_loss: 'claims-disputes',
  theft: 'claims-disputes',
  hull_damage: 'shipyard-refit',
  fire: 'shipyard-refit',
  hot_work: 'shipyard-refit',
  survey: 'shipyard-refit',
  grounding: 'shipyard-refit',
  charter_exclusion: 'charter-commercial',
  racing: 'charter-commercial',
  liveaboard: 'charter-commercial',
  crew_coverage: 'crew-liability',
  liability: 'crew-liability',
  pollution: 'crew-liability',
  salvage: 'salvage-navigation',
  towing: 'salvage-navigation',
  navigation_limits: 'salvage-navigation',
};

// ─── TRANSFORMATION PROMPT ───────────────────────────────────
function buildTransformPrompt(rawQuestion: string, clusterId: string): string {
  return `/no_think
You are transforming a raw scraped question into a CANONICAL article topic.

RAW QUESTION (DO NOT ECHO THIS - transform it):
"${rawQuestion}"

CLUSTER: ${clusterId}

REQUIREMENTS:
1. canonical_title must be technical, neutral, professional
2. primary_query must start with: What/How/Are/Is/Does/Which/When/Why
3. NO first person (I, my, me)
4. NO forum language (anyone know, help, thanks)
5. NO company/brand names
6. NO colloquial language

Output JSON only:
{
  "canonical_title": "Technical Article Title (max 12 words)",
  "primary_query": "What/How/Are/Is/Does... professional query",
  "secondary_queries": ["query 2", "query 3"],
  "risk_topic": "one of: hurricane|lay_up|deductible|claims_denial|policy_void|total_loss|hull_damage|fire|survey|grounding|charter_exclusion|racing|liveaboard|crew_coverage|liability|pollution|salvage|towing|navigation_limits|theft|other",
  "jurisdiction": "global|us|uk|eu",
  "persona": "captain|engineer|broker|owner"
}`;
}

async function callQwen(prompt: string): Promise<string> {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      stream: false,
      options: {
        temperature: 0.15,
        top_p: 0.9,
        num_predict: 500,
      },
    }),
  });

  if (!response.ok) throw new Error(`Ollama error: ${response.status}`);
  const data = await response.json();
  return data.response ?? '';
}

function parseJson(raw: string): Record<string, unknown> | null {
  const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

// ─── MAIN SEEDER ─────────────────────────────────────────────

interface SeedResult {
  seeded: number;
  blocked_contamination: number;
  failed_transform: number;
  skipped_duplicate: number;
}

export async function seedTopics(
  questions: Array<{ id: string; question: string; risk_topic?: string }>,
  defaultCluster = 'claims-disputes'
): Promise<SeedResult> {
  const result: SeedResult = {
    seeded: 0,
    blocked_contamination: 0,
    failed_transform: 0,
    skipped_duplicate: 0,
  };

  for (const q of questions) {
    // Stage 1: Contamination check
    if (isContaminated(q.question)) {
      console.log(`[BLOCKED] Contamination: ${q.question.slice(0, 50)}...`);
      result.blocked_contamination++;
      continue;
    }

    // Stage 2: Transform via Qwen
    const clusterId = TOPIC_TO_CLUSTER[q.risk_topic || ''] || defaultCluster;
    const prompt = buildTransformPrompt(q.question, clusterId);

    let parsed: Record<string, unknown> | null = null;
    try {
      const raw = await callQwen(prompt);
      parsed = parseJson(raw);
    } catch (e) {
      console.log(`[FAILED] Transform error: ${q.question.slice(0, 50)}...`);
      result.failed_transform++;
      continue;
    }

    if (!parsed || !parsed.canonical_title || !parsed.primary_query) {
      result.failed_transform++;
      continue;
    }

    // Stage 3: Validate transformed output
    const primaryQuery = parsed.primary_query as string;
    if (!hasCanonicalStart(primaryQuery)) {
      console.log(`[BLOCKED] Non-canonical start: ${primaryQuery.slice(0, 50)}...`);
      result.blocked_contamination++;
      continue;
    }

    // Stage 4: Insert
    const riskTopic = (parsed.risk_topic as string) ?? q.risk_topic ?? 'other';
    const finalCluster = TOPIC_TO_CLUSTER[riskTopic] || defaultCluster;

    const { error } = await db.from('paper_topics').insert({
      topic_signal: q.question,
      canonical_title: parsed.canonical_title as string,
      primary_query: primaryQuery,
      secondary_queries: (parsed.secondary_queries as string[]) ?? [],
      risk_topic: riskTopic,
      cluster_id: finalCluster,
      jurisdiction: (parsed.jurisdiction as string) ?? 'global',
      persona: (parsed.persona as string) ?? 'captain',
      status: 'seed',
    });

    if (error) {
      if (error.message.includes('duplicate')) {
        result.skipped_duplicate++;
      } else {
        result.failed_transform++;
      }
    } else {
      result.seeded++;
    }
  }

  return result;
}

export { isContaminated, hasCanonicalStart, CONTAMINATION_PATTERNS };
