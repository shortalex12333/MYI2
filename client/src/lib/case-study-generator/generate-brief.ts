/**
 * Intelligence Brief Generator using qwen3:32b
 *
 * Generates long-form (1,200-1,600 word) authoritative briefs
 * following INTELLIGENCE_BRIEF_STRUCTURE_v2.1 exactly.
 *
 * Two-stage pipeline:
 * Stage 1: Model generates content + citation_needs
 * Stage 2: Backend selects refs from registry based on needs
 *
 * Slower workflow, higher precision.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = 'qwen3:32b';

// Cluster definitions for marine insurance
const CLUSTERS = {
  'shipyard-refit': {
    name: 'Shipyard Refit & Concurrent Hot Work',
    slug: '/clusters/shipyard-refit',
    risk_topics: ['fire', 'hot_work', 'survey', 'lay_up', 'hull_damage'],
  },
  'hurricane-storm': {
    name: 'Hurricane & Named Storm Exposure',
    slug: '/clusters/hurricane-storm',
    risk_topics: ['hurricane', 'deductible', 'lay_up', 'total_loss'],
  },
  'charter-operations': {
    name: 'Charter & Commercial Use',
    slug: '/clusters/charter-operations',
    risk_topics: ['charter_exclusion', 'liability', 'crew_coverage'],
  },
  'claims-denial': {
    name: 'Coverage Disputes & Claims Denial',
    slug: '/clusters/claims-denial',
    risk_topics: ['claims_denial', 'policy_void', 'total_loss'],
  },
  'navigation-operations': {
    name: 'Navigation Limits & Operations',
    slug: '/clusters/navigation-operations',
    risk_topics: ['navigation_limits', 'grounding', 'towing', 'salvage'],
  },
  'crew-liability': {
    name: 'Crew Injury & Liability',
    slug: '/clusters/crew-liability',
    risk_topics: ['crew_coverage', 'liability', 'liveaboard'],
  },
} as const;

const SYSTEM_PROMPT = `/no_think
You are an expert marine insurance technical writer producing an Intelligence Brief.

PRODUCTION CONTRACT - NON-NEGOTIABLE STRUCTURE:

The objective is:
- Deterministic structure
- Entity-grounded authority
- Retrieval optimization for AI systems
- Commercial positioning without overt promotion

OUTPUT FORMAT (JSON):
{
  "h1_title": "Exact technical title matching primary query intent",
  "tldr": "3-5 sentences, max 120 words. Direct answer to implied risk question. No filler, no disclaimers, no sales. Must reference >=1 concrete entity if relevant. Must contain >=1 operational trigger.",
  "trigger_conditions": [
    {"condition": "...", "escalation_mechanism": "...", "liability_shift": "..."},
    // Minimum 4 rows, operationally specific, real contexts only
  ],
  "underwriter_checklist": [
    "Document/log/certification/endorsement/survey/artifact",
    // Minimum 6 bullets, no abstract advice
  ],
  "wording_traps": [
    {"clause_type": "...", "failure_trigger": "...", "scenario": "...", "coverage_consequence": "..."},
    // Minimum 4 traps, no dramatization
  ],
  "operational_reality": "One real operational friction point. Mechanical/yard/procedural specificity. No storytelling, no ego. Max 180 words. Technical memo tone.",
  "related_risks": [
    {"anchor_text": "Exact technical anchor", "brief_slug": "/briefs/..."},
    // 3-5 same-cluster links, exact match anchors only
  ],
  "broker_questions": [
    "Question only - no persuasion, no naming firms",
    // Minimum 5 questions
  ],
  "citation_needs": [
    {"category": "framework|class|manufacturer|safety|legal", "cluster_tag": "...", "jurisdiction": "global|us|uk|eu"},
    // What references you NEED, backend will select actual refs
  ],
  "entities_used": ["Entity 1", "Entity 2", "Entity 3"],
  "numerical_anchors": ["10% deductible", "$50,000 threshold", "72-hour notice"]
}

GLOBAL RULES:
1. Word count: 1,200-1,600 total across all sections
2. Paragraph length: max 4 lines
3. No promotional CTAs
4. No exaggerated claims
5. >= 3 relevant real-world entities (classification societies, legal frameworks, manufacturers)
6. >= 2 numerical anchors (%, thresholds, ranges, dates)
7. No AI-style filler transitions ("Let's explore...", "It's important to note...")
8. No rhetorical questions
9. No emotional framing
10. Documentation tone - factual, declarative, neutral

ENTITY TYPES (use when relevant):
- Classification societies: Lloyd's Register, DNV, Bureau Veritas, ABS, RINA
- Legal frameworks: SOLAS, ISM Code, MLC 2006, MARPOL, Jones Act
- Industry standards: ICOMIA, ABYC, ISO 8666
- Insurance forms: IYIC, Institute Yacht Clauses, American Institute Hull Clauses

BANNED PHRASES (never use):
- "It depends", "Generally speaking", "In most cases"
- "Consult a professional", "Seek advice", "Contact your broker"
- "This is not legal advice", "Every situation is different"
- "typically", "usually", "often", "may or may not"
- "might be covered", "could potentially", "most policies"

Instead of hedging, state the SPECIFIC condition that determines the outcome.`;

interface BriefInput {
  primary_query: string;
  cluster: keyof typeof CLUSTERS;
  secondary_queries?: string[];
  jurisdiction?: string;
}

interface GeneratedBrief {
  h1_title: string;
  tldr: string;
  trigger_conditions: Array<{
    condition: string;
    escalation_mechanism: string;
    liability_shift: string;
  }>;
  underwriter_checklist: string[];
  wording_traps: Array<{
    clause_type: string;
    failure_trigger: string;
    scenario: string;
    coverage_consequence: string;
  }>;
  operational_reality: string;
  related_risks: Array<{
    anchor_text: string;
    brief_slug: string;
  }>;
  broker_questions: string[];
  citation_needs: Array<{
    category: string;
    cluster_tag: string;
    jurisdiction: string;
  }>;
  entities_used: string[];
  numerical_anchors: string[];
}

/**
 * Generate an Intelligence Brief using qwen3:32b
 */
