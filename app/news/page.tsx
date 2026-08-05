'use client';

import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Heart, Repeat2, Eye, RefreshCw } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import WhatsHappening from '@/components/WhatsHappening';
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

export default function NewsPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['news-full'],
    queryFn: () => api.news(50),
    refetchInterval: 120_000,
  });

  const items: MentionItem[] = Array.isArray(data) ? data : [];

  return (
    <div className="flex" style={{ background: 'var(--color-background)' }}>
      <Sidebar />

      <main className="flex-1 ml-60 mr-72 p-6" style={{ minHeight: '100vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              News & Mentions
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Latest activity from X · Refreshed every 2 minutes
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-opacity hover:opacity-75"
            style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-lg animate-pulse"
                style={{ background: 'var(--color-surface)' }}
              />
            ))}
          </div>
        )}

        {error && (
          <div
            className="rounded-lg p-6 text-center"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <p style={{ color: 'var(--color-text-muted)' }}>Failed to load news feed.</p>
          </div>
        )}

        {/* Feed */}
        {!isLoading && !error && (
          <div
            className="rounded-lg divide-y"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              divideColor: 'var(--color-border)',
            }}
          >
            {items.length === 0 && (
              <p className="p-6 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                No activity yet.
              </p>
            )}
            {items.map((item) => (
              <a
                key={item.tweetId}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-4 p-4 group transition-colors"
                style={{ borderBottom: '1px solid var(--color-border)' }}
              >
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: 'var(--color-border)', color: 'var(--color-secondary)' }}
                >
                  {item.account.username[0].toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  {/* Name + type */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      @{item.account.username}
                    </span>
                    {item.account.isVerified && (
                      <span className="text-xs" style={{ color: 'var(--color-primary)' }}>✓</span>
                    )}
                    <span
                      className="text-xs px-2 py-0.5 rounded capitalize"
                      style={{
                        color: TYPE_COLOR[item.type] ?? 'var(--color-text-muted)',
                        background: 'var(--color-background)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      {item.type}
                    </span>
                    <span className="text-xs ml-auto" style={{ color: 'var(--color-text-muted)' }}>
                      {timeAgo(item.mentionedAt)}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    <span className="flex items-center gap-1">
                      <Heart size={12} /> {item.likeCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Repeat2 size={12} /> {item.repostCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={12} /> {item.viewCount.toLocaleString()}
                    </span>
                    <ExternalLink
                      size={11}
                      className="ml-auto opacity-0 group-hover:opacity-50 transition-opacity"
                    />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>

      <WhatsHappening />
    </div>
  );
}
