// Directory data for _tabs. Reproduces Jekyll's tab output rules:
//   - permalink ending in "/"        -> directory index (e.g. /comment-policy/)
//   - permalink without trailing "/" -> flat .html      (e.g. /class-of-1982.html)
//   - no permalink                   -> collection default /tabs/:slug/
export default {
  tags: ["tabs"],
  eleventyComputed: {
    permalink: (data) => {
      const p = data.permalink;
      if (!p) return `/tabs/${data.page.fileSlug}/`;
      const abs = p.startsWith("/") ? p : `/${p}`;
      return abs.endsWith("/") ? abs : `${abs}.html`;
    },
  },
};
