/**
 * Shared authentication and utilities for scraper API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Verify x-api-key header (supports both legacy SCRAPER_API_KEY and SERVICE_ROLE_KEY)
 */
export function verifyApiKey(request: NextRequest): { valid: boolean; error?: string } {
  const apiKey = request.headers.get('x-api-key');

  if (!apiKey) {
    return { valid: false, error: 'Missing x-api-key header' };
  }

  // Check against SCRAPER_API_KEY if available (legacy)
  const scraperKey = process.env.SCRAPER_API_KEY;
  if (scraperKey && apiKey === scraperKey) {
    return { valid: true };
  }

  // Check against SERVICE_ROLE_KEY (primary auth method)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRoleKey && apiKey === serviceRoleKey) {
    return { valid: true };
  }

  // If neither key is set, that's a server config error
  if (!scraperKey && !serviceRoleKey) {
    return { valid: false, error: 'Server misconfigured: No authentication keys available' };
  }

  return { valid: false, error: 'Invalid x-api-key' };
}

/**
 * Generic error response
 */
export function errorResponse(
  message: string,
  statusCode: number = 400,
  details?: any
) {
  return NextResponse.json(
    {
      error: message,
      ...(details && { details }),
    },
    { status: statusCode }
  );
}

/**
 * Generic success response
 */
export function successResponse(data: any, statusCode: number = 200) {
  return NextResponse.json(data, { status: statusCode });
}

/**
 * Initialize Supabase admin client
 */
export function initSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(url, key);
}

/**
 * Parse request body safely
 */
export async function parseRequestBody(request: NextRequest): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const data = await request.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: `Invalid JSON: ${String(error)}` };
  }
}

/**
 * Validate required fields in object
 */
export function validateRequired(
  obj: any,
  fields: string[]
): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];

  for (const field of fields) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
      errors.push(`Missing required field: ${field}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Generate unique run ID
 */
export function generateRunId(prefix: string = 'run'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Get source tier label
 */
export function getTierLabel(tier: number): string {
  if (tier <= 2) return 'Tier 1 (Highest ROI)';
  if (tier <= 4) return 'Tier 2 (Good Quality)';
  if (tier <= 6) return 'Tier 3 (Forum/Discussion)';
  if (tier <= 8) return 'Tier 4 (Regulatory)';
  return 'Tier 5 (Supplementary)';
}

/**
 * Retry logic for database operations
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
      }
    }
  }

  throw lastError;
}

/**
 * Log operation to console with timestamp
 */
export function log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '[ℹ️]',
    warn: '[⚠️]',
    error: '[❌]',
  }[level];

  console.log(`${prefix} ${timestamp} ${message}`);
}
