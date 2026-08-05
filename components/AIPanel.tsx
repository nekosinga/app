'use client';

import { Sparkles, TrendingUp, AlertCircle } from 'lucide-react';

const INSIGHTS = [
  {
    id: 1,
    icon: '🐋',
    question: 'Should I short BTC after the whale opened a 40x short?',
    time: '2m ago',
  },
  {
    id: 2,
    icon: '⚖️',
    question: 'Is the CLARITY Act still a strong reason to reduce BTC holdings?',
    time: '5m ago',
  },
  {
    id: 3,
    icon: '📈',
    question: 'Top 3 tokens gaining momentum from social sentiment today',
    time: '8m ago',
  },
];

export default function AIPanel() {
  return (
    <aside
      className="fixed right-0 top-0 h-screen w-80 flex flex-col border-l overflow-y-auto"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Header */}
      <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
          <h2 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
            AI Market Intelligence
          </h2>
          <span
            className="text-xs px-2 py-0.5 rounded font-semibold ml-auto"
            style={{ background: 'var(--color-primary)', color: '#fff' }}
          >
            BETA
          </span>
        </div>
      </div>

      {/* Insights */}
      <div className="flex-1 p-4 space-y-3">
        {INSIGHTS.map((insight) => (
          <button
            key={insight.id}
            className="w-full text-left p-3 rounded-lg transition-all hover:scale-[1.01]"
            style={{
              background: 'var(--color-background)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg shrink-0">{insight.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug" style={{ color: 'var(--color-text-primary)' }}>
                  {insight.question}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  {insight.time}
                </p>
              </div>
            </div>
          </button>
        ))}

        {/* Ask button */}
        <button
          className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          style={{
            background: 'var(--color-primary)',
            color: '#fff',
          }}
        >
          <Sparkles size={14} />
          Ask NekoSinga AI
        </button>
      </div>

      {/* What's Happening */}
      <div className="border-t p-4" style={{ borderColor: 'var(--color-border)' }}>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>
          What's Happening
        </h3>

        {/* Tabs */}
        <div className="flex gap-1 mb-3">
          {['All', 'X', 'Reddit', 'Telegram', 'News'].map((tab) => (
            <button
              key={tab}
              className="px-2.5 py-1 rounded text-xs transition-colors"
              style={{
                background: tab === 'All' ? 'var(--color-primary)' : 'var(--color-background)',
                color: tab === 'All' ? '#fff' : 'var(--color-text-muted)',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Mentions preview */}
        <div className="space-y-2">
          {[
            { user: 'BullTheory', handle: 'X', time: '12m ago' },
            { user: 'Deltaine', handle: 'X', time: '15m ago' },
            { user: 'diegoBloomberg', handle: 'X', time: '18m ago' },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-2 p-2 rounded transition-colors hover:bg-opacity-50"
              style={{ background: 'var(--color-background)' }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: 'var(--color-border)', color: 'var(--color-secondary)' }}
              >
                {item.user[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  @{item.user} <span style={{ color: 'var(--color-text-muted)' }}>({item.handle})</span>
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{item.time}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          className="w-full mt-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          style={{
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-muted)',
          }}
        >
          View More
        </button>
      </div>
    </aside>
  );
}
