/**
 * Q&A Quality Evaluation Gates
 *
 * Five gates that must pass before an answer is publishable:
 * 1. Named reference present (from verified registry)
 * 2. Numerical anchor present
 * 3. Zero generic hedges
 * 4. No fabricated clause references (Gate 4 - critical)
 * 5. Reference-question relevance (Gate 5 - semantic check)
 */

import { checkReferenceRelevance, inferRiskTopic } from './reference-relevance';

// VERIFIED references from reference_registry table
// These are the ONLY clause/regulatory references allowed
const VERIFIED_REFERENCES = [
  // From reference_registry - ref_id and variants
  { id: 'SOLAS-CH2', patterns: ['SOLAS', 'SOLAS Chapter II', 'SOLAS Ch. II', 'SOLAS Ch II'] },
  { id: 'IMO-MSC', patterns: ['IMO MSC', 'IMO Maritime Safety Committee', 'MSC Circular'] },
  { id: 'ISM-CODE', patterns: ['ISM Code', 'International Safety Management Code'] },
  { id: 'ABS-RULES', patterns: ['ABS Rules', 'ABS', 'American Bureau of Shipping'] },
  { id: 'LLOYDS-REGISTER', patterns: ["Lloyd's Register", "Lloyd's", 'Lloyds Register'] },
  { id: 'DNV-YACHTS', patterns: ['DNV Rules', 'DNV', 'DNV GL'] },
  { id: 'USCG-CFR33', patterns: ['CFR 33', 'CFR Title 33', '33 CFR'] },
  { id: 'USCG-CFR46', patterns: ['CFR 46', 'CFR Title 46', '46 CFR'] },
  { id: 'JONES-ACT', patterns: ['Jones Act', 'Merchant Marine Act of 1920'] },
  { id: 'FL-STAT-327', patterns: ['Florida Statutes Chapter 327', 'FL Stat. 327', 'FS 327', 'Florida Statute 327'] },
  { id: 'FL-HURRICANE-PREP', patterns: ['Florida Hurricane Preparedness'] },
  { id: 'NFPA-302', patterns: ['NFPA 302', 'NFPA-302'] },
  { id: 'NFPA-51B-2024', patterns: ['NFPA 51B', 'NFPA-51B'] },
  { id: 'ABYC-STANDARDS', patterns: ['ABYC Standards', 'ABYC', 'American Boat and Yacht Council'] },
  { id: 'MIA-GUIDELINES', patterns: ['MIA Guidelines', 'Marine Insurance Association'] },
  { id: 'NMMA-CERT', patterns: ['NMMA Certified', 'NMMA Certification'] },
  { id: 'ISM-CODE-SEC9', patterns: ['ISM Code Section 9'] },
  { id: 'IACS-UR-A2', patterns: ['IACS UR A2', 'IACS Unified Requirement A2'] },
  { id: 'OSHA-1915-SUBPART-D', patterns: ['OSHA 1915 Subpart D', 'OSHA 1915'] },
  { id: 'HSE-HSG-168', patterns: ['HSG 168', 'HSE HSG 168'] },
  { id: 'IMO-MSC-CIRC-1321', patterns: ['MSC.1/Circ.1321', 'MSC Circ 1321'] },
  { id: 'IMO-FSS-CODE-CH7', patterns: ['FSS Code Chapter 7', 'Fire Safety Systems Code'] },
  { id: 'SOLAS-CH2-REG19', patterns: ['SOLAS Chapter II-2 Regulation 19', 'SOLAS Regulation 19'] },
  { id: 'DNV-RU-SHIP-PT1-CH3', patterns: ['DNV Rules Part 1 Chapter 3'] },
  { id: 'LR-RULES-2024-PT1-CH2', patterns: ["Lloyd's Register Part 1 Chapter 2"] },
  { id: 'BV-NR500-2024-PT2-CH6', patterns: ['Bureau Veritas NR500', 'BV NR500'] },
  { id: 'MCA-MGN-280', patterns: ['MGN 280', 'MCA MGN 280'] },
  { id: 'ICOMIA-REFIT-STD-2021', patterns: ['ICOMIA Superyacht Refit Standard', 'ICOMIA Refit'] },
  { id: 'ABS-GUIDE-HOTWORK-2023', patterns: ['ABS Hot Work', 'ABS Guidance Notes on Hot Work'] },
  { id: 'AWS-D36M-2017', patterns: ['AWS D3.6M', 'AWS D3.6M:2017', 'Underwater Welding Code'] },
  // New references for racing/theft/liveaboard/towing/salvage
  { id: 'NFPA-303', patterns: ['NFPA 303', 'NFPA-303'] },
  { id: 'USCG-CFR46-PT26', patterns: ['CFR 46 Part 26', '46 CFR Part 26', 'towing vessel requirements'] },
  { id: 'OPA-90', patterns: ['OPA 90', 'Oil Pollution Act', 'OPA-90'] },
  { id: 'YORK-ANTWERP-2016', patterns: ['York-Antwerp Rules', 'York-Antwerp', 'general average'] },
  { id: 'MLC-2006', patterns: ['MLC 2006', 'Maritime Labour Convention'] },
  { id: 'FL-STAT-327-53', patterns: ['Florida Statute 327.53', 'FL Stat. 327.53', 'FS 327.53'] },
  { id: 'ABYC-H2', patterns: ['ABYC H-2', 'ABYC H2'] },
  // Claims/hull/total-loss/deductible/salvage references (batch 2)
  { id: 'ITC-H-1983', patterns: [
    'Institute Time Clauses', 'ITC-H', 'ITC Hulls',
    'Institute Time Clauses Hulls'
  ]},
  { id: 'IYIC-1985', patterns: [
    'Institute Yacht Clauses', 'IYIC', 'IYIC 1985'
  ]},
  { id: 'IHC-2003', patterns: [
    'International Hull Clauses', 'IHC 2003', 'IHC (01.11.03)'
  ]},
  { id: 'MIA-1906', patterns: [
    'Marine Insurance Act', 'Marine Insurance Act 1906', 'MIA 1906'
  ]},
  { id: 'ICA-2015', patterns: [
    'Insurance Act 2015', 'Insurance Act', 'ICA 2015'
  ]},
  { id: 'LSW-3000', patterns: [
    'LSW 3000', 'Named Storm Deductible Clause', 'LMA named storm'
  ]},
  { id: 'LOF-2020', patterns: [
    "Lloyd's Open Form", 'LOF 2020', 'LOF',
    "Lloyd's Standard Form of Salvage"
  ]},
  { id: 'SALVAGE-1989', patterns: [
    'International Convention on Salvage', 'Salvage Convention 1989',
    'IMO Salvage Convention'
  ]},
  { id: 'TOWCON', patterns: [
    'TOWCON', 'BIMCO TOWCON', 'TOWCON 2008'
  ]},
  { id: 'CTL', patterns: [
    'Constructive Total Loss', 'CTL', 's.60'
  ]},
  { id: 'IACS-UR-W', patterns: [
    'IACS UR W', 'IACS Unified Requirements W'
  ]},
];

