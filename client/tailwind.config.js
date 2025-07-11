module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        muniPro: {
          "primary": "#1D4ED8",
          "secondary": "#0E7AEF", 
          "accent": "#E0EFFF",
          "neutral": "#2E2E3A",
          "base-100": "#F6F9FF",
        }
      }
    ]
  }
};