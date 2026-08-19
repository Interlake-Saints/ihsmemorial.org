// Directory data for _posts. Reproduces Jekyll's `/:categories/:title/` permalink.
// 772 posts have one category (class-of-YYYY or staff); 5 have two, which Jekyll
// joins with "/". fileSlug is the filename minus the YYYY-MM-DD- date prefix.
export default {
  eleventyComputed: {
    permalink: (data) => {
      const cats = (data.categories || []).join("/");
      // Jekyll strips trailing hyphens from the URL slug; fileSlug keeps them
      // (e.g. "paxton-smith-jr-" from a filename ending in a period → hyphen).
      const slug = data.page.fileSlug.replace(/-+$/, "");
      return `/${cats}/${slug}/`;
    },
  },
};
