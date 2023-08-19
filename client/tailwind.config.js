/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      minWidth: {
        50: '50%'
      }
    }
  },
  plugins: []
}
