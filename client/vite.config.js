import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages manzili: https://javohir877.github.io/byhojiakbar-portfolio/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/byhojiakbar-portfolio/" : "/",
}));
