import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// SPA with /host and /display routes. Vite dev + preview both fall back to
// index.html for unknown paths, so BrowserRouter routes work on full reload.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
