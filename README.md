# Kids Start Page

A "home page" for kids' browsers — a [Poki](https://poki.com)-style grid of
colorful tiles linking to fun, edifying websites: game-making, learning, math,
stories, art, history and activity ideas.

Static site, no framework, **zero npm dependencies**. Each card shows a live
screenshot of the site plus a category badge. Hosts free on GitHub Pages,
Cloudflare Pages, or any static host.

## Update the links

1. Edit `data/links.json` — add/remove categories or items. The category
   becomes a badge on each card. Each item:
   ```json
   { "title": "Scratch", "url": "https://scratch.mit.edu/", "emoji": "🐱", "desc": "Make games with blocks." }
   ```
2. Capture screenshots for any new links (uses your local Chrome, headless):
   ```sh
   npm run shots          # only captures links missing a screenshot
   npm run shots -- --force   # recapture everything
   ```
   Screenshots land in `shots/<slug>.png` and are committed to the repo, so the
   site needs no browser at deploy time. Set `CHROME_BIN` to point at a specific
   browser binary if auto-detection fails.
3. Rebuild:
   ```sh
   node src/build.mjs   # or: npm run build
   ```
   This regenerates `index.html`. Card colors are derived from each title —
   no CSS or HTML editing needed. Links without a screenshot fall back to an
   emoji tile.

## Preview locally

```sh
npm run build
python3 -m http.server   # then open http://localhost:8000
```

## Deploy

`.github/workflows/pages.yml` builds and deploys to GitHub Pages on every push
to `main`. Enable it once under **Settings → Pages → Source: GitHub Actions**.

To use it as a browser home page: set this site's URL as your startup page,
Home button, or first bookmark.

## Layout

- `data/links.json` — the content (the only file you normally edit)
- `src/shots.mjs` — headless-Chrome screenshot capture
- `src/build.mjs` — the build script
- `src/lib.mjs` — shared helpers (slug, flatten)
- `src/styles.css` — styling
- `shots/` — generated screenshots (committed)
- `index.html` — generated output (do not edit by hand)
