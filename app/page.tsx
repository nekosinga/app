'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { TrendingUp, TrendingDown, ArrowRight, Zap, MessageSquare } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import WhatsHappening from '@/components/WhatsHappening';
import { api, type TrendingToken, type MentionItem } from '@/lib/api';

// ── Mini token icon ──────────────────────────────────────────
function TokenIcon({ symbol, size = 28 }: { symbol: string; size?: number }) {
  const [err, setErr] = useState(false);
  const { data: url, isSuccess } = useQuery({
    queryKey: ['icon', symbol],
    queryFn: () => api.icon(symbol),
    staleTime: Infinity,
    retry: false,
  });
  if (isSuccess && url && !err) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt={symbol} width={size} height={size}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
        onError={() => setErr(true)} />
    );
  }
  return (
    <div className="rounded-full flex items-center justify-center text-xs font-bold shrink-0"
      style={{ width: size, height: size, background: 'var(--color-primary)', color: '#fff' }}>
      {symbol.slice(0, 2).toUpperCase()}
    </div>
  );
}

// ── Trending Tokens card ─────────────────────────────────────
function TrendingCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['trending'],
    queryFn: api.trending,
    refetchInterval: 60_000,
  });
  const rows: TrendingToken[] = (data?.data ?? []).slice(0, 5);
  const total = rows.reduce((s, t) => s + t.current_count, 0);

  return (
    <div className="rounded-2xl p-6 flex flex-col gap-4 h-full"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <div>
        <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Trending Tokens
        </h2>
        <p className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
          See what is gaining attention.
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Track tokens with rising social activity and identify where attention is moving.
        </p>
      </div>

      <div className="rounded-xl overflow-hidden flex flex-col divide-y"
        style={{ background: 'var(--color-background)', borderColor: 'var(--color-border)', border: '1px solid var(--color-border)' }}>
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse mx-3 my-2 rounded-lg"
              style={{ background: 'var(--color-surface)' }} />
          ))
          : rows.slice(0, 3).map((t, i) => {
            const isUp = t.change_percent >= 0;
            const ms = total ? ((t.current_count / total) * 100).toFixed(1) + '%' : '—';
            return (
              <Link key={t.token} href={`/token/${t.token}`}
                className="flex items-center gap-3 px-4 py-3 hover:opacity-80 transition-opacity"
                style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-xs font-semibold w-5 shrink-0"
                  style={{ color: 'var(--color-text-muted)' }}>
                  #{i + 1}
                </span>
                <TokenIcon symbol={t.token} size={24} />
                <span className="font-semibold text-sm uppercase flex-1"
                  style={{ color: 'var(--color-text-primary)' }}>
                  ${t.token.toUpperCase()}
                </span>
                <span className="text-sm font-mono" style={{ color: 'var(--color-text-muted)' }}>
                  {ms}
                </span>
                <span className="text-sm font-mono font-semibold"
                  style={{ color: isUp ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {isUp ? '+' : ''}{t.change_percent.toFixed(0)}%
                </span>
              </Link>
            );
          })}
      </div>

      <Link href="/trending"
        className="flex items-center gap-1 text-xs font-medium mt-auto w-fit"
        style={{ color: 'var(--color-primary)' }}>
        View all tokens <ArrowRight size={12} />
      </Link>
    </div>
  );
}

// ── Social Sentiment card ─────────────────────────────────────
function SentimentCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['sentiment', 'BTC'],
    queryFn: () => api.sentiment('BTC'),
    refetchInterval: 60_000,
  });
  const mentions: MentionItem[] = Array.isArray(data) ? data : [];
  const engagement = mentions.reduce((a, m) => a + m.likeCount + m.repostCount + m.quoteCount, 0);
  const posts = mentions.filter(m => m.type === 'post').length;
  const reposts = mentions.filter(m => m.type === 'repost').length;
  const total = posts + reposts || 1;
  const bullPct = Math.round((posts / total) * 100);
  const bearPct = 100 - bullPct;

  return (
    <div className="rounded-2xl p-6 flex flex-col gap-4 h-full"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <div>
        <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Social Sentiment
        </h2>
        <p className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
          Understand the conversation behind the chart.
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Explore social activity and engagement to understand how the market is reacting.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 rounded-xl animate-pulse" style={{ background: 'var(--color-background)' }} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl p-4 space-y-3"
          style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
          <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
            Market Sentiment · BTC
          </p>
          {/* Bar */}
          <div className="flex rounded-full overflow-hidden h-2.5">
            <div style={{ width: `${bullPct}%`, background: 'var(--color-success)' }} />
            <div style={{ width: `${bearPct}%`, background: 'var(--color-danger)' }} />
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: 'var(--color-success)' }}>{bullPct}% Bullish</span>
            <span style={{ color: 'var(--color-danger)' }}>{bearPct}% Bearish</span>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {[
              { label: 'Engagement', value: engagement >= 1000 ? `${(engagement / 1000).toFixed(1)}K` : engagement.toString(), icon: Zap },
              { label: 'Posts', value: mentions.length.toString(), icon: MessageSquare },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-lg p-3"
                style={{ background: 'var(--color-surface)' }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={11} style={{ color: 'var(--color-primary)' }} />
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                </div>
                <p className="text-xl font-bold font-mono" style={{ color: 'var(--color-text-primary)' }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link href="/sentiment"
        className="flex items-center gap-1 text-xs font-medium mt-auto w-fit"
        style={{ color: 'var(--color-primary)' }}>
        Explore sentiment <ArrowRight size={12} />
      </Link>
    </div>
  );
}

// ── Market News card ─────────────────────────────────────────
function NewsCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['news', 3],
    queryFn: () => api.news(3),
    refetchInterval: 120_000,
  });
  const items: MentionItem[] = Array.isArray(data) ? data : [];

  function timeAgo(d: string) {
    const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (m < 60) return `${m}m ago`;
    return `${Math.floor(m / 60)}h ago`;
  }

  return (
    <div className="rounded-2xl p-6 flex flex-col gap-4 h-full"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <div>
        <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Market News
        </h2>
        <p className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
          Stay close to what is happening.
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Bring relevant crypto news and social activity into the same workflow.
        </p>
      </div>

      <div className="rounded-xl overflow-hidden flex flex-col divide-y"
        style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', borderColor: 'var(--color-border)' }}>
        {isLoading
          ? Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse m-3 rounded-lg"
              style={{ background: 'var(--color-surface)' }} />
          ))
          : items.map((item) => (
            <a key={item.tweetId} href={item.link} target="_blank" rel="noopener noreferrer"
              className="px-4 py-3 hover:opacity-80 transition-opacity group">
              <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                @{item.account.username}
              </p>
              <p className="text-sm font-semibold leading-snug"
                style={{ color: 'var(--color-text-primary)' }}>
                {item.likeCount + item.repostCount > 100
                  ? '🔥 High engagement activity'
                  : 'Social mention'}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {timeAgo(item.mentionedAt)}
              </p>
            </a>
          ))}
      </div>

      <Link href="/news"
        className="flex items-center gap-1 text-xs font-medium mt-auto w-fit"
        style={{ color: 'var(--color-primary)' }}>
        View all news <ArrowRight size={12} />
      </Link>
    </div>
  );
}

