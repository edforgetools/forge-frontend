import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
      },
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontSize: {
        xs: "var(--font-size-xs)",
        sm: "var(--font-size-sm)",
        base: "var(--font-size-base)",
        lg: "var(--font-size-lg)",
        xl: "var(--font-size-xl)",
        "2xl": "var(--font-size-2xl)",
        "3xl": "var(--font-size-3xl)",
        "4xl": "var(--font-size-4xl)",
        "5xl": "var(--font-size-5xl)",
        "6xl": "var(--font-size-6xl)",
      },
      lineHeight: {
        tight: "var(--line-height-tight)",
        snug: "var(--line-height-snug)",
        normal: "var(--line-height-normal)",
        relaxed: "var(--line-height-relaxed)",
        loose: "var(--line-height-loose)",
      },
      spacing: {
        "0": "var(--space-0)",
        "1": "var(--space-1)",
        "2": "var(--space-2)",
        "3": "var(--space-3)",
        "4": "var(--space-4)",
        "5": "var(--space-5)",
        "6": "var(--space-6)",
        "8": "var(--space-8)",
        "10": "var(--space-10)",
        "12": "var(--space-12)",
        "16": "var(--space-16)",
        "20": "var(--space-20)",
        "24": "var(--space-24)",
        "32": "var(--space-32)",
      },
      fontWeight: {
        light: "var(--font-weight-light)",
        normal: "var(--font-weight-normal)",
        medium: "var(--font-weight-medium)",
        semibold: "var(--font-weight-semibold)",
        bold: "var(--font-weight-bold)",
      },
      colors: {
        // Neutral palette from design tokens
        neutral: {
          50: "rgb(var(--color-neutral-50))",
          100: "rgb(var(--color-neutral-100))",
          200: "rgb(var(--color-neutral-200))",
          300: "rgb(var(--color-neutral-300))",
          400: "rgb(var(--color-neutral-400))",
          500: "rgb(var(--color-neutral-500))",
          600: "rgb(var(--color-neutral-600))",
          700: "rgb(var(--color-neutral-700))",
          800: "rgb(var(--color-neutral-800))",
          900: "rgb(var(--color-neutral-900))",
          950: "rgb(var(--color-neutral-950))",
        },
        // Semantic colors
        background: "rgb(var(--color-background))",
        foreground: "rgb(var(--color-text-primary))",
        surface: "rgb(var(--color-surface))",
        "surface-elevated": "rgb(var(--color-surface-elevated))",
        border: "rgb(var(--color-border))",
        "border-subtle": "rgb(var(--color-border-subtle))",
        "border-strong": "rgb(var(--color-border-strong))",
        // Interactive colors
        interactive: "rgb(var(--color-interactive))",
        "interactive-hover": "rgb(var(--color-interactive-hover))",
        "interactive-active": "rgb(var(--color-interactive-active))",
        "interactive-disabled": "rgb(var(--color-interactive-disabled))",
        // Text colors
        "text-primary": "rgb(var(--color-text-primary))",
        "text-secondary": "rgb(var(--color-text-secondary))",
        "text-tertiary": "rgb(var(--color-text-tertiary))",
        "text-disabled": "rgb(var(--color-text-disabled))",
        // Status colors
        success: "rgb(var(--color-success))",
        "success-foreground": "rgb(var(--color-success-foreground))",
        warning: "rgb(var(--color-warning))",
        "warning-foreground": "rgb(var(--color-warning-foreground))",
        error: "rgb(var(--color-error))",
        "error-foreground": "rgb(var(--color-error-foreground))",
        info: "rgb(var(--color-info))",
        "info-foreground": "rgb(var(--color-info-foreground))",
        // Brand colors
        forge: "#0EA5E9",
        // Legacy shadcn colors for compatibility
        primary: {
          DEFAULT: "rgb(var(--color-interactive))",
          foreground: "rgb(var(--color-surface-elevated))",
        },
        secondary: {
          DEFAULT: "rgb(var(--color-surface))",
          foreground: "rgb(var(--color-text-primary))",
        },
        destructive: {
          DEFAULT: "rgb(var(--color-error))",
          foreground: "rgb(var(--color-error-foreground))",
        },
        muted: {
          DEFAULT: "rgb(var(--color-surface))",
          foreground: "rgb(var(--color-text-secondary))",
        },
        accent: {
          DEFAULT: "rgb(var(--color-surface))",
          foreground: "rgb(var(--color-text-primary))",
        },
        popover: {
          DEFAULT: "rgb(var(--color-surface-elevated))",
          foreground: "rgb(var(--color-text-primary))",
        },
        card: {
          DEFAULT: "rgb(var(--color-surface-elevated))",
          foreground: "rgb(var(--color-text-primary))",
        },
        input: "rgb(var(--color-border))",
        ring: "rgb(var(--color-interactive))",
      },
      borderRadius: {
        none: "var(--radius-none)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "3xl": "var(--radius-3xl)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
      zIndex: {
        base: "var(--z-base)",
        dropdown: "var(--z-dropdown)",
        sticky: "var(--z-sticky)",
        fixed: "var(--z-fixed)",
        "modal-backdrop": "var(--z-modal-backdrop)",
        modal: "var(--z-modal)",
        popover: "var(--z-popover)",
        tooltip: "var(--z-tooltip)",
        toast: "var(--z-toast)",
      },
      transitionDuration: {
        fast: "var(--transition-fast)",
        normal: "var(--transition-normal)",
        slow: "var(--transition-slow)",
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
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-in-up": "fade-in-up 0.5s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "bounce-in": "bounce-in 0.6s ease-out",
      },
    },
  },
  plugins: [import("tailwindcss-animate")],
} satisfies Config;
