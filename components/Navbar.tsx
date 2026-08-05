'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useBalance } from 'wagmi';
import { Wallet, LogOut, TrendingUp, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });

  const short = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        borderColor: 'var(--color-border)',
        background: 'var(--color-surface)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/nekosinga-logo.png"
            alt="Neko Singa"
            width={32}
            height={32}
            className="rounded-full"
          />
          <span className="font-bold text-base tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Neko<span style={{ color: 'var(--color-primary)' }}>Singa</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1 text-sm">
          {[
            { href: '/', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/trending', label: 'Trending', icon: TrendingUp },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors hover:text-white"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <Icon size={14} />
              {label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-2">
          {ready && authenticated && address ? (
            <div className="flex items-center gap-2">
              {/* Wallet info */}
              <div
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                style={{
                  background: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <Wallet size={12} style={{ color: 'var(--color-primary)' }} />
                <span className="font-mono" style={{ color: 'var(--color-text-primary)' }}>
                  {short(address)}
                </span>
                {balance && (
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    {(Number(balance.value) / 1e18).toFixed(4)} {balance.symbol}
                  </span>
                )}
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors hover:text-white"
                style={{
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-muted)',
                }}
              >
                <LogOut size={12} />
                <span className="hidden sm:inline">Disconnect</span>
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              disabled={!ready}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40"
              style={{
                background: 'var(--color-primary)',
                color: '#fff',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = 'var(--color-primary-hover)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'var(--color-primary)')}
            >
              <Wallet size={14} />
              Connect
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
