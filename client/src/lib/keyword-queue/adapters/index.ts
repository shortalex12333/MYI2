/**
 * Pipeline Adapters Barrel Export
 *
 * Thin adapter layer bridging keyword_queue processor to existing content pipelines.
 */

export {
  generatePaperFromKeyword,
  type KeywordPaperInput,
  type KeywordPaperResult,
} from './keyword-to-paper';

export {
  generateQAFromKeyword,
  type KeywordQAInput,
  type KeywordQAResult,
} from './keyword-to-qa';

export {
  generateTopicFromKeyword,
  type KeywordTopicInput,
  type KeywordTopicResult,
} from './keyword-to-topic';
