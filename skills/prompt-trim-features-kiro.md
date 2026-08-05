Trim the dashboard UI to match what the backend actually supports. Right now the sidebar and the right panel show several features that don't have a working backend behind them yet — this looks misleading in a portfolio demo, so let's remove or repurpose them.

## 1. Remove the "AI Market Intelligence" panel (right sidebar)

This panel currently shows fake chat examples ("Should I short BTC after the whale opened a 40x short?") and an "Ask NekoSinga AI" button. There is no AI chat backend — Elfa's AI Chat endpoint requires their Grow plan, which this project intentionally doesn't use (see `api` repo README for context).

- Remove the chat examples and the "Ask NekoSinga AI" button entirely.
- Keep the "What's Happening" section, but make sure it pulls real data from `GET /api/market/news` — this is a real, working endpoint, so this section should stay and be wired to that data if it isn't already.

## 2. Simplify the sidebar to only working features

Keep:
- **Dashboard** (current trending table view)
- **Trending** (can link to a full trending page)
- **Sentiment / Mentions** (wire to `GET /api/market/sentiment/:token`)
- **News** (wire to `GET /api/market/news`)

Remove (no backend/auth system built for these yet):
- Market Intelligence (redundant with Sentiment/Mentions — consolidate into one)
- Watchlist
- Alerts
- Token Screener
- Sentiment Feed (if separate from the "Sentiment/Mentions" item above — consolidate)
- Top Mentions (same, consolidate with Mentions/News)
- Profile
- Settings
- API Access
- "Try Mobile App" promo block — there is no mobile app, this was leftover reference content

## 3. Add what's missing

- Add a "Connect Wallet" button (Privy) somewhere visible in the layout — top right nav or sidebar. This isn't in the UI yet but is a core requirement for this project.
- Make each row in the trending table clickable, linking to a token detail page (chart + sentiment panel), per the `app` PRD.

## 4. Result

The sidebar should end up short and fully functional — every nav item should lead to a page backed by real data from the `api` repo. No grayed-out/disabled items, no placeholder features. If something isn't built yet, it shouldn't be visible in the nav at all.
