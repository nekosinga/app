'use client';

import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Heart, Repeat2, Eye, RefreshCw } from 'lucide-react';
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

const TYPE_COLOR: Record<string, string> = {
  post:   '#F97316',
  repost: '#22C55E',
  note:   '#A89A88',
};

export default function WhatsHappening({ limit = 8 }: { limit?: number }) {
  const { data, isLoading, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['news'],
    queryFn: () => api.news(limit),
    refetchInterval: 120_000,
  });

  const items: MentionItem[] = Array.isArray(data) ? data : [];

  return (
    <aside
      className="fixed right-0 top-0 h-screen w-72 flex flex-col border-l overflow-hidden"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        zIndex: 40,
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-4 flex items-center justify-between border-b shrink-0"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
          What's Happening
        </h2>
        <button
          onClick={() => refetch()}
          className="p-1 rounded transition-opacity hover:opacity-70"
          title="Refresh"
        >
          <RefreshCw size={12} style={{ color: 'var(--color-text-muted)' }} />
        </button>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {isLoading && (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-7 h-7 rounded-full animate-pulse shrink-0" style={{ background: 'var(--color-border)' }} />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-24 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
                <div className="h-3 w-full rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
              </div>
            </div>
          ))
        )}

        {error && (
          <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
            Failed to load feed.
          </p>
        )}

        {!isLoading && !error && items.length === 0 && (
          <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
            No activity yet.
          </p>
        )}

        {!isLoading && items.map((item) => (
          <a
            key={item.tweetId}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-3 group"
          >
            {/* Avatar */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
              style={{ background: 'var(--color-border)', color: 'var(--color-secondary)' }}
            >
              {item.account.username[0].toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              {/* Name row */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className="text-xs font-semibold group-hover:opacity-75 transition-opacity"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  @{item.account.username}
                </span>
                {item.account.isVerified && (
                  <span style={{ color: 'var(--color-primary)' }}>✓</span>
                )}
                <span
                  className="text-xs px-1.5 py-0.5 rounded capitalize ml-auto"
                  style={{
                    color: TYPE_COLOR[item.type] ?? 'var(--color-text-muted)',
                    background: 'var(--color-background)',
                  }}
                >
                  {item.type}
                </span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-2.5 mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                <span>{timeAgo(item.mentionedAt)}</span>
                {item.likeCount > 0 && (
                  <span className="flex items-center gap-0.5">
                    <Heart size={10} />{item.likeCount}
                  </span>
                )}
                {item.repostCount > 0 && (
                  <span className="flex items-center gap-0.5">
                    <Repeat2 size={10} />{item.repostCount}
                  </span>
                )}
                {item.viewCount > 0 && (
                  <span className="flex items-center gap-0.5">
                    <Eye size={10} />{item.viewCount.toLocaleString()}
                  </span>
                )}
                <ExternalLink
                  size={9}
                  className="ml-auto opacity-0 group-hover:opacity-50 transition-opacity shrink-0"
                />
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Footer: last updated */}
      {dataUpdatedAt > 0 && (
        <div
          className="px-4 py-2 border-t shrink-0"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Last updated: {timeAgo(new Date(dataUpdatedAt).toISOString())} · <span style={{ color: 'var(--color-success)' }}>●</span>
          </p>
        </div>
      )}
    </aside>
  );
}
