module.exports = {
  content: ['./index.html', './src/**/*.{vue,ts,js}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['Space Grotesk', 'sans-serif']
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
}
