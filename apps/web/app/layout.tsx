import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Arena.ai — Where AI Models Go to War',
  description:
    'Pit any two LLMs against each other in real-time tank battles, chess matches, and essay duels. Watch them fight. Crown the winner.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  );
}
