'use client';

import Link from 'next/link';
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

// Derive a display category from engagement signals
// Real category field doesn't exist in API yet — using heuristic fallback
type Category = 'Tailwind' | 'Headwind' | 'Governance' | 'Tokenomics' | 'Neutral';

function deriveCategory(item: MentionItem): Category {
  const eng = item.likeCount + item.repostCount + item.quoteCount;
  if (item.type === 'repost' && item.repostBreakdown.smart > 0) return 'Governance';
  if (eng > 500) return 'Tailwind';
  if (eng > 100) return 'Tokenomics';
  if (item.type === 'note') return 'Neutral';
  if (item.repostCount > item.likeCount) return 'Headwind';
  return 'Neutral';
}

const CATEGORY_STYLE: Record<Category, { bg: string; color: string }> = {
  Tailwind:   { bg: 'rgba(34,197,94,0.15)',   color: '#22C55E' },
  Headwind:   { bg: 'rgba(239,68,68,0.15)',    color: '#EF4444' },
  Governance: { bg: 'rgba(249,115,22,0.15)',   color: '#F97316' },
  Tokenomics: { bg: 'rgba(249,115,22,0.12)',   color: '#FCD9A8' },
  Neutral:    { bg: 'rgba(168,154,136,0.15)',  color: '#A89A88' },
};

// Extract token symbol hint from link URL (e.g. /status/... doesn't have it — fallback null)
function extractToken(item: MentionItem): string | null {
  // Heuristic: check if username contains a known ticker pattern
  const match = item.account.username.match(/^([A-Z]{2,6})(?:feed|listings|signal|news|ai)?$/i);
  return match ? match[1].toLowerCase() : null;
}

export default function WhatsHappening({ limit = 10 }: { limit?: number }) {
  const { data, isLoading, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['news', limit],
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
          What&apos;s Happening
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
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {isLoading && Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-7 h-7 rounded-full animate-pulse shrink-0" style={{ background: 'var(--color-border)' }} />
            <div className="flex-1 space-y-1.5 pt-1">
              <div className="h-3 w-24 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
              <div className="h-3 w-full rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
            </div>
          </div>
        ))}

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

        {!isLoading && items.map((item) => {
          const category = deriveCategory(item);
          const catStyle = CATEGORY_STYLE[category];
          const tokenHint = extractToken(item);

          const inner = (
            <div className="flex gap-3 group">
              {/* Avatar */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                style={{ background: 'var(--color-border)', color: 'var(--color-secondary)' }}
              >
                {item.account.username[0].toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                {/* Name + category badge */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className="text-xs font-semibold group-hover:opacity-75 transition-opacity truncate"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    @{item.account.username}
                  </span>
                  {item.account.isVerified && (
                    <span className="text-xs" style={{ color: 'var(--color-primary)' }}>✓</span>
                  )}
                  {/* Category tag */}
                  <span
                    className="text-xs px-1.5 py-0.5 rounded ml-auto shrink-0 font-medium"
                    style={{ background: catStyle.bg, color: catStyle.color }}
                  >
                    {category}
                  </span>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
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
            </div>
          );

          // If we can derive a token, wrap with Link to token detail page
          // Otherwise link out to the tweet
          if (tokenHint) {
            return (
              <Link key={item.tweetId} href={`/token/${tokenHint}`} className="block">
                {inner}
              </Link>
            );
          }

          return (
            <a
              key={item.tweetId}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              {inner}
            </a>
          );
        })}
      </div>

      {/* Footer */}
      {dataUpdatedAt > 0 && (
        <div
          className="px-4 py-2 border-t shrink-0"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Last updated: {timeAgo(new Date(dataUpdatedAt).toISOString())} ·{' '}
            <span style={{ color: 'var(--color-success)' }}>●</span>
          </p>
        </div>
      )}
    </aside>
  );
}
