import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY ?? '';
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY ?? '';

/** Publishable client — respects RLS, used for most queries */
export function createSupabaseClient(accessToken?: string): SupabaseClient {
  if (accessToken) {
    return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
  }
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}

/** Secret client — bypasses RLS, used for seeding and admin */
export function createServiceClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);
}
