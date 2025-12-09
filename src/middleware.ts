import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sso-callback(.*)",
  "/session-tasks(.*)"
]);

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/org(.*)', '/user(.*)', '/'])

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { isAuthenticated, redirectToSignIn, sessionStatus } = await auth()

  // Send users with pending sessions to the /session-tasks page
  // Handle both authenticated and unauthenticated users with pending sessions
  if (sessionStatus === 'pending' && isProtectedRoute(req)) {
    // Don't redirect if already on session-tasks page
    if (!req.nextUrl.pathname.startsWith('/session-tasks')) {
      const url = req.nextUrl.clone()
      url.pathname = '/session-tasks'
      return NextResponse.redirect(url)
    }
  }

  // Send users who are not authenticated
  // and don't have pending tasks to the sign-in page
  if (!isAuthenticated && isProtectedRoute(req)) {
    return redirectToSignIn()
  }

  // If it's a public route, allow access
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // User is authenticated, allow access
  return NextResponse.next();
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
