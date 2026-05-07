import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE } from "@/config/site";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return rss({
    title: `${SITE.name} — Blog`,
    description:
      "Notes from the team building CloudoX — cloud discovery, AWS architecture understanding, and AI you can trust.",
    site: context.site ?? SITE.url,
    items: posts
      .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
      .map((post) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        link: `/blog/${post.id}/`,
      })),
  });
}
