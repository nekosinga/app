'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useBalance } from 'wagmi';
import {
  BarChart2,
  Flame,
  MessageCircle,
  Rss,
  Wallet,
  LogOut,
  Github,
  BookOpen,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: BarChart2 },
  { href: '/trending', label: 'Trending', icon: Flame },
  { href: '/sentiment', label: 'Sentiment', icon: MessageCircle },
  { href: '/news', label: 'News', icon: Rss },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { ready, authenticated, login, logout } = usePrivy();
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const short = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-60 flex flex-col border-r overflow-y-auto"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        zIndex: 40,
      }}
    >
      {/* Logo */}
      <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/nekosinga-logo.png"
            alt="Neko Singa"
            width={28}
            height={28}
            className="rounded-full"
          />
          <span className="font-bold text-base tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Neko<span style={{ color: 'var(--color-primary)' }}>Singa</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all"
            style={{
              background: isActive(href) ? 'var(--color-primary)' : 'transparent',
              color: isActive(href) ? '#fff' : 'var(--color-text-muted)',
            }}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Connect Wallet + Footer */}
      <div className="px-3 pb-4">
        {/* Separator */}
        <div className="mb-3" style={{ borderTop: '1px solid var(--color-border)' }} />

        {ready && authenticated && address ? (
          <div className="space-y-2 mb-3">
            <div
              className="rounded-lg p-3 space-y-1"
              style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)' }}
            >
              <div className="flex items-center gap-2">
                <Wallet size={12} style={{ color: 'var(--color-primary)' }} />
                <span className="text-xs font-mono" style={{ color: 'var(--color-text-primary)' }}>
                  {short(address)}
                </span>
              </div>
              {balance && (
                <p className="text-xs pl-4" style={{ color: 'var(--color-text-muted)' }}>
                  {(Number(balance.value) / 1e18).toFixed(4)} {balance.symbol}
                </p>
              )}
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors"
              style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
            >
              <LogOut size={12} />
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={login}
            disabled={!ready}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-40 mb-3"
            style={{ background: 'var(--color-primary)', color: '#fff' }}
          >
            <Wallet size={14} />
            Connect Wallet
          </button>
        )}

        {/* Footer links */}
        <div className="flex items-center justify-center gap-4 mb-1.5">
          <a
            href="https://github.com/nekosinga"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs transition-opacity hover:opacity-75"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <Github size={11} />
            GitHub
          </a>
          <span style={{ color: 'var(--color-border)' }}>·</span>
          <a
            href="https://docs-nekosinga.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs transition-opacity hover:opacity-75"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <BookOpen size={11} />
            Docs
          </a>
        </div>
        <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
          © {new Date().getFullYear()} NekoSinga
        </p>
      </div>
    </aside>
  );
}
