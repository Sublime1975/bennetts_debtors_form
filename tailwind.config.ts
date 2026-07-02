import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#C9863F",
          light: "#E3B679",
        },
        bg: "#141413",
        surface: "#1C1B19",
        ink: "#FAFAF8",
        muted: "#A8A29E",
      },
      fontFamily: {
        display: ["var(--font-lora)", "serif"],
        body: ["var(--font-poppins)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
