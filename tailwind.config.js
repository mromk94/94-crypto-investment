module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  safelist: [
    'bg-ton', 'bg-sui', 'bg-accent',
    'from-ton/30', 'via-sui/20', 'to-accent/10',
    'text-ton', 'text-sui', 'text-accent',
    'filter', 'blur-3xl', 'blur-2xl', 'blur-xl', 'blur-lg', 'blur', 'blur-sm', 'blur-none'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a2233',
        accent: '#00ffe7',
        ton: '#0098ea',
        sui: '#6e56ff',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
