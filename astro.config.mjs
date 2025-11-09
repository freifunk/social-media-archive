import { defineConfig } from "astro/config";
import { siteConfig } from "./config-loader.mjs";

export default defineConfig({
  // Site customization (loaded from config-loader.mjs)
  // Defaults are in config-loader.mjs
  // Forks can create custom.config.mjs to override defaults
  ...siteConfig,
  
  // ============================================
  // Standard Astro configuration options
  // ============================================
  // site: "https://www.example.com",
  // base: "/",
});
