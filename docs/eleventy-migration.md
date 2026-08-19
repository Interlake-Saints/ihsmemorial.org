# Eleventy migration plan

Branch: `migrate/eleventy`. Goal: replace the Jekyll build with Eleventy (11ty) while keeping every URL, the Decap CMS, and the content files exactly as they are. This doc is the source of truth for scope and sequencing.

## Why Eleventy (recap)

11ty runs Liquid natively, consumes the same `_posts/*.md` front matter, and leaves Decap CMS untouched. It's the lowest-effort target off Jekyll. Build drops from ~100s to ~10-20s. See `docs/ssg-scope.md` for the full comparison.

## Guardrails (non-negotiable)

1. **URL parity.** Every path in `docs/url-baseline.txt` (905 URLs, captured from the Jekyll `_site`) must still exist, byte-for-byte on the path. This includes the flat-vs-directory distinction: class pages are flat (`/class-of-1982.html` served at `/class-of-1982`), posts and causes are directory-index (trailing slash).
2. **Decap CMS unchanged.** Same `_posts/`, `_tabs/`, `_cause/` folders, same field names, same `media_folder: /assets`. `admin/` is copied through untouched.
3. **Front-matter contract unchanged:** `layout, title, sortKey, date, dateUnknown, author, categories, tags, images[], gender, obituary` + body.

## Feature manifest (decided 2026-08-19)

### Cut — provably dead

| Feature | Evidence |
|---|---|
| Syntax highlighting (Rouge) | 0 posts contain code blocks |
| Mermaid | 0 posts |
| Table of contents | 0 posts have markdown headings; always rendered empty |
| jekyll-redirect-from | 0 content uses it; only outputs were `/assets/` and `/norobots/` 404 guards |
| Light theme | Already removed upstream in this repo (dark-only) |

### Cut — by decision

| Feature | Note |
|---|---|
| PWA / offline service worker | Remove `app.js`, `sw.js`, `assets/js/data/cache-list.js` and the SW registration. Negligible benefit. |

### Keep

- Post pages (777), class pages (`class-of-YYYY` + `staff`), decade "classes" pages, causes (used by 395 posts)
- Images + lazy-load (746 posts), obituary links (303)
- Home, archives, categories, tags listing pages
- Client-side search (topbar + generated `search.json` index)
- Disqus comments
- Post/sidebar extras: prev/next nav, recently-updated list, social share, related posts
- RSS feed (already hardened), sitemap, SEO meta

## Parity strategy: three tiers (answering "does content diff too?")

Full byte-for-byte HTML diff is the wrong bar. We're deliberately cutting features and re-porting templates, and the markdown processor changes (kramdown → markdown-it), so a raw HTML diff would be nearly all noise and would fight the simplification. Instead:

1. **URL parity** — `bin/parity-check.sh`. Same set of output paths, exact (flat `.html` vs directory index preserved). Cheap, deterministic, the go/no-go gate. *Status: 872/905; gap is pagination (31) + 2 trivial redirect guards.*

2. **Content-data parity** (the valuable one — replaces manually eyeballing 777 obituaries). Not HTML diff. For each page, extract only the data that must be preserved and diff old vs new:
   - person name (h1/title)
   - obituary body **text** (tags stripped, whitespace normalized)
   - image basenames referenced
   - obituary URL, cause/tag links, date, class
   This tolerates markup/design churn while catching the regressions that actually matter: a truncated obituary, a dropped image, a mangled name (the class of bug behind the "Beckie" feed break), a wrong date or class. Runs once real templates render (slice 2+).
   *Caveat:* kramdown vs markdown-it differ on smart quotes and entity encoding, so compare normalized text and keep a small allowlist of legitimate encoding differences.

3. **Full visual/HTML diff** — deliberately skipped. Covered instead by tier 2 plus a browser spot-check of a representative sample (a person, a class page, a cause page, home, archives).

## URL / permalink map

| Content | Source | Output form | Permalink rule |
|---|---|---|---|
| Person | `_posts/YYYY-MM-DD-slug.md` | `/cat/slug/` (dir index) | `/{categories joined by /}/{fileSlug}/` — 5 posts have 2 categories |
| Cause | `_cause/*.md` | `/cause/id/` (dir index) | `/cause/{fileSlug}/` |
| Class page | `_tabs/class-of-YYYY.md` | `/class-of-YYYY.html` (flat) | preserve flat `.html` |
| Staff page | `_tabs/staff.md` | `/staff.html` (flat) | preserve flat |
| Special tabs | `_tabs/{about,archives,categories,tags}.md` | under `/tabs/...` | match Jekyll tab output |
| Home | `index.html` | `/` | `/` |
| 404 | `404.html` | `/404.html` | flat |

The parity harness (`bin/parity-check.sh`) is the arbiter: it builds 11ty and diffs output paths against the baseline. Permalinks get iterated until the diff is empty.

## Template surface to port

Layout chain (Jekyll): `compress -> default -> page -> {post, category, classes, tags, tag, archives, home, categories}`. 7-9 layouts, roughly half the 22 includes survive the cuts.

## Port sequence (each slice ends green on parity + visual spot-check)

1. **Walking skeleton (parity first).** ✅ Done. Scaffold, permalinks for all file-backed pages, minimal base. URL parity 872/905 (gap = pagination + 2 redirect guards), zero spurious pages.
2. **Post page.** ✅ Done (aggregation-dependent widgets deferred to slice 3). `post.liquid` chains through a ported `default` shell: head (favicons, per-layout CSS/JS selectors, SEO subset), sidebar (avatar, nav from the `navTabs` collection, contact links), topbar (breadcrumb + search box), footer, Disqus, license line. SCSS is compiled by dart-sass via an 11ty extension (`@use` resolves from `_sass/`, embedded Liquid values substituted), output matches Jekyll's CSS byte sizes. Filter shims added: `relative_url`, `absolute_url`, `postDate`, `slugify`. **Both parity checks green: URL 872/905, content 0/772 mismatches.** Visual A/B against the live page confirms the post body/sidebar/topbar/footer/Disqus match. Deferred to slice 3 (all need the posts collection): right panel (Recent Updates + Top Causes), related posts (Further Reading), prev/next nav, trending-tags in search panel.
3. **Aggregation pages.** category (class listings), classes (decade), causes/tags, categories index, archives, home. These are the Liquid loops that need custom filters/globals shimmed.
4. **Search + feed + sitemap.** Regenerate `search.json`, port `feed.xml`, sitemap.
5. **Extras.** prev/next, related, recently-updated, social share, Disqus, lazy-load.
6. **CI + cutover.** Swap the Actions build step to 11ty, output to `_site`, verify parity against a fresh Jekyll build one last time, flip.

## Jekyll-isms that need 11ty shims

Custom filters/globals liquidjs lacks: `absolute_url`, `relative_url`, `date_to_xmlschema`, `slugify`, `jsonify`, `where`, `group_by`, `site.*` globals, the `paginator` object, and the `{% seo %}` tag (hand-port to head meta). Collected as we hit them in slices 2-4.
