/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        solana: {
          purple: '#9945FF',
          green: '#14F195',
          dark: '#0e0f12',
          card: '#16181d',
          border: '#262932',
          muted: '#808a9d'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
