/**
 * Q&A Extraction and Normalization Pipeline
 * Converts raw scraped content into structured, neutral Q&A entries
 */

import { createClient } from '@supabase/supabase-js';

interface QAEntry {
  question: string;
  answer: string;
  tags: ('definitions' | 'coverage' | 'cost' | 'requirements' | 'claims' | 'exclusions' | 'policy_terms')[];
  sourceUrl: string;
  sourceType: string;
  confidence: number;
  extractionMethod: 'faq_pattern' | 'header_inference' | 'definition_extraction';
  rawQuestion?: string;
  rawAnswer?: string;
}

interface EntityMention {
  type: 'provider' | 'region' | 'vessel_type' | 'coverage_type' | 'claim_type';
  value: string;
  confidence: number;
}

class QAExtractionPipeline {
  private supabase: ReturnType<typeof createClient>;

  // Known entities for recognition
  private providers = [
    'Travelers', 'GEICO', 'Chubb', 'Progressive', 'State Farm',
    'AXA XL', 'Allianz', 'QBE', 'Zurich', 'Markel',
    'Pantaenius', 'BoatUS', 'W3 Insurance', 'Howden', 'Marsh',
    'Gallagher', 'Lockton', 'Aon', 'Brown & Brown', 'HUB International'
  ];

  private regions = [
    'Caribbean', 'Mediterranean', 'Atlantic', 'Gulf of Mexico',
    'Pacific', 'North Sea', 'Baltic', 'Southeast Asia',
    'Florida', 'Bahamas', 'US', 'UK', 'Europe', 'Canada'
  ];

  private vesselTypes = [
    'sailboat', 'motor yacht', 'catamaran', 'monohull',
    'trawler', 'powerboat', 'sailship', 'superyacht',
    'cruising yacht', 'racing yacht', 'tugboat'
  ];

  private coverageTypes = [
    'hull', 'liability', 'p&i', 'medical', 'towing',
    'machinery', 'cargo', 'crew', 'tender', 'personal effects'
  ];

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Main pipeline: Extract Q&A from raw HTML/text
   */
  async processSnapshot(snapshotId: number, htmlContent: string, sourceUrl: string): Promise<QAEntry[]> {
    const cleanText = this.cleanHtml(htmlContent);
    const qaEntries: QAEntry[] = [];

    // Strategy 1: Detect FAQ pattern (question/answer pairs)
    const faqMatches = this.extractFAQPattern(cleanText, sourceUrl);
    qaEntries.push(...faqMatches);

    // Strategy 2: Extract from headers + paragraphs
    const headerBased = this.extractFromHeaders(cleanText, sourceUrl);
    qaEntries.push(...headerBased);

    // Strategy 3: Extract definition-style content
    const definitions = this.extractDefinitions(cleanText, sourceUrl);
    qaEntries.push(...definitions);

    // Deduplicate by question similarity
    const deduplicated = this.deduplicateByQuestion(qaEntries);

    // Return extracted entries (storage handled by extract route)
    return deduplicated;
  }

  /**
   * Strategy 1: FAQ Pattern Detection
   * Looks for: "Q: ...", "A: ...", or "Question:", "Answer:"
   */
  private extractFAQPattern(text: string, sourceUrl: string): QAEntry[] {
    const entries: QAEntry[] = [];

    // Pattern 1: "Q: ... A: ..."
    const qaPairRegex = /(?:^|\n)\s*(?:Q\s*:?|Question\s*:?)\s*(.+?)(?:\n\s*(?:A\s*:?|Answer\s*:?)\s*(.+?)(?=(?:\nQ\s*:?|\nQuestion\s*:?|$)))/gis;
    let match;

    while ((match = qaPairRegex.exec(text)) !== null) {
      const rawQuestion = match[1].trim();
      const rawAnswer = match[2].trim();

      if (rawQuestion.length > 10 && rawAnswer.length > 20) {
        const normalized = this.normalizeQA(rawQuestion, rawAnswer);
        entries.push({
          ...normalized,
          sourceUrl,
          sourceType: 'faq',
          extractionMethod: 'faq_pattern',
          rawQuestion,
          rawAnswer,
        });
      }
    }

    return entries;
  }

