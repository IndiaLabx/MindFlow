/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        // Poppins for English, falling back to Noto Sans Devanagari for mixed content
        poppins: ['Poppins', '"Noto Sans Devanagari"', 'sans-serif'],
        // Specific Hindi font
        hindi: ['"Noto Sans Devanagari"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
