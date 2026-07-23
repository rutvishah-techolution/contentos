import type { NextAuthConfig } from "next-auth";

const AUTH_PAGES = ["/login", "/signup"];

/**
 * Edge-safe auth config (no Node/bcrypt) — imported by middleware and extended in
 * auth.ts with the Credentials provider. Google can be added here later as another
 * provider without touching anything else.
 */
export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  // trust whatever host the app is served on — localhost, a LAN IP, a tunnel
  // (ngrok/cloudflared), or a deployed domain. No host is hardcoded.
  trustHost: true,
  providers: [], // real providers are added in auth.ts (Node runtime)
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const loggedIn = !!auth?.user;
      const onAuthPage = AUTH_PAGES.some((p) => nextUrl.pathname.startsWith(p));
      if (onAuthPage) {
        // logged-in users shouldn't sit on login/signup
        if (loggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }
      return loggedIn; // everything else requires a session
    },
    jwt({ token, user }) {
      if (user) token.id = (user as { id?: string }).id;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) session.user.id = token.id as string;
      return session;
    },
  },
};
