// Global site data, mirrored from Jekyll's _config.yml and _data/. Exposed to
// templates as `site.*` so ported Liquid keeps working.
export default {
  title: "Interlake High School Memorial Wall",
  tagline: "Dedicated to graduates and staff",
  author: "Mario Lanza",
  description:
    "Dedicated to all the IHS graduates and staff who have passed away throughout the years.",
  url: "https://ihsmemorial.org",
  baseurl: "",
  lang: "en-US",
  avatar: "/assets/10609708_672957986115083_7627741849738825230_n.webp",
  img_cdn: "",
  github: { username: "MarioJLanza" },
  twitter: { username: "MarioJLanza" },
  disqus: { comments: true, shortname: "interlake-high-school-memorial-wall" },
  social: {
    name: "Mario Lanza",
    email: "MLanza1974@aol.com",
    links: [
      "https://x.com/MarioJLanza",
      "https://github.com/MarioJLanza",
      "https://www.facebook.com/mariolanza",
    ],
  },
  // Jekyll _data/ equivalents referenced by the templates as site.data.*
  data: {
    contact: [
      { type: "github", icon: "fab fa-github-alt" },
      { type: "twitter", icon: "fab fa-twitter" },
      { type: "email", icon: "fas fa-envelope", noblank: true },
      { type: "rss", icon: "fas fa-rss", noblank: true },
    ],
    label: {
      search_hint: "Search",
      panel: { lastmod: "Recent Updates", trending_tags: "Top Causes", toc: "Contents" },
    },
    rights: {
      license: { name: "CC BY 4.0", link: "https://creativecommons.org/licenses/by/4.0/" },
      brief: "Some rights reserved.",
    },
  },
};
