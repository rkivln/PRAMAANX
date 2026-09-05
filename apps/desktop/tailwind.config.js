/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          dark: '#0B2942',
          DEFAULT: '#123B63',
          mid: '#1E5A8A',
          light: '#2E6FA0',
        },
        saffron: '#FF9933',
        gov: {
          green: '#138808',
          'green-pale': '#E6F4E6',
          rejected: '#B42318',
          'rejected-pale': '#FDECEA',
          review: '#C47A00',
          'review-pale': '#FFF3D6',
        },
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
};
