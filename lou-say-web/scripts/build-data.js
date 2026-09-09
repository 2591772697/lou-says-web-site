const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')
const MarkdownIt = require('markdown-it')
const mammoth = require('mammoth')

const md = new MarkdownIt({ html: true })

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
      if (ext === '.md' || ext === '.docx') {
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/')
        const category = path.dirname(relativePath)
        results.push({ filePath: fullPath, category: category === '.' ? '' : category })
      }
    }
  })
  return results
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

async function buildData(){
  // content directory lives inside the project to be deployed (lou-say-web/content)
  const contentDir = path.resolve(process.cwd(), 'content')
  const outputFile = path.resolve(process.cwd(), 'public', 'data.json')

  if(!fs.existsSync(contentDir)){
    console.error('content/ not found — create it and add files, then rerun this script')
    process.exit(1)
  }

  const entries = walkDir(contentDir)
  const articles = []

  for(const entry of entries){
    const { filePath, category } = entry
    const fileName = path.basename(filePath)
    const ext = path.extname(filePath).toLowerCase()
    const slug = path.basename(filePath, ext)
    const { date, title } = parseFileName(fileName)

    let contentHtml = ''
    let frontmatter = {}

    if(ext === '.md'){
      const raw = fs.readFileSync(filePath, 'utf-8')
      const parsed = matter(raw)
      frontmatter = parsed.data || {}
      contentHtml = md.render(parsed.content || '')
    } else if(ext === '.docx'){
      try{
        const buffer = fs.readFileSync(filePath)
        const result = await mammoth.convertToHtml({ buffer })
        contentHtml = result.value
      }catch(e){
        console.error('mammoth convert error', filePath, e.message)
        contentHtml = '<p>无法解析的 DOCX 文件</p>'
      }
    }

    const plainText = contentHtml.replace(/<[^>]+>/g, '')
    const excerpt = (frontmatter.excerpt) ? frontmatter.excerpt : (plainText.slice(0, 150) + '...')

    articles.push({
      slug,
      title: frontmatter.title || title,
      date: frontmatter.date || date,
      category: frontmatter.category || category || '未分类',
      excerpt,
      content: contentHtml
    })
  }

  articles.sort((a,b) => (a.date < b.date ? 1 : -1))

  fs.mkdirSync(path.dirname(outputFile), { recursive: true })
  fs.writeFileSync(outputFile, JSON.stringify(articles, null, 2), 'utf8')
  console.log(`✅ 已生成 ${articles.length} 篇文章，涵盖 ${new Set(articles.map(a => a.category)).size} 个分类`)
}

buildData().catch(e=>{ console.error(e); process.exit(1) })
