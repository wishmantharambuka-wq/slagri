import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        primary: {
          orange: '#F97316',
          green: '#10B981',
          blue: '#3B82F6',
        },
        glass: {
          DEFAULT: 'rgba(255, 255, 255, 0.65)',
          panel: 'rgba(255, 255, 255, 0.85)',
          card: 'rgba(255, 255, 255, 0.60)',
          border: 'rgba(255, 255, 255, 0.40)',
        },
      },
      backgroundImage: {
        'radial-green':
          'radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.08) 0px, transparent 50%)',
        'radial-orange':
          'radial-gradient(at 100% 0%, rgba(249, 115, 22, 0.08) 0px, transparent 50%)',
        'radial-blue':
          'radial-gradient(at 100% 100%, rgba(59, 130, 246, 0.08) 0px, transparent 50%)',
      },
      animation: {
        'fade-in-up': 'fadeIn 0.5s ease-out forwards',
        'slide-in-right': 'slideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'pulse-dot': 'pulse 2s infinite',
        ticker: 'ticker 40s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
      },
      backdropBlur: {
        glass: '20px',
      },
      boxShadow: {
        glass: '0 4px 20px rgba(0, 0, 0, 0.03)',
        'glass-hover': '0 8px 25px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};

export default config;
