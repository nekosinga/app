'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import WhatsHappening from '@/components/WhatsHappening';
import TrendingTable from '@/components/TrendingTable';

export default function TrendingPage() {
  const [query, setQuery] = useState('');

  return (
    <div className="flex" style={{ background: 'var(--color-background)' }}>
      <Sidebar />

      <main className="flex-1 ml-60 mr-72 p-6" style={{ minHeight: '100vh' }}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Trending Tokens
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Ranked by social mentions · Updated every 60s
          </p>
        </div>

        {/* Search bar */}
        <div className="mb-5">
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <Search size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search tokens… e.g. BTC, ETH, SOL"
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: 'var(--color-text-primary)' }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="transition-opacity hover:opacity-75"
              >
                <X size={14} style={{ color: 'var(--color-text-muted)' }} />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div
          className="rounded-lg p-5"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <TrendingTable search={query} />
        </div>
      </main>

      <WhatsHappening />
    </div>
  );
}
