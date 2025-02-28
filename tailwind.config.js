/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'red-bg': 'url("../public/rbc-bg.jpg")',
      },
      // that is animation class
      animation: {
        fadeout: 'fadeOut 1s ease-in-out forwards',
        fadein: 'fadeIn 1s ease-in-out forwards',
      },

      // that is actual animation
      keyframes: theme => ({
        fadeOut: {
          '0%': { opacity: 1 },
          '100%': { opacity: 0, display: 'none' },
        },
        fadeIn: {
          '0%': { opacity: 0, display: 'flex' },
          '100%': { opacity: 1},
        },
      }),
    },
  },
  plugins: [],
}
