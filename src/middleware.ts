import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

/**
 * BOILERPLATE NOTE: Clerk authentication is bypassed in test/CI environments
 * to allow Playwright e2e tests to run without requiring Clerk credentials.
 *
 * TODO: When setting up this project for production, you should:
 * 1. Configure real Clerk credentials in your CI environment secrets
 * 2. Remove this bypass or limit it to specific test scenarios
 * 3. Implement proper e2e auth testing (see: https://clerk.com/docs/testing/playwright)
 */
export default clerkMiddleware(async (auth, req) => {
	if (process.env.CI || process.env.PLAYWRIGHT_TEST) {
		return NextResponse.next();
	}

	if (isProtectedRoute(req)) {
		await auth.protect();
	}
});

export const config = {
	matcher: [
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		"/(api|trpc)(.*)",
	],
};
