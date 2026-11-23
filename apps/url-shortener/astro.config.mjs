import cloudflare from "@astrojs/cloudflare";
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  adapter: cloudflare({
    imageService: "passthrough",
  }),
  site: process.env.PUBLIC_SITE_URL || "https://url-shortener.suite.local",
});
