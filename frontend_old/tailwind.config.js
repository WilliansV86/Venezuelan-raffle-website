/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'anton': ['Anton', 'sans-serif'],
        'sans': ['Inter', 'sans-serif'],
        'heading': ['Anton', 'sans-serif'],
      },
      colors: {
        'vnz-yellow': '#FCD116',
        'vnz-blue': '#003893',
        'vnz-red': '#CE1126',
        'primary': '#0072CE',
        'secondary': '#FFD100',
        'accent': '#EF3340',
        'dark': '#1A1A1A',
        'light': '#F5F5F5',
      },

      animation: {
        'bounce-slow': 'bounce 2s infinite',
      },
    },
  },
  plugins: [],
};
