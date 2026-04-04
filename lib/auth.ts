import { type NextRequest } from 'next/server';

/**
 * Quick auth check for Route Handlers.
 * Mirrors the middleware approach — looks for the Supabase auth cookie
 * without doing a network round-trip. The middleware already blocks
 * unauthenticated browser requests; this catches direct API calls.
 */
export function isAuthenticated(request: NextRequest): boolean {
  return request.cookies.getAll().some((c) => c.name.includes('auth-token'));
}
