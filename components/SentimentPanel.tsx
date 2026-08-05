'use client';

import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Repeat2, FileText, Zap, ExternalLink } from 'lucide-react';
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

export default function SentimentPanel({ symbol }: { symbol: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['sentiment', symbol],
    queryFn: () => api.sentiment(symbol),
    refetchInterval: 60_000,
  });

  const mentions: MentionItem[] = Array.isArray(data) ? data : [];

  const posts    = mentions.filter((m) => m.type === 'post').length;
  const reposts  = mentions.filter((m) => m.type === 'repost').length;
  const notes    = mentions.filter((m) => m.type === 'note').length;
  const engagement = mentions.reduce(
    (acc, m) => acc + m.likeCount + m.repostCount + m.quoteCount,
    0,
  );

  if (isLoading) {
    return (
      <div
        className="rounded-lg p-4 space-y-3"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 rounded-lg animate-pulse" style={{ background: 'var(--color-border)' }} />
        ))}
      </div>
    );
  }

  if (error || mentions.length === 0) {
    return (
      <div
        className="rounded-lg p-4"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {error ? 'Mentions unavailable.' : `No mentions for ${symbol.toUpperCase()}.`}
        </p>
      </div>
    );
  }

  const stats = [
    { label: 'Posts',      value: posts,      icon: MessageSquare, color: 'var(--color-primary)' },
    { label: 'Reposts',    value: reposts,     icon: Repeat2,       color: 'var(--color-success)' },
    { label: 'Notes',      value: notes,       icon: FileText,      color: 'var(--color-text-muted)' },
    { label: 'Engagement', value: engagement,  icon: Zap,           color: 'var(--color-secondary)' },
  ];

  return (
    <div
      className="rounded-lg p-4 space-y-4"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
          Mentions
        </h3>
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {mentions.length} recent
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-lg p-3 flex items-center gap-2"
            style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)' }}
          >
            <Icon size={14} style={{ color }} />
            <div>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
              <p className="font-semibold font-mono text-sm" style={{ color: 'var(--color-text-primary)' }}>
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent mentions */}
      <div>
        <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>Recent</p>
        <div className="space-y-2.5">
          {mentions.slice(0, 5).map((item) => (
            <a
              key={item.tweetId}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 group"
            >
              <span
                className="text-sm truncate group-hover:opacity-75 transition-opacity"
                style={{ color: 'var(--color-text-primary)' }}
              >
                @{item.account.username}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {timeAgo(item.mentionedAt)}
                </span>
                <ExternalLink
                  size={10}
                  className="opacity-0 group-hover:opacity-50 transition-opacity"
                  style={{ color: 'var(--color-text-muted)' }}
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
