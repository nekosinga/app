const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetcher<T>(path: string, revalidate?: number): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    // Next.js server-side cache — aligned with Redis TTL on backend
    ...(revalidate !== undefined ? { next: { revalidate } } : {}),
  });

  if (!res.ok) {
    throw new ApiError(res.status, `API error ${res.status}: ${path}`);
  }

  const json = await res.json();

  // Backend currently wraps responses in { data: { success: true, data: <payload> } }
  // Remove this unwrap once backend is updated to return data directly (per PRD §6a)
  if (json?.data?.success === true && json?.data?.data !== undefined) {
    return json.data.data as T;
  }

  return json as T;
}

// ---------- Types ----------

export interface TrendingToken {
  token: string;
  current_count: number;
  previous_count: number;
  change_percent: number;
}

export interface TrendingPaginated {
  total: number;
  page: number;
  pageSize: number;
  data: TrendingToken[];
}

/** Contract address entry from /api/market/trending-cas */
export interface TrendingCA {
  address: string;
  symbol: string;
  mentions: number;
  change_percent: number;
}

export interface MentionItem {
  tweetId: string;
  link: string;
  likeCount: number;
  repostCount: number;
  viewCount: number;
  quoteCount: number;
  replyCount: number;
  bookmarkCount: number;
  mentionedAt: string;
  type: 'post' | 'note' | 'repost';
  account: {
    username: string;
    isVerified: boolean;
  };
  repostBreakdown: {
    smart: number;
    ct: number;
  };
}

export interface HealthResponse {
  status: string;
  db: string;
  timestamp: string;
}

// ---------- Endpoints ----------
// revalidate values aligned with Redis TTL in backend (api repo)

export const api = {
  health: () =>
    fetcher<HealthResponse>('/api/health'),

  trending: () =>
    fetcher<TrendingPaginated>('/api/market/trending', 1800),

  trendingCAs: () =>
    fetcher<TrendingCA[]>('/api/market/trending-cas', 1800),

  sentiment: (token: string) =>
    fetcher<MentionItem[]>(`/api/market/sentiment/${token.toUpperCase()}`, 900),

  news: (limit = 10) =>
    fetcher<MentionItem[]>(`/api/market/news?limit=${limit}`, 1800),

  /** Returns icon URL string or null if symbol not found in CoinGecko */
  icon: (symbol: string) =>
    fetcher<string | null>(`/api/market/icon/${symbol.toLowerCase()}`, 86400),
};
