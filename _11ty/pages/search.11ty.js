// Generates the Simple-Jekyll-Search index at /assets/js/data/search.json,
// replacing the Jekyll Liquid template of the same path.
export default class {
  data() {
    return {
      permalink: "/assets/js/data/search.json",
      eleventyExcludeFromCollections: true,
    };
  }

  render({ collections }) {
    const items = collections.postsByDate.map((p) => ({
      title: p.data.title || "",
      url: p.url,
      categories: (p.data.categories || []).join(", "),
      tags: (p.data.tags || []).join(", "),
      date: String(p.data.date || ""),
      snippet: (p.templateContent || "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 300),
    }));
    return JSON.stringify(items);
  }
}
