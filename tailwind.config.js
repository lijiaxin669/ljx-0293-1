/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,vue}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        festival: {
          red: '#D72638',
          'red-dark': '#B71C2C',
          'red-light': '#E84A5F',
          gold: '#F4D03F',
          'gold-dark': '#D4AC0D',
          'gold-light': '#F9E79F',
          ink: '#2C3E50',
          paper: '#ECF0F1',
          'paper-dark': '#D5DBDB',
          receive: '#27AE60',
          send: '#E74C3C',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px rgba(215, 38, 56, 0.1)',
        'card-hover': '0 8px 30px rgba(215, 38, 56, 0.15)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
