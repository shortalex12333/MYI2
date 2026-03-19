/**
 * Paper Quality Gates
 *
 * Validates generated papers before scheduling.
 * Six gates — all must pass for review_status = 'reviewed'.
 *
 * Gate 1 — Structure: all required sections present
 * Gate 2 — Entity density: ≥3 named entities
 * Gate 3 — Word count: 1,200–1,600
 * Gate 4 — No fabrication: no invented clause numbers
 * Gate 5 — References: REFERENCES_BLOCK replaced, ≥3 refs injected
 * Gate 6 — Citation Requirements: uncited claims must be minimal, standards must be valid
 *
 * Usage:
 *   npx ts-node cli.ts validate [--paper-id=uuid] [--all-drafts]
 */

import { db } from './db';
import { runGate4 } from './fabrication-gate';
import { runGateCitations } from './citation-requirement-validator';

export interface GateResult {
  gate:    string;
  passed:  boolean;
  detail:  string;
  fatal:   boolean;   // if true, reject entirely — do not schedule
}

interface ValidationResult {
  paperId:  string;
  passed:   boolean;
  gates:    GateResult[];
  verdict:  'publish' | 'revise' | 'reject';
}

// ─── GATE 1: STRUCTURE ────────────────────────────────────────
const REQUIRED_SECTIONS = [
  'TL;DR',
  'Trigger Conditions',
  'Underwriter\'s Checklist',
  'Common Wording Traps',
  'Operational Reality',
  'Related Risks',
  'Questions to Clarify',
  'References',
  'Disclosure',
];

function gateStructure(body: string): GateResult {
  const missing = REQUIRED_SECTIONS.filter(s => !body.includes(s));
  return {
    gate:   'Structure',
    passed: missing.length === 0,
    detail: missing.length === 0
      ? 'All required sections present'
      : `Missing: ${missing.join(', ')}`,
    fatal:  missing.length > 2,   // >2 missing = reject
  };
}

// ─── GATE 2: ENTITY DENSITY ───────────────────────────────────
// Recognized maritime entities — classification societies,
// regulations, frameworks, manufacturers.
const KNOWN_ENTITIES = [
  // Classification societies
  'Lloyd\'s Register', 'Bureau Veritas', 'DNV', 'American Bureau of Shipping',
  'ABS', 'RINA', 'ClassNK', 'GL', 'Germanischer Lloyd',
  // Regulatory frameworks
  'SOLAS', 'ISM Code', 'MLC 2006', 'MARPOL', 'COLREGS',
  'Jones Act', 'MIA 1906', 'IACS', 'OPA 90',
  // Industry bodies
  'IMO', 'USCG', 'MCA', 'Lloyd\'s Market', 'Lloyd\'s of London',
  'IUMI', 'ICOMIA', 'NMMA', 'MYBA', 'ECPY',
  // Standards - ISO
  'ISO 12215', 'ISO 8666', 'ISO 10240', 'ISO 15584', 'ISO 15085',
  // Standards - ABYC
  'ABYC', 'American Boat and Yacht Council',
  'ABYC E-11', 'ABYC H-2', 'ABYC A-22', 'ABYC H-24',
  // Standards - NFPA
  'NFPA 302', 'NFPA 303', 'NFPA 51B',
  // Standards - CFR
  'CFR 33', 'CFR 46', '33 CFR', '46 CFR',
  // Standards - other
  'ISM', 'ISPS', 'STCW', 'RCD', 'CE marking',
  // Clauses / policy frameworks
  'Institute Time Clauses', 'ITC 2003', 'International Hull Clauses', 'IHC 2003',
  'Institute Yacht Clauses', 'IYC', 'Institute Voyage Clauses', 'IVC 2009',
  'P&I Club', 'Protection and Indemnity', 'York-Antwerp Rules',
  // Insurance specific
  'agreed value', 'actual cash value', 'named perils', 'all risks',
  'hull and machinery', 'H&M', 'total loss', 'constructive total loss',
  'general average', 'particular average', 'salvage', 'sue and labor',
];

function gateEntityDensity(body: string): GateResult {
  const found = KNOWN_ENTITIES.filter(e => body.includes(e));
  const unique = [...new Set(found)];
  return {
    gate:   'Entity Density',
    passed: unique.length >= 3,
    detail: unique.length >= 3
      ? `${unique.length} entities found: ${unique.slice(0, 5).join(', ')}`
      : `Only ${unique.length} entities found (need ≥3): ${unique.join(', ')}`,
    fatal:  unique.length === 0,
  };
}

// ─── GATE 3: WORD COUNT ───────────────────────────────────────
function gateWordCount(body: string): GateResult {
  const count = body.split(/\s+/).filter(Boolean).length;
  const passed = count >= 1200 && count <= 1600;
  return {
    gate:   'Word Count',
    passed,
    detail: `${count} words (target: 1,200–1,600)`,
    fatal:  count < 800 || count > 2000,  // extreme outliers = reject
  };
}

