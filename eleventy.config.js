// Eleventy config — migration scaffold (branch: migrate/eleventy).
// Coexists with the Jekyll build: 11ty reads the same _posts/_tabs/_cause content,
// uses its own templates under _11ty/, and outputs to _site-11ty so it never
// collides with Jekyll's _site. Cutover later switches output to _site.

import * as sass from "sass";

export default function (eleventyConfig) {
  // Static assets and the Decap CMS admin are copied verbatim. The stray .scss
  // sources also get copied (harmless); the compiled .css is what pages load.
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("admin");

  // Compile the Chirpy SCSS entrypoints (assets/css/*.scss) the way Jekyll did,
  // resolving @use from _sass/. Partials in _sass are ignored (.eleventyignore).
  // The SCSS entrypoints are also Liquid templates. Substitute the few embedded
  // interpolations before Sass sees them. (tab-count = nav tabs + home.)
  const liquidSubst = (s) =>
    s
      .replace(/\{\{\s*site\.tabs\s*\|\s*size\s*\|\s*plus:\s*1\s*\}\}/g, "10")
      .replace(/\{\{\s*site\.data\.label\.post\.button\.previous\s*\}\}/g, "Older")
      .replace(/\{\{\s*site\.data\.label\.post\.button\.next\s*\}\}/g, "Newer");
  eleventyConfig.addTemplateFormats("scss");
  eleventyConfig.addExtension("scss", {
    outputFileExtension: "css",
    compile: (inputContent) => () =>
      sass.compileString(liquidSubst(inputContent.replace(/^---[\s\S]*?---\n/, "")), {
        loadPaths: ["_sass", "assets/css"],
        style: "compressed",
        quietDeps: true,
        silenceDeprecations: [
          "import", "global-builtin", "color-functions", "legacy-js-api", "slash-div",
        ],
      }).css,
  });

  // Baseurl-aware URL filters (baseurl is ""). Jekyll parity.
  const rel = (p) => {
    const s = String(p == null ? "" : p);
    return s.startsWith("/") || s.includes("://") ? s : "/" + s;
  };
  eleventyConfig.addFilter("relative_url", rel);
  eleventyConfig.addFilter("absolute_url", (p) => {
    const s = String(p == null ? "" : p);
    return s.includes("://") ? s : "https://ihsmemorial.org" + rel(s);
  });

  // Sidebar navigation tabs (navigate: true), ordered like Jekyll.
  eleventyConfig.addCollection("navTabs", (api) =>
    api.getAll()
      .filter((it) => it.data.navigate === true)
      .sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99)));

  // --- Aggregation data model (Jekyll site.posts / site.categories / site.tags) ---
  const isPost = (it) => it.inputPath.includes("/_posts/");
  // Jekyll site.posts: reverse chronological; tie-break newer filename first.
  const byDateDesc = (a, b) =>
    b.date - a.date || (a.inputPath < b.inputPath ? 1 : -1);

  eleventyConfig.addCollection("postsByDate", (api) =>
    api.getAll().filter(isPost).sort(byDateDesc));

  // site.categories[name] -> posts, each list sorted by sortKey (Chirpy).
  eleventyConfig.addCollection("categoriesMap", (api) => {
    const map = {};
    for (const p of api.getAll().filter(isPost))
      for (const c of p.data.categories || []) (map[c] ||= []).push(p);
    for (const c of Object.keys(map))
      map[c].sort((a, b) =>
        String(a.data.sortKey || "").localeCompare(String(b.data.sortKey || "")));
    return map;
  });

  // site.tags[name] -> posts (causes live in the `tags` field), date desc.
  eleventyConfig.addCollection("tagsMap", (api) => {
    const map = {};
    for (const p of api.getAll().filter(isPost).sort(byDateDesc))
      for (const t of p.data.tags || []) (map[t] ||= []).push(p);
    return map;
  });

  // All causes, natural-sorted by name with counts (Jekyll tags layout).
  eleventyConfig.addCollection("trendingTagsAll", (api) => {
    const counts = {};
    for (const p of api.getAll().filter(isPost))
      for (const t of p.data.tags || []) counts[t] = (counts[t] || 0) + 1;
    return Object.keys(counts)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((name) => ({ name, count: counts[name] }));
  });

  // Category names, alphabetical (Jekyll `site.categories | sort`).
  eleventyConfig.addCollection("categoryNames", (api) => {
    const set = new Set();
    for (const p of api.getAll().filter(isPost))
      for (const c of p.data.categories || []) set.add(c);
    return [...set].sort();
  });

  // Panel: Recent Updates = 5 most-recently-modified posts (git lastmod).
  eleventyConfig.addCollection("recentUpdates", (api) =>
    api.getAll().filter(isPost)
      .filter((p) => p.data.last_modified_at)
      .sort((a, b) => (a.data.last_modified_at < b.data.last_modified_at ? 1 : -1))
      .slice(0, 5));

  // Panel: Top Causes = 10 tags by post count (desc), ties broken naturally.
  eleventyConfig.addCollection("trendingTags", (api) => {
    const counts = {};
    for (const p of api.getAll().filter(isPost))
      for (const t of p.data.tags || []) counts[t] = (counts[t] || 0) + 1;
    return Object.keys(counts)
      .sort((a, b) => counts[b] - counts[a] || a.localeCompare(b))
      .slice(0, 10);
  });

  // Match kramdown's typography (smart quotes, -- -> en-dash, ... -> ellipsis)
  // so the rendered obituary prose matches the Jekyll output.
  eleventyConfig.amendLibrary("md", (md) => md.set({ typographer: true }));

  // Jekyll-ism shims that liquidjs lacks.
  // Jekyll's `date: "%b %d, %Y"` -> "Jul 07, 2026". Parse as UTC so a bare
  // YYYY-MM-DD date doesn't shift a day in the local zone.
  eleventyConfig.addFilter("postDate", (d) => {
    const dt = d instanceof Date ? d : new Date(d);
    return dt.toLocaleDateString("en-US", {
      month: "short", day: "2-digit", year: "numeric", timeZone: "UTC",
    });
  });
  // Jekyll's default slugify (used for category/cause hrefs).
  eleventyConfig.addFilter("slugify", (s) =>
    String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
  // Jekyll date_format.post.long = "%b %e, %Y" (day space-padded): "Jul  7, 2026".
  eleventyConfig.addFilter("dateLong", (d) => {
    const dt = d instanceof Date ? d : new Date(d);
    const mon = dt.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
    const day = dt.toLocaleDateString("en-US", { day: "numeric", timeZone: "UTC" });
    return `${mon} ${day.padStart(2, " ")}, ${dt.getUTCFullYear()}`;
  });

  // Prev/next post neighbors in date-desc order. Jekyll: page.previous = older,
  // page.next = newer. In a date-desc list, older is the next index, newer the
  // previous index.
  eleventyConfig.addFilter("postNav", (postsByDate, url) => {
    const i = postsByDate.findIndex((p) => p.url === url);
    return {
      previous: i >= 0 && i + 1 < postsByDate.length ? postsByDate[i + 1] : null, // older
      next: i > 0 ? postsByDate[i - 1] : null, // newer
    };
  });

  // Related posts (Chirpy scoring): tag match = 1, category match = 0.5; take
  // top 3, then fill with the newest remaining posts.
  eleventyConfig.addFilter("relatedPosts", (postsByDate, page) => {
    const myTags = new Set(page.tags || []);
    const myCats = new Set(page.categories || []);
    const scored = [];
    for (const p of postsByDate) {
      if (p.url === page.url) continue;
      let s = 0;
      for (const t of p.data.tags || []) if (myTags.has(t)) s += 1;
      for (const c of p.data.categories || []) if (myCats.has(c)) s += 0.5;
      if (s > 0) scored.push({ p, s });
    }
    scored.sort((a, b) => b.s - a.s);
    const out = scored.slice(0, 3).map((x) => x.p);
    if (out.length < 3) {
      for (const p of postsByDate) {
        if (out.length >= 3) break;
        if (p.url !== page.url && !out.includes(p)) out.push(p);
      }
    }
    return out;
  });

  // All layouts are ported now; only `compress` (a no-op wrapper in Jekyll)
  // maps to a passthrough base.
  eleventyConfig.addLayoutAlias("compress", "base.liquid");

  return {
    dir: {
      input: ".",
      output: "_site-11ty",
      includes: "_11ty/includes",
      layouts: "_11ty/layouts",
      data: "_11ty/data",
    },
    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "liquid",
  };
}
