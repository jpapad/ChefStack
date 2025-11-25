/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./KitchenInterface.tsx",
    "./RecipeForm.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Manrope', 'sans-serif'],
      },
      colors: {
        'brand-yellow': '#FBBF24',
        'brand-dark': '#1F2937',
        'brand-primary': '#FBBF24',
        'brand-secondary': '#1F2937',
        'light-bg': '#F3F4F6',
        'light-card': '#FFFFFF',
        'light-text-primary': '#111827',
        'light-text-secondary': '#4B5563',
        'dark-bg': '#111827',
        'dark-card': '#1F2937',
        'dark-text-primary': '#F9FAFB',
        'dark-text-secondary': '#9CA3AF',
      },
      boxShadow: {
        'aura-yellow': '0 0 0 3px rgba(251, 191, 36, 0.4)',
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'lift': '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
        'glow-yellow': '0 0 20px rgba(251, 191, 36, 0.3)',
      },
    },
  },
  plugins: [],
}
