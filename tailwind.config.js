/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          50: 'var(--text-primary)',
          100: 'var(--text-primary)',
          200: 'var(--text-primary)',
          300: 'var(--text-primary)',
          400: 'var(--text-secondary)',
          500: 'var(--text-muted)',
          600: 'var(--text-dim)',
          700: 'var(--bg-surface-alt)',
          800: 'var(--bg-surface)',
          900: 'var(--bg-surface)',
          950: 'var(--bg-primary)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          light: 'var(--accent-light)',
          dark: 'var(--accent-dark)',
          glow: 'var(--accent-glow)',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        glow: 'var(--shadow-glow)',
        'glow-sm': '0 0 10px var(--accent-glow)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
};
