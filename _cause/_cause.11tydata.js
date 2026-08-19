// Directory data for _cause. Jekyll output these at /cause/:id/ (directory index).
export default {
  eleventyComputed: {
    permalink: (data) => `/cause/${data.page.fileSlug}/`,
  },
};
