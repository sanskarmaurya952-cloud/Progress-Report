/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        uplivo: {
          bg: '#0f0f14',
          surface: '#1a1a24',
          card: '#22222e',
          border: '#2d2d3d',
          primary: '#7c5cfc',
          'primary-hover': '#6a4de6',
          'primary-light': '#9b82fc',
          accent: '#5eead4',
          text: '#e8e8ed',
          'text-secondary': '#9898a8',
          'text-muted': '#6b6b7b',
          success: '#4ade80',
          warning: '#fbbf24',
          error: '#f87171',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
