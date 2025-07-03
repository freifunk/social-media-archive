import { defineConfig } from "astro/config";

import preact from "@astrojs/preact";

// https://astro.build/config
export default defineConfig({
  site: "https://sandraastro.netlify.app/",
  integrations: [preact()]
});

export async function getStaticPaths() {
  const allPosts = await getCollection('blog');
  const postsPerPage = 2;
  const totalPages = Math.ceil(allPosts.length / postsPerPage);

  return Array.from({ length: totalPages }).map((_, i) => ({
    params: { page: String(i + 1) },
  }));
}
