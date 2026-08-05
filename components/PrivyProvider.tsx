'use client';

import { PrivyProvider as PrivyAuthProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, arbitrum, base } from 'wagmi/chains';
import { useState } from 'react';

const wagmiConfig = createConfig({
  chains: [mainnet, arbitrum, base],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
  },
});

export default function PrivyProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
      },
    },
  }));

  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? '';

  return (
    <PrivyAuthProvider
      appId={appId}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#F97316',
          logo: '/nekosinga-logo.png',
        },
        loginMethods: ['wallet', 'email', 'google', 'twitter'],
        embeddedWallets: {
          ethereum: { createOnLogin: 'users-without-wallets' },
        },
      }}
    >
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </PrivyAuthProvider>
  );
}
