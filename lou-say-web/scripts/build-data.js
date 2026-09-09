const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')
const MarkdownIt = require('markdown-it')
const mammoth = require('mammoth')
const WordExtractor = require('word-extractor')

const md = new MarkdownIt({ html: true })
const wordExtractor = new WordExtractor()

// 同一目录下同名多格式文件视为同一篇文章，优先保留的格式
const PREFERRED_EXT = '.md'

// 格式优先级：.md > .docx > .doc（用于同 basename 多格式去重）
function rankExt(ext){
  if (ext === PREFERRED_EXT) return 3
  if (ext === '.docx') return 2
  if (ext === '.doc') return 1
  return 0
}

function walkDir(dir, baseDir = dir){
  let results = []
  const list = fs.readdirSync(dir)
  list.forEach((item) => {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      results = results.concat(walkDir(fullPath, baseDir))
    } else {
      const ext = path.extname(item).toLowerCase()
      if (ext === '.md' || ext === '.docx' || ext === '.doc') {
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/')
        const category = path.dirname(relativePath)
        results.push({
          filePath: fullPath,
          relPath: relativePath,
          ext,
          category: category === '.' ? '' : category
        })
      }
    }
  })
  return results
}

// 同一目录下同名多格式（.md/.docx/.doc）视为同一篇文章，按格式优先级去重
function dedupeFormats(entries){
  const seen = new Map()  // relPath 去扩展名 -> entry
  const kept = []
  const skipped = []
  for (const entry of entries) {
    const key = entry.relPath.replace(/\.[^.]+$/, '')
    const existing = seen.get(key)
    if (!existing) {
      seen.set(key, entry)
      kept.push(entry)
      continue
    }
    if (rankExt(entry.ext) > rankExt(existing.ext)) {
      kept[kept.indexOf(existing)] = entry
      seen.set(key, entry)
      skipped.push(existing.relPath)
    } else {
      skipped.push(entry.relPath)
    }
  }
  return { kept, skipped }
}

function parseFileName(fileName){
  const nameWithoutExt = path.basename(fileName, path.extname(fileName))
  const parts = nameWithoutExt.split('-')
  if(parts.length >= 4){
    const date = parts.slice(0,3).join('-')
    const title = parts.slice(3).join('-')
    return { date, title }
  }
  return { date: '1970-01-01', title: nameWithoutExt }
}

// frontmatter 的 date 会被 YAML 解析成 Date 对象，统一转回 YYYY-MM-DD 字符串
function normalizeDate(d){
  if (d instanceof Date && !isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  if (typeof d === 'string') return d.slice(0, 10)
  return d
}

// 从 Word 文档转换的 HTML 开头提取并剥离混入正文的 frontmatter 段落。
// md 转 Word 时，frontmatter 常被当作 4 个加粗段落粘贴在文档开头：
//   <p><strong>title：xxx</strong></p><p><strong>date：xxx</strong></p>...
// 识别出至少 3 个字段才视为 frontmatter，避免误删正文。
function extractDocxFrontmatter(html){
  const fm = {}
  let out = html
  const fieldRe = /^\s*<p[^>]*>\s*(?:<strong>)?\s*(title|date|category|tags)\s*[:：]\s*([^<]*?)\s*(?:<\/strong>)?\s*<\/p>/i
  // 连续剥离开头符合字段格式的段落
  for (;;) {
    const m = out.match(fieldRe)
    if (!m) break
    const key = m[1].toLowerCase()
    const val = m[2].trim()
    if (key === 'tags') {
      fm.tags = val.replace(/^\[|\]$/g, '').split(/[,，]/).map((s) => s.trim()).filter(Boolean)
    } else {
      fm[key] = val
    }
    out = out.replace(m[0], '')
  }
  if (Object.keys(fm).length >= 3) return { html: out, frontmatter: fm }
  return { html, frontmatter: {} }
}

// Word 文档正文中残留的 markdown 加粗符号（如 **治道**）转为真正的 <strong>
function fixMarkdownBold(html){
  return html.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
}

// .doc 纯文本转 HTML：逐段包裹 <p> 并转义
function plainTextToHtml(text){
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return text
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => `<p>${esc(l)}</p>`)
    .join('\n')
}

