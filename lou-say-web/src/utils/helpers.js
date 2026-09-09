export function slugify(s){
  return s.replace(/[^a-zA-Z0-9\u4e00-\u9fa5-_]+/g, '-').replace(/(^-|-$)/g,'')
}

export function buildCategoryTree(articles){
  const map = {}
  articles.forEach(a=>{
    const parts = a.category ? a.category.split('/') : ['未分类']
    let cur = map
    parts.forEach((p, idx)=>{
      if(!cur[p]) cur[p] = { __meta: { name: p, level: idx }, __children: {} }
      cur = cur[p].__children
    })
  })

  function toArray(node){
    return Object.keys(node).map(k=>({
      name: node[k].__meta.name,
      level: node[k].__meta.level,
      children: toArray(node[k].__children)
    }))
  }

  return toArray(map)
}
