/**
 * Reference Injector - Deterministic Citation System
 *
 * V1: Code is truth, model is content. Zero hallucination possible.
 *
 * Flow:
 * 1. Extract signals from body (frameworks, risk topics, jurisdictions)
 * 2. Match signals to reference_registry
 * 3. Inject formatted References section
 * 4. Update paper_citation_map for tracking
 */

import { db } from './db';

// ─── FRAMEWORK PATTERNS ─────────────────────────────────────
// Known maritime/insurance frameworks we can cite
const FRAMEWORK_PATTERNS: Array<{ pattern: RegExp; ref_match: string }> = [
  { pattern: /\bABYC\b/gi, ref_match: 'abyc' },
  { pattern: /\bISO\s*12215\b/gi, ref_match: 'iso-12215' },
  { pattern: /\bISO\s*8666\b/gi, ref_match: 'iso-8666' },
  { pattern: /\bMLC\s*2006\b/gi, ref_match: 'mlc-2006' },
  { pattern: /\bMIA\s*1906\b/gi, ref_match: 'mia-1906' },
  { pattern: /\bSOLAS\b/gi, ref_match: 'solas' },
  { pattern: /\bMARPOL\b/gi, ref_match: 'marpol' },
  { pattern: /\bSTCW\b/gi, ref_match: 'stcw' },
  { pattern: /\bISM\s*Code\b/gi, ref_match: 'ism' },
  { pattern: /\bIHC\s*2003\b/gi, ref_match: 'ihc-2003' },
  { pattern: /\bITC\s*2003\b/gi, ref_match: 'itc-2003' },
  { pattern: /\bIVC\s*2009\b/gi, ref_match: 'ivc-2009' },
  { pattern: /\bYork[- ]Antwerp/gi, ref_match: 'york-antwerp' },
  { pattern: /\bOPA\s*90\b/gi, ref_match: 'opa-90' },
  { pattern: /\bCFR\s*33\b/gi, ref_match: 'cfr-33' },
  { pattern: /\bCFR\s*46\b/gi, ref_match: 'cfr-46' },
  { pattern: /\bNFPA\s*302\b/gi, ref_match: 'nfpa-302' },
  { pattern: /\bNFPA\s*303\b/gi, ref_match: 'nfpa-303' },
  { pattern: /\bNFPA\s*51B\b/gi, ref_match: 'nfpa-51b' },
  { pattern: /\bLloyd's/gi, ref_match: 'lloyds' },
  { pattern: /\bP&I\s*Club/gi, ref_match: 'pandi' },
  { pattern: /\bIMO\b/gi, ref_match: 'imo' },
];

// ─── RISK TOPIC PATTERNS ────────────────────────────────────
// Maps content keywords to reference_registry tags
const RISK_TOPIC_PATTERNS: Array<{ pattern: RegExp; tags: string[] }> = [
  { pattern: /\bhull\s*(damage|coverage|repair|insurance)/gi, tags: ['hull_damage', 'hull'] },
  { pattern: /\btotal\s*loss/gi, tags: ['total_loss'] },
  { pattern: /\bconstructive\s*total\s*loss/gi, tags: ['total_loss', 'ctl'] },
  { pattern: /\bcrew\s*(injury|liability|coverage)/gi, tags: ['crew_injury', 'crew'] },
  { pattern: /\bhot\s*work/gi, tags: ['hot_work', 'refit'] },
  { pattern: /\brefit/gi, tags: ['refit', 'shipyard'] },
  { pattern: /\bshipyard/gi, tags: ['shipyard', 'refit'] },
  { pattern: /\bhurricane/gi, tags: ['hurricane', 'storm'] },
  { pattern: /\bnamed\s*storm/gi, tags: ['hurricane', 'storm'] },
  { pattern: /\bgrounding/gi, tags: ['grounding', 'navigation'] },
  { pattern: /\bsalvage/gi, tags: ['salvage'] },
  { pattern: /\bpollution/gi, tags: ['pollution', 'environmental'] },
  { pattern: /\bcharter/gi, tags: ['charter'] },
  { pattern: /\bnavigation\s*limits/gi, tags: ['navigation', 'cruising_area'] },
  { pattern: /\bclaims?\s*denial/gi, tags: ['claims_denial', 'claims'] },
  { pattern: /\bunderwriter/gi, tags: ['underwriting'] },
  { pattern: /\bsurvey/gi, tags: ['survey', 'condition'] },
  { pattern: /\bvaluation/gi, tags: ['valuation', 'agreed_value'] },
  { pattern: /\bdeductible/gi, tags: ['deductible'] },
  { pattern: /\bexclusion/gi, tags: ['exclusions'] },
  { pattern: /\bliability/gi, tags: ['liability'] },
  { pattern: /\bP&I/gi, tags: ['pandi', 'liability'] },
  { pattern: /\bseaworthiness/gi, tags: ['seaworthiness'] },
  { pattern: /\bmaintenance/gi, tags: ['maintenance'] },
  { pattern: /\breplica|kit[- ]built/gi, tags: ['construction', 'classification'] },
  { pattern: /\bclassification\s*society/gi, tags: ['classification'] },
];

// ─── JURISDICTION PATTERNS ──────────────────────────────────
const JURISDICTION_PATTERNS: Array<{ pattern: RegExp; jurisdiction: string }> = [
  { pattern: /\bFlorida\b/gi, jurisdiction: 'us-fl' },
  { pattern: /\bUSCG\b|U\.?S\.?\s*Coast\s*Guard/gi, jurisdiction: 'us' },
  { pattern: /\bMCA\b|Maritime\s*and\s*Coastguard/gi, jurisdiction: 'uk' },
  { pattern: /\bLloyd's\s*of\s*London/gi, jurisdiction: 'uk' },
  { pattern: /\bCaribbean/gi, jurisdiction: 'caribbean' },
  { pattern: /\bMediterranean/gi, jurisdiction: 'med' },
  { pattern: /\bEU\b|European\s*Union/gi, jurisdiction: 'eu' },
  { pattern: /\bBahamas/gi, jurisdiction: 'bahamas' },
  { pattern: /\bCayman/gi, jurisdiction: 'cayman' },
  { pattern: /\bMarshall\s*Islands/gi, jurisdiction: 'marshall' },
];

// ─── SIGNAL EXTRACTION ──────────────────────────────────────

interface ExtractedSignals {
  frameworks: string[];      // ref_match values
  tags: string[];            // reference_registry tags
  jurisdictions: string[];   // jurisdiction codes
}

export function extractSignals(body: string): ExtractedSignals {
  const frameworks = new Set<string>();
  const tags = new Set<string>();
  const jurisdictions = new Set<string>();

  // Extract frameworks
  for (const { pattern, ref_match } of FRAMEWORK_PATTERNS) {
    if (pattern.test(body)) {
      frameworks.add(ref_match);
    }
    // Reset lastIndex for global regex
    pattern.lastIndex = 0;
  }

  // Extract risk topics -> tags
  for (const { pattern, tags: matchTags } of RISK_TOPIC_PATTERNS) {
    if (pattern.test(body)) {
      matchTags.forEach(t => tags.add(t));
    }
    pattern.lastIndex = 0;
  }

  // Extract jurisdictions
  for (const { pattern, jurisdiction } of JURISDICTION_PATTERNS) {
    if (pattern.test(body)) {
      jurisdictions.add(jurisdiction);
    }
    pattern.lastIndex = 0;
  }

  return {
    frameworks: Array.from(frameworks),
    tags: Array.from(tags),
    jurisdictions: Array.from(jurisdictions),
  };
}

// ─── REGISTRY MATCHING ──────────────────────────────────────

interface RegistryRef {
  ref_id: string;
  short_title: string;
  url: string;
  citation_category: string;
  cluster_tags: string[];
}

async function matchReferences(signals: ExtractedSignals): Promise<RegistryRef[]> {
  const matchedRefs: RegistryRef[] = [];
  const seenRefIds = new Set<string>();

  // 1. Direct framework matches (highest priority)
  if (signals.frameworks.length > 0) {
    const frameworkConditions = signals.frameworks
      .map(f => `ref_id.ilike.%${f}%`)
      .join(',');

    const { data: frameworkRefs } = await db
      .from('reference_registry')
      .select('ref_id, short_title, url, citation_category, cluster_tags')
      .or(frameworkConditions)
      .not('short_title', 'is', null)
      .not('url', 'is', null)
      .limit(5);

    if (frameworkRefs) {
      for (const ref of frameworkRefs) {
        if (!seenRefIds.has(ref.ref_id)) {
          matchedRefs.push(ref);
          seenRefIds.add(ref.ref_id);
        }
      }
    }
  }

  // 2. Tag matches (medium priority)
  if (signals.tags.length > 0 && matchedRefs.length < 5) {
    const { data: tagRefs } = await db
      .from('reference_registry')
      .select('ref_id, short_title, url, citation_category, cluster_tags')
      .overlaps('cluster_tags', signals.tags)
      .not('short_title', 'is', null)
      .not('url', 'is', null)
      .limit(10);

    if (tagRefs) {
      for (const ref of tagRefs) {
        if (!seenRefIds.has(ref.ref_id) && matchedRefs.length < 7) {
          matchedRefs.push(ref);
          seenRefIds.add(ref.ref_id);
        }
      }
    }
  }

  // 3. Jurisdiction matches (supplementary)
  if (signals.jurisdictions.length > 0 && matchedRefs.length < 5) {
    const { data: jurisRefs } = await db
      .from('reference_registry')
      .select('ref_id, short_title, url, citation_category, cluster_tags')
      .in('jurisdiction', signals.jurisdictions)
      .not('short_title', 'is', null)
      .not('url', 'is', null)
      .limit(5);

    if (jurisRefs) {
      for (const ref of jurisRefs) {
        if (!seenRefIds.has(ref.ref_id) && matchedRefs.length < 7) {
          matchedRefs.push(ref);
          seenRefIds.add(ref.ref_id);
        }
      }
    }
  }

  // 4. Fallback: get general high-authority refs if we still have < 3
  if (matchedRefs.length < 3) {
    const { data: fallbackRefs } = await db
      .from('reference_registry')
      .select('ref_id, short_title, url, citation_category, cluster_tags')
      .in('citation_category', ['statutory', 'regulatory', 'treaty'])
      .not('short_title', 'is', null)
      .not('url', 'is', null)
      .limit(5);

    if (fallbackRefs) {
      for (const ref of fallbackRefs) {
        if (!seenRefIds.has(ref.ref_id) && matchedRefs.length < 5) {
          matchedRefs.push(ref);
          seenRefIds.add(ref.ref_id);
        }
      }
    }
  }

  return matchedRefs;
}

// ─── CITATION INJECTION ─────────────────────────────────────

function formatReferencesSection(refs: RegistryRef[]): string {
  if (refs.length === 0) return '';

  const lines = ['## References', ''];

  refs.forEach((ref, idx) => {
    const typeLabel = ref.citation_category
      ? `(${ref.citation_category})`
      : '';
    lines.push(`${idx + 1}. **${ref.short_title}** ${typeLabel} — [${ref.url}](${ref.url})`);
  });

  return lines.join('\n');
}

// ─── EXTRACT INLINE CITATIONS ───────────────────────────────

function extractInlineCitations(body: string): string[] {
  // Match [REF-ID] patterns - uppercase letters, numbers, hyphens
  const matches = body.match(/\[([A-Z][A-Z0-9-]+)\]/g) || [];
  const refIds = matches.map(m => m.slice(1, -1)); // Remove brackets
  return [...new Set(refIds)]; // Dedupe
}

// ─── LOOKUP CITED REFS ──────────────────────────────────────

async function lookupCitedRefs(refIds: string[]): Promise<RegistryRef[]> {
  if (refIds.length === 0) return [];

  const { data: refs, error } = await db
    .from('reference_registry')
    .select('ref_id, short_title, url, citation_category, cluster_tags')
    .in('ref_id', refIds)
    .not('short_title', 'is', null)
    .not('url', 'is', null);

  if (error || !refs) {
    console.warn('Failed to lookup refs:', error?.message);
    return [];
  }

  // Sort to match order of appearance in body
  const refOrder = new Map(refIds.map((id, idx) => [id, idx]));
  refs.sort((a, b) => (refOrder.get(a.ref_id) ?? 999) - (refOrder.get(b.ref_id) ?? 999));

  return refs;
}

// ─── MAIN INJECTOR ──────────────────────────────────────────

export interface InjectionResult {
  original_body: string;
  injected_body: string;
  signals: ExtractedSignals;
  refs_matched: number;
  refs: RegistryRef[];
  cited_ids: string[];
  missing_ids: string[];
}

export async function injectReferences(body: string): Promise<InjectionResult> {
  // 1. Extract actual [REF-ID] citations from body
  const citedIds = extractInlineCitations(body);

  // 2. Lookup those specific refs in registry
  const refs = await lookupCitedRefs(citedIds);

  // 3. Identify any cited IDs not found in registry
  const foundIds = new Set(refs.map(r => r.ref_id));
  const missingIds = citedIds.filter(id => !foundIds.has(id));

  if (missingIds.length > 0) {
    console.warn(`  ⚠ Missing from registry: ${missingIds.join(', ')}`);
  }

  // 4. Format references section from actual citations
  const refsSection = formatReferencesSection(refs);

  // 5. Remove any existing References section and append new one
  let cleanBody = body.replace(/## References\s*\n*[\s\S]*?(?=\n## |$)/, '').trim();

  // If there's a Disclosure section, insert refs before it
  if (cleanBody.includes('## Disclosure')) {
    cleanBody = cleanBody.replace(
      '## Disclosure',
      `${refsSection}\n\n---\n\n## Disclosure`
    );
  } else {
    // Otherwise append at end
    cleanBody = `${cleanBody}\n\n---\n\n${refsSection}`;
  }

  // Also extract signals for diagnostics (but don't use for refs)
  const signals = extractSignals(body);

  return {
    original_body: body,
    injected_body: cleanBody,
    signals,
    refs_matched: refs.length,
    refs,
    cited_ids: citedIds,
    missing_ids: missingIds,
  };
}

// ─── DATABASE UPDATE ────────────────────────────────────────

export async function injectAndSave(paperId: string): Promise<InjectionResult> {
  // 1. Fetch paper body
  const { data: paper, error: fetchError } = await db
    .from('papers')
    .select('body_markdown')
    .eq('id', paperId)
    .single();

  if (fetchError || !paper?.body_markdown) {
    throw new Error(`Paper not found: ${fetchError?.message}`);
  }

  // 2. Inject references
  const result = await injectReferences(paper.body_markdown);

  // 3. Update paper body
  const { error: updateError } = await db
    .from('papers')
    .update({
      body_markdown: result.injected_body,
      // Recalculate word count
      word_count: result.injected_body.split(/\s+/).filter(w => w.length > 0).length,
    })
    .eq('id', paperId);

  if (updateError) {
    throw new Error(`Failed to update paper: ${updateError.message}`);
  }

  // 4. Record citations in paper_citation_map
  if (result.refs.length > 0) {
    const citations = result.refs.map((ref, idx) => ({
      paper_id: paperId,
      ref_id: ref.ref_id,
      position: idx + 1,
      relevance_note: `Matched via: ${result.signals.frameworks.length > 0 ? 'framework' : 'tags'}`,
    }));

    // Delete existing citations first
    await db.from('paper_citation_map').delete().eq('paper_id', paperId);

    // Insert new citations
    const { error: citationError } = await db
      .from('paper_citation_map')
      .insert(citations);

    if (citationError) {
      console.warn(`Citation map update failed: ${citationError.message}`);
    }
  }

  return result;
}

// ─── EXPORTS ────────────────────────────────────────────────

export { FRAMEWORK_PATTERNS, RISK_TOPIC_PATTERNS, JURISDICTION_PATTERNS };
