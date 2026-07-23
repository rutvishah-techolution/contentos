import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Middleware gates PAGES only. API routes are same-origin (called by the authed
// UI) and handle their own concerns (e.g. the news scan's cron secret).
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
