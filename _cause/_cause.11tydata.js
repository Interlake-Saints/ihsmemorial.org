// Directory data for _cause. Jekyll output these at /cause/:id/ (directory index).
// layout/breadcrumb come from _config.yml defaults (not front matter) in Jekyll.
export default {
  layout: "tag",
  breadcrumb: [{ label: "Home", url: "/" }],
  eleventyComputed: {
    permalink: (data) => `/cause/${data.page.fileSlug}/`,
  },
};
