# Design System: Neko Singa

Referensi warna & styling untuk seluruh produk Neko Singa (`app`, `web`, `docs`), diturunkan dari logo brand.

---

## 1. Brand Colors (dari Logo)

| Warna | Hex | Sumber di Logo |
|---|---|---|
| Orange | `#F97316` | Background/mane utama |
| Brown Gelap | `#7C3A0E` | Mane bagian gelap |
| Cream | `#FCD9A8` | Muka karakter |
| Dark Brown | `#2B1608` | Mata & mulut |
| Putih Hangat | `#FFFDF7` | Bagian mata putih |

---

## 2. Theme Tokens (Dark Mode — Default)

UI utama pakai dark theme, dengan orange sebagai accent color (bukan base), supaya tetap nyaman buat dashboard data-dense.

```css
--color-background:      #0A0A0A;  /* base background, hampir hitam */
--color-surface:         #171310;  /* card/panel — coklat sangat gelap */
--color-primary:         #F97316;  /* accent utama, tombol, highlight */
--color-primary-hover:   #EA660A;
--color-secondary:       #FCD9A8;  /* label, teks sekunder */
--color-border:          #3D2814;  /* border tipis antar elemen */
--color-text-primary:    #FFFDF7;  /* teks utama */
--color-text-muted:      #A89A88;  /* teks tersier/timestamp */
--color-success:         #22C55E;  /* %change positif */
--color-danger:          #EF4444;  /* %change negatif */
```

### Tailwind Config

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        background: '#0A0A0A',
        surface: '#171310',
        primary: {
          DEFAULT: '#F97316',
          hover: '#EA660A',
        },
        secondary: '#FCD9A8',
        border: '#3D2814',
        text: {
          primary: '#FFFDF7',
          muted: '#A89A88',
        },
        success: '#22C55E',
        danger: '#EF4444',
      },
    },
  },
}
```

---

## 3. Typography

- Font: default Next.js (Geist/Inter) sudah cukup — tidak perlu custom font di v1
- Text utama: `text-text-primary`
- Label/kolom header: `text-text-muted`, ukuran lebih kecil (`text-xs` atau `text-sm`), uppercase opsional buat kesan "data terminal"

---

## 4. Component Patterns

### Card / Table Container
```
bg-surface border border-border rounded-lg
```

### Token Badge (BT, SP, ETH, dst)
```
bg-primary text-white font-semibold px-2 py-1 rounded
```

### Table Row
```
border-b border-border py-3 (hover: bg-surface/80)
```

### Change % Indicator
```
Positif: text-success
Negatif: text-danger
```

### Button Primary
```
bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2
```

---

## 5. Mood Reference

Dashboard crypto data-dense (terinspirasi `app.elfa.ai`), dark theme, tapi accent warna oranye hangat sesuai brand — bukan biru/ungu generik yang umum dipakai produk crypto lain. Tujuannya: tetap terasa "serius/data-heavy" tapi punya identitas visual sendiri.

---

## 6. Assets Checklist

| Aset | Status | Lokasi File |
|---|---|---|
| Logo (full) | ✅ Ada | `public/nekosinga-logo.png` |
| Favicon | ⬜ Belum | `app/icon.png` (copy dari logo, Next.js auto-detect nama ini) |
| OG Image | ⬜ Belum | `public/og-image.png` — 1200x630px, buat share link |
| Token icons | ⬜ Belum | `cryptocurrency-icons` (npm) |
| UI icons | ⬜ Belum | `lucide-react` (npm) |

### Cara Pakai Logo di Kode

```tsx
import Image from 'next/image'

<Image src="/nekosinga-logo.png" alt="Neko Singa" width={40} height={40} />
```
