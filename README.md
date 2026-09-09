# 国学读书分享（lou-says）

🌐 网站地址：https://lou-says.pages.dev/

「罢黜百家，独尊娄术」——一个以娄家学问为核心的国学读书分享网站。

## 项目结构

```
lou-says-web-site/
└── lou-say-web/          # 站点代码（Cloudflare Pages 的根目录）
    ├── content/          # 文章目录：按文件夹分类存放 .md / .docx / .doc
    ├── scripts/
    │   └── build-data.js # 构建时扫描 content/，生成 public/data.json
    ├── src/              # React 前端源码
    └── public/           # 静态资源 + _redirects（SPA 回退）
```

## 本地开发

```bash
cd E:/lou-says-website/lou-says-web-site/lou-say-web
npm install
npm run dev          # 自动监听 content/ 变化并重建数据，同时启动开发服务器
```

生产构建：

```bash
npm run build        # 生成 public/data.json + dist/
npm run preview      # 本地预览构建产物
```

## 文章维护

- 文章放在 `lou-say-web/content/` 下，文件夹结构即网站分类，一级、二级目录都可以放文章
  （例如 `content/经部/易类/2026-01-01-乾卦解读.md` → 分类 `经部/易类`）
- 文件名格式：`YYYY-MM-DD-文章标题.扩展名`（日期取自文件名）
- 支持格式：`.md` / `.docx` / `.doc`（老式 Word 格式）
- 同名多格式视为同一篇文章，优先级 `.md` > `.docx` > `.doc`，其余文件原样保留不删除
- Word 文档顶部以文字形式粘贴的 frontmatter（title / date / category / tags）会被自动识别、从正文剥离并用作元数据
- `.md` 文件支持 YAML frontmatter：`title`、`date`、`category`、`excerpt`、`tags`
- `public/data.json` 由构建脚本生成，已 gitignore，每次部署自动重建

## 站点功能

- 侧栏分类树：可折叠、自动展开当前分类、显示各分类文章数
- 文章详情页：自动生成目录（TOC）并高亮当前阅读位置、上一篇/下一篇、返回上一页
- 全站宋体 / 新宋体字体
- 设置页（`/settings`）：白天 / 黑夜 / 跟随系统三种主题；字号滑杆 80%～160% 连续调节
- 偏好保存在浏览器 localStorage，刷新不丢失

## 部署（Cloudflare Pages）

- 框架预设：无
- 构建命令：`npm run build`
- 构建输出目录：`dist`
- 根目录：`/lou-say-web`

推送 main 分支后 Cloudflare 会自动构建部署。

## 许可证

本项目采用 [MIT License](./LICENSE) 开源。
