// Eleventy config — migration scaffold (branch: migrate/eleventy).
// Coexists with the Jekyll build: 11ty reads the same _posts/_tabs/_cause content,
// uses its own templates under _11ty/, and outputs to _site-11ty so it never
// collides with Jekyll's _site. Cutover later switches output to _site.

export default function (eleventyConfig) {
  // Static assets and the Decap CMS admin are copied verbatim.
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("admin");

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

  // Layouts still in the walking-skeleton phase resolve to the minimal base.
  // `post` is now a real ported layout (_11ty/layouts/post.liquid), so it is
  // no longer aliased here.
  ["page", "category", "classes", "tag", "tags",
   "home", "categories", "archives", "default", "compress"]
    .forEach((name) => eleventyConfig.addLayoutAlias(name, "base.liquid"));

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
