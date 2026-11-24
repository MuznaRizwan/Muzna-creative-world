import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client with the secret (service-role) key. It bypasses
 * row level security, so it must only ever run on the server: API routes and
 * the ingest script. Never import this from a client component.
 *
 * Accepts either the legacy service_role key or the newer "secret" key
 * (sb_secret_...) in SUPABASE_SERVICE_ROLE_KEY.
 */
export function createAdminClient(env = process.env) {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

/** Whether the Supabase variables are present (without revealing them). */
export function hasSupabaseConfig(env = process.env) {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}
