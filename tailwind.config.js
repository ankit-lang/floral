/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './layout/**/*.liquid',
    './sections/**/*.liquid',
    './snippets/**/*.liquid',
    './templates/**/*.liquid',
    './templates/**/*.json',
    './assets/**/*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        primary: { 50:'#e8f5ec', 100:'#c7e8d0', 200:'#a3d9b3', 300:'#6ec490', 400:'#3aad6b', 500:'#0e7040', DEFAULT:'#0e7040', 600:'#0b5c34', 700:'#084828', 800:'#05341c', 900:'#022010' },
        secondary: { 50:'#fdf2f4', 100:'#fce4ea', 200:'#f9c8d4', 300:'#f5a0b5', 400:'#ef6d8e', DEFAULT:'#d15c7e', 500:'#d15c7e', 600:'#b8456a', 700:'#9a3558', 800:'#7c2848', 900:'#5e1d38' },
        cream: '#fdf8f0',
        champagne: '#f7e7ce',
        blush: '#fce4ec',
        sage: '#e8f5e9',
      },
    },
  },
  plugins: [],
}
