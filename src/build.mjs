#!/usr/bin/env node
// Lightweight static-site builder for the Kids Start Page.
// Reads data/links.json + src/styles.css and writes index.html.
// No dependencies — run with: node src/build.mjs

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Escape text for safe insertion into HTML.
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Deterministic pastel color per tile, derived from its title so colors
// stay stable across builds and never need hand-picking.
function colorFor(seed) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const hue = h % 360;
  return { bg: `hsl(${hue} 70% 88%)`, fg: `hsl(${hue} 60% 28%)`, accent: `hsl(${hue} 65% 55%)` };
}

function tile(item) {
  const c = colorFor(item.title);
  return `      <a class="tile" href="${esc(item.url)}" style="--bg:${c.bg};--fg:${c.fg};--accent:${c.accent}"${item.desc ? ` title="${esc(item.desc)}"` : ""}>
        <span class="tile-emoji">${esc(item.emoji || "🔗")}</span>
        <span class="tile-title">${esc(item.title)}</span>
        ${item.desc ? `<span class="tile-desc">${esc(item.desc)}</span>` : ""}
      </a>`;
}

function section(cat) {
  return `    <section class="category">
      <h2><span class="cat-emoji">${esc(cat.emoji || "📁")}</span> ${esc(cat.name)}</h2>
      <div class="grid">
${cat.items.map(tile).join("\n")}
      </div>
    </section>`;
}

const data = JSON.parse(await readFile(join(root, "data", "links.json"), "utf8"));
const css = await readFile(join(root, "src", "styles.css"), "utf8");

const count = data.categories.reduce((n, c) => n + c.items.length, 0);

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(data.title)}</title>
  <meta name="description" content="${esc(data.tagline)}" />
  <style>
${css}
  </style>
</head>
<body>
  <header>
    <h1>${esc(data.title)}</h1>
    <p class="tagline">${esc(data.tagline)}</p>
  </header>
  <main>
${data.categories.map(section).join("\n")}
  </main>
  <footer>
    <p>${count} places to explore · edit <code>data/links.json</code> and run <code>node src/build.mjs</code> to update.</p>
  </footer>
</body>
</html>
`;

await writeFile(join(root, "index.html"), html);
console.log(`Built index.html — ${data.categories.length} categories, ${count} links.`);
