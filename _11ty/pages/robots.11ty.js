import { SITE_URL } from "../_lib/util.js";

export default class {
  data() {
    return { permalink: "/robots.txt", eleventyExcludeFromCollections: true };
  }
  render() {
    return `User-agent: *

Disallow: /norobots/

Sitemap: ${SITE_URL}/sitemap.xml`;
  }
}