// Flatten all valid patterns for quick lookup
const VALID_REFERENCE_PATTERNS = VERIFIED_REFERENCES.flatMap(r => r.patterns.map(p => p.toLowerCase()));

// Common policy terminology (allowed without specific clause numbers)
const ALLOWED_POLICY_TERMS = [
  'sue and labor', 'concurrent causation', 'navigation warranty',
  'lay-up warranty', 'named storm deductible', 'hurricane deductible',
  'agreed value', 'actual cash value', 'ACV',
  'hull and machinery', 'H&M', 'P&I', 'protection and indemnity',
  'crew endorsement', 'charter endorsement', 'racing exclusion',
  'tender coverage', 'dinghy coverage', 'personal effects',
  'MLC 2006', 'MARPOL', 'Longshore Act', 'FS 627', 'Citizens',
];

// Gate 1 now uses VERIFIED references only
const NAMED_REFERENCES = [
  ...VALID_REFERENCE_PATTERNS,
  ...ALLOWED_POLICY_TERMS.map(t => t.toLowerCase()),
];

// Patterns for numerical anchors
const NUMERICAL_PATTERNS = [
  /\d+%/,                           // Percentages: 5%, 10%
  /\$[\d,]+/,                       // Dollar amounts: $5,000
  /\d+[-–]\d+/,                     // Ranges: 5-10, 30-60
  /\d+ (days?|hours?|months?|years?|feet|ft|nm|miles)/i,  // Time/distance
  /\d{4}/,                          // Years: 2006, 2024
  /(first|within|after|before) \d+/, // Thresholds
  /\d+ (knots|mph|kts)/i,           // Speeds
  /\d+(['"]|ft|feet)/,              // Measurements
];

// Banned generic hedges
const BANNED_PHRASES = [
  'most policies',
  'coverage depends',
  'verify with your insurer',
  'verify with the insurer',
  'verify with your',
  'verify with the',
  'it varies',
  'consult a professional',
  'it depends on your policy',
  'check your policy wording',
  'typically',
  'generally speaking',
  'in most cases',
  'usually',
  'often',
  'may or may not',
  'could potentially',
  'might be covered',
  'contact your broker',
  'speak with your agent',
];

// Patterns that indicate fabricated clause references
// These catch invented "Section X.X", "Clause X.X", etc.
const FABRICATION_PATTERNS = [
  // Generic numbered clauses without known parent
  /\bsection\s+[IVX\d]+\.[\d.]+/gi,           // "Section III.1.2", "Section 1.1.1"
  /\bclause\s+[\d.]+/gi,                       // "Clause 12.1", "Clause 1.2"
  /\b(?:exclusion|policy)\s+clause\s+[\d.]+/gi, // "Exclusion Clause 12.1"
  /\b(?:policy|insurance)\s+condition\s+[\d.]+/gi, // "Policy Condition 5.3"
  /\bpart\s+[A-Z],?\s+(?:section|clause)\s+[\d.]+/gi, // "Part A, Section 1.1"
  /\biyic\b.*?(?:section|clause)\s+[\d.]+/gi,  // "IYIC Section X.X" (IYIC doesn't use this format)
  /\binstitute\s+(?:time|yacht|hull)\s+clause[s]?\s+[\d.]+/gi, // "Institute Time Clauses 1.1.1"
];

// Patterns for fabricated verbatim quotes
const FABRICATED_QUOTE_PATTERNS = [
  // Quoted policy language that looks invented
  /[""].*?(?:shall be discharged|coverage shall|insurer shall|insured must).*?["']/gi,
  /[""].*?(?:the insurer|the insured|this policy|this insurance).*?["']/gi,
];

interface EvalResult {
  passed: boolean;
  gate: string;
  details: string;
  matches?: string[];
}

interface FullEvalResult {
  passed: boolean;
  score: number;  // 0-5, one point per gate
  gates: {
    namedReference: EvalResult;
    numericalAnchor: EvalResult;
    genericHedge: EvalResult;
    fabricatedReference: EvalResult;
    referenceRelevance: EvalResult;
  };
  recommendation: 'publish' | 'revise' | 'reject';
}

// Minimum match length to count as a named reference
// Prevents short abbreviations like 'ACV', 'H&M' from passing alone
const MIN_REFERENCE_LENGTH = 5;

/**
 * Gate 1: Check for named policy clause or regulatory reference
 */
function checkNamedReference(answer: string): EvalResult {
  const lowerAnswer = answer.toLowerCase();
  const matches: string[] = [];

  for (const ref of NAMED_REFERENCES) {
    // Only count references >= 5 characters to avoid incidental matches
    if (ref.length >= MIN_REFERENCE_LENGTH &&
        lowerAnswer.includes(ref.toLowerCase())) {
      matches.push(ref);
    }
  }

  return {
    passed: matches.length > 0,
    gate: 'Named Reference',
    details: matches.length > 0
      ? `Found ${matches.length} reference(s)`
      : 'No named clause or regulatory reference found',
    matches,
  };
}

/**
 * Gate 2: Check for numerical anchor
 */
function checkNumericalAnchor(answer: string): EvalResult {
  const matches: string[] = [];

  for (const pattern of NUMERICAL_PATTERNS) {
    const found = answer.match(pattern);
    if (found) {
      matches.push(found[0]);
    }
  }

  // Dedupe
  const unique = [...new Set(matches)];

  return {
    passed: unique.length > 0,
    gate: 'Numerical Anchor',
    details: unique.length > 0
      ? `Found ${unique.length} numerical anchor(s)`
      : 'No numerical anchor (%, threshold, date, range) found',
    matches: unique,
  };
}

/**
 * Gate 3: Check for banned generic hedges
 */
function checkGenericHedge(answer: string): EvalResult {
  const lowerAnswer = answer.toLowerCase();
  const matches: string[] = [];

  for (const phrase of BANNED_PHRASES) {
    if (lowerAnswer.includes(phrase.toLowerCase())) {
      matches.push(phrase);
    }
  }

  return {
    passed: matches.length === 0,  // Pass if NO banned phrases
    gate: 'Generic Hedge',
    details: matches.length === 0
      ? 'No generic hedges detected'
      : `Found ${matches.length} banned phrase(s)`,
    matches,
  };
}

/**
 * Gate 4: Check for fabricated clause references (CRITICAL)
 *
 * Detects when the model invents clause numbers like:
 * - "Exclusion Clause 12.1" (not a real standardized clause)
 * - "Section III, Clause 1.2 of IYIC" (fabricated)
 * - "Policy Condition 5.3" (invented)
 *
 * These pass Gate 1 (looks like a reference) but are dangerous
 * because they're authoritative-sounding fabrications.
 */
function checkFabricatedReference(answer: string): EvalResult {
  const fabricatedMatches: string[] = [];

  // Check for fabricated clause patterns
  for (const pattern of FABRICATION_PATTERNS) {
    const matches = answer.match(pattern);
    if (matches) {
      for (const match of matches) {
        // Check if this clause reference is part of a verified reference
        const lowerMatch = match.toLowerCase();
        const isVerified = VALID_REFERENCE_PATTERNS.some(valid =>
          lowerMatch.includes(valid) || valid.includes(lowerMatch)
        );

        if (!isVerified) {
          fabricatedMatches.push(match);
        }
      }
    }
  }

  // Check for fabricated verbatim quotes
  for (const pattern of FABRICATED_QUOTE_PATTERNS) {
    const matches = answer.match(pattern);
    if (matches) {
      fabricatedMatches.push(...matches);
    }
  }

  // Dedupe
  const unique = [...new Set(fabricatedMatches)];

  return {
    passed: unique.length === 0,  // Pass if NO fabricated references
    gate: 'Fabricated Reference',
    details: unique.length === 0
      ? 'No fabricated clause references detected'
      : `CRITICAL: Found ${unique.length} fabricated reference(s)`,
    matches: unique,
  };
}

/**
 * Run all five evaluation gates
 */
function evaluateAnswer(answer: string, question?: string, riskTopic?: string): FullEvalResult {
  const namedReference = checkNamedReference(answer);
  const numericalAnchor = checkNumericalAnchor(answer);
  const genericHedge = checkGenericHedge(answer);
  const fabricatedReference = checkFabricatedReference(answer);

  // Gate 5: Reference relevance check
  // If riskTopic not provided, infer from question text
  const topic = riskTopic || (question ? inferRiskTopic(question) : 'other');
  const referenceRelevance = checkReferenceRelevance(answer, topic);

  const gates = [namedReference, numericalAnchor, genericHedge, fabricatedReference, referenceRelevance];
  const score = gates.filter(g => g.passed).length;

  // Gate 4 and Gate 5 are hard blockers
  const hasFabrication = !fabricatedReference.passed;
  const hasMisappliedRef = !referenceRelevance.passed;
  const allPassed = score === 5;

  let recommendation: 'publish' | 'revise' | 'reject';
  if (hasFabrication || hasMisappliedRef) {
    // Fabricated or misapplied references are immediate rejection
    recommendation = 'reject';
  } else if (allPassed) {
    recommendation = 'publish';
  } else if (score >= 4 && genericHedge.passed && fabricatedReference.passed && referenceRelevance.passed) {
    recommendation = 'revise';  // Missing one signal but no bad phrases, fabrications, or misapplied refs
  } else {
    recommendation = 'reject';
  }

  return {
    passed: allPassed,
    score,
    gates: {
      namedReference,
      numericalAnchor,
      genericHedge,
      fabricatedReference,
      referenceRelevance,
    },
    recommendation,
  };
}

/**
 * Quick pass/fail check
 */
function passesAllGates(answer: string, question?: string, riskTopic?: string): boolean {
  return evaluateAnswer(answer, question, riskTopic).passed;
}

export {
  evaluateAnswer,
  passesAllGates,
  checkNamedReference,
  checkNumericalAnchor,
  checkGenericHedge,
  checkFabricatedReference,
  checkReferenceRelevance,
  inferRiskTopic,
  EvalResult,
  FullEvalResult,
  NAMED_REFERENCES,
  BANNED_PHRASES,
  VERIFIED_REFERENCES,
  VALID_REFERENCE_PATTERNS,
};
