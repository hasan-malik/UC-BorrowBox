/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"SF Pro Display"',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        ink: {
          900: '#111111',
          700: '#3a3a3c',
          500: '#6e6e73',
          300: '#c7c7cc',
          200: '#e5e5ea',
          100: '#f2f2f7',
        },
        accent: '#0a84ff',
      },
      borderRadius: {
        ios: '14px',
      },
    },
  },
  plugins: [],
};
