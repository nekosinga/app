/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
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
  plugins: [],
};
