import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Resend from 'next-auth/providers/resend';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@arena/db';
import { generateKey, exportKey } from '@arena/lib/crypto';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(getDb(), {
    usersTable: schema.users,
    accountsTable: schema.accounts,
    verificationTokensTable: schema.verificationTokens,
  }),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Resend({
      from: process.env.AUTH_RESEND_FROM ?? 'noreply@arena.ai',
    }),
  ],
  callbacks: {
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      const kek = await generateKey();
      const kekRaw = await exportKey(kek);
      const kekB64 = Buffer.from(kekRaw).toString('base64');
      const emailPrefix = (user.email ?? 'user')
        .split('@')[0]!
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 16);
      const handle = `${emailPrefix}_${user.id.slice(-4)}`;
      await getDb()
        .update(schema.users)
        .set({ kek: kekB64, handle })
        .where(eq(schema.users.id, user.id));
    },
  },
});
