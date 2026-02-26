/**
 * Supabase Database Singleton
 *
 * Provides a single shared Supabase client for the topics generator pipeline.
 * Credentials are read from environment variables - never hardcoded.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Singleton Supabase client for topics generator operations.
 * Uses the service role key for full database access.
 */
export const db: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
