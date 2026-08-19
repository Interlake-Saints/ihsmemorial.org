// Eleventy config — migration scaffold (branch: migrate/eleventy).
// Coexists with the Jekyll build: 11ty reads the same _posts/_tabs/_cause content,
// uses its own templates under _11ty/, and outputs to _site-11ty so it never
// collides with Jekyll's _site. Cutover later switches output to _site.

export default function (eleventyConfig) {
  // Static assets and the Decap CMS admin are copied verbatim.
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("admin");

  // Existing content carries Jekyll layout names in front matter. During the
  // walking-skeleton phase every layout resolves to a single minimal base so we
  // can prove URL parity before porting any real design.
  ["post", "page", "category", "classes", "tag", "tags",
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
