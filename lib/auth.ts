import { createServerClient } from '@/lib/supabase-server';

/**
 * Real auth check for Route Handlers.
 *
 * Validates the Supabase session by verifying the JWT against Supabase's
 * auth server (supabase.auth.getUser()), rather than trusting the mere
 * presence of a cookie. A forged or expired token fails here.
 *
 * Reads the session from cookies via next/headers, so no request arg needed.
 */
export async function isAuthenticated(): Promise<boolean> {
  const supabase = createServerClient();
  const { data, error } = await supabase.auth.getUser();
  return !error && !!data.user;
}
