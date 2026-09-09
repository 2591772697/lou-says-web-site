# lou-say-web

Simple Vite + React static site scaffold. Content is read from `lou-say-web/content/` (inside the project) and compiled into `public/data.json` by `scripts/build-data.js`.

Quick start

```bash
cd E:/lou-says-website/lou-says-web-site/lou-say-web
npm install
npm run dev          # 自动监听 content/ 变化并重建 data.json，同时启动 vite 开发服务器
```

Production build (runs build-data automatically):

```bash
npm run build        # 生成 public/data.json + dist/
npm run preview      # 本地预览构建产物
```

Notes

- Place your `.md` and `.docx` files under `lou-say-web/content/`, organised by folder. The folder structure maps directly to site categories (e.g. `content/经部/易类/2026-01-01-乾卦解读.md` → category `经部/易类`). Both first-level folders (e.g. `儒家/`) and nested folders (e.g. `经部/易类/`) display their articles.
- File name format: `YYYY-MM-DD-文章标题.md` / `.docx` (date is derived from the file name).
- Optional frontmatter in `.md` files: `title`, `date`, `category`, `excerpt`, `tags` (array).
- If the same article exists as both `.md` and `.docx` in one folder, only the `.md` version is used (the `.docx` stays on disk untouched). Change `PREFERRED_EXT` in `scripts/build-data.js` to prefer `.docx` instead.
- `public/data.json` is generated and gitignored — it is rebuilt on every deploy/build.
