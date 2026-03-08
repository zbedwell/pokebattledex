/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Montserrat", "sans-serif"],
        body: ["Source Sans 3", "sans-serif"],
      },
      colors: {
        slatebg: "#f5f7fb",
        ink: "#1b2433",
        card: "#ffffff",
        accent: "#e63946",
        accentDark: "#b71f2a",
      },
      boxShadow: {
        card: "0 12px 32px rgba(18, 35, 64, 0.08)",
      },
    },
  },
  plugins: [],
};
