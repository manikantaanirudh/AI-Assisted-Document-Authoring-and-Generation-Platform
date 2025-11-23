/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium black/white palette
        'charcoal': '#1A1A1A',
        'matte-black': '#0D0D0D',
        'silver': '#C0C0C0',
        'soft-silver': '#E8E8E8',
        'dark-gray': '#2A2A2A',
        'light-gray': '#F5F5F5',
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-1': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '800' }],
        'display-2': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-3': ['2.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '700' }],
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(to bottom, #000000, #0D0D0D, #000000)',
        'gradient-soft': 'linear-gradient(to bottom, #000000, #1A1A1A, #000000)',
      },
      boxShadow: {
        'glow-sm': '0 0 20px rgba(255, 255, 255, 0.06)',
        'glow-md': '0 0 30px rgba(255, 255, 255, 0.08)',
        'glow-lg': '0 0 40px rgba(255, 255, 255, 0.1)',
        'glow-xl': '0 0 60px rgba(255, 255, 255, 0.12)',
        'glow-hover': '0 0 20px rgba(255, 255, 255, 0.3)',
        'inner-glow': 'inset 0 0 20px rgba(255, 255, 255, 0.05)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'fadeIn': 'fadeIn 0.6s ease-in-out',
        'fadeInUp': 'fadeInUp 0.6s ease-out',
        'softGlow': 'softGlow 2s ease-in-out infinite alternate',
        'slowPulse': 'slowPulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
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
        softGlow: {
          '0%': { boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)' },
          '100%': { boxShadow: '0 0 40px rgba(255, 255, 255, 0.2)' },
        },
        slowPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      transitionProperty: {
        'glow': 'box-shadow, transform',
      },
    },
  },
  plugins: [],
}
