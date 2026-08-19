// Atom feed at /feed.xml — the 5 newest posts. Replaces the Jekyll feed.xml
// template (carrying forward its XML-escaping fix). All interpolated values are
// escaped.
import { SITE_URL, pacificMidnight, xmlSchema, xmlEscape } from "../_lib/util.js";

export default class {
  data() {
    return { permalink: "/feed.xml", eleventyExcludeFromCollections: true };
  }

  render({ collections }) {
    const author = "Mario Lanza";
    const now = new Date().toISOString();
    const entries = collections.postsByDate
      .slice(0, 5)
      .map((p) => {
        const url = SITE_URL + p.url;
        const published = pacificMidnight(p.date);
        const updated = xmlSchema(p.data.last_modified_at) || published;
        const summary = (p.data.summary
          ? String(p.data.summary)
          : (p.templateContent || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 400)
        ).trim();
        const cats = (p.data.categories || [])
          .map((c) => `<category term="${xmlEscape(c)}" />`)
          .join("");
        return `<entry><title>${xmlEscape(p.data.title)}</title><link href="${xmlEscape(url)}" rel="alternate" type="text/html" title="${xmlEscape(p.data.title)}" /><published>${published}</published><updated>${updated}</updated><id>${xmlEscape(url)}</id><content src="${xmlEscape(url)}" /><author><name>${xmlEscape(author)}</name></author>${cats}<summary>${xmlEscape(summary)}</summary></entry>`;
      })
      .join("");

    return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom"><id>${SITE_URL}/</id><title>Interlake High School Memorial Wall</title><subtitle>Dedicated to all the IHS graduates and staff who have passed away throughout the years.</subtitle><updated>${now}</updated><author><name>${xmlEscape(author)}</name><uri>${SITE_URL}/</uri></author><link rel="self" type="application/atom+xml" href="${SITE_URL}/feed.xml"/><link rel="alternate" type="text/html" hreflang="en-US" href="${SITE_URL}/"/><rights> © ${new Date().getFullYear()} ${xmlEscape(author)} </rights><icon>/assets/img/favicons/favicon.ico</icon><logo>/assets/img/favicons/favicon-96x96.png</logo>${entries}</feed>`;
  }
}
