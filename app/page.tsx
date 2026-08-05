import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import WhatsHappening from '@/components/WhatsHappening';
import TrendingTable from '@/components/TrendingTable';

export default function HomePage() {
  return (
    <div className="flex" style={{ background: 'var(--color-background)' }}>
      <Sidebar />

      <main className="flex-1 ml-60 mr-72 p-6" style={{ minHeight: '100vh' }}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Dashboard
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Real-time crypto market intelligence powered by social sentiment
          </p>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <span style={{ color: 'var(--color-text-muted)' }}>🔍</span>
            <input
              type="text"
              placeholder="Search markets, tokens, or trends"
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: 'var(--color-text-primary)' }}
            />
            <kbd
              className="px-2 py-0.5 rounded text-xs font-mono"
              style={{ background: 'var(--color-background)', color: 'var(--color-text-muted)' }}
            >
              /
            </kbd>
          </div>
        </div>

        {/* Trending */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              Trending Tokens
            </h2>
            <Link href="/trending" className="text-xs" style={{ color: 'var(--color-primary)' }}>
              View All →
            </Link>
          </div>
          <div
            className="rounded-lg p-5"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <TrendingTable limit={10} />
          </div>
        </div>
      </main>

      <WhatsHappening />
    </div>
  );
}
