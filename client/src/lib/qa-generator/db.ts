/**
 * Supabase Database Singleton
 *
 * Provides a single shared Supabase client for the Q&A generator pipeline.
 * Credentials are read from environment variables - never hardcoded.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _dbInstance: SupabaseClient | null = null;

/**
 * Lazy database client initialization
 *
 * Allows module imports without immediate environment variable requirement.
 * Environment variables are checked only when database access is attempted.
 */
export function getDb(): SupabaseClient {
  if (_dbInstance) {
    return _dbInstance;
  }

  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error(
      'Missing Supabase environment variables. Required: SUPABASE_URL and SUPABASE_SERVICE_KEY (or NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)'
    );
  }

  _dbInstance = createClient(SUPABASE_URL, SUPABASE_KEY);
  return _dbInstance;
}

/**
 * Legacy export for backward compatibility
 *
 * Note: This uses a Proxy to defer initialization until first property access.
 * This allows existing code like `db.from('table')` to work while maintaining lazy loading.
 */
export const db = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const instance = getDb();
    const value = instance[prop as keyof SupabaseClient];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
