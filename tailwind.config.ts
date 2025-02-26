import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/shared/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {},
      colors: {
        primary: "#26B893",
        "primary-500": "#4CC1A6",
        "primary-300": "#9EE2D0",
        "primary-100": "#EAFBF6",
        "primary-foreground": "#FAFAFA",

        secondary: "#FF7043",
        "secondary-500": "#FFA069",
        "secondary-foreground": "#FAFAFA",
        paragraph: "#333333",

        muted: "#F0F0F0",
        "muted-foreground": "#1A1A1A",

        accent: "#E8E8E8",
        "accent-foreground": "#1A1A1A",

        "white-1": "#FAFAFA",
        "white-2": "#F0F0F0",
        "white-3": "#E8E8E8",

        "dark-1": "#4A4543",
        "dark-2": "#808080",
        "dark-3": "#4D4D4D",
        "dark-bg": "#292929",
        "dark-icon": "#FFFFFF",
        "dark-text": "#FFFFFF",
        "dark-border": "#00000099",
        "dark-input-bg": "#DADADA33",

        "error-bg": "#FFD9D7",
        "error-text": "#EA8F95",
        "error-accent": "#ff6b6b",
        "error-btn": "#e63946",
        "error-btn-hover": "#ff7b7b",

        "success-bg": "#B5FFCE",
        "success-text": "#43BE83",
        "success-accent": "#66bb6a",
        "success-btn": "#4caf50",
        "success-btn-hover": "#66bb6a",

        "main-heading": "#0F172A",
        "secondary-heading": "#7B878C",

        sidebar: {
          DEFAULT: "white",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "#E8EAEECC",
          ring: "hsl(var(--sidebar-ring))",
          icon: "#CACED8",
        },
      },
      fontSize: {
        "heading1-reg": [
          "36px",
          {
            lineHeight: "140%",
          },
        ],
        "heading1-bold": [
          "36px",
          {
            lineHeight: "140%",
            fontWeight: "700",
          },
        ],
        "heading1-semibold": [
          "36px",
          {
            lineHeight: "140%",
            fontWeight: "600",
          },
        ],
        "heading2-reg": [
          "30px",
          {
            lineHeight: "140%",
          },
        ],
        "heading2-bold": [
          "30px",
          {
            lineHeight: "140%",
            fontWeight: "700",
          },
        ],
        "heading2-semibold": [
          "30px",
          {
            lineHeight: "140%",
            fontWeight: "600",
          },
        ],
        "heading3-reg": [
          "24px",
          {
            lineHeight: "140%",
            fontWeight: "500",
          },
        ],
        "heading3-bold": [
          "24px",
          {
            lineHeight: "140%",
            fontWeight: "700",
          },
        ],
        "heading4-medium": [
          "20px",
          {
            lineHeight: "140%",
            fontWeight: "500",
          },
        ],
        "heading4-light": [
          "21px",
          {
            lineHeight: "140%",
            fontWeight: "400",
          },
        ],
        "body-reg": [
          "18px",
          {
            lineHeight: "140%",
          },
        ],
        "body-bold": [
          "18px",
          {
            lineHeight: "140%",
            fontWeight: "700",
          },
        ],
        "body-semibold": [
          "18px",
          {
            lineHeight: "140%",
            fontWeight: "600",
          },
        ],
        "body-medium": [
          "18px",
          {
            lineHeight: "140%",
            fontWeight: "500",
          },
        ],
        "body-normal": [
          "18px",
          {
            lineHeight: "140%",
            fontWeight: "400",
          },
        ],
        "body1-bold": [
          "18px",
          {
            lineHeight: "140%",
            fontWeight: "700",
          },
        ],
        "base-regular": [
          "16px",
          {
            lineHeight: "140%",
            fontWeight: "400",
          },
        ],
        "base-medium": [
          "16px",
          {
            lineHeight: "140%",
            fontWeight: "500",
          },
        ],
        "base-semibold": [
          "16px",
          {
            lineHeight: "140%",
            fontWeight: "600",
          },
        ],
        "base1-semibold": [
          "16px",
          {
            lineHeight: "140%",
            fontWeight: "700",
          },
        ],
        "small-regular": [
          "14px",
          {
            lineHeight: "140%",
            fontWeight: "400",
          },
        ],
        "small-medium": [
          "14px",
          {
            lineHeight: "140%",
            fontWeight: "500",
          },
        ],
        "small-semibold": [
          "14px",
          {
            lineHeight: "140%",
            fontWeight: "600",
          },
        ],
        "subtle-medium": [
          "12px",
          {
            lineHeight: "16px",
            fontWeight: "500",
          },
        ],
        "subtle-semibold": [
          "12px",
          {
            lineHeight: "16px",
            fontWeight: "600",
          },
        ],
        "tiny-medium": [
          "10px",
          {
            lineHeight: "140%",
            fontWeight: "500",
          },
        ],
        "x-small-semibold": [
          "7px",
          {
            lineHeight: "9.318px",
            fontWeight: "600",
          },
        ],
      },
      shadows: {
        default: "0px 4px 10px rgba(0, 0, 0, 0.25)",
        soft: "0px 2px 6px rgba(0, 0, 0, 0.15)",
        hover: "0px 6px 12px rgba(0, 0, 0, 0.3)",
        inner: "inset 0px 2px 4px rgba(0, 0, 0, 0.4)",
      },
      screens: {
        xs: "400px",
        md: "770px",
        lg: "1030px",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        beat: {
          "0%": {
            transform: "scale(1)",
          },
          "50%": {
            transform: "scale(1.2)",
          },
          "100%": {
            transform: "scale(1)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        beat: "beat 1s infinite",
      },
    },
  },
};
export default config;
