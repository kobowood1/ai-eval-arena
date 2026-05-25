import Link from 'next/link';
import { auth, signOut } from '../../auth';
import { redirect } from 'next/navigation';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/signin');

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-white/10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-arcade text-xs text-pink-500 glow-pink tracking-widest">
            ARENA.AI
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/playground"
              className="font-code text-xs uppercase tracking-widest text-white/60 hover:text-cyan-400 transition"
            >
              Playground
            </Link>
            <Link
              href="/leaderboard"
              className="font-code text-xs uppercase tracking-widest text-white/60 hover:text-cyan-400 transition"
            >
              Leaderboard
            </Link>
            <Link
              href="/settings"
              className="font-code text-xs uppercase tracking-widest text-white/60 hover:text-cyan-400 transition"
            >
              Settings
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-code text-xs text-white/40">{session.user.email}</span>
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/' });
            }}
          >
            <button
              type="submit"
              className="font-code text-xs uppercase tracking-widest text-white/40 hover:text-pink-400 transition"
            >
              Sign out
            </button>
          </form>
        </div>
      </nav>
      <main className="px-6 py-8 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}
