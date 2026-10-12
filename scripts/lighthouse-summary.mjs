// Runs Lighthouse (its default mobile profile) against a local production
// server and prints the numbers the forge rebrand's budget is judged on.
//
//   npm run build && npm run start        (leave it running)
//   node scripts/lighthouse-summary.mjs <label> [url]
//
// Reports land in the OS temp dir as lh-<label>.report.{json,html}.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const label = process.argv[2] ?? "run";
const url = process.argv[3] ?? "http://localhost:3000/";
const base = join(tmpdir(), `lh-${label}`);

execFileSync(
  "npx",
  [
    "--yes",
    "lighthouse",
    url,
    "--only-categories=performance,accessibility",
    "--output=json",
    "--output=html",
    `--output-path=${base}`,
    "--chrome-flags=--headless=new",
    "--quiet",
  ],
  { stdio: "inherit" },
);

const report = JSON.parse(readFileSync(`${base}.report.json`, "utf8"));
const audits = report.audits;
const script = audits["resource-summary"].details.items.find(
  (item) => item.resourceType === "script",
);

console.log(
  JSON.stringify(
    {
      label,
      url,
      performance: Math.round(report.categories.performance.score * 100),
      accessibility: Math.round(report.categories.accessibility.score * 100),
      lcp: audits["largest-contentful-paint"].displayValue,
      cls: audits["cumulative-layout-shift"].displayValue,
      tbt: audits["total-blocking-time"].displayValue,
      scriptKB: Math.round((script?.transferSize ?? 0) / 1024),
      report: `${base}.report.html`,
    },
    null,
    2,
  ),
);
