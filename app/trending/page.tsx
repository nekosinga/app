import Sidebar from '@/components/Sidebar';
import WhatsHappening from '@/components/WhatsHappening';
import TrendingTable from '@/components/TrendingTable';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trending Tokens | Neko Singa',
  description: 'Top trending crypto tokens by social mentions.',
};

export default function TrendingPage() {
  return (
    <div className="flex" style={{ background: 'var(--color-background)' }}>
      <Sidebar />

      <main className="flex-1 ml-60 mr-72 p-6" style={{ minHeight: '100vh' }}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Trending Tokens
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Ranked by social mentions · Updated every 60s
          </p>
        </div>

        <div
          className="rounded-lg p-5"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <TrendingTable />
        </div>
      </main>

      <WhatsHappening />
    </div>
  );
}
