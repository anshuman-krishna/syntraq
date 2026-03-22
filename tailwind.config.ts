import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

export default <Config>{
  content: [
    './app/**/*.{vue,ts}',
    './shared/**/*.ts',
  ],

  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      colors: {
        sky: {
          pastel: '#a7d8ff',
        },
        mint: {
          DEFAULT: '#b8f2e6',
          light: '#d4f7ef',
        },
        peach: {
          DEFAULT: '#ffd6c9',
          light: '#ffe8e0',
        },
        glass: {
          white: 'rgba(255, 255, 255, 0.08)',
          border: 'rgba(255, 255, 255, 0.12)',
          hover: 'rgba(255, 255, 255, 0.15)',
        },
      },

      backdropBlur: {
        xs: '2px',
        glass: '16px',
        heavy: '32px',
      },

      boxShadow: {
        glass: '0 4px 30px rgba(0, 0, 0, 0.08)',
        'glass-lg': '0 8px 40px rgba(0, 0, 0, 0.12)',
        'glass-inset': 'inset 0 1px 1px rgba(255, 255, 255, 0.1)',
        glow: '0 0 20px rgba(167, 216, 255, 0.3)',
        'glow-mint': '0 0 20px rgba(184, 242, 230, 0.3)',
        'glow-peach': '0 0 20px rgba(255, 214, 201, 0.3)',
      },

      borderRadius: {
        glass: '16px',
        'glass-lg': '24px',
      },

      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },

  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        '.glass-card': {
          background: 'rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
        },
        '.glass-panel': {
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.1)',
        },
        '.glass-navbar': {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 2px 20px rgba(0, 0, 0, 0.06)',
        },
        '.glass-sidebar': {
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        },
        '.glass-input': {
          background: 'rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          transition: 'all 0.2s ease',
          '&:focus': {
            border: '1px solid rgba(167, 216, 255, 0.4)',
            boxShadow: '0 0 0 3px rgba(167, 216, 255, 0.1)',
          },
        },
        '.gradient-mesh': {
          background: 'radial-gradient(at 20% 80%, rgba(167, 216, 255, 0.15) 0%, transparent 50%), radial-gradient(at 80% 20%, rgba(184, 242, 230, 0.12) 0%, transparent 50%), radial-gradient(at 50% 50%, rgba(255, 214, 201, 0.08) 0%, transparent 50%)',
        },
      })
    }),
  ],
}
