/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#F5F3EE', // Off-white
        primary: '#E8E4DD',    // Paper
        accent: '#E63B2E',     // Signal Red
        dark: '#111111',       // Black
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        drama: ['"DM Serif Display"', 'serif'],
        data: ['"Space Mono"', 'monospace'],
        sans: ['"Space Grotesk"', 'sans-serif'], // defaulting sans to heading font for brutalist look
      }
    },
  },
  plugins: [],
}
