'use client';

import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, TrendingUp, TrendingDown, Zap, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import WhatsHappening from '@/components/WhatsHappening';
import SentimentPanel from '@/components/SentimentPanel';
import TokenChart from '@/components/TokenChart';
import { api, type MentionItem } from '@/lib/api';

interface PageProps { params: Promise<{ symbol: string }> }
type Tab = 'Overview' | 'Mentions';

function generateOhlc(count = 60) {
  let price = 1000 + Math.random() * 9000;
  const now = Math.floor(Date.now() / 1000);
  return Array.from({ length: count }, (_, i) => {
    const open = price;
    const close = price * (1 + (Math.random() - 0.5) * 0.04);
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    price = close;
    return { time: new Date((now - (count - i) * 3600) * 1000).toISOString().split('T')[0], open, high, low, close };
  });
}

function TokenIconHeader({ symbol }: { symbol: string }) {
  const [err, setErr] = useState(false);
  const { data: url, isSuccess } = useQuery({
    queryKey: ['icon', symbol], queryFn: () => api.icon(symbol), staleTime: Infinity, retry: false,
  });
  if (isSuccess && url && !err) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={symbol} width={40} height={40}
      className="rounded-full object-cover w-10 h-10" onError={() => setErr(true)} />;
  }
  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
      style={{ background: 'var(--color-primary)', color: '#fff' }}>
      {symbol.slice(0, 2).toUpperCase()}
    </div>
  );
}

export default function TokenPage({ params }: PageProps) {
  const { symbol } = use(params);
  const upper = symbol.toUpperCase();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');

  const { data: trending, isLoading } = useQuery({ queryKey: ['trending'], queryFn: api.trending });
  const { data: sentData } = useQuery({
    queryKey: ['sentiment', symbol], queryFn: () => api.sentiment(symbol), refetchInterval: 60_000,
  });

  const token = trending?.data?.find(t => t.token.toUpperCase() === upper);
  const isUp = (token?.change_percent ?? 0) >= 0;
  const chartData = generateOhlc();

  const mentions: MentionItem[] = Array.isArray(sentData) ? sentData : [];
  const engagement = mentions.reduce((a, m) => a + m.likeCount + m.repostCount + m.quoteCount, 0);
  const bars = Array.from({ length: 7 }, (_, i) =>
    mentions.filter(m => {
      const h = Math.floor((Date.now() - new Date(m.mentionedAt).getTime()) / 3_600_000);
      return h >= i * 3 && h < (i + 1) * 3;
    }).length
  );
  const maxBar = Math.max(...bars, 1);

  const signals = [
    mentions.length > 0 ? { dot: 'var(--color-success)', label: 'Rising mentions' } : { dot: 'var(--color-text-muted)', label: 'No recent mentions' },
    engagement > 0 ? { dot: 'var(--color-primary)', label: 'Positive engagement' } : null,
    { dot: '#60a5fa', label: 'New market discussion' },
  ].filter(Boolean) as { dot: string; label: string }[];

  function fmt(n: number) { return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString(); }

  return (
    <div className="flex" style={{ background: 'var(--color-background)' }}>
      <Sidebar />
      <main className="flex-1 ml-60 mr-72" style={{ minHeight: '100vh' }}>

        {/* Top header bar */}
        {!isLoading && token && (
          <div className="flex flex-wrap items-center gap-6 px-6 py-3 border-b"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-3">
              <TokenIconHeader symbol={symbol} />
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  ${upper}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {symbol.charAt(0).toUpperCase() + symbol.slice(1).toLowerCase()}
                </p>
              </div>
            </div>
            {[
              { label: 'Social Mentions', value: fmt(token.current_count) },
              { label: 'Prev Period', value: fmt(token.previous_count) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                <p className="text-sm font-semibold font-mono" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
              </div>
            ))}
            <div>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>24h Change</p>
              <p className="text-sm font-semibold font-mono flex items-center gap-1"
                style={{ color: isUp ? 'var(--color-success)' : 'var(--color-danger)' }}>
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

          {/* Main grid: chart left, intelligence right */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

            {/* Left: chart + tabs (2/3) */}
            <div className="xl:col-span-2 rounded-2xl overflow-hidden"
              style={{ border: '1px solid var(--color-border)' }}>
              <div className="flex gap-1 px-4 py-3 border-b"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                {(['Overview', 'Mentions'] as Tab[]).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: activeTab === tab ? 'var(--color-primary)' : 'transparent',
                      color: activeTab === tab ? '#fff' : 'var(--color-text-muted)',
                    }}>
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === 'Overview' && <TokenChart data={chartData} symbol={upper} />}
              {activeTab === 'Mentions' && (
                <div className="p-4" style={{ background: 'var(--color-background)' }}>
                  <SentimentPanel symbol={upper} />
                </div>
              )}
            </div>

            {/* Right: Token Intelligence card (1/3) */}
            <div className="rounded-2xl p-5 flex flex-col gap-4"
              style={{ background: 'var(--color-surface)', border: `2px solid var(--color-primary)` }}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: 'var(--color-text-muted)' }}>Token Intelligence</p>
                <p className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
                  Zoom into any token.
                </p>
              </div>

              {token && (
                <div className="rounded-xl p-4 space-y-4"
                  style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
                  <div className="flex items-center gap-2">
                    <TokenIconHeader symbol={symbol} />
                    <div>
                      <p className="font-bold uppercase" style={{ color: 'var(--color-text-primary)' }}>${upper}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {symbol.charAt(0).toUpperCase() + symbol.slice(1).toLowerCase()}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      { label: 'Price', value: 'N/A' },
                      { label: '24h Change', value: `${isUp ? '+' : ''}${token.change_percent.toFixed(1)}%`, color: isUp ? 'var(--color-success)' : 'var(--color-danger)' },
                      { label: 'Social Mentions', value: fmt(token.current_count) },
                      { label: 'Engagement', value: fmt(engagement) },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="rounded-lg p-2.5" style={{ background: 'var(--color-surface)' }}>
                        <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                        <p className="font-bold font-mono" style={{ color: color ?? 'var(--color-text-primary)' }}>{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Bar chart */}
                  <div>
                    <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>Social Activity</p>
                    <div className="flex items-end gap-1 h-12">
                      {bars.map((v, i) => (
                        <div key={i} className="flex-1 rounded-sm"
                          style={{
                            height: `${Math.max(10, Math.round((v / maxBar) * 100))}%`,
                            background: 'var(--color-primary)',
                            opacity: 0.5 + (v / maxBar) * 0.5,
                          }} />
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ borderTop: '1px solid var(--color-border)' }} />

                  {/* Signals */}
                  <div>
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>
                      Latest Signals
                    </p>
                    <div className="space-y-1.5">
                      {signals.map((s, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                          <span className="text-xs" style={{ color: 'var(--color-text-primary)' }}>{s.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sentiment panel below when on Overview */}
          {activeTab === 'Overview' && <SentimentPanel symbol={upper} />}
        </div>
      </main>
      <WhatsHappening />
    </div>
  );
}