// ─── GATE 4: NO FABRICATION ───────────────────────────────────
// Now handled by ./fabrication-gate.ts module
// Uses runGate4() for fabrication detection

// ─── GATE 5: REFERENCES INJECTED ─────────────────────────────
function gateReferences(body: string): GateResult {
  const hasPlaceholder = body.includes('REFERENCES_BLOCK');
  if (hasPlaceholder) {
    return {
      gate: 'References', passed: false,
      detail: 'REFERENCES_BLOCK placeholder not replaced — injection failed',
      fatal: true,
    };
  }

  // Extract reference section
  const refSection = body.match(/## References\n([\s\S]*?)(?:\n##|$)/)?.[1] ?? '';
  const refLineMatches = refSection.match(/^\d+\..+$/gm) ?? [];
  const refLines = refLineMatches.length;

  // Null detection patterns — FATAL if any found
  const nullPatterns = [
    /\]\(null\)/,      // null URL: ](null)
    /\*\*null\*\*/,    // null title: **null**
    /\[null\]/,        // null link text: [null]
    /\(null\)$/,       // null at end of reference line
  ];

  const hasNulls = refLineMatches.some(line =>
    nullPatterns.some(pattern => pattern.test(line))
  );

  // Field completeness check
  // Expected format: "1. **Title** (Category) — [Link Text](URL)"
  const validRefPattern = /^\d+\.\s+\*\*[^*]+\*\*\s+\([^)]+\)\s+—\s+\[[^\]]+\]\([^)]+\)/;
  const malformedLines = refLineMatches.filter(line => !validRefPattern.test(line));
  const hasMalformed = malformedLines.length > 0;
  const malformedCount = malformedLines.length;

  return {
    gate: 'References',
    passed: refLines >= 3 && !hasNulls && !hasMalformed,
    detail: hasNulls ? `FATAL: null values in references`
          : hasMalformed ? `Malformed reference lines: ${malformedCount}`
          : `${refLines} valid references`,
    fatal: hasNulls || refLines === 0,
  };
}

// ─── MAIN VALIDATOR ──────────────────────────────────────────

export async function validatePaper(paperId: string): Promise<ValidationResult> {
  const { data: paper, error } = await db
    .from('papers')
    .select('id, body_markdown, word_count')
    .eq('id', paperId)
    .single();

  if (error || !paper?.body_markdown) {
    throw new Error(`Paper not found: ${error?.message}`);
  }

  const body = paper.body_markdown;

  const gates: GateResult[] = [
    gateStructure(body),
    gateEntityDensity(body),
    gateWordCount(body),
    runGate4(body),
    gateReferences(body),
    runGateCitations(body),  // Gate 6: Citation Requirements
  ];

  const hasFatal   = gates.some(g => g.fatal && !g.passed);
  const allPassed  = gates.every(g => g.passed);
  const anyFailed  = gates.some(g => !g.passed);

  const verdict = hasFatal ? 'reject'
                : allPassed ? 'publish'
                : 'revise';

  // Update paper with gate results
  // NOTE: gate_citations column may need a migration if it doesn't exist yet.
  // The validation will still work; the DB update for that field will be ignored.
  const { error: updateError } = await db
    .from('papers')
    .update({
      gate_structure:      gates[0].passed,
      gate_entity:         gates[1].passed,
      gate_word_count:     gates[2].passed,
      gate_no_fabrication: gates[3].passed,
      gate_references:     gates[4].passed,
      gate_citations:      gates[5].passed,  // Gate 6: Citation Requirements
      gates_passed_at:     allPassed ? new Date().toISOString() : null,
      review_status:       verdict === 'publish' ? 'published' : 'draft',
    })
    .eq('id', paperId);

  if (updateError) {
    console.error(`Warning: gate update failed — ${updateError.message}`);
  }

  return { paperId, passed: allPassed, gates, verdict };
}

// ─── BATCH VALIDATE ───────────────────────────────────────────

export async function validateAllDrafts(): Promise<{
  publish: number;
  revise: number;
  reject: number;
  results: ValidationResult[];
}> {
  const { data: papers, error } = await db
    .from('papers')
    .select('id')
    .eq('review_status', 'draft')
    .limit(50);

  if (error || !papers) throw new Error(`Fetch failed: ${error?.message}`);

  const results: ValidationResult[] = [];
  let publish = 0, revise = 0, reject = 0;

  for (const p of papers) {
    const result = await validatePaper(p.id);
    results.push(result);
    if (result.verdict === 'publish') publish++;
    else if (result.verdict === 'revise') revise++;
    else reject++;
  }

  return { publish, revise, reject, results };
}
