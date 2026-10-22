export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary, #007DDC)",
          50: "#f0f8ff",
          100: "#e0f0fe",
          200: "#b9e1fd",
          300: "#7cc7fc",
          400: "#36a8f8",
          500: "#007DDC",
          600: "#006bbd",
          700: "#005599",
          800: "#04487e",
          900: "#093c68",
        },
        dark: {
          DEFAULT: "var(--color-dark, #2C2C2C)",
          50: "#f6f6f6",
          100: "#e7e7e7",
          200: "#d1d1d1",
          300: "#b0b0b0",
          400: "#888888",
          500: "#6d6d6d",
          600: "#5d5d5d",
          700: "#4f4f4f",
          800: "#2C2C2C",
          900: "#1f1f1f",
        },
        surface: {
          DEFAULT: "var(--color-surface, #FFFFFF)",
          alt: "var(--color-surface-alt, #F9FAFB)",
        },
        border: "var(--color-border, #E5E7EB)",
      },
      fontFamily: {
        sans: ["'Fira Sans'", "sans-serif"],
        fira: ["'Fira Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
}
