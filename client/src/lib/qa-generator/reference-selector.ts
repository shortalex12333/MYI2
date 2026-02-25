/**
 * Reference Selector - Stage 1 of the Q&A Pipeline
 *
 * Selects verified references from reference_registry based on:
 * 1. Risk topic mapping
 * 2. Keyword matching
 * 3. Jurisdiction filtering
 *
 * This ensures the model can ONLY cite verified references.
 */

import { createClient } from '@supabase/supabase-js';

interface SelectedReference {
  ref_id: string;
  short_title: string | null;
  title: string;
  citation_text: string;  // What to inject into prompt
  cluster_tags: string[];
}

// Risk topic → cluster_tag mapping
// Maps question risk_topics to registry cluster_tags
const RISK_TOPIC_TO_TAGS: Record<string, string[]> = {
  // Coverage/claims topics (updated with new registry tags)
  claims_denial: ['claims', 'claims-denial', 'non-disclosure', 'policy'],
  policy_void: ['policy', 'policy-void', 'non-disclosure', 'claims-denial'],
  deductible: ['deductible', 'hurricane', 'storm', 'claims'],
  quote_bind: ['underwriting', 'policy'],

  // Physical damage topics
  fire: ['fire', 'fire-safety', 'hot-work'],
  hurricane: ['hurricane', 'storm', 'deductible', 'layup', 'storage'],
  hull_damage: ['hull', 'hull-damage', 'hull-repair', 'claims'],
  grounding: ['hull', 'hull-damage', 'navigation', 'operations'],
  total_loss: ['total-loss', 'hull', 'valuation', 'claims'],

  // Liability topics
  liability: ['liability', 'injury', 'crew'],
  crew_coverage: ['crew', 'injury', 'liability'],
  pollution: ['liability', 'operations'],
  pollution_or_contamination: ['pollution', 'environmental', 'liability'],

  // Operations topics
  racing: ['racing', 'policy', 'claims'],
  charter_exclusion: ['yacht-charter', 'commercial', 'liability'],
  navigation_limits: ['navigation', 'operations'],
  towing: ['towing', 'salvage', 'operations'],
  salvage: ['salvage', 'towing', 'operations'],

  // Survey/maintenance topics
  survey: ['survey', 'classification', 'inspection'],
  lay_up: ['layup', 'storage', 'hurricane'],

  // Specific risks
  theft: ['theft', 'registration', 'florida', 'claims'],
  liveaboard: ['liveaboard', 'crew', 'marina', 'operations'],
  financing: ['valuation', 'policy'],

  // Fallback (improved to catch more registry hits)
  other: ['claims', 'policy', 'insurance'],
};

// Jurisdiction mapping
const JURISDICTION_TO_FILTER: Record<string, string[]> = {
  'FL': ['us', 'florida', 'global'],
  'US': ['us', 'global'],
  'UK': ['uk', 'global'],
  'EU': ['global'],  // No specific EU refs yet
  'international': ['global'],
  'unknown': ['global', 'us'],  // Default to US/global
};

// Reference exclusions by risk topic
// Prevents references from being selected for topics where they don't apply
// Even if tag overlap exists, these references should NOT be used
const REFERENCE_EXCLUSIONS: Record<string, string[]> = {
  // SOLAS governs ship construction/fire safety - not coverage/claims/charter
  claims_denial: ['SOLAS-CH2', 'SOLAS-CH2-REG19', 'ICOMIA-REFIT-STD-2021'],
  deductible: ['SOLAS-CH2', 'SOLAS-CH2-REG19', 'ICOMIA-REFIT-STD-2021', 'JONES-ACT'],
  charter_exclusion: ['SOLAS-CH2', 'SOLAS-CH2-REG19', 'JONES-ACT'],
  racing: ['SOLAS-CH2', 'SOLAS-CH2-REG19', 'ICOMIA-REFIT-STD-2021', 'JONES-ACT'],
  theft: ['SOLAS-CH2', 'SOLAS-CH2-REG19', 'ICOMIA-REFIT-STD-2021', 'JONES-ACT'],
  financing: ['SOLAS-CH2', 'SOLAS-CH2-REG19', 'ICOMIA-REFIT-STD-2021', 'JONES-ACT'],
  liveaboard: ['SOLAS-CH2', 'SOLAS-CH2-REG19', 'ICOMIA-REFIT-STD-2021'],
  quote_bind: ['SOLAS-CH2', 'SOLAS-CH2-REG19', 'ICOMIA-REFIT-STD-2021', 'JONES-ACT'],
  policy_void: ['SOLAS-CH2', 'SOLAS-CH2-REG19', 'ICOMIA-REFIT-STD-2021'],
  total_loss: ['ICOMIA-REFIT-STD-2021'],
  towing: ['SOLAS-CH2', 'ICOMIA-REFIT-STD-2021'],
  salvage: ['SOLAS-CH2', 'ICOMIA-REFIT-STD-2021'],
  // Jones Act only applies to crew injury - not hull/general coverage
  hull_damage: ['JONES-ACT', 'ICOMIA-REFIT-STD-2021'],
  grounding: ['JONES-ACT', 'ICOMIA-REFIT-STD-2021'],
  navigation_limits: ['JONES-ACT', 'ICOMIA-REFIT-STD-2021'],
};

