/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  safelist: [
    'border-emerald-200',
    'border-emerald-500',
    'ring-emerald-200',
    'border-rose-200',
    'border-rose-500',
    'ring-rose-200',
  ],
  plugins: [],
};
