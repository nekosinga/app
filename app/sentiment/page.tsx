'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MessageSquare, Repeat2, FileText, Zap, ExternalLink } from 'lucide-react';
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

const QUICK_TOKENS = ['BTC', 'ETH', 'SOL', 'DOGE', 'BNB'];

export default function SentimentPage() {
  const [token, setToken] = useState('BTC');
  const [input, setInput] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['sentiment', token],
    queryFn: () => api.sentiment(token),
    refetchInterval: 60_000,
    enabled: token.length > 0,
  });

  const mentions: MentionItem[] = Array.isArray(data) ? data : [];
  const posts    = mentions.filter((m) => m.type === 'post').length;
  const reposts  = mentions.filter((m) => m.type === 'repost').length;
  const notes    = mentions.filter((m) => m.type === 'note').length;
  const engagement = mentions.reduce((a, m) => a + m.likeCount + m.repostCount + m.quoteCount, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setToken(input.trim().toUpperCase());
      setInput('');
    }
  };

  return (
    <div className="flex" style={{ background: 'var(--color-background)' }}>
      <Sidebar />

      <main className="flex-1 ml-60 mr-72 p-6" style={{ minHeight: '100vh' }}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Sentiment
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Social mentions per token · Powered by Elfa API
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-4">
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <Search size={14} style={{ color: 'var(--color-text-muted)' }} />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              type="text"
              placeholder="Enter token symbol (e.g. SOL)"
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: 'var(--color-text-primary)' }}
            />
            <button
              type="submit"
              className="px-3 py-1 rounded text-xs font-semibold"
              style={{ background: 'var(--color-primary)', color: '#fff' }}
            >
              Search
            </button>
          </div>
        </form>

        {/* Quick tokens */}
        <div className="flex gap-2 mb-6">
          {QUICK_TOKENS.map((t) => (
            <button
              key={t}
              onClick={() => setToken(t)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: token === t ? 'var(--color-primary)' : 'var(--color-surface)',
                color: token === t ? '#fff' : 'var(--color-text-muted)',
                border: '1px solid var(--color-border)',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Stats cards */}
        {!isLoading && !error && mentions.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Posts',      value: posts,      icon: MessageSquare, color: 'var(--color-primary)' },
              { label: 'Reposts',    value: reposts,     icon: Repeat2,       color: 'var(--color-success)' },
              { label: 'Notes',      value: notes,       icon: FileText,      color: 'var(--color-text-muted)' },
              { label: 'Engagement', value: engagement,  icon: Zap,           color: 'var(--color-secondary)' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="rounded-lg p-4"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={14} style={{ color }} />
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                </div>
                <p className="text-xl font-bold font-mono" style={{ color: 'var(--color-text-primary)' }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-4 gap-3 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-lg animate-pulse" style={{ background: 'var(--color-surface)' }} />
            ))}
          </div>
        )}

        {/* Mentions list */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>
            Recent mentions · {token}
          </h2>

          {error && (
            <div
              className="rounded-lg p-6 text-center"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                No mentions found for {token}.
              </p>
            </div>
          )}

          {!isLoading && !error && mentions.length === 0 && (
            <div
              className="rounded-lg p-6 text-center"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                No mentions found for {token}.
              </p>
            </div>
          )}

          {!isLoading && mentions.length > 0 && (
            <div
              className="rounded-lg"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              {mentions.map((item, idx) => (
                <a
                  key={item.tweetId}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 px-4 py-3 group transition-colors"
                  style={{ borderBottom: idx < mentions.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: 'var(--color-border)', color: 'var(--color-secondary)' }}
                  >
                    {item.account.username[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        @{item.account.username}
                      </span>
                      {item.account.isVerified && (
                        <span className="text-xs" style={{ color: 'var(--color-primary)' }}>✓</span>
                      )}
                    </div>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {timeAgo(item.mentionedAt)} · {item.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                    <span>♥ {item.likeCount}</span>
                    <span>↺ {item.repostCount}</span>
                    <ExternalLink
                      size={11}
                      className="opacity-0 group-hover:opacity-50 transition-opacity"
                    />
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>

      <WhatsHappening />
    </div>
  );
}
