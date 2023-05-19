/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite-react/**/*.js"
  ],
  theme: {
    extend: {
      textGradientColors: {
        'yellow-red-pink': 'linear-gradient(90deg, #f6e05e, #ef4444, #f472b6)',
      },
    },
    fontSize: {
      xs: '0.6rem',
      sm: '1rem',
      base: '1rem',
      xl: '1.25rem',
      '2xl': '1.563rem',
      '3xl': '1.953rem',
      '4xl': '2.441rem',
      '5xl': '3.052rem',
    },
    screens: {
      'sm': { 'min': '320px', 'max': '639px' },     // Phones (portrait)
      'md': { 'min': '640px', 'max': '767px' },     // Phones (landscape) / Tablets (portrait)
      'lg': { 'min': '768px', 'max': '1023px' },    // Tablets (landscape) / Laptops
      'xl': { 'min': '1024px', 'max': '1279px' },   // Desktops (sm)
      '2xl': { 'min': '1280px', 'max': '1535px' },  // Desktops (md)
      '3xl': { 'min': '1536px' },
      'nv': { 'min': '640', 'max': '1536' }                   // Wide Boi (lg)
    },
    fontFamily: {
      darumadrop: ['"DarumadropOne"', 'sans-serif'],
    },
  },
  plugins: [
    require('flowbite/plugin')
  ]
}
