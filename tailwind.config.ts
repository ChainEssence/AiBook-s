import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f4ff',
          500: '#6366f1',
          600: '#5b5bd6',
          700: '#4c4ab8',
        },
        muted: '#64748b',
      },
      maxWidth: {
        'prose': '72ch',
        'container': '1200px',
      },
      spacing: {
        '18': '4.5rem',
      }
    },
  },
  plugins: [],
}
export default config

