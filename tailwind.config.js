/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['"Noto Kufi Arabic"', 'system-ui', 'sans-serif'],
        display: ['"Cinzel"', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        mystery: {
          950: '#08080f',
          900: '#0d0d18',
          800: '#141425',
          700: '#1d1d35',
          600: '#282848',
          500: '#353560',
          400: '#4a4a78',
          300: '#6b6ba0',
        },
        blood: {
          900: '#4a0d12',
          800: '#6b131a',
          700: '#8c1a24',
          600: '#a8202d',
          500: '#c4283a',
          400: '#d94050',
          300: '#e86678',
        },
        moon: {
          900: '#1a2332',
          800: '#243650',
          700: '#2f4a6e',
          600: '#3d6090',
          500: '#4d7ab0',
          400: '#6a96c8',
          300: '#8db4db',
          200: '#b3d0e8',
          100: '#d6e8f5',
        },
        gold: {
          900: '#4a3a0d',
          800: '#6b5215',
          700: '#8c6e1f',
          600: '#a8852b',
          500: '#c49a38',
          400: '#d9b250',
          300: '#e8c970',
        },
        forest: {
          800: '#0d2818',
          700: '#143d24',
          600: '#1c5232',
          500: '#2a6b45',
        },
        ash: {
          700: '#2a2a3a',
          600: '#3a3a50',
          500: '#4a4a66',
          400: '#6a6a88',
          300: '#8a8aaa',
          200: '#aaaac8',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'fade-in-down': 'fadeInDown 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px 0 rgba(196, 154, 56, 0.3)' },
          '50%': { boxShadow: '0 0 40px 5px rgba(196, 154, 56, 0.5)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      },
      backgroundImage: {
        'mystery-radial': 'radial-gradient(ellipse at top, #1d1d35 0%, #08080f 60%)',
        'blood-radial': 'radial-gradient(ellipse at bottom, #4a0d12 0%, #08080f 60%)',
        'gold-gradient': 'linear-gradient(135deg, #a8852b 0%, #d9b250 50%, #a8852b 100%)',
      },
    },
  },
  plugins: [],
};
