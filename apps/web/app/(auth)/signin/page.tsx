import { signIn } from '../../../auth';
import { Swords, Zap, Lock } from 'lucide-react';
import { Panel } from '../../../components/ui/panel';

export default function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  return (
    <div className="min-h-screen bg-black text-white grid-bg noise-bg flex items-center justify-center p-8 relative">
      <div className="relative w-full max-w-md">
        <div className="absolute -inset-1 bg-gradient-to-br from-pink-500/30 to-cyan-400/30 blur-xl" />
        <Panel className="relative p-10 clip-corner">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-pink-500 flex items-center justify-center clip-corner">
              <Swords className="w-5 h-5 text-black" />
            </div>
            <div className="font-arcade text-sm text-pink-500 glow-pink">ARENA.AI</div>
          </div>

          <h1 className="font-arcade text-lg mb-2">ENTER THE ARENA</h1>
          <p className="font-code text-xs text-white/50 mb-8 leading-relaxed">
            Sign in to configure your fighters and start a match.
          </p>

          {/* Google OAuth */}
          <form
            action={async () => {
              'use server';
              const { callbackUrl } = await searchParams;
              await signIn('google', { redirectTo: callbackUrl ?? '/playground' });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-white text-black font-code text-sm font-bold uppercase tracking-widest px-6 py-3 clip-corner hover:bg-white/90 transition mb-4"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="font-code text-[10px] text-white/30 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Magic link */}
          <form
            action={async (formData: FormData) => {
              'use server';
              const email = formData.get('email') as string;
              const { callbackUrl } = await searchParams;
              await signIn('resend', { email, redirectTo: callbackUrl ?? '/playground' });
            }}
          >
            <div className="mb-4">
              <label className="block font-code text-[10px] uppercase tracking-widest text-white/60 mb-2">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="you@domain.com"
                className="w-full bg-black/60 border border-white/20 px-4 py-3 font-code text-sm focus:outline-none focus:border-pink-500 transition"
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-400 text-black font-code text-sm font-bold uppercase tracking-widest px-6 py-3 clip-corner transition"
            >
              <Zap className="w-4 h-4" />
              Send Magic Link
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 font-code text-[10px] text-white/40 leading-relaxed flex items-start gap-2">
            <Lock className="w-3 h-3 mt-0.5 flex-shrink-0" />
            Sessions encrypted. No tracking. API keys never leave your account.
          </div>
        </Panel>
      </div>
    </div>
  );
}
