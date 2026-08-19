#!/usr/bin/env bash
# URL parity: build the Eleventy site and diff its output paths against the
# Jekyll baseline (docs/url-baseline-exact.txt). Green = same set of URLs.
set -euo pipefail
cd "$(dirname "$0")/.."

# Eleventy does not prune stale output; clean so the diff reflects only this build.
rm -rf _site-11ty
npx @11ty/eleventy --quiet

( cd _site-11ty && find . -name "*.html" | sed 's|^\.||' | sort ) > /tmp/url-11ty-exact.txt

base=docs/url-baseline-exact.txt
new=/tmp/url-11ty-exact.txt
missing=$(comm -23 "$base" "$new" | wc -l | tr -d ' ')
extra=$(comm -13 "$base" "$new" | wc -l | tr -d ' ')

echo "baseline (Jekyll): $(wc -l < "$base" | tr -d ' ')   eleventy: $(wc -l < "$new" | tr -d ' ')"
echo "MISSING from 11ty: $missing    EXTRA in 11ty: $extra"
echo
echo "--- MISSING (in Jekyll, not yet in 11ty) ---"
comm -23 "$base" "$new" | sed 's|/[^/]*$|/*|' | sort | uniq -c | sort -rn | head -20
echo
echo "--- EXTRA (in 11ty, not in Jekyll) ---"
comm -13 "$base" "$new" | sed 's|/[^/]*$|/*|' | sort | uniq -c | sort -rn | head -20

[ "$missing" -eq 0 ] && [ "$extra" -eq 0 ] && echo && echo "URL PARITY: GREEN"
exit 0
