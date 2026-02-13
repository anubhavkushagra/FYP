/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0EA5E9', // Sky Blue
        'primary-dark': '#0284C7',
        secondary: '#14B8A6', // Teal
        surface: '#F8FAFC',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      maxWidth: {
        '3xl': '48rem',
        '4xl': '56rem', // Adjusted for chat width
      }
    },
  },
  plugins: [],
}

