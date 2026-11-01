import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        bdgreen: "#006a4e",
        bdred: "#f42a41",
      },
            fontFamily: {
        sans: ['SolaimanLipi', 'Arial', 'sans-serif'],
        heading: ['SolaimanLipi', 'Arial', 'sans-serif'],
        hind: ['SolaimanLipi', 'Arial', 'sans-serif'],
        body: ['SolaimanLipi', 'Arial', 'sans-serif'],
        solaiman: ['SolaimanLipi', 'Arial', 'sans-serif'],
        bangla: ['SolaimanLipi', 'Arial', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['13px', { lineHeight: '18px' }],
        'xs': ['15px', { lineHeight: '22px' }],
        'sm': ['17px', { lineHeight: '25px' }],
        'base': ['19px', { lineHeight: '28px' }],
        'lg': ['21px', { lineHeight: '30px' }],
        'xl': ['24px', { lineHeight: '32px' }],
        '2xl': ['28px', { lineHeight: '36px' }],
        '3xl': ['34px', { lineHeight: '42px' }],
        '4xl': ['40px', { lineHeight: '48px' }],
        '5xl': ['52px', { lineHeight: '60px' }],
      },
    },
  },
  plugins: [],
};
export default config;
