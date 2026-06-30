#!/usr/bin/env node
// Lightweight static-site builder for the Kids Start Page.
// Reads data/links.json + src/styles.css and writes index.html.
// No dependencies — run with: node src/build.mjs

import { readFile, writeFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import { root, slug, flatten } from "./lib.mjs";

// Escape text for safe insertion into HTML.
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Deterministic pastel color per tile, derived from its title so colors
// stay stable across builds and never need hand-picking.
function colorFor(seed) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const hue = h % 360;
  return { bg: `hsl(${hue} 70% 90%)`, fg: `hsl(${hue} 60% 26%)`, accent: `hsl(${hue} 65% 52%)` };
}

const exists = (p) =>
  access(p, constants.F_OK).then(() => true).catch(() => false);

async function tile(item) {
  const c = colorFor(item.title);
  const shot = `shots/${slug(item.title)}.png`;
  const hasShot = await exists(join(root, shot));
  const thumb = hasShot
    ? `<span class="tile-shot" style="background-image:url('${esc(shot)}')"></span>`
    : `<span class="tile-shot tile-shot--placeholder"><span class="tile-emoji">${esc(item.emoji || "🔗")}</span></span>`;
  return `      <a class="tile" href="${esc(item.url)}" style="--bg:${c.bg};--fg:${c.fg};--accent:${c.accent}"${
    item.desc ? ` title="${esc(item.desc)}"` : ""
  }>
        ${thumb}
        <span class="tile-badge">${esc(item.categoryEmoji || "📁")} ${esc(item.category)}</span>
        <span class="tile-body">
          <span class="tile-title">${esc(item.emoji || "🔗")} ${esc(item.title)}</span>
          ${item.desc ? `<span class="tile-desc">${esc(item.desc)}</span>` : ""}
        </span>
      </a>`;
}

const data = JSON.parse(await readFile(join(root, "data", "links.json"), "utf8"));
const css = await readFile(join(root, "src", "styles.css"), "utf8");
const items = flatten(data);
const tiles = (await Promise.all(items.map(tile))).join("\n");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(data.title)}</title>
  <meta name="description" content="${esc(data.tagline || data.title)}" />
  <style>
${css}
  </style>
</head>
<body>
  <header>
    <h1>${esc(data.title)}</h1>
  </header>
  <main>
    <div class="grid">
${tiles}
    </div>
  </main>
  <footer>
    <p>${items.length} places to explore · edit <code>data/links.json</code>, then run <code>npm run shots</code> &amp; <code>npm run build</code>.</p>
  </footer>
</body>
</html>
`;

await writeFile(join(root, "index.html"), html);
console.log(`Built index.html — ${items.length} links.`);
