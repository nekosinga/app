'use client';

import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Zap, MessageSquare, Repeat2, TrendingUp, TrendingDown } from 'lucide-react';
import { api, type MentionItem } from '@/lib/api';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function fmt(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export default function SentimentPanel({ symbol }: { symbol: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['sentiment', symbol],
    queryFn: () => api.sentiment(symbol),
    refetchInterval: 60_000,
  });

  const mentions: MentionItem[] = Array.isArray(data) ? data : [];
  const posts      = mentions.filter(m => m.type === 'post').length;
  const reposts    = mentions.filter(m => m.type === 'repost').length;
  const engagement = mentions.reduce((a, m) => a + m.likeCount + m.repostCount + m.quoteCount, 0);
  const total      = posts + reposts || 1;
  const bullPct    = Math.round((posts / total) * 100);
  const bearPct    = 100 - bullPct;

  // Latest signals derived from data
  const signals = [
    posts > reposts
      ? { dot: 'var(--color-success)', label: 'Rising mentions' }
      : { dot: 'var(--color-danger)', label: 'Declining mentions' },
    engagement > 0
      ? { dot: 'var(--color-primary)', label: 'Positive engagement' }
      : { dot: 'var(--color-text-muted)', label: 'Low engagement' },
    { dot: '#60a5fa', label: 'New market discussion' },
  ];

  if (isLoading) return (
    <div className="rounded-2xl p-5 space-y-3"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-10 rounded-xl animate-pulse"
          style={{ background: 'var(--color-background)' }} />
      ))}
    </div>
  );

  if (error || mentions.length === 0) return (
    <div className="rounded-2xl p-5"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
        {error ? 'Mentions unavailable.' : `No mentions for ${symbol.toUpperCase()}.`}
      </p>
    </div>
  );

  return (
    <div className="rounded-2xl p-5 space-y-4"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>

      {/* Token header row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold uppercase" style={{ color: 'var(--color-text-primary)' }}>
            ${symbol.toUpperCase()}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {mentions.length} recent mentions
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs font-mono"
          style={{ color: posts >= reposts ? 'var(--color-success)' : 'var(--color-danger)' }}>
          {posts >= reposts ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {posts >= reposts ? 'Bullish' : 'Bearish'}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Engagement', value: fmt(engagement), icon: Zap, color: 'var(--color-primary)' },
          { label: 'Posts', value: fmt(posts), icon: MessageSquare, color: 'var(--color-success)' },
          { label: 'Reposts', value: fmt(reposts), icon: Repeat2, color: 'var(--color-secondary)' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl p-3 text-center"
            style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
            <Icon size={12} style={{ color, margin: '0 auto 4px' }} />
            <p className="text-base font-bold font-mono" style={{ color: 'var(--color-text-primary)' }}>
              {value}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Sentiment bar */}
      <div className="rounded-xl p-3 space-y-2"
        style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)' }}>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Market Sentiment</p>
        <div className="flex rounded-full overflow-hidden h-2">
          <div style={{ width: `${bullPct}%`, background: 'var(--color-success)' }} />
          <div style={{ width: `${bearPct}%`, background: 'var(--color-danger)' }} />
        </div>
        <div className="flex justify-between text-xs">
          <span style={{ color: 'var(--color-success)' }}>{bullPct}% Bullish</span>
          <span style={{ color: 'var(--color-danger)' }}>{bearPct}% Bearish</span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid var(--color-border)' }} />

      {/* Latest Signals */}
      <div>
        <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>
          Latest Signals
        </p>
        <div className="space-y-1.5">
          {signals.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
              <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid var(--color-border)' }} />

      {/* Recent mentions */}
      <div className="space-y-2">
        {mentions.slice(0, 4).map((item) => (
          <a key={item.tweetId} href={item.link} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between gap-2 group">
            <span className="text-sm truncate group-hover:opacity-75 transition-opacity"
              style={{ color: 'var(--color-text-primary)' }}>
              @{item.account.username}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {timeAgo(item.mentionedAt)}
              </span>
              <ExternalLink size={10}
                className="opacity-0 group-hover:opacity-50 transition-opacity"
                style={{ color: 'var(--color-text-muted)' }} />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
