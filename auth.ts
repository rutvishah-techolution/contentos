import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { verifyCredentials } from "@/lib/auth/users";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (creds) => {
        const email = String(creds?.email || "");
        const password = String(creds?.password || "");
        const user = await verifyCredentials(email, password);
        return user
          ? { id: user.id, name: user.name, email: user.email }
          : null;
      },
    }),
    // Google can be added here later:
    // Google({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET }),
  ],
});
