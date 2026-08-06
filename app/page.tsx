'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { TrendingUp, TrendingDown, ArrowRight, Zap, MessageSquare, ExternalLink } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import WhatsHappening from '@/components/WhatsHappening';
import { api, type TrendingToken, type MentionItem } from '@/lib/api';

// ── helpers ──────────────────────────────────────────────────
function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60_000);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

// ── Token icon ────────────────────────────────────────────────
function TokenIcon({ symbol, size = 28 }: { symbol: string; size?: number }) {
  const [err, setErr] = useState(false);
  const { data: url, isSuccess } = useQuery({
    queryKey: ['icon', symbol],
    queryFn: () => api.icon(symbol),
    staleTime: Infinity,
    retry: false,
  });
  if (isSuccess && url && !err) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={symbol} width={size} height={size}
      className="rounded-full object-cover shrink-0"
      style={{ width: size, height: size }}
      onError={() => setErr(true)} />;
  }
  return (
    <div className="rounded-full flex items-center justify-center text-xs font-bold shrink-0"
      style={{ width: size, height: size, background: 'var(--color-primary)', color: '#fff' }}>
      {symbol.slice(0, 2).toUpperCase()}
    </div>
  );
}

// ── Card shell ────────────────────────────────────────────────
function Card({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="rounded-2xl p-6 flex flex-col gap-5 transition-all"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--color-surface)',
        border: hovered ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
        height: '360px',
      }}>
      {children}
    </div>
  );
}

// ── Card header block ─────────────────────────────────────────
function CardHeader({ title, subtitle, body }: { title: string; subtitle: string; body: string }) {
  return (
    <div className="shrink-0">
      <h2 className="text-base font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </h2>
      <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--color-primary)' }}>
        {subtitle}
      </p>
      <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
        {body}
      </p>
    </div>
  );
}

// ── Inner panel (nested card look) ────────────────────────────
function InnerPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl flex-1 overflow-hidden"
      style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
      {children}
    </div>
  );
}

// ── Trending Tokens ───────────────────────────────────────────
function TrendingCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['trending'], queryFn: api.trending, refetchInterval: 60_000,
  });
  const rows: TrendingToken[] = (data?.data ?? []).slice(0, 3);
  const total = rows.reduce((s, t) => s + t.current_count, 0);

  return (
    <Card>
      <CardHeader
        title="Trending Tokens"
        subtitle="See what is gaining attention."
        body="Track tokens with rising social activity and identify where attention is moving." />

      <InnerPanel>
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse mx-3 my-2 rounded-lg"
              style={{ background: 'var(--color-surface)' }} />
          ))
          : rows.map((t, i) => {
            const isUp = t.change_percent >= 0;
            const ms = total ? `${((t.current_count / total) * 100).toFixed(1)}%` : '—';
            return (
              <Link key={t.token} href={`/token/${t.token}`}
                className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:opacity-75"
                style={{
                  borderBottom: i < rows.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}>
                <span className="text-xs w-4 shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                  #{i + 1}
                </span>
                <TokenIcon symbol={t.token} size={26} />
                <span className="font-semibold text-sm flex-1"
                  style={{ color: 'var(--color-text-primary)' }}>
                  ${t.token.toUpperCase()}
                </span>
                <span className="text-xs font-mono mr-2" style={{ color: 'var(--color-text-muted)' }}>
                  {ms}
                </span>
                <span className="text-sm font-mono font-semibold"
                  style={{ color: isUp ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {isUp ? '+' : ''}{t.change_percent.toFixed(1)}%
                </span>
              </Link>
            );
          })}
      </InnerPanel>

      <Link href="/trending" className="flex items-center gap-1 text-xs font-semibold shrink-0"
        style={{ color: 'var(--color-primary)' }}>
        View all tokens <ArrowRight size={12} />
      </Link>
    </Card>
  );
}

