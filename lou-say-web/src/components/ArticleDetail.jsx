import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useData } from '../context/DataContext'

export default function ArticleDetail(){
  const { slug } = useParams()
  const { articles = [], loading } = useData()
  if(loading) return <div>加载文章详情...</div>
  const article = articles.find(x => x.slug === slug)

  if(!article) return <div>未找到文章。<div><Link to="/">返回</Link></div></div>

  return (
    <div>
      <h1>{article.title}</h1>
      <div className="muted">{article.date} — {article.category}</div>
      <div style={{marginTop:12}} dangerouslySetInnerHTML={{__html: article.content}} />
      <div style={{marginTop:16}}><Link to="/">返回列表</Link></div>
    </div>
  )
}
