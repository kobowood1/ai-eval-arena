import type { NextAuthConfig } from 'next-auth';

// Edge-safe config — no DB adapter, no Node.js-only imports.
// Used by middleware for lightweight JWT session checks.
export const authConfig = {
  session: { strategy: 'jwt' as const },
  pages: { signIn: '/signin' },
  providers: [],
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
} satisfies NextAuthConfig;
