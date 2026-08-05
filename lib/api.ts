const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetcher<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    throw new ApiError(res.status, `API error ${res.status}: ${path}`);
  }

  const json = await res.json();

  // Backend wraps all responses in { data: { success: true, data: <payload> } }
  if (json?.data?.success === true && json?.data?.data !== undefined) {
    return json.data.data as T;
  }

  return json as T;
}

// ---------- Types (matching actual API shape) ----------

/** Single trending token from /api/market/trending */
export interface TrendingToken {
  token: string;           // e.g. "btc"
  current_count: number;
  previous_count: number;
  change_percent: number;
}

/** Paginated trending response (after unwrap = TrendingPaginated) */
export interface TrendingPaginated {
  total: number;
  page: number;
  pageSize: number;
  data: TrendingToken[];
}

/** Single mention/tweet from /api/market/news or /api/market/sentiment/:token */
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

export const api = {
  health: () =>
    fetcher<HealthResponse>('/api/health'),

  trending: () =>
    fetcher<TrendingPaginated>('/api/market/trending'),

  sentiment: (token: string) =>
    fetcher<MentionItem[]>(`/api/market/sentiment/${token.toUpperCase()}`),

  news: (limit = 10) =>
    fetcher<MentionItem[]>(`/api/market/news?limit=${limit}`),

  /** Returns icon URL string or null if not found */
  icon: (symbol: string) =>
    fetcher<string | null>(`/api/market/icon/${symbol.toLowerCase()}`),
};