// ── Token Intelligence card ───────────────────────────────────
function TokenIntelligenceCard() {
  const { data } = useQuery({
    queryKey: ['trending'],
    queryFn: api.trending,
    staleTime: 60_000,
  });
  const top = data?.data?.[0];

  // Derive simple bar chart data from top tokens
  const bars = (data?.data ?? []).slice(0, 7).map(t => t.current_count);
  const maxBar = Math.max(...bars, 1);

  return (
    <div className="rounded-2xl p-6 flex flex-col gap-4 h-full"
      style={{
        background: 'var(--color-surface)',
        border: `2px solid var(--color-primary)`,
      }}>
      <div>
        <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Token Intelligence
        </h2>
        <p className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
          Zoom into any token.
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Open a token profile to see price, movement, mentions, and social signals.
        </p>
      </div>

      {top && (
        <div className="rounded-xl p-4 space-y-3"
          style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
          {/* Token header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TokenIcon symbol={top.token} size={28} />
              <span className="font-bold uppercase" style={{ color: 'var(--color-text-primary)' }}>
                ${top.token.toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-mono" style={{ color: 'var(--color-text-muted)' }}>
              N/A
            </span>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg p-2.5" style={{ background: 'var(--color-surface)' }}>
              <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>24h Change</p>
              <p className="text-sm font-semibold font-mono"
                style={{ color: top.change_percent >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {top.change_percent >= 0 ? '+' : ''}{top.change_percent.toFixed(1)}%
              </p>
            </div>
            <div className="rounded-lg p-2.5" style={{ background: 'var(--color-surface)' }}>
              <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Mentions</p>
              <p className="text-sm font-semibold font-mono" style={{ color: 'var(--color-text-primary)' }}>
                {top.current_count >= 1000
                  ? `${(top.current_count / 1000).toFixed(1)}K`
                  : top.current_count}
              </p>
            </div>
          </div>

          {/* Social Activity bar chart */}
          <div>
            <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>Social Activity</p>
            <div className="flex items-end gap-1 h-10">
              {bars.map((v, i) => (
                <div key={i} className="flex-1 rounded-sm transition-all"
                  style={{
                    height: `${Math.round((v / maxBar) * 100)}%`,
                    background: 'var(--color-primary)',
                    opacity: 0.6 + (v / maxBar) * 0.4,
                  }} />
              ))}
            </div>
          </div>
        </div>
      )}

      <Link href={`/token/${top?.token ?? 'btc'}`}
        className="flex items-center gap-1 text-xs font-medium mt-auto w-fit"
        style={{ color: 'var(--color-primary)' }}>
        Open token profile <ArrowRight size={12} />
      </Link>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="flex" style={{ background: 'var(--color-background)' }}>
      <Sidebar />

      <main className="flex-1 ml-60 mr-72 p-6" style={{ minHeight: '100vh' }}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight mb-1"
            style={{ color: 'var(--color-text-primary)' }}>
            Dashboard
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Real-time crypto market intelligence powered by social sentiment
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>🔍</span>
            <input type="text" placeholder="Search markets, tokens, or trends"
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: 'var(--color-text-primary)' }} />
            <kbd className="px-2 py-0.5 rounded text-xs font-mono"
              style={{ background: 'var(--color-background)', color: 'var(--color-text-muted)' }}>
              /
            </kbd>
          </div>
        </div>

        {/* 2×2 card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <TrendingCard />
          <SentimentCard />
          <NewsCard />
          <TokenIntelligenceCard />
        </div>
      </main>

      <WhatsHappening />
    </div>
  );
}
