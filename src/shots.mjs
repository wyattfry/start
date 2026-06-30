#!/usr/bin/env node
// Capture a screenshot of every linked page into shots/<slug>.png using
// headless Chrome. Zero npm deps — relies on a local Chrome/Chromium binary.
// Run with: node src/shots.mjs   (or: npm run shots)
//
// Screenshots are committed to the repo so the Pages build needs no browser.
// Set CHROME_BIN to override the auto-detected binary.

import { readFile, mkdir, access, mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { constants } from "node:fs";
import { root, slug, flatten } from "./lib.mjs";

const run = promisify(execFile);

const CANDIDATES = [
  process.env.CHROME_BIN,
  "google-chrome-stable",
  "google-chrome",
  "chromium",
  "chromium-browser",
].filter(Boolean);

async function findChrome() {
  for (const bin of CANDIDATES) {
    try {
      await run(bin, ["--version"]);
      return bin;
    } catch {}
  }
  throw new Error(
    "No Chrome/Chromium found. Install Google Chrome or set CHROME_BIN to a browser binary."
  );
}

const exists = (p) =>
  access(p, constants.F_OK).then(() => true).catch(() => false);

const force = process.argv.includes("--force");

const chrome = await findChrome();
const data = JSON.parse(await readFile(join(root, "data", "links.json"), "utf8"));
const items = flatten(data);
const shotsDir = join(root, "shots");
await mkdir(shotsDir, { recursive: true });

let captured = 0;
let skipped = 0;
let failed = 0;

// Sequential on purpose — kinder to the machine and the remote sites.
for (const item of items) {
  const out = join(shotsDir, `${slug(item.title)}.png`);
  if (!force && (await exists(out))) {
    skipped++;
    continue;
  }
  // Unique profile dir per capture — otherwise a fresh Chrome attaches to an
  // already-running instance sharing the default profile and --screenshot
  // silently no-ops.
  const profile = await mkdtemp(join(tmpdir(), "kids-shot-"));
  try {
    await run(
      chrome,
      [
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--hide-scrollbars",
        "--force-color-profile=srgb",
        `--user-data-dir=${profile}`,
        // Some sites serve a blank/blocked page to the default headless UA.
        "--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "--window-size=1280,800",
        "--virtual-time-budget=15000",
        `--screenshot=${out}`,
        item.url,
      ],
      { timeout: 45000 }
    );
    if (!(await exists(out))) throw new Error("no screenshot produced");
    captured++;
    console.log(`📸 ${item.title}`);
  } catch (err) {
    failed++;
    console.warn(`⚠️  ${item.title} — ${err.message.split("\n")[0]}`);
  } finally {
    await rm(profile, { recursive: true, force: true });
  }
}

console.log(
  `Done. captured=${captured} skipped(existing)=${skipped} failed=${failed}. Use --force to recapture all.`
);
