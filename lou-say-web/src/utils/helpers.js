export function slugify(s) {
  return s.replace(/[^a-zA-Z0-9一-龥-_]+/g, '-').replace(/(^-|-$)/g, '')
}

// 构建分类树。
// 返回 [{ name, level, direct, total, children }]
//   name:     分类名
//   level:    层级（0 起）
//   direct:   该分类直属文章数
//   total:    该分类子树文章总数（含子分类）
//   children: 子分类数组
export function buildCategoryTree(articles) {
  const map = {}
  articles.forEach((a) => {
    const parts = (a.category ? a.category : '未分类').split('/').filter(Boolean)
    const safeParts = parts.length ? parts : ['未分类']
    let cur = map
    safeParts.forEach((p, idx) => {
      if (!cur[p]) {
        cur[p] = { __meta: { name: p, level: idx }, __articles: [], __children: {} }
      }
      if (idx === safeParts.length - 1) {
        cur[p].__articles.push(a)
      }
      cur = cur[p].__children
    })
  })

  function toArray(node) {
    return Object.keys(node).map((k) => {
      const children = toArray(node[k].__children)
      const direct = node[k].__articles.length
      const total = direct + children.reduce((sum, c) => sum + c.total, 0)
      return {
        name: node[k].__meta.name,
        level: node[k].__meta.level,
        direct,
        total,
        children,
      }
    })
  }

  return toArray(map)
}
