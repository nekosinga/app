import type { Metadata } from 'next';
import './globals.css';
import PrivyProvider from '@/components/PrivyProvider';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: 'Neko Singa | Crypto Market Intelligence',
  description: 'Dashboard crypto market intelligence: trending tokens, sentiment, dan news.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <PrivyProvider>
          {children}
        </PrivyProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
