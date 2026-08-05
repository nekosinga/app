# PRD: `nekosinga/app`

## 1. Overview

Frontend produk utama Neko Singa — dashboard crypto market intelligence, terinspirasi langsung dari UI Elfa (`app.elfa.ai`). Mengonsumsi data dari `nekosinga/api` (live: `api-nekosinga.vercel.app`).

**Deploy target:** Vercel

---

## 2. Referensi UI (dari observasi langsung produk Elfa)

| Halaman Elfa | Elemen Kunci | Rencana di `app` |
|---|---|---|
| `/agent` | Chat AI, quick-action buttons ("Suggest Trade Setup", "Explain Token"), automation list | Dashboard chat sederhana (tanpa AI chat beneran, karena free plan — lihat catatan di README `api`) |
| `/trade/hyperliquid/btc` | Chart + order book + sentiment overlay dalam 1 layar | Chart trending token (data dari `/api/market/trending`) + panel sentiment (data dari `/api/market/sentiment/:token`) |
| `/leaderboard/token` | Tabel ranked (Mindshare), sparkline mini-chart per baris, panel "What's Happening Today" | Tabel trending tokens dari `/api/market/trending`, plus panel news dari `/api/market/news` |
| Login modal | Privy-powered: MetaMask, email, Google, Twitter, atau "Continue with a wallet" — semua dalam 1 modal | Login pakai Privy dengan opsi serupa |

---

## 3. Tech Stack

| Layer | Teknologi | Kegunaan |
|---|---|---|
| Framework | Next.js + TypeScript | UI & routing |
| Styling | Tailwind CSS | Styling cepat, konsisten |
| Auth / Wallet | `@privy-io/react-auth` | Login modal multi-method (wallet, email, Google, Twitter) — sama seperti Elfa |
| On-chain Data | `wagmi` + `viem` | Baca data on-chain (saldo, network info) setelah login |
| State/Fetch | `@tanstack/react-query` | Data fetching & caching (dependency wagmi, juga dipakai buat fetch ke `api`) |
| Chart | `lightweight-charts` (TradingView) atau Recharts | Candlestick/price chart |
| Data Source | `nekosinga/api` | Trending tokens, sentiment, news, dll |

> Catatan: Privy sudah menyediakan hooks sendiri (`usePrivy`, `useWallets`) yang cukup untuk basic wallet connect. wagmi/viem dipasang tambahan untuk baca data on-chain lebih lanjut, dan karena disebut eksplisit sebagai skill yang dicari di job posting.

---

## 4. Packages to Install

```bash
npx create-next-app@latest app
cd app
npm install @privy-io/react-auth wagmi viem @tanstack/react-query
npm install lightweight-charts
```

---

## 5. Struktur Folder (Rencana)

```
app/
├── app/
│   ├── page.tsx                 # Landing/dashboard utama
│   ├── layout.tsx               # Root layout + Privy provider
│   ├── trending/
│   │   └── page.tsx             # Tabel trending tokens (mirip /leaderboard/token)
│   ├── token/[symbol]/
│   │   └── page.tsx             # Detail token: chart + sentiment (mirip /trade/hyperliquid/btc)
│   └── api/
│       └── proxy/route.ts       # Optional: proxy ringan ke backend, biar key nggak exposed
├── components/
│   ├── PrivyProvider.tsx
│   ├── TokenChart.tsx
│   ├── TrendingTable.tsx
│   └── NewsPanel.tsx
├── lib/
│   └── api.ts                   # fetch wrapper ke NEXT_PUBLIC_API_URL
├── .env.local
└── package.json
```

---

## 6. Environment Variables

```env
NEXT_PUBLIC_API_URL=https://api-nekosinga.vercel.app
NEXT_PUBLIC_PRIVY_APP_ID=
```

---

## 7. Fitur v1 (Sesuai Free Tier Backend)

- [ ] Login via Privy (wallet/email/Google/Twitter dalam 1 modal)
- [ ] Halaman trending tokens (tabel + sparkline) — lihat §7b untuk spesifikasi detail
- [ ] Halaman detail token: chart + sentiment/mentions panel
- [ ] Panel "What's happening" dari `/api/market/news` — lihat §7c untuk spesifikasi detail
- [ ] Setelah login, tampilkan info wallet (alamat, saldo native token) via wagmi/viem
- [ ] Token icon: fetch dari `/api/market/icon/:symbol`, fallback ke initial badge kalau `null`