  /**
   * Strategy 2: Header + Paragraph Inference
   * Converts section headers into implicit questions
   */
  private extractFromHeaders(text: string, sourceUrl: string): QAEntry[] {
    const entries: QAEntry[] = [];

    // Find H1-H3 headers with following paragraphs
    const headerRegex = /(?:^|\n)(#{1,3})\s+(.+?)(?:\n{1,2})((?:.+?\n?)+?)(?=\n#{1,3}\s|\n\n[^#]|$)/gm;
    let match;

    while ((match = headerRegex.exec(text)) !== null) {
      const headerText = match[2].trim();
      const bodyText = match[3].trim().split('\n').slice(0, 3).join(' ');

      if (headerText.length > 5 && bodyText.length > 30) {
        // Convert header to question if it looks relevant
        const question = this.headerToQuestion(headerText);
        if (question) {
          const normalized = this.normalizeQA(question, bodyText);
          entries.push({
            ...normalized,
            sourceUrl,
            sourceType: 'guide',
            extractionMethod: 'header_inference',
          });
        }
      }
    }

    return entries;
  }

  /**
   * Strategy 3: Definition Extraction
   * Looks for patterns like "X is ...", "X refers to ..."
   */
  private extractDefinitions(text: string, sourceUrl: string): QAEntry[] {
    const entries: QAEntry[] = [];

    // Pattern: "X is a ...", "X refers to ...", "X means ..."
    const defRegex = /\b([A-Z][a-zA-Z\s&]+)\s+(?:is|refers to|means|denotes|signifies)\s+([^.!?]+[.!?])/g;
    let match;

    while ((match = defRegex.exec(text)) !== null) {
      const term = match[1].trim();
      const definition = match[2].trim();

      if (term.length < 50 && definition.length > 20 && definition.length < 200) {
        const normalized = this.normalizeQA(
          `What is ${term}?`,
          definition
        );
        entries.push({
          ...normalized,
          sourceUrl,
          sourceType: 'guide',
          extractionMethod: 'definition_extraction',
          tags: ['definitions', ...normalized.tags],
        });
      }
    }

    return entries;
  }

  /**
   * Normalize Q&A to neutral, concise format
   * - Remove marketing language
   * - Break up long sentences (>15 words per sentence)
   * - Maintain factual accuracy
   * - Answer 40-120 words
   */
  private normalizeQA(rawQuestion: string, rawAnswer: string): Omit<QAEntry, 'sourceUrl' | 'sourceType' | 'extractionMethod'> {
    // Clean question
    let question = rawQuestion
      .replace(/^(what|why|how|when|where|who|which)\s+/i, '$1 ')
      .replace(/[?!]+$/, '')
      .trim() + '?';

    // Clean answer: remove marketing, HTML artifacts, extra whitespace
    let answer = rawAnswer
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .replace(/&nbsp;|&lt;|&gt;|&amp;/g, (match) => ({ '&nbsp;': ' ', '&lt;': '<', '&gt;': '>', '&amp;': '&' }[match] || match))
      .replace(/\s+/g, ' ')
      .trim();

    // Remove common marketing phrases
    const marketingPhrases = [
      /\bclick here\b/gi,
      /\blearn more\b/gi,
      /\bget a quote\b/gi,
      /\bcontact us\b/gi,
      /\btrusted by\b/gi,
      /\blead the industry\b/gi,
      /\bour experts\b/gi,
      /\bcall today\b/gi,
    ];

    for (const phrase of marketingPhrases) {
      answer = answer.replace(phrase, '');
    }

    // Break into sentences if > 15 words per sentence
    answer = this.breakLongSentences(answer);

    // Truncate to 120 words max
    const words = answer.split(/\s+/);
    if (words.length > 120) {
      answer = words.slice(0, 120).join(' ') + ' ...';
    }

    // If < 40 words, likely too thin
    const confidence = words.length < 40 ? 0.4 : words.length > 120 ? 0.6 : 0.8;

    // Extract tags based on content
    const tags = this.inferTags(question, answer);

    return { question, answer, tags, confidence };
  }

  /**
   * Break sentences longer than 15 words
   */
  private breakLongSentences(text: string): string {
    return text.split(/([.!?])\s+/).reduce((acc, part, i) => {
      if (i % 2 === 0) {
        // Content part
        const words = part.split(/\s+/);
        if (words.length > 15) {
          // Split into chunks
          const chunks = [];
          for (let j = 0; j < words.length; j += 15) {
            chunks.push(words.slice(j, j + 15).join(' '));
          }
          return acc + chunks.join('. ');
        }
        return acc + part;
      } else {
        // Punctuation
        return acc + part + ' ';
      }
    }, '');
  }

  /**
   * Convert header to natural question
   */
  private headerToQuestion(header: string): string | null {
    // Skip generic headers
    if (/^(overview|introduction|summary|details|information)$/i.test(header)) {
      return null;
    }

    // Already question-like?
    if (header.endsWith('?')) {
      return header;
    }

    // Convert noun phrases to questions
    // "Hull Coverage" -> "What is hull coverage?"
    // "Claims Process" -> "What is the claims process?"
    if (!/^(when|why|how|what|where|which)/i.test(header)) {
      return `What is ${header.toLowerCase()}?`;
    }

    return `${header}?`;
  }

  /**
   * Infer tags based on question and answer content
   */
  private inferTags(question: string, answer: string): QAEntry['tags'] {
    const tags: QAEntry['tags'] = [];
    const lowerQ = question.toLowerCase();
    const lowerA = answer.toLowerCase();

    if (/\b(what|define|definition|mean|refers?)\b/.test(lowerQ)) {
      tags.push('definitions');
    }
    if (/\b(cover|coverage|included|excluded)\b/.test(lowerA)) {
      tags.push('coverage');
    }
    if (/\b(cost|price|premium|deductible|fee)\b/.test(lowerA)) {
      tags.push('cost');
    }
    if (/\b(require|required|qualification|eligible|condition)\b/.test(lowerA)) {
      tags.push('requirements');
    }
    if (/\b(claim|claims|damage|loss|incident)\b/.test(lowerA)) {
      tags.push('claims');
    }
    if (/\b(exclude|excluded|not covered|exception)\b/.test(lowerA)) {
      tags.push('exclusions');
    }
    if (/\b(policy|term|agreement|condition|provision)\b/.test(lowerA)) {
      tags.push('policy_terms');
    }

    return tags.length > 0 ? tags : ['definitions'];
  }

  /**
   * Extract entity mentions from text
   */
  private extractEntities(text: string): EntityMention[] {
    const entities: EntityMention[] = [];

    // Provider mentions
    for (const provider of this.providers) {
      const regex = new RegExp(`\\b${provider}\\b`, 'gi');
      if (regex.test(text)) {
        entities.push({ type: 'provider', value: provider, confidence: 0.9 });
      }
    }

    // Region mentions
    for (const region of this.regions) {
      const regex = new RegExp(`\\b${region}\\b`, 'gi');
      if (regex.test(text)) {
        entities.push({ type: 'region', value: region, confidence: 0.8 });
      }
    }

    return entities;
  }

  /**
   * Deduplicate Q&A entries by similar questions
   */
  private deduplicateByQuestion(entries: QAEntry[]): QAEntry[] {
    const seen = new Map<string, QAEntry>();

    for (const entry of entries) {
      const normalized = entry.question.toLowerCase().replace(/[?!.]/g, '').trim();
      const existing = seen.get(normalized);

      if (!existing || entry.confidence > existing.confidence) {
        seen.set(normalized, entry);
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Store Q&A entries in database
   */
  private async storeQAEntries(entries: QAEntry[], snapshotId: number): Promise<void> {
    for (const entry of entries) {
      // Check for duplicates
      const { data: existing } = await this.supabase
        .from('qa_entries')
        .select('id')
        .eq('question', entry.question)
        .eq('source_url', entry.sourceUrl)
        .single();

      if (existing) {
        console.log(`Duplicate Q&A skipped: ${entry.question.slice(0, 50)}`);
        continue;
      }

      // Insert Q&A entry
      const { data: qaData, error: qaError } = await this.supabase
        .from('qa_entries')
        .insert([
          {
            question: entry.question,
            answer: entry.answer,
            tags: entry.tags,
            source_url: entry.sourceUrl,
            source_type: entry.sourceType,
            confidence: entry.confidence,
            is_active: entry.confidence >= 0.5, // Only activate high-confidence entries
          },
        ])
        .select('id')
        .single();

      if (qaError) {
        console.error(`Failed to insert Q&A:`, qaError);
        continue;
      }

      // Extract and store entities
      const entities = this.extractEntities(entry.answer);
      for (const entity of entities) {
        const { error: entityError } = await this.supabase
          .from('entity_mentions')
          .insert([
            {
              qa_entry_id: qaData.id,
              entity_type: entity.type,
              entity_value: entity.value,
              confidence: entity.confidence,
            },
          ]);

        if (entityError) {
          console.warn(`Failed to insert entity mention:`, entityError);
        }
      }

      // Log extraction
      await this.supabase
        .from('qa_extraction_log')
        .insert([
          {
            snapshot_id: snapshotId,
            qa_entry_id: qaData.id,
            raw_question: entry.rawQuestion || entry.question,
            raw_answer: entry.rawAnswer || entry.answer,
            extraction_method: entry.extractionMethod,
            normalization_changes: JSON.stringify({
              rawLength: (entry.rawAnswer || '').length,
              normalizedLength: entry.answer.length,
              tagCount: entry.tags.length,
            }),
          },
        ]);
    }

    // Update snapshot status
    await this.supabase
      .from('source_snapshots')
      .update({
        extraction_status: 'extracted',
        extracted_qa_count: entries.length,
      })
      .eq('id', snapshotId);
  }

  /**
   * Clean HTML to plain text
   */
  private cleanHtml(html: string): string {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
      .replace(/<[^>]+>/g, '\n')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  }
}

export { QAExtractionPipeline, QAEntry, EntityMention };
