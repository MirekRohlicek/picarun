import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent:    '#FF6A4A',
        bg:        '#0F1226',
        panel:     '#2E3251',
        secondary: '#5A5F7E',
        cream:     '#FCF8F4',
      },
    },
  },
  plugins: [],
} satisfies Config;
