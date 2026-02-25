/**
 * Fabrication Gate - Deterministic Detection
 *
 * Gate 4 is ALWAYS FATAL if triggered.
 * This replaces the vague "no invented clause numbers" rule
 * with concrete regex patterns and claim tracking.
 */

// ─── FABRICATION PATTERNS (ALWAYS BLOCK) ─────────────────────

const FABRICATION_PATTERNS: Array<{
  pattern: RegExp;
  name: string;
  fatal: boolean;
}> = [
  // Invented clause/section numbers
  {
    pattern: /\b[Ss]ection\s+\d+\.\d+(\.\d+)?/g,
    name: 'invented_section_number',
    fatal: true,
  },
  {
    pattern: /\b[Cc]lause\s+\d+\.\d+(\.\d+)?/g,
    name: 'invented_clause_number',
    fatal: true,
  },
  {
    pattern: /\b[Pp]aragraph\s+\d+\.\d+/g,
    name: 'invented_paragraph_number',
    fatal: true,
  },
  {
    pattern: /\b[Aa]rticle\s+\d+\.\d+/g,
    name: 'invented_article_number',
    fatal: true,
  },
  {
    pattern: /\b[Rr]ule\s+\d+\.\d+/g,
    name: 'invented_rule_number',
    fatal: true,
  },
  {
    pattern: /\b[Aa]ppendix\s+[A-Z]\s+[Ss]ection/gi,
    name: 'invented_appendix_ref',
    fatal: true,
  },
  {
    pattern: /\bpolicy\s+condition\s+\d+/gi,
    name: 'invented_policy_condition',
    fatal: true,
  },
];

// ─── ALLOWED DOCUMENT PATTERNS ───────────────────────────────
// Real documents that contain numbers in their names
const ALLOWED_DOCUMENT_REFS = [
  'MLC 2006',
  'IHC 2003',
  'MIA 1906',
  'STCW 1978',
  'ISM Code',
  'SOLAS Chapter',
  'MARPOL Annex',
  'CFR 33',
  'CFR 46',
  'ISO 8666',
  'NFPA 302',
  'NFPA 303',
  'NFPA 51B',
  'OPA 90',
  'York-Antwerp 2016',
];

// ─── CLAIM PATTERNS (REQUIRE REF_ID) ─────────────────────────
// These patterns indicate a claim that MUST be backed by reference

const UNBACKED_CLAIM_PATTERNS: Array<{
  pattern: RegExp;
  name: string;
}> = [
  {
    pattern: /\b(requires|mandates|stipulates)\s+(that\s+)?[A-Z]/g,
    name: 'requirement_claim',
  },
  {
    pattern: /\b(must|shall)\s+(be|have|include|provide)/gi,
    name: 'obligation_claim',
  },
  {
    pattern: /\bfailure to\s+\w+\s+(will|shall|may)\s+(result|void|invalidate)/gi,
    name: 'consequence_claim',
  },
];

// ─── SUSPICIOUS PERCENTAGE PATTERNS ──────────────────────────
// Specific percentages need justification

const SUSPICIOUS_PERCENTAGE = /\b(\d{1,3})%\s+(of\s+)?(policies|claims|vessels|insurers|underwriters)/gi;

// ─── DETECTION RESULT ────────────────────────────────────────

interface FabricationViolation {
  pattern_name: string;
  match: string;
  position: number;
  fatal: boolean;
}

interface FabricationResult {
  passed: boolean;
  violations: FabricationViolation[];
  suspicious_claims: string[];
  suspicious_percentages: string[];
}

function isAllowedDocumentRef(text: string, match: string, position: number): boolean {
  // Check if the match is near an allowed document reference
  const context = text.slice(Math.max(0, position - 50), position + match.length + 50);
  return ALLOWED_DOCUMENT_REFS.some(doc => context.includes(doc));
}

export function detectFabrication(body: string): FabricationResult {
  const violations: FabricationViolation[] = [];
  const suspicious_claims: string[] = [];
  const suspicious_percentages: string[] = [];

  // Check fabrication patterns
  for (const { pattern, name, fatal } of FABRICATION_PATTERNS) {
    const matches = body.matchAll(new RegExp(pattern.source, pattern.flags));
    for (const match of matches) {
      const matchText = match[0];
      const position = match.index ?? 0;

      // Check if this is an allowed document reference
      if (isAllowedDocumentRef(body, matchText, position)) {
        continue; // Skip - this is a real document
      }

      violations.push({
        pattern_name: name,
        match: matchText,
        position,
        fatal,
      });
    }
  }

  // Check unbacked claim patterns
  for (const { pattern, name } of UNBACKED_CLAIM_PATTERNS) {
    const matches = body.matchAll(new RegExp(pattern.source, pattern.flags));
    for (const match of matches) {
      suspicious_claims.push(`[${name}] ${match[0]}`);
    }
  }

  // Check suspicious percentages
  const percentMatches = body.matchAll(SUSPICIOUS_PERCENTAGE);
  for (const match of percentMatches) {
    suspicious_percentages.push(match[0]);
  }

  const hasFatalViolation = violations.some(v => v.fatal);

  return {
    passed: !hasFatalViolation,
    violations,
    suspicious_claims,
    suspicious_percentages,
  };
}

// ─── CLAIM TRACKER ───────────────────────────────────────────
// Every paper must track its claims

interface TrackedClaim {
  text: string;
  type: 'operational_note' | 'general_principle' | 'framework_backed';
  ref_id: string | null;
  line_number: number;
}

export function extractClaims(body: string): TrackedClaim[] {
  const claims: TrackedClaim[] = [];
  const lines = body.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip headers, lists markers, empty lines
    if (line.startsWith('#') || line.startsWith('-') || line.startsWith('|') || !line.trim()) {
      continue;
    }

    // Check for framework-backed claims
    for (const { pattern, name } of UNBACKED_CLAIM_PATTERNS) {
      if (pattern.test(line)) {
        claims.push({
          text: line.slice(0, 200),
          type: 'framework_backed',
          ref_id: null, // Must be filled by reference injection
          line_number: i + 1,
        });
      }
    }
  }

  return claims;
}

// ─── GATE RUNNER ─────────────────────────────────────────────

export interface Gate4Result {
  gate: 'No Fabrication';
  passed: boolean;
  fatal: boolean;
  detail: string;
  violations: FabricationViolation[];
  unbacked_claims: number;
}

export function runGate4(body: string): Gate4Result {
  const fabrication = detectFabrication(body);
  const claims = extractClaims(body);
  const unbackedCount = claims.filter(c => c.type === 'framework_backed' && !c.ref_id).length;

  const fatalViolations = fabrication.violations.filter(v => v.fatal);
  const passed = fatalViolations.length === 0;

  let detail: string;
  if (passed && fabrication.violations.length === 0) {
    detail = 'No fabricated references detected';
  } else if (passed) {
    detail = `${fabrication.violations.length} non-fatal issues, ${unbackedCount} unbacked claims`;
  } else {
    detail = `FATAL: ${fatalViolations.map(v => v.match).join(', ')}`;
  }

  return {
    gate: 'No Fabrication',
    passed,
    fatal: !passed,
    detail,
    violations: fabrication.violations,
    unbacked_claims: unbackedCount,
  };
}

export { FABRICATION_PATTERNS, ALLOWED_DOCUMENT_REFS, UNBACKED_CLAIM_PATTERNS };
