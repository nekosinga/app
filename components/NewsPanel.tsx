'use client';

import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Heart, Repeat2, Eye } from 'lucide-react';
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

const TYPE_STYLE: Record<string, string> = {
  post:    '#F97316',
  repost:  '#22C55E',
  note:    '#A89A88',
};

export default function NewsPanel() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['news'],
    queryFn: () => api.news(10),
    refetchInterval: 120_000,
  });

  const items: MentionItem[] = Array.isArray(data) ? data : [];

  return (
    <div
      className="rounded-lg p-4 h-full"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <h2
        className="text-xs font-semibold uppercase tracking-wider mb-4"
        style={{ color: 'var(--color-text-muted)' }}
      >
        What&apos;s Happening
      </h2>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-7 h-7 rounded-full animate-pulse shrink-0" style={{ background: 'var(--color-border)' }} />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-28 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
                <div className="h-3 w-full rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Failed to load feed.</p>
      )}

      {!isLoading && !error && items.length === 0 && (
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No activity yet.</p>
      )}

      {!isLoading && !error && items.length > 0 && (
        <div className="space-y-4">
          {items.map((item) => (
            <a
              key={item.tweetId}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 group"
            >
              {/* Avatar */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{
                  background: 'var(--color-border)',
                  color: 'var(--color-secondary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {item.account.username.slice(0, 1).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                {/* Header row */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className="text-sm font-medium group-hover:opacity-75 transition-opacity"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    @{item.account.username}
                  </span>
                  {item.account.isVerified && (
                    <span style={{ color: 'var(--color-primary)' }} title="Verified">✓</span>
                  )}
                  <span
                    className="text-xs px-1.5 py-0.5 rounded capitalize"
                    style={{
                      background: 'var(--color-background)',
                      color: TYPE_STYLE[item.type] ?? 'var(--color-text-muted)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {item.type}
                  </span>
                  <ExternalLink
                    size={11}
                    className="ml-auto opacity-0 group-hover:opacity-50 transition-opacity shrink-0"
                    style={{ color: 'var(--color-text-muted)' }}
                  />
                </div>

                {/* Stats row */}
                <div
                  className="flex items-center gap-3 mt-1 text-xs"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <span>{timeAgo(item.mentionedAt)}</span>
                  {item.likeCount > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Heart size={10} /> {item.likeCount}
                    </span>
                  )}
                  {item.repostCount > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Repeat2 size={10} /> {item.repostCount}
                    </span>
                  )}
                  {item.viewCount > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Eye size={10} /> {item.viewCount.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
