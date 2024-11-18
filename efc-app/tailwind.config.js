/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
      },
      colors: {
        common: '#fdfefe',
        uncommon: '#27AE60',
        rare: '#2471A3',
        epic: '#7D3C98',
        legendary: '#f1c40f',
        mythic: '#D35400',
        lightOrange: '#2e1d16',
        strongOrange: '#d45500',
        selectedGreen: '#1b3217',
        oddRow: '#120e0e',
        evenRow: '#2e1d16'
      },
      backgroundImage: {
      },
    },
  },
  themes: [
    {
      extend: {
        colors: {
          common: '#fdfefe',
          uncommon: '#27AE60',
          rare: '#2471A3',
          epic: '#7D3C98',
          legendary: '#f1c40f',
          mythic: '#D35400',
          lightOrange: '#2e1d16'
        },
        backgroundImage: {
        },
      },
    },
  ],
  plugins: [],
};
