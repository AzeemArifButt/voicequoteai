import { NextRequest, NextResponse } from 'next/server';

// Only enforce Clerk auth when keys are configured
const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

async function proxyHandler(req: NextRequest) {
  if (!hasClerk) return NextResponse.next();

  // Dynamically import Clerk so it doesn't crash when keys are missing
  const { clerkMiddleware, createRouteMatcher } = await import('@clerk/nextjs/server');
  const isProtected = createRouteMatcher(['/dashboard(.*)']);

  return clerkMiddleware(async (auth, request) => {
    if (isProtected(request)) {
      await auth.protect();
    }
  })(req, {} as never);
}

export default proxyHandler;

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
