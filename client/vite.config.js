import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Sayt manzili: https://byhojiakbar.pages.dev/ (Cloudflare Pages, ildiz yo'li "/")
export default defineConfig({
  plugins: [react()],
  base: "/",
});
