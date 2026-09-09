import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useData } from '../context/DataContext'

export default function ArticleList({ category: propCategory = '' }){
  const { articles = [], loading } = useData()
  const [searchParams] = useSearchParams()
  const category = propCategory || searchParams.get('category') || ''

  if(loading) return <div>加载文章中...</div>

  const filtered = category
    ? articles.filter((a) => a.category === category || a.category.startsWith(category + '/'))
    : articles

  if(filtered.length === 0){
    return <p>该分类下暂无文章 📭</p>
  }

  return (
    <div>
      <h1>文章列表</h1>
      <div className="article-list">
        {filtered.map((article) => (
          <div className="card" key={article.slug}>
            <div className="title"><Link to={`/article/${encodeURIComponent(article.slug)}`}>{article.title}</Link></div>
            <div className="muted">{article.date} · 📂 {article.category}</div>
            <p>{article.excerpt}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
