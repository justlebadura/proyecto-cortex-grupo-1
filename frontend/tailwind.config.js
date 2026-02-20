/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        keyframes: {
          "liquid-drift": {
            "0%": { transform: "translate(0, 0) rotate(0deg)" },
            "33%": { transform: "translate(30px, -50px) rotate(10deg)" },
            "66%": { transform: "translate(-20px, 20px) rotate(-5deg)" },
            "100%": { transform: "translate(0, 0) rotate(0deg)" },
          },
          "fade-in": {
            "0%": { opacity: "0" },
            "100%": { opacity: "1" },
          },
          "slide-in-from-bottom-2": {
            "0%": { transform: "translateY(10px)", opacity: 0 },
            "100%": { transform: "translateY(0)", opacity: 1 },
          },
          "zoom-in-95": {
            "0%": { opacity: 0, transform: "scale(0.95)" },
            "100%": { opacity: 1, transform: "scale(1)" },
          }
        },
        animation: {
          "liquid-drift": "liquid-drift 20s ease-in-out infinite",
          "fade-in": "fade-in 0.5s ease-out",
          "slide-in-from-bottom-2": "slide-in-from-bottom-2 0.3s ease-out",
        }
      },
    },
    plugins: [
      require("tailwindcss-animate"),
    ],
  }
