# lou-say-web

Simple Vite + React static site scaffold. Content is read from `lou-say-web/content/` (inside the project) and compiled into `public/data.json` by `scripts/build-data.js`.

Quick start

```bash
cd f:/lou-says/lou-say-web
npm install
npm run build-data
npm run dev
```

Notes
Place your `.md` and `.docx` files under `lou-say-web/content/` (e.g. `f:/lou-says/lou-say-web/content/`) following the described structure. This folder will be part of your Cloudflare Pages deployment.
