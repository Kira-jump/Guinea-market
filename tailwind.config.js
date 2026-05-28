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
          50:  '#fbf6e7',
          100: '#f6ecc4',
          200: '#eed98c',
          300: '#e5c357',
          400: '#d9ad33',
          500: '#c9982a',
          600: '#a87c20',
          700: '#85601b',
          800: '#5e4413',
          900: '#3a2a0c',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['Jost', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        arabic: ['Amiri', 'serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 24px -6px rgba(217, 173, 51, 0.45)',
        'emerald-glow': '0 0 24px -6px rgba(16, 185, 129, 0.45)',
        'card-dark': '0 10px 40px -12px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'radial-fade': 'radial-gradient(ellipse at top, rgba(29,42,82,0.45), transparent 60%)',
        'gold-shine': 'linear-gradient(135deg, #f6ecc4 0%, #d9ad33 50%, #a87c20 100%)',
      },
    },
  },
  plugins: [],
}
