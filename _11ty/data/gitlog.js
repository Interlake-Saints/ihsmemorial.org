// Replicates _plugins/posts-lastmod-hook.rb: a post gets last_modified_at only
// if it has more than one commit, set to its most recent commit date. One git
// pass builds {postPath: {count, lastmod}} for all of _posts.
import { execSync } from "node:child_process";

function build() {
  let raw;
  try {
    raw = execSync("git log --format=@@%cI --name-only -- _posts", {
      maxBuffer: 1 << 28,
    }).toString();
  } catch {
    return {}; // no git history (shallow/detached) -> no lastmods, feed/panel degrade gracefully
  }
  const map = {};
  let date = null;
  for (const line of raw.split("\n")) {
    if (line.startsWith("@@")) {
      date = line.slice(2);
    } else if (line.startsWith("_posts/") && line.endsWith(".md")) {
      // log is newest-first, so the first date seen for a file is its lastmod.
      const e = (map[line] ||= { count: 0, lastmod: null });
      e.count += 1;
      if (!e.lastmod) e.lastmod = date;
    }
  }
  return map;
}

export default build();
