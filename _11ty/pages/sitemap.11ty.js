// Sitemap at /sitemap.xml, replacing jekyll-sitemap. Lists all HTML pages
// (posts, causes, tabs, home, pagination) with a lastmod.
import { SITE_URL, pacificMidnight, xmlSchema, xmlEscape } from "../_lib/util.js";

export default class {
  data() {
    return { permalink: "/sitemap.xml", eleventyExcludeFromCollections: true };
  }

  render({ collections }) {
    const buildIso = new Date().toISOString();
    const seen = new Set();
    const urls = [];
    // Jekyll lists pages by their extensionless URL (/class-of-1974, not .html).
    const loc = (u) => SITE_URL + u.replace(/\.html$/, "");

    // Posts carry a real published/modified date.
    for (const p of collections.postsByDate) {
      seen.add(p.url);
      const lastmod = xmlSchema(p.data.last_modified_at) || pacificMidnight(p.date);
      urls.push({ loc: loc(p.url), lastmod });
    }
    // Every other rendered HTML page (tabs, causes, home). 404 is excluded.
    for (const p of collections.all) {
      if (!p.url || seen.has(p.url)) continue;
      if (!/(\/|\.html)$/.test(p.url)) continue; // skip xml/json/txt outputs
      if (p.url === "/404.html") continue;
      seen.add(p.url);
      urls.push({ loc: loc(p.url), lastmod: buildIso });
    }
    // Home pagination pages (/page2..N/) are not in collections.all here, so
    // derive them from the post count (25/page, matching index.html).
    const totalPages = Math.ceil(collections.postsByDate.length / 25);
    for (let i = 2; i <= totalPages; i++) {
      const u = `/page${i}/`;
      if (seen.has(u)) continue;
      seen.add(u);
      urls.push({ loc: SITE_URL + u, lastmod: buildIso });
    }

    const body = urls
      .map((u) => `<url><loc>${xmlEscape(u.loc)}</loc><lastmod>${u.lastmod}</lastmod></url>`)
      .join("\n");
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;
  }
}
