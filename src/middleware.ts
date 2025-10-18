import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sso-callback(.*)"
]);

const isOrganizationRoute = createRouteMatcher([
  "/create-organization"
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId, redirectToSignIn } = await auth();

  // If it's a public route, allow access
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // If user is not authenticated, redirect to sign in
  if (!userId) {
    return redirectToSignIn();
  }

  // If user is authenticated but on organization creation page, allow access
  if (isOrganizationRoute(req)) {
    return NextResponse.next();
  }

  // If user is authenticated but has no organization, redirect to create organization
  if (userId && !orgId) {
    const createOrgUrl = new URL('/create-organization', req.url);
    return NextResponse.redirect(createOrgUrl);
  }

  // User is authenticated and has an organization, allow access
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
