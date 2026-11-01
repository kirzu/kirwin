/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      colors: {
        /* SKBT palette — recoloured to the brand logo:
         * brand = royal blue (#0048ad), sage = graphite/silver greys
         * (#585858 / #d8d8d8), terracotta = cool slate. */
        brand: {
          50: "#eef4fb",
          100: "#d9e6f7",
          200: "#b6cef0",
          300: "#86ade6",
          400: "#4f84d8",
          500: "#2463c4",
          600: "#0048ad",
          700: "#003d92",
          800: "#003176",
          900: "#002a63",
          950: "#001a3d",
        },
        sage: {
          50: "#f7f7f7",
          100: "#eeeeee",
          200: "#e0e0e0",
          300: "#cfcfcf",
          400: "#adadad",
          500: "#8a8a8a",
          600: "#6b6b6b",
          700: "#585858",
          800: "#454545",
          900: "#333333",
          950: "#1f1f1f",
        },
        terracotta: {
          50: "#f2f5f9",
          100: "#e4eaf2",
          200: "#c9d5e5",
          300: "#a3b8d1",
          400: "#7a97bb",
          500: "#5a7aa3",
          600: "#46638a",
          700: "#3a5170",
          800: "#33455e",
          900: "#2d3b4f",
          950: "#1c2530",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(40px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "scale-in": "scale-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "slide-in-right": "slide-in-right 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
