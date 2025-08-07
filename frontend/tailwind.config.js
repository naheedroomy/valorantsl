/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        valorant: {
          red: '#FF4655',
          dark: '#0F1923',
          blue: '#00D4FF',
        }
      }
    },
  },
  plugins: [],
}