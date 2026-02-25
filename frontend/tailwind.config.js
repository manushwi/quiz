/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f5f3ef',
          100: '#e8e4da',
          200: '#d4cdb8',
          300: '#b8ae94',
          400: '#9a8e6d',
          500: '#7d7050',
          600: '#635843',
          700: '#4a4133',
          800: '#2e2820',
          900: '#1a1710',
          950: '#0d0c08',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        }
      }
    }
  },
  plugins: []
}
