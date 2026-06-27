/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#040712',
          900: '#070d1c',
          800: '#0c142b',
          700: '#131c3d',
          600: '#1d2a52',
          500: '#283668',
          400: '#3a487f',
          300: '#5b6aa3',
          200: '#8a96c2',
          100: '#c4cbe0',
        },
        gold: {
          50:  '#f9f9f9',
          100: '#f0f0f0',
          200: '#d9d9d9',
          300: '#c0c0c0',
          400: '#a0a0a0',
          500: '#808080',
          600: '#636363',
          700: '#4a4a4a',
          800: '#333333',
          900: '#1a1a1a',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['Jost', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        arabic: ['Amiri',', 'serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 24px -6px rgba(160, 160, 160, 0.45)',
        'emerald-glow': '0 0 24px -6px rgba(16, 185, 129, 0.45)',
        'card-dark': '0 10px 40px -12px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'radial-fade': 'radial-gradient(ellipse at top, rgba(29,42,82,0.45), transparent 60%)',
        'gold-shine': 'linear-gradient(135deg, #f0f0f0 0%, #a0a0a0 50%, #636363 100%)',
      },
    },
  },
  plugins: [],
}
