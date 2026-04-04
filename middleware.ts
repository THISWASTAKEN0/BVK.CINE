import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminPath = pathname.startsWith('/admin');
  const isLoginPage = pathname === '/admin/login';

  // Check auth by looking for the Supabase auth cookie
  const cookies = request.cookies.getAll();
  const authCookie = cookies.find(c => c.name.includes('auth-token'));
  const isLoggedIn = !!(authCookie?.value);

  // Unauthenticated user tries to access admin → redirect to login
  if (isAdminPath && !isLoginPage && !isLoggedIn) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already authenticated user visits login page → send to dashboard
  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: ['/admin/:path*'],
};
