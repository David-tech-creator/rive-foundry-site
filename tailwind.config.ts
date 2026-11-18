import type { Config } from "tailwindcss"

/*
 * Dark only. One palette, shared with lib/site.ts (SITE.colors), the OG images
 * and the particle shaders:
 *   ink      #1F1E22  page background
 *   surface  #26252A  raised surfaces (inputs, image wells)
 *   text     #EDEDEF
 *   muted    #8B8A92
 *   line     rgba(255,255,255,.08) hairlines
 *   azure    #007FFF single accent, azure-light #4DA3FF for glow
 *
 * The shadcn token names (background, foreground, border, ...) are kept and
 * mapped onto the same palette so components/ui still render correctly.
 */
const config = {
  darkMode: ["class"],
  content: ["./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#1F1E22",
        surface: "#26252A",
        text: "#EDEDEF",
        line: "rgba(255,255,255,0.08)",
        azure: { DEFAULT: "#007FFF", light: "#4DA3FF" },

        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
