import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  clockSkewInMs: 60000,
  // These routes are PUBLIC (accessible without login)
  publicRoutes: [
    "/", // Landing page
    "/sign-in(.*)", // Sign in pages
    "/sign-up(.*)", // Sign up pages
  ],

  // These routes are COMPLETELY IGNORED by auth
  ignoredRoutes: [
    "/api/webhooks/clerk", // Clerk webhook
    "/api/webhooks/stripe", // Stripe webhook (if used)
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
