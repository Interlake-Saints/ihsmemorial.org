// Shared helpers for the XML/JSON generators. Plain .js (not a *.11ty.js
// template), so Eleventy imports it without treating it as a page.

const SITE_URL = "https://ihsmemorial.org";
export { SITE_URL };

// The America/Los_Angeles UTC offset (e.g. "-07:00") in effect on a given day.
function pacificOffset(ymd) {
  const noonUTC = new Date(`${ymd}T12:00:00Z`);
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    timeZoneName: "longOffset",
  })
    .formatToParts(noonUTC)
    .find((p) => p.type === "timeZoneName").value; // "GMT-07:00"
  return name.replace("GMT", "") || "+00:00";
}

// Eleventy parses `date: 2026-07-07` as UTC midnight; Jekyll treats it as
// midnight in the site timezone. Reconstruct the Y-M-D and stamp Pacific
// midnight so published dates match Jekyll exactly.
export function pacificMidnight(date) {
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  return `${ymd}T00:00:00${pacificOffset(ymd)}`;
}

// A git ISO date (%cI, already offset-qualified) passed through for feed <updated>.
export function xmlSchema(iso) {
  return iso ? String(iso).trim() : null;
}

export function xmlEscape(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
