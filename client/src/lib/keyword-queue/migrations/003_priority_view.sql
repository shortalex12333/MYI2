-- Priority Scoring VIEW
-- Calculates real-time priority scores without cron dependency
-- Logic mirrors src/lib/keyword-queue/priority-scorer.ts

CREATE OR REPLACE VIEW keyword_queue_priority AS
SELECT
  id,
  keyword,
  status,
  pipeline_type,
  cluster_id,
  search_volume,
  keyword_difficulty,
  retry_count,
  generated_content_id,
  requires_human_review,
  created_at,
  updated_at,

  -- FR-2.1: Base score = volume × (100 - difficulty)
  (search_volume * (100 - keyword_difficulty)) AS base_score,

  -- FR-2.2: Seasonal multiplier (hurricane keywords in Q2-Q3)
  CASE
    WHEN keyword ILIKE '%hurricane%'
         AND EXTRACT(MONTH FROM CURRENT_DATE) BETWEEN 4 AND 9
    THEN 1.5
    ELSE 1.0
  END AS seasonal_multiplier,

  -- FR-2.3: Decay for pending keywords >7 days old
  CASE
    WHEN status = 'pending'
         AND created_at < NOW() - INTERVAL '7 days'
    THEN 0.8
    ELSE 1.0
  END AS decay_factor,

  -- Final priority score (all factors combined)
  ROUND(
    (search_volume * (100 - keyword_difficulty))
    * CASE
        WHEN keyword ILIKE '%hurricane%'
             AND EXTRACT(MONTH FROM CURRENT_DATE) BETWEEN 4 AND 9
        THEN 1.5
        ELSE 1.0
      END
    * CASE
        WHEN status = 'pending'
             AND created_at < NOW() - INTERVAL '7 days'
        THEN 0.8
        ELSE 1.0
      END
  ) AS priority_score

FROM keyword_queue
ORDER BY priority_score DESC NULLS LAST;

-- Comment for documentation
COMMENT ON VIEW keyword_queue_priority IS
  'Real-time priority scoring for keyword queue. Use this VIEW instead of base table for queue processing.';
