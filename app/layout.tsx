import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

// ── Editable site metadata ───────────────────────────────────────────────────
// These values appear in browser tabs, search results, and social shares.
// Change them here once; they apply everywhere.
export const metadata: Metadata = {
  title: {
    default: process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME ?? 'Photography Portfolio',
    template: `%s — ${process.env.NEXT_PUBLIC_PHOTOGRAPHER_NAME ?? 'Photography Portfolio'}`,
  },
  description:
    'Photography portfolio — capturing light and telling stories through images.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-bg text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
