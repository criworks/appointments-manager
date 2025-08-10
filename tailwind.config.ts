import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        background: "var(--background)", // Background general
        foreground: "var(--foreground)", // Texto principal
        card: "var(--card)", // Fondo Cards, panels
        "card-foreground": "var(--card-foreground)", // Texto sobre cards
        popover: "var(--popover)", // Fondo Popover
        "popover-foreground": "var(--popover-foreground)", // Texto sobre popover
        primary: "var(--primary)", // Botones, enlaces
        "primary-foreground": "var(--primary-foreground)", // Texto sobre botones
        secondary: "var(--secondary)", // Grises secundarios
        "secondary-foreground": "var(--secondary-foreground)", // Texto sobre grises secundarios
        muted: "var(--muted)", // Grises activos
        "muted-foreground": "var(--muted-foreground)", // Texto sobre grises activos y secundarios
        accent: "var(--accent)", // Por definir
        "accent-foreground": "var(--accent-foreground)", // Por definir
        destructive: "var(--destructive)", // Fondo para errores y destrutivos
        "destructive-foreground": "var(--destructive-foreground)", // Texto sobre errores y destrutivos
        border: "var(--border)", // Borde de los elementos
        input: "var(--input)", // Fondo de los inputs
        ring: "var(--ring)", // Borde de los inputs
        chart1: "var(--chart-1)",
        chart2: "var(--chart-2)",
        chart3: "var(--chart-3)",
        chart4: "var(--chart-4)",
        chart5: "var(--chart-5)",
      },
      borderRadius: {
        xs: "calc(var(--radius) * 0.6)",   // ≈ 6px
        sm: "calc(var(--radius) * 1.2)",   // ≈ 12px
        md: "calc(var(--radius) * 1.6)",   // ≈ 16px
        lg: "calc(var(--radius) * 3)",     // ≈ 30px
        DEFAULT: "var(--radius)",          // 10px base
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'], // var(--font-sans) Viene definido en layout.tsx
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
}

export default config