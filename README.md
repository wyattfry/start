# Kids Start Page

A "home page" for kids' browsers — a [Poki](https://poki.com)-style grid of
colorful tiles linking to fun, edifying websites: game-making, learning, math,
stories, art, history and activity ideas.

Static site, no framework, **zero dependencies**. Hosts free on GitHub Pages,
Cloudflare Pages, or any static host.

## Update the links

1. Edit `data/links.json` — add/remove categories or items. Each item:
   ```json
   { "title": "Scratch", "url": "https://scratch.mit.edu/", "emoji": "🐱", "desc": "Make games with blocks." }
   ```
2. Rebuild:
   ```sh
   node src/build.mjs   # or: npm run build
   ```
   This regenerates `index.html`. Tile colors are picked automatically from each
   title — no CSS or HTML editing needed.

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
- `src/build.mjs` — the build script
- `src/styles.css` — styling
- `index.html` — generated output (do not edit by hand)