// 给 h1~h6 生成稳定的锚点 id（用于文章内目录），已有 id 则保留
function addHeadingIds(html){
  const used = {}
  return html.replace(/<(h[1-6])([^>]*)>([\s\S]*?)<\/\1>/gi, (match, tag, attrs, inner) => {
    if (/id\s*=/.test(attrs)) return match
    const text = inner.replace(/<[^>]+>/g, '').trim()
    if (!text) return match
    let base = text
      .toLowerCase()
      .replace(/[^一-龥a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    if (!base) base = 'heading'
    let id = base
    let n = 2
    while (used[id]) { id = `${base}-${n++}` }
    used[id] = true
    return `<${tag}${attrs} id="${id}">${inner}</${tag}>`
  })
}

// 解码常见 HTML 实体并压缩空白（用于摘要纯文本）
function cleanPlainText(html){
  return html
    .replace(/<\/(h[1-6]|p|li|ul|ol|blockquote)>/g, '\n$&')  // 块级标签前补换行，避免相邻文本粘连
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (m, d) => String.fromCharCode(Number(d)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

async function buildData(){
  // content directory lives inside the project to be deployed (lou-say-web/content)
  const contentDir = path.resolve(process.cwd(), 'content')
  const outputFile = path.resolve(process.cwd(), 'public', 'data.json')

  if(!fs.existsSync(contentDir)){
    console.error('content/ not found — create it and add files, then rerun this script')
    process.exit(1)
  }

  const all = walkDir(contentDir)
  // 按相对路径稳定排序（与资源管理器一致），保证分类在导航中的顺序稳定
  all.sort((a, b) => (a.relPath < b.relPath ? -1 : 1))

  const { kept, skipped } = dedupeFormats(all)
  skipped.forEach((p) => console.log(`ℹ️ 忽略同名重复格式文件: ${p}（保留 ${PREFERRED_EXT} 版本）`))

  const articles = []

  for(const entry of kept){
    const { filePath, category, ext } = entry
    const fileName = path.basename(filePath)
    const slug = path.basename(filePath, ext)
    const { date, title } = parseFileName(fileName)

    let contentHtml = ''
    let frontmatter = {}

    if(ext === '.md'){
      const raw = fs.readFileSync(filePath, 'utf-8')
      const parsed = matter(raw)
      frontmatter = parsed.data || {}
      contentHtml = md.render(parsed.content || '')
    } else if(ext === '.docx' || ext === '.doc'){
      try{
        if (ext === '.docx') {
          const result = await mammoth.convertToHtml({ buffer: fs.readFileSync(filePath) })
          contentHtml = result.value
        } else {
          const doc = await wordExtractor.extract(filePath)
          contentHtml = plainTextToHtml(doc.getBody())
        }
        // 剥离混入正文的 frontmatter 段落并提取元数据
        const extracted = extractDocxFrontmatter(contentHtml)
        contentHtml = extracted.html.trim() || contentHtml
        frontmatter = { ...frontmatter, ...extracted.frontmatter }
        // 修复正文中残留的 markdown 加粗符号
        contentHtml = fixMarkdownBold(contentHtml)
      }catch(e){
        console.error('Word 文档解析失败', filePath, e.message)
        contentHtml = `<p>无法解析的 ${ext.toUpperCase()} 文件</p>`
      }
    }

    contentHtml = addHeadingIds(contentHtml)

    const plainText = cleanPlainText(contentHtml)
    const excerpt = (frontmatter.excerpt) ? frontmatter.excerpt : (plainText.slice(0, 150) + '...')
    const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : []

    articles.push({
      slug,
      title: frontmatter.title || title,
      date: normalizeDate(frontmatter.date || date),
      category: frontmatter.category || category || '未分类',
      tags,
      excerpt,
      content: contentHtml
    })
  }

  articles.sort((a,b) => (a.date < b.date ? 1 : -1))

  // 防止不同目录下的同名文件 slug 冲突
  const usedSlugs = new Set()
  for (const a of articles) {
    if (usedSlugs.has(a.slug)) {
      let n = 2
      while (usedSlugs.has(`${a.slug}-${n}`)) n++
      console.warn(`⚠️ slug 重复: ${a.slug}（${a.category}），已改为 ${a.slug}-${n}`)
      a.slug = `${a.slug}-${n}`
    }
    usedSlugs.add(a.slug)
  }

  fs.mkdirSync(path.dirname(outputFile), { recursive: true })
  fs.writeFileSync(outputFile, JSON.stringify(articles, null, 2), 'utf8')
  console.log(`✅ 已生成 ${articles.length} 篇文章，涵盖 ${new Set(articles.map(a => a.category)).size} 个分类`)
}

buildData().catch(e=>{ console.error(e); process.exit(1) })
