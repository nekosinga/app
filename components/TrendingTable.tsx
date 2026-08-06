'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { api, type TrendingToken } from '@/lib/api';

// --- Sparkline ---
function MiniSparkline({ trend }: { trend: 'up' | 'down' }) {
  const points = Array.from({ length: 12 }, (_, i) => {
    const base = 15;
    const v = trend === 'up' ? i * 1.2 : 20 - i * 1.2;
    return base + Math.sin(i * 0.5) * 3 + v;
  });
  const max = Math.max(...points), min = Math.min(...points);
  const range = max - min || 1;
  const w = 60, h = 24;
  const path = points.map((v, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="inline-block">
      <path d={path} fill="none"
        stroke={trend === 'up' ? 'var(--color-success)' : 'var(--color-danger)'}
        strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// --- Change cell ---
function ChangeCell({ value }: { value: number }) {
  const isPos = value >= 0;
  return (
    <span className="inline-flex items-center gap-1 font-mono text-sm"
      style={{ color: isPos ? 'var(--color-success)' : 'var(--color-danger)' }}>
      {isPos ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
      {isPos ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}

// --- Token icon with API fallback ---
function TokenIcon({ symbol }: { symbol: string }) {
  const [imgError, setImgError] = useState(false);

  const { data: iconUrl, isSuccess } = useQuery({
    queryKey: ['icon', symbol],
    queryFn: () => api.icon(symbol),
    staleTime: Infinity,
    retry: false,
  });

  const fallback = (
    <span className="text-xs font-bold" style={{ color: '#fff' }}>
      {symbol.slice(0, 2).toUpperCase()}
    </span>
  );

  // Show fallback while loading or if no icon / img load error
  const showIcon = isSuccess && iconUrl && !imgError;

  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden"
      style={{ background: showIcon ? 'transparent' : 'var(--color-primary)', color: '#fff' }}
    >
      {showIcon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={iconUrl}
          alt={symbol}
          width={32}
          height={32}
          className="w-full h-full object-cover rounded-full"
          onError={() => setImgError(true)}
        />
      ) : fallback}
    </div>
  );
}

// --- Mindshare derived from total ---
function mindshare(current: number, total: number) {
  if (!total) return '—';
  return ((current / total) * 100).toFixed(2) + '%';
}

// --- Time label ---

export default function TrendingTable({ limit, search }: { limit?: number; search?: string }) {
  const [updatedAt, setUpdatedAt] = useState<number>(0);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['trending'],
    queryFn: api.trending,
    refetchInterval: 60_000,
  });

  useEffect(() => {
    if (data) setUpdatedAt(Date.now());
  }, [data]);

  const allRows: TrendingToken[] = limit
    ? (data?.data ?? []).slice(0, limit)
    : (data?.data ?? []);

  // Filter by search query (case-insensitive match on token symbol)
  const rows: TrendingToken[] = search
    ? allRows.filter(t => t.token.toLowerCase().includes(search.toLowerCase()))
    : allRows;

  const totalMentions = rows.reduce((s, t) => s + t.current_count, 0);

  const secsAgo = updatedAt ? Math.floor((Date.now() - updatedAt) / 1000) : null;
  const updatedLabel = secsAgo === null ? null
    : secsAgo < 60 ? `${secsAgo}s ago`
    : `${Math.floor(secsAgo / 60)}m ago`;

  // --- Loading skeleton ---
  if (isLoading) return (
    <div className="space-y-2">
      {Array.from({ length: limit ?? 8 }).map((_, i) => (
        <div key={i} className="h-14 rounded-lg animate-pulse"
          style={{ background: 'var(--color-background)' }} />
      ))}
    </div>
  );

  if (error || !rows.length) return (
    <div className="py-10 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
      {error ? 'Failed to load trending data.' : 'No data available.'}
    </div>
  );

  return (
    <div className="overflow-x-auto">
      {/* Table header row with refresh indicator */}
      <div className="flex items-center justify-between mb-3">
        {/* Time filter tabs */}
        <div className="flex gap-1">
          {['1H', '4H', '1D', '7D'].map((t) => (
            <button key={t}
              className="px-2.5 py-1 rounded text-xs font-medium transition-colors"
              style={{
                background: t === '1D' ? 'var(--color-primary)' : 'var(--color-background)',
                color: t === '1D' ? '#fff' : 'var(--color-text-muted)',
                border: '1px solid var(--color-border)',
              }}
            >
              {t}
            </button>
          ))}
        </div>
        {/* Updated indicator */}
        {updatedLabel && (
          <button onClick={() => refetch()}
            className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-75"
            style={{ color: 'var(--color-text-muted)' }}>
            <RefreshCw size={11} />
            Updated {updatedLabel}
          </button>
        )}
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-left"
            style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>
            <th className="pb-3 pr-4 w-8">#</th>
            <th className="pb-3 pr-4">Token</th>
            <th className="pb-3 pr-6 text-right">Mindshare</th>
            <th className="pb-3 pr-6 text-right">Change</th>
            <th className="pb-3 pr-6 text-right hidden sm:table-cell">Price</th>
            <th className="pb-3 text-right hidden lg:table-cell">Chart</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((token, i) => {
            const trend = token.change_percent >= 0 ? 'up' : 'down';
            return (
              <tr key={token.token}
                className="group transition-colors"
                style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 pr-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {i + 1}
                </td>
                <td className="py-3 pr-4">
                  <Link href={`/token/${token.token}`}
                    className="flex items-center gap-2.5 hover:opacity-80 transition-opacity w-fit">
                    <TokenIcon symbol={token.token} />
                    <div>
                      <span className="font-semibold uppercase text-sm block"
                        style={{ color: 'var(--color-text-primary)' }}>
                        {token.token.toUpperCase()}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {token.token.charAt(0).toUpperCase() + token.token.slice(1)}
                      </span>
                    </div>
                  </Link>
                </td>
                <td className="py-3 pr-6 text-right font-mono"
                  style={{ color: 'var(--color-text-primary)' }}>
                  {mindshare(token.current_count, totalMentions)}
                </td>
                <td className="py-3 pr-6 text-right">
                  <ChangeCell value={token.change_percent} />
                </td>
                <td className="py-3 pr-6 text-right hidden sm:table-cell font-mono text-xs"
                  style={{ color: 'var(--color-text-muted)' }}>
                  N/A
                </td>
                <td className="py-3 text-right hidden lg:table-cell">
                  <MiniSparkline trend={trend} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {data && (
        <p className="text-xs mt-3 text-right" style={{ color: 'var(--color-text-muted)' }}>
          Showing {rows.length} of {data.total}
        </p>
      )}
    </div>
  );
}
