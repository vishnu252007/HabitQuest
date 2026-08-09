/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Vibrant blue matching reference image active state
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        surface: {
          sidebar: '#f3f4f6', // Light gray sidebar
          bg: '#f8fafc',      // Main body light background
          card: '#ffffff',    // Crisp white card
          hover: '#f1f5f9',
          border: '#e2e8f0',
        },
        accent: {
          teal: '#0d9488',
          amber: '#d97706',
          rose: '#e11d48',
          emerald: '#059669',
          sky: '#0284c7',
        },
      },
      boxShadow: {
        'subtle-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'subtle-md': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        'subtle-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
