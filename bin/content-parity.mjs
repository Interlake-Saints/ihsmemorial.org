// Tier-2 parity: for every person page, extract the data that MUST be preserved
// (name, obituary body text, image files, obituary URL, causes) from the Jekyll
// baseline and the Eleventy build, and diff. Tolerates markup/design churn;
// catches truncated obituaries, dropped images, mangled names, wrong causes.
// Run the Eleventy build first (bin/parity-check.sh or `npm run build`).
import fs from "node:fs";

const BASE = "_site";
const NEW = "_site-11ty";

const urls = fs
  .readFileSync("docs/url-baseline-exact.txt", "utf8")
  .split("\n")
  .filter((u) => /^\/(class-of-\d+|staff)\/[^/]+\/index\.html$/.test(u));

// Normalize away differences that don't matter: smart quotes/dashes, common
// HTML entities (kramdown vs markdown-it), and whitespace.
function norm(s) {
  return s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    // kramdown collapses hyphen runs to en/em dashes; markdown-it leaves them
    // literal. The prose words are identical either way, so treat any dash run
    // (ascii or unicode) as one hyphen for the text-equality check.
    .replace(/[-–—]+/g, "-")
    .replace(/&#39;|&rsquo;|&lsquo;|&apos;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&hellip;|…/g, "...")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
const strip = (s) => s.replace(/<[^>]+>/g, " ");

function extract(html) {
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || "";
  const pcm = html.match(/class="post-content"[^>]*>([\s\S]*?)<div class="post-tail/);
  const pc = pcm ? pcm[1] : "";
  const images = [...pc.matchAll(/<img[^>]*src="([^"]+)"/g)]
    .map((m) => m[1].split("/").pop())
    .sort();
  const obituary = (pc.match(/obituary can be found\s*<a href="([^"]+)"/) || [])[1] || "";
  const body = norm(strip(pc));
  // Scope causes to the post's own post-tags block (not the sidebar's global list).
  const tagsBlock = (html.match(/<div class="post-tags">([\s\S]*?)<\/div>/) || ["", ""])[1];
  const causes = [
    ...new Set(
      [...tagsBlock.matchAll(/class="post-tag[^"]*"[^>]*>([\s\S]*?)<\/a>/g)].map((m) =>
        norm(strip(m[1])),
      ),
    ),
  ].sort();
  return { name: norm(strip(h1)), body, images, obituary, causes };
}

const mismatches = [];
for (const u of urls) {
  if (!fs.existsSync(NEW + u)) {
    mismatches.push({ u, why: "missing-in-11ty" });
    continue;
  }
  const a = extract(fs.readFileSync(BASE + u, "utf8"));
  const b = extract(fs.readFileSync(NEW + u, "utf8"));
  const diffs = [];
  if (a.name !== b.name) diffs.push("name");
  if (a.body !== b.body) diffs.push("body");
  if (a.images.join("|") !== b.images.join("|")) diffs.push("images");
  if (a.obituary !== b.obituary) diffs.push("obituary");
  if (a.causes.join("|") !== b.causes.join("|")) diffs.push("causes");
  if (diffs.length) mismatches.push({ u, diffs, a, b });
}

console.log(`person pages checked: ${urls.length}`);
console.log(`mismatches: ${mismatches.length}`);
const byField = {};
for (const m of mismatches) for (const d of m.diffs || [m.why]) byField[d] = (byField[d] || 0) + 1;
console.log("by field:", JSON.stringify(byField));
for (const m of mismatches.slice(0, 6)) {
  console.log("\n---", m.u, m.diffs || m.why);
  if (m.a)
    for (const d of m.diffs) {
      console.log(`  [${d}] jekyll:`, JSON.stringify(m.a[d]).slice(0, 220));
      console.log(`  [${d}] 11ty:  `, JSON.stringify(m.b[d]).slice(0, 220));
    }
}
process.exit(mismatches.length ? 1 : 0);
