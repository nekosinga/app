'use client';

import { Star, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import type { TrendingToken } from '@/lib/api';

interface TokenHeaderProps {
  token: TrendingToken;
}

export default function TokenHeader({ token }: TokenHeaderProps) {
  const isUp = token.change_percent >= 0;
  const symbol = token.token.toUpperCase();

  // Mock price data (API doesn't provide price yet)
  const mockPrice = (Math.random() * 100).toFixed(2);

  return (
    <div
      className="flex items-center justify-between px-6 py-3 border-b"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Left: Token info */}
      <div className="flex items-center gap-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ background: 'var(--color-primary)', color: '#fff' }}
        >
          {symbol.slice(0, 2)}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {symbol} / USDC
            </h1>
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{ background: 'var(--color-background)', color: 'var(--color-text-muted)' }}
            >
              Bitcoin
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-6 ml-6">
          <div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Price</p>
            <p className="text-sm font-semibold font-mono" style={{ color: 'var(--color-text-primary)' }}>
              ${mockPrice}
            </p>
          </div>

          <div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>24h Change</p>
            <p
              className="text-sm font-semibold font-mono flex items-center gap-1"
              style={{ color: isUp ? 'var(--color-success)' : 'var(--color-danger)' }}
            >
              {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {isUp ? '+' : ''}{token.change_percent.toFixed(2)}%
            </p>
          </div>

          <div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>24h Volume</p>
            <p className="text-sm font-semibold font-mono" style={{ color: 'var(--color-text-primary)' }}>
              ${(Math.random() * 1000).toFixed(2)}M
            </p>
          </div>

          <div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Market Cap</p>
            <p className="text-sm font-semibold font-mono" style={{ color: 'var(--color-text-primary)' }}>
              ${(Math.random() * 100).toFixed(2)}B
            </p>
          </div>

          <div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Sentiment</p>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-success)' }}>
              Bullish
            </p>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <button
        className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
        style={{
          background: 'var(--color-primary)',
          color: '#fff',
        }}
      >
        <Plus size={14} />
        Add to Watchlist
      </button>
    </div>
  );
}
