/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['lucide-react'],
  images: {
    remotePatterns: [
      {
        // CoinGecko token icons via /api/market/icon/:symbol
        protocol: 'https',
        hostname: 'coin-images.coingecko.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
      },
    ],
  },
  webpack(config) {
    // Stub optional Privy peer deps that aren't installed
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@farcaster/mini-app-solana': false,
      '@solana/web3.js': false,
    };
    return config;
  },
};

export default nextConfig;
