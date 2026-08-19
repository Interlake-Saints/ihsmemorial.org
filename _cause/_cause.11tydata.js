// Directory data for _cause. Jekyll output these at /cause/:id/ (directory index).
export default {
  tags: ["causes"],
  eleventyComputed: {
    permalink: (data) => `/cause/${data.page.fileSlug}/`,
  },
};
