/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        // Venezuelan flag colors
        'vnz-blue': '#0072CE',
        'vnz-red': '#EF3340',
        'vnz-yellow': '#FFD100',
        // Additional custom colors
        'primary': '#0072CE',
        'secondary': '#FFD100',
        'accent': '#EF3340',
        'dark': '#1A1A1A',
        'light': '#F5F5F5',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'heading': ['Montserrat', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}
