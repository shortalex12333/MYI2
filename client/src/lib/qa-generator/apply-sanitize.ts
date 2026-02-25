/**
 * Apply sanitization to all existing T1 answers in database
 */
import { createClient } from '@supabase/supabase-js';
import { sanitizeAnswer } from './sanitize';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function applySanitize() {
  const { data: answers, error } = await supabase
    .from('qa_candidates')
    .select('id, answer')
    .eq('publish_status', 'drafted')
    .eq('intent_tier', 'T1')
    .not('answer', 'is', null);

  if (error || !answers) {
    console.error('Failed to fetch:', error);
    return;
  }

  console.log(`Sanitizing ${answers.length} T1 answers...`);

  let updated = 0;
  for (const a of answers) {
    const sanitized = sanitizeAnswer(a.answer);

    if (sanitized !== a.answer) {
      const { error: updateError } = await supabase
        .from('qa_candidates')
        .update({ answer: sanitized })
        .eq('id', a.id);

      if (!updateError) {
        updated++;
      }
    }
  }

  console.log(`Updated ${updated}/${answers.length} answers`);
}

applySanitize();
