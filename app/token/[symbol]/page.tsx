'use client';

import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import WhatsHappening from '@/components/WhatsHappening';
import SentimentPanel from '@/components/SentimentPanel';
import TokenChart from '@/components/TokenChart';
import { api } from '@/lib/api';

interface PageProps {
  params: Promise<{ symbol: string }>;
}

type Tab = 'Overview' | 'Mentions';

// Stub OHLC — real price endpoint not available yet in free tier
function generateOhlc(count = 60) {
  let price = 1000 + Math.random() * 9000;
  const now = Math.floor(Date.now() / 1000);
  return Array.from({ length: count }, (_, i) => {
    const open = price;
    const close = price * (1 + (Math.random() - 0.5) * 0.04);
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    price = close;
    return {
      time: new Date((now - (count - i) * 3600) * 1000).toISOString().split('T')[0],
      open, high, low, close,
    };
  });
}

// Token icon — tries API, falls back to initials
function TokenIconHeader({ symbol }: { symbol: string }) {
  const [imgError, setImgError] = useState(false);
  const { data: iconUrl } = useQuery({
    queryKey: ['icon', symbol],
    queryFn: () => api.icon(symbol),
    staleTime: Infinity,
    retry: false,
  });

  if (iconUrl && !imgError) {
    return (
      <Image
        src={iconUrl}
        alt={symbol}
        width={36}
        height={36}
        className="rounded-full object-cover"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
      style={{ background: 'var(--color-primary)', color: '#fff' }}
    >
      {symbol.slice(0, 2)}
    </div>
  );
}

export default function TokenPage({ params }: PageProps) {
  const { symbol } = use(params);
  const upper = symbol.toUpperCase();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');

  const { data: trending, isLoading } = useQuery({
    queryKey: ['trending'],
    queryFn: api.trending,
  });

  const token = trending?.data?.find((t) => t.token.toUpperCase() === upper);
  const isUp = (token?.change_percent ?? 0) >= 0;
  const chartData = generateOhlc();

  const TABS: Tab[] = ['Overview', 'Mentions'];

  return (
    <div className="flex" style={{ background: 'var(--color-background)' }}>
      <Sidebar />

      <main className="flex-1 ml-60 mr-72" style={{ minHeight: '100vh' }}>
        {/* Token header bar */}
        {!isLoading && token && (
          <div
            className="flex flex-wrap items-center gap-6 px-6 py-3 border-b"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-3">
              <TokenIconHeader symbol={symbol} />
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {upper} / USDC
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Social mentions tracker
                </p>
              </div>
            </div>

            {[
              { label: 'Mentions', value: token.current_count.toLocaleString() },
              { label: 'Prev Period', value: token.previous_count.toLocaleString() },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                <p className="text-sm font-semibold font-mono" style={{ color: 'var(--color-text-primary)' }}>
                  {value}
                </p>
              </div>
            ))}

            <div>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Change</p>
              <p
                className="text-sm font-semibold font-mono flex items-center gap-1"
                style={{ color: isUp ? 'var(--color-success)' : 'var(--color-danger)' }}
              >
                {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {isUp ? '+' : ''}{token.change_percent.toFixed(2)}%
              </p>
            </div>
          </div>
        )}

        <div className="p-6 space-y-5">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            <Link href="/trending" className="hover:text-white transition-colors">Trending</Link>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--color-text-primary)' }}>{upper}</span>
          </div>

          {/* Tabs + content */}
          <div
            className="rounded-lg overflow-hidden"
            style={{ border: '1px solid var(--color-border)' }}
          >
            {/* Tab bar */}
            <div
              className="flex gap-1 px-4 py-2 border-b"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-3 py-1.5 rounded text-sm transition-colors"
                  style={{
                    background: activeTab === tab ? 'var(--color-primary)' : 'transparent',
                    color: activeTab === tab ? '#fff' : 'var(--color-text-muted)',
                    fontWeight: activeTab === tab ? 600 : 400,
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Overview: chart */}
            {activeTab === 'Overview' && (
              <TokenChart data={chartData} symbol={upper} />
            )}

            {/* Mentions: sentiment panel */}
            {activeTab === 'Mentions' && (
              <div style={{ background: 'var(--color-background)' }}>
                <SentimentPanel symbol={upper} />
              </div>
            )}
          </div>

          {/* Always show sentiment summary below chart in Overview */}
          {activeTab === 'Overview' && (
            <SentimentPanel symbol={upper} />
          )}
        </div>
      </main>

      <WhatsHappening />
    </div>
  );
}
