import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

// Dev-only fallback secret. In production, NEXTAUTH_SECRET must be set.
const DEV_SECRET = "kirwin-dev-secret-do-not-use-in-production";

function resolveSecret(): string {
  const fromEnv = process.env.NEXTAUTH_SECRET;
  if (fromEnv && fromEnv.length > 0) {
    return fromEnv;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXTAUTH_SECRET must be set in production");
  }
  // eslint-disable-next-line no-console
  console.warn(
    "[auth] NEXTAUTH_SECRET is not set — falling back to a dev-only secret. Do NOT use in production."
  );
  return DEV_SECRET;
}

/**
 * NextAuth configuration for the Kirwin admin area.
 *
 * Only the credentials provider is enabled. Users are looked up by email
 * via Prisma and the password is verified with bcryptjs. On successful
 * authentication the session contains the user's id, email, name, and role.
 */
export const authOptions: NextAuthOptions = {
  secret: resolveSecret(),
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user) {
          return null;
        }

        const passwordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!passwordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

export type RoleType = Role;