// ── Social Sentiment ──────────────────────────────────────────
function SentimentCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['sentiment', 'BTC'], queryFn: () => api.sentiment('BTC'), refetchInterval: 60_000,
  });
  const mentions: MentionItem[] = Array.isArray(data) ? data : [];
  const engagement = mentions.reduce((a, m) => a + m.likeCount + m.repostCount + m.quoteCount, 0);
  const posts   = mentions.filter(m => m.type === 'post').length;
  const reposts = mentions.filter(m => m.type === 'repost').length;
  const total   = posts + reposts || 1;
  const bullPct = Math.round((posts / total) * 100);
  const bearPct = 100 - bullPct;

  return (
    <Card>
      <CardHeader
        title="Social Sentiment"
        subtitle="Understand the conversation behind the chart."
        body="Explore social activity and engagement to understand how the market is reacting." />

      <InnerPanel>
        {isLoading
          ? <div className="h-full animate-pulse m-3 rounded-lg" style={{ background: 'var(--color-surface)' }} />
          : (
            <div className="p-4 space-y-3 h-full flex flex-col justify-between">
              {/* Sentiment label */}
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                Market Sentiment · BTC
              </p>
              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex rounded-full overflow-hidden h-3"
                  style={{ background: 'var(--color-border)' }}>
                  <div style={{ width: `${bullPct}%`, background: 'var(--color-success)', transition: 'width 0.6s ease' }} />
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span style={{ color: 'var(--color-success)' }}>{bullPct}% Bullish</span>
                  <span style={{ color: 'var(--color-danger)' }}>{bearPct}% Bearish</span>
                </div>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Engagement', value: fmt(engagement), icon: Zap },
                  { label: 'Posts', value: fmt(mentions.length), icon: MessageSquare },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-lg p-3"
                    style={{ background: 'var(--color-surface)' }}>
                    <div className="flex items-center gap-1 mb-1">
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
      </InnerPanel>

      <Link href="/sentiment" className="flex items-center gap-1 text-xs font-semibold shrink-0"
        style={{ color: 'var(--color-primary)' }}>
        Explore sentiment <ArrowRight size={12} />
      </Link>
    </Card>
  );
}

// ── Market News ───────────────────────────────────────────────
function NewsCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['news-home'], queryFn: () => api.news(2), refetchInterval: 120_000,
  });
  const items: MentionItem[] = (Array.isArray(data) ? data : []).slice(0, 2);

  return (
    <Card>
      <CardHeader
        title="Market News"
        subtitle="Stay close to what is happening."
        body="Bring relevant crypto news and social activity into the same workflow." />

      <InnerPanel>
        {isLoading
          ? Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse mx-3 my-2 rounded-lg"
              style={{ background: 'var(--color-surface)' }} />
          ))
          : items.map((item, i) => {
            const hot = item.likeCount + item.repostCount > 100;
            return (
              <a key={item.tweetId} href={item.link} target="_blank" rel="noopener noreferrer"
                className="flex items-start gap-3 px-4 py-4 group transition-opacity hover:opacity-75"
                style={{ borderBottom: i < items.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: 'var(--color-border)', color: 'var(--color-secondary)' }}>
                  {item.account.username[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      @{item.account.username}
                    </span>
                    <ExternalLink size={10} className="opacity-0 group-hover:opacity-50 transition-opacity shrink-0"
                      style={{ color: 'var(--color-text-muted)' }} />
                  </div>
                  <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--color-text-primary)' }}>
                    {hot ? '🔥 High engagement activity' : 'Market mention'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {timeAgo(item.mentionedAt)} · ♥ {item.likeCount} ↺ {item.repostCount}
                  </p>
                </div>
              </a>
            );
          })}
      </InnerPanel>

      <Link href="/news" className="flex items-center gap-1 text-xs font-semibold shrink-0"
        style={{ color: 'var(--color-primary)' }}>
        View all news <ArrowRight size={12} />
      </Link>
    </Card>
  );
}

// ── Token Intelligence ────────────────────────────────────────
function TokenIntelligenceCard() {
  const { data } = useQuery({ queryKey: ['trending'], queryFn: api.trending, staleTime: 60_000 });
  const top  = data?.data?.[0];
  const bars = (data?.data ?? []).slice(0, 7).map(t => t.current_count);
  const maxBar = Math.max(...bars, 1);

  return (
    <Card>
      <CardHeader
        title="Token Intelligence"
        subtitle="Zoom into any token."
        body="Open a token profile to see price, movement, mentions, and social signals." />

      <InnerPanel>
        {top ? (
          <div className="p-4 flex flex-col gap-3 h-full">
            {/* Token row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TokenIcon symbol={top.token} size={26} />
                <span className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  ${top.token.toUpperCase()}
                </span>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded"
                style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)' }}>
                N/A
              </span>
            </div>

            {/* Mini stats */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg p-2.5" style={{ background: 'var(--color-surface)' }}>
                <p style={{ color: 'var(--color-text-muted)' }}>24h Change</p>
                <p className="font-bold font-mono mt-0.5"
                  style={{ color: top.change_percent >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {top.change_percent >= 0 ? '+' : ''}{top.change_percent.toFixed(1)}%
                </p>
              </div>
              <div className="rounded-lg p-2.5" style={{ background: 'var(--color-surface)' }}>
                <p style={{ color: 'var(--color-text-muted)' }}>Mentions</p>
                <p className="font-bold font-mono mt-0.5" style={{ color: 'var(--color-text-primary)' }}>
                  {fmt(top.current_count)}
                </p>
              </div>
            </div>

            {/* Bar chart */}
            <div className="flex-1 flex flex-col justify-end">
              <p className="text-xs mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Social Activity</p>
              <div className="flex items-end gap-1 h-10">
                {bars.map((v, i) => (
                  <div key={i} className="flex-1 rounded-sm"
                    style={{
                      minHeight: '4px',
                      height: `${Math.max(8, Math.round((v / maxBar) * 100))}%`,
                      background: 'var(--color-primary)',
                      opacity: 0.4 + (v / maxBar) * 0.6,
                    }} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full animate-pulse m-3 rounded-lg" style={{ background: 'var(--color-surface)' }} />
        )}
      </InnerPanel>

      <Link href={`/token/${top?.token ?? 'btc'}`}
        className="flex items-center gap-1 text-xs font-semibold shrink-0"
        style={{ color: 'var(--color-primary)' }}>
        Open token profile <ArrowRight size={12} />
      </Link>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="flex" style={{ background: 'var(--color-background)' }}>
      <Sidebar />
      <main className="flex-1 ml-60 mr-72 p-6" style={{ minHeight: '100vh' }}>

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight mb-1"
            style={{ color: 'var(--color-text-primary)' }}>
            Dashboard
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Real-time crypto market intelligence powered by social sentiment
          </p>
        </div>

        {/* Search bar */}
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

        {/* 2×2 uniform grid */}
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