/**
 * Select relevant references for a question based on risk_topic and jurisdiction
 */
async function selectReferences(
  supabase: ReturnType<typeof createClient>,
  riskTopic: string,
  jurisdiction: string,
  maxRefs: number = 3
): Promise<SelectedReference[]> {
  // Get relevant tags for this risk topic
  const relevantTags = RISK_TOPIC_TO_TAGS[riskTopic] || RISK_TOPIC_TO_TAGS['other'];

  // Get jurisdiction filter
  const jurisdictionFilter = JURISDICTION_TO_FILTER[jurisdiction] || JURISDICTION_TO_FILTER['unknown'];

  // Query references that match any of the tags AND jurisdiction
  const { data: refs, error } = await supabase
    .from('reference_registry')
    .select('ref_id, short_title, title, cluster_tags, jurisdiction')
    .eq('is_active', true)
    .in('jurisdiction', jurisdictionFilter)
    .overlaps('cluster_tags', relevantTags)
    .limit(maxRefs * 2);  // Fetch extra to filter

  if (error || !refs) {
    console.error('Failed to fetch references:', error);
    return [];
  }

  // Get excluded reference IDs for this risk topic
  const excludedRefs = REFERENCE_EXCLUSIONS[riskTopic] || [];

  // Filter out excluded references, then score by tag overlap
  const scored = refs
    .filter(ref => !excludedRefs.includes(ref.ref_id))
    .map(ref => {
      const tagOverlap = ref.cluster_tags.filter((t: string) =>
        relevantTags.includes(t)
      ).length;
      return { ...ref, score: tagOverlap };
    });

  // Sort by score descending, take top N
  const selected = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxRefs);

  // Format for injection
  return selected.map(ref => ({
    ref_id: ref.ref_id,
    short_title: ref.short_title,
    title: ref.title,
    citation_text: ref.short_title || ref.title,
    cluster_tags: ref.cluster_tags,
  }));
}

/**
 * Build the reference constraint section for the prompt
 */
function buildReferencePrompt(references: SelectedReference[]): string {
  if (references.length === 0) {
    return `
REFERENCE GUIDANCE:
No specific regulatory references apply to this question.
Describe the principle or standard practice without citing specific clause numbers.
Focus on the condition boundaries (when coverage applies vs. does not apply).`;
  }

  const refList = references
    .map(r => `- ${r.citation_text}`)
    .join('\n');

  return `
APPROVED REFERENCES FOR THIS QUESTION:
${refList}

You may ONLY cite references from the list above.
If describing a principle not covered by these references, state it without a clause number.
NEVER invent clause numbers or section references.`;
}

/**
 * Combined function for pipeline use
 */
async function getReferencesForQuestion(
  supabase: ReturnType<typeof createClient>,
  riskTopic: string,
  jurisdiction: string
): Promise<{ references: SelectedReference[]; promptSection: string }> {
  const references = await selectReferences(supabase, riskTopic, jurisdiction);
  const promptSection = buildReferencePrompt(references);
  return { references, promptSection };
}

export {
  selectReferences,
  buildReferencePrompt,
  getReferencesForQuestion,
  SelectedReference,
  RISK_TOPIC_TO_TAGS,
  JURISDICTION_TO_FILTER,
  REFERENCE_EXCLUSIONS,
};
