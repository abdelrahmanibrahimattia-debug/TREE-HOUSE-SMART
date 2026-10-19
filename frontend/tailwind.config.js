/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tree: {
          green: '#4E8732',
          'green-dark': '#43792B',
          'green-light': '#6BA84B',
          'green-subtle': '#F2F8EE',
          brown: '#3D2817',
          'brown-dark': '#2E1E11',
          'brown-light': '#5A3E26',
        }
      },
      fontFamily: {
        sans: ['Cairo', 'Segoe UI', 'Tahoma', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
