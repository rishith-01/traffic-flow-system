/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        shell: "#09111f",
        ink: "#eff3ff",
        accent: "#4de6b1",
        alert: "#ff7657",
        gold: "#ffbf5f",
        cyan: "#67d4ff",
        asphalt: "#18253a",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.06), 0 16px 40px rgba(15, 27, 46, 0.42)",
      },
      backgroundImage: {
        "road-grid":
          "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Sora'", "sans-serif"],
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        pulseSoft: "pulseSoft 2.6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: 0.72 },
          "50%": { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};

