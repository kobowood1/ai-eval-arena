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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  );
}
