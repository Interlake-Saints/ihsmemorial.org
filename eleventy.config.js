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

  // `post` and `default` are now real ported layouts. Aggregation layouts stay
  // aliased to the minimal base until slice 3.
  ["page", "category", "classes", "tag", "tags", "home", "categories", "archives", "compress"]
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