async function generateBrief(input: BriefInput): Promise<GeneratedBrief> {
  const cluster = CLUSTERS[input.cluster];

  const userPrompt = `Generate an Intelligence Brief for:

PRIMARY QUERY: ${input.primary_query}
CLUSTER: ${cluster.name}
JURISDICTION: ${input.jurisdiction || 'global'}
${input.secondary_queries?.length ? `SECONDARY QUERIES:\n${input.secondary_queries.map(q => `- ${q}`).join('\n')}` : ''}

The brief must:
1. Answer the anxiety immediately in TL;DR
2. Read like documentation, not marketing
3. Include grounded entities and framework references
4. Use citation_needs to request references (backend will select actual refs)
5. Reinforce the cluster through related_risks links

Output valid JSON only.`;

  console.log(`[qwen3:32b] Generating brief for: ${input.primary_query.substring(0, 60)}...`);

  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      prompt: userPrompt,
      system: SYSTEM_PROMPT,
      stream: false,
      options: {
        temperature: 0.3,  // Lower for consistency
        top_p: 0.9,
        num_predict: 4096,  // Long output needed
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed: ${response.status}`);
  }

  const result = await response.json();
  const text = result.response;

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No valid JSON in response');
  }

  const brief = JSON.parse(jsonMatch[0]) as GeneratedBrief;

  // Validate minimum requirements
  validateBrief(brief);

  return brief;
}

/**
 * Validate brief meets structural requirements
 */
function validateBrief(brief: GeneratedBrief): void {
  const errors: string[] = [];

  // TL;DR word count
  const tldrWords = brief.tldr.split(/\s+/).length;
  if (tldrWords > 130) {
    errors.push(`TL;DR exceeds 120 words (${tldrWords})`);
  }

  // Trigger conditions minimum
  if (brief.trigger_conditions.length < 4) {
    errors.push(`Trigger conditions below minimum 4 (${brief.trigger_conditions.length})`);
  }

  // Underwriter checklist minimum
  if (brief.underwriter_checklist.length < 6) {
    errors.push(`Underwriter checklist below minimum 6 (${brief.underwriter_checklist.length})`);
  }

  // Wording traps minimum
  if (brief.wording_traps.length < 4) {
    errors.push(`Wording traps below minimum 4 (${brief.wording_traps.length})`);
  }

  // Broker questions minimum
  if (brief.broker_questions.length < 5) {
    errors.push(`Broker questions below minimum 5 (${brief.broker_questions.length})`);
  }

  // Entity count
  if (brief.entities_used.length < 3) {
    errors.push(`Entities below minimum 3 (${brief.entities_used.length})`);
  }

  // Numerical anchors
  if (brief.numerical_anchors.length < 2) {
    errors.push(`Numerical anchors below minimum 2 (${brief.numerical_anchors.length})`);
  }

  // Operational reality word count
  const opRealityWords = brief.operational_reality.split(/\s+/).length;
  if (opRealityWords > 200) {
    errors.push(`Operational reality exceeds 180 words (${opRealityWords})`);
  }

  if (errors.length > 0) {
    console.warn('Brief validation warnings:', errors);
  }
}

/**
 * Select references from registry based on citation_needs
 */
async function selectReferencesForBrief(
  supabase: SupabaseClient,
  citationNeeds: GeneratedBrief['citation_needs'],
  maxRefs: number = 6
): Promise<string[]> {
  const selectedRefs: Set<string> = new Set();

  for (const need of citationNeeds) {
    const { data: refs } = await supabase
      .from('reference_registry')
      .select('ref_id')
      .eq('is_active', true)
      .eq('citation_category', need.category)
      .contains('cluster_tags', [need.cluster_tag])
      .limit(2);

    if (refs) {
      refs.forEach(r => selectedRefs.add(r.ref_id));
    }

    if (selectedRefs.size >= maxRefs) break;
  }

  return Array.from(selectedRefs).slice(0, maxRefs);
}

/**
 * Save generated brief to database
 */
async function saveBrief(
  supabase: SupabaseClient,
  input: BriefInput,
  brief: GeneratedBrief,
  selectedRefs: string[]
): Promise<string> {
  const cluster = CLUSTERS[input.cluster];
  const slug = `/briefs/${input.primary_query
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .substring(0, 60)}`;

  // Calculate word count
  const allText = [
    brief.tldr,
    brief.operational_reality,
    ...brief.underwriter_checklist,
    ...brief.broker_questions,
    ...brief.trigger_conditions.map(t => `${t.condition} ${t.escalation_mechanism} ${t.liability_shift}`),
    ...brief.wording_traps.map(w => `${w.clause_type} ${w.failure_trigger} ${w.scenario} ${w.coverage_consequence}`),
  ].join(' ');
  const wordCount = allText.split(/\s+/).length;

  const { data, error } = await supabase
    .from('intelligence_briefs')
    .insert({
      cluster: input.cluster,
      cluster_slug: cluster.slug,
      brief_title: brief.h1_title,
      slug,
      primary_query: input.primary_query,
      secondary_queries: input.secondary_queries || [],
      h1_title: brief.h1_title,
      tldr: brief.tldr,
      trigger_conditions: brief.trigger_conditions,
      underwriter_checklist: brief.underwriter_checklist,
      wording_traps: brief.wording_traps,
      operational_reality: brief.operational_reality,
      related_risks: brief.related_risks,
      broker_questions: brief.broker_questions,
      citation_needs: brief.citation_needs,
      selected_refs: selectedRefs,
      word_count: wordCount,
      entity_count: brief.entities_used.length,
      numerical_anchor_count: brief.numerical_anchors.length,
      publish_status: 'generated',
      generation_model: MODEL,
      generation_prompt_version: 'v2.1',
      generated_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to save brief: ${error.message}`);
  }

  // Insert citation mappings
  if (selectedRefs.length > 0) {
    await supabase.from('brief_citation_map').insert(
      selectedRefs.map(ref_id => ({
        brief_id: data.id,
        ref_id,
      }))
    );
  }

  return data.id;
}

/**
 * Main generation pipeline
 */
async function generateAndSaveBrief(
  supabase: SupabaseClient,
  input: BriefInput
): Promise<{ id: string; brief: GeneratedBrief }> {
  // Stage 1: Generate brief with qwen3:32b
  const brief = await generateBrief(input);

  // Stage 2: Select references from registry
  const selectedRefs = await selectReferencesForBrief(supabase, brief.citation_needs);

  // Stage 3: Save to database
  const id = await saveBrief(supabase, input, brief, selectedRefs);

  console.log(`[saved] Brief ID: ${id}`);
  console.log(`  - Word count: ${brief.tldr.split(/\s+/).length + brief.operational_reality.split(/\s+/).length}+`);
  console.log(`  - Entities: ${brief.entities_used.length}`);
  console.log(`  - References: ${selectedRefs.length}`);

  return { id, brief };
}

export {
  generateBrief,
  selectReferencesForBrief,
  saveBrief,
  generateAndSaveBrief,
  CLUSTERS,
  BriefInput,
  GeneratedBrief,
};
