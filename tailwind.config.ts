import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontSize: {
        xs: "12px",
        sm: "13px",
        base: "15px",
        lg: "17px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "28px",
        "4xl": "32px",
        "5xl": "36px",
        "6xl": "40px",
      },
      lineHeight: {
        xs: "1.4",
        sm: "1.4",
        base: "1.5",
        lg: "1.5",
        xl: "1.4",
        "2xl": "1.3",
        "3xl": "1.2",
        "4xl": "1.1",
        "5xl": "1.1",
        "6xl": "1",
      },
      zIndex: {
        base: "var(--z-base)",
        header: "var(--z-header)",
        toolbar: "var(--z-toolbar)",
        popover: "var(--z-popover)",
        sheet: "var(--z-sheet)",
        dialog: "var(--z-dialog)",
        toast: "var(--z-toast)",
      },
    },
  },
  plugins: [],
} satisfies Config;
