import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0a0f',
        'bg-secondary': '#12121a',
        'bg-card': '#1a1a24',
        'text-primary': '#ffffff',
        'text-secondary': '#a0a0b0',
        'neon-pink': '#ff2d95',
        'neon-blue': '#00d4ff',
        'neon-cyan': '#00ffd4',
        'neon-purple': '#a855f7',
      },
    },
  },
  plugins: [],
};

export default config;
