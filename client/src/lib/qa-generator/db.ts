/**
 * Supabase Database Singleton
 *
 * Provides a single shared Supabase client for the Q&A generator pipeline.
 * Credentials are read from environment variables - never hardcoded.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}\n` +
      `Please set ${name} in your environment or .env file.`
    );
  }
  return value;
}

const supabaseUrl = getRequiredEnv('SUPABASE_URL');
const supabaseServiceKey = getRequiredEnv('SUPABASE_SERVICE_KEY');

/**
 * Singleton Supabase client for Q&A generator operations.
 * Uses the service role key for full database access.
 */
export const db: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey);
