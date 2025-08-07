/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        secondary: '#1a1a1a',
        accent: '#ffffff',
        muted: '#666666',
      }
    },
  },
  plugins: [],
}