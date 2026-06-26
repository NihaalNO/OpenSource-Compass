import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "lavender-canvas": "var(--color-lavender-canvas)",
        "card-white": "var(--color-card-white)",
        ink: "var(--color-ink)",
        "muted-iris": "var(--color-muted-iris)",
        "border-mist": "var(--color-border-mist)",
        "hover-iris": "var(--color-hover-iris)",
        "soft-blue-wash": "var(--color-soft-blue-wash)",
        "brand-violet": "var(--color-brand-violet)",
        "brand-violet-light": "var(--color-brand-violet-light)",
        "shadow-violet": "var(--color-shadow-violet)",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        }
      },
      borderRadius: {
        lg: "var(--radius-mid)",
        md: "var(--radius-small)",
        sm: "var(--radius-small)",
        "3xl": "var(--radius-cards)"
      },
      boxShadow: {
        xl: "var(--shadow-xl)"
      },
      fontFamily: {
        sans: ["var(--font-thicccboi)"]
      },
      maxWidth: {
        page: "var(--page-max-width)"
      }
    }
  },
  plugins: [tailwindcssAnimate]
};

export default config;
