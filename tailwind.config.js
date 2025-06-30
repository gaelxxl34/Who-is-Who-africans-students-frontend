/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          600: "#0284c7", // blue-600
          700: "#0369a1", // blue-700
        },
      },
      screens: {
        xs: "480px", // Add a custom breakpoint for extra small screens
      },
    },
  },
  plugins: [],
};
