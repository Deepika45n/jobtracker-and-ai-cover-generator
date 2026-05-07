/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: "var(--bg-primary)",
        surface: "var(--bg-surface)",
        surface2: "var(--bg-surface2)",
        border: "var(--border)",
        textPrimary: "var(--text-primary)",
        textSecondary: "var(--text-secondary)",
        textMuted: "var(--text-muted)",
        accent: "var(--accent)",
        accentLight: "var(--accent-light)",
        success: "var(--green)",
        warning: "var(--amber)",
        danger: "var(--red)",
        info: "var(--blue)",
      }
    },
  },
  plugins: [],
}