### 7b. Spesifikasi Tabel Trending Tokens (referensi: `app.elfa.ai/explore`)

Kolom:
| Kolom | Isi | Sumber |
|---|---|---|
| # | Rank | Index array |
| Symbol | Icon + symbol + nama token | `/api/market/icon/:symbol` + data trending |
| Mindshare | Persentase (bisa dipetakan dari mentions relatif terhadap total) | Turunan dari `/api/market/trending` |
| Change | 24h change %, warna hijau/merah | `/api/market/trending` |
| Price | Harga terkini | `/api/market/trending` |
| Chart | Sparkline mini (garis tren singkat) | Turunan dari data historis mentions/price yang tersedia |

Filter waktu di atas tabel: tab **1H / 4H / 1D / 7D** — mengubah window data yang ditampilkan (butuh parameter `timeWindow` diteruskan ke `elfa.getTrendingTokens` di backend).

Header lain: label "Updated Xs ago" (auto-refresh indicator, sesuai pola yang sudah ada di dashboard).

### 7c. Spesifikasi Panel "What's Happening Today"

Setiap item panel berisi:
- Icon token/sumber + nama (mis. `AMZN`, `SOL`, atau `Global News` untuk berita umum)
- Timestamp relatif (`12m ago`)
- Judul/isi berita (dari `/api/market/news`)
- Tag kategori (mis. `Neutral`, `Governance`, `Headwind`, `Tailwind`, `Tokenomics`) — badge kecil berwarna, warna berbeda per jenis tag (positif = hijau/orange, negatif = merah, netral = abu-abu)
- Seluruh item clickable → link ke halaman detail token terkait (`/token/[symbol]`)

## 7a. Di Luar Scope v1

- AI chat interaktif (butuh Elfa Grow plan — lihat README `api`)
- Eksekusi trade sungguhan ke exchange manapun

---

### 7d. Halaman Detail Token — Chart + Sentiment (Free Tier Compatible)

Referensi visual: `app.elfa.ai/trade/hyperliquid/btc`, tapi **discope ulang** supaya sesuai kemampuan backend free tier — tanpa TradingView Charting Library (butuh approval), tanpa order book real-time (butuh WebSocket ke exchange).

| Elemen di Referensi | Ada di v1? | Alasan |
|---|---|---|
| Candlestick/line chart | ✅ Ya | Pakai `lightweight-charts` (open-source, no approval), data harga dari `elfa.getTrendingTokens` |
| Toggle "Sentiment" / "Mentions" | ✅ Ya | Data dari `elfa.getKeywordMentions` (`/api/market/sentiment/:token`) — free tier |
| Drawing tools, indicator, fullscreen toolbar | ❌ Tidak | Fitur TradingView Charting Library, butuh approval — di luar scope |
| Order book real-time | ❌ Tidak | Butuh WebSocket ke Hyperliquid, di luar scope backend saat ini |
| "Ask Elfa" AI panel | ❌ Tidak | Butuh Elfa Grow plan — sudah didokumentasikan di README `api` |

Jadi halaman ini cukup: chart harga (Lightweight Charts) + tombol toggle buat nampilin overlay/panel sentiment di sampingnya. Semua data sumbernya endpoint yang sudah free-tier compatible.

## 8. Uninstall Package yang Tidak Terpakai

`cryptocurrency-icons` **tidak jadi dipakai** — digantikan sepenuhnya oleh endpoint `/api/market/icon/:symbol` di backend (proxy ke CoinGecko), karena CoinGecko punya coverage lebih luas termasuk token micro-cap yang tidak ada di package ini.

```bash
npm uninstall cryptocurrency-icons
```

## 9. Setup Order

1. `create-next-app` + install semua dependency
2. Setup Privy provider di `layout.tsx`, test login modal jalan
3. Bikin `lib/api.ts`, tes fetch ke `api-nekosinga.vercel.app/api/health`
4. Bikin halaman trending tokens (tabel)
5. Bikin halaman detail token (chart + sentiment)
6. Integrasi wagmi/viem — tampilkan data wallet setelah login
7. Polish UI/UX — ini bagian paling penting karena job desc menekankan "pixel obsession"

---

## 10. Link Dokumentasi

- Next.js: https://nextjs.org/docs
- Privy: https://docs.privy.io/
- wagmi: https://wagmi.sh/
- viem: https://viem.sh/
- TradingView Lightweight Charts: https://tradingview.github.io/lightweight-charts/