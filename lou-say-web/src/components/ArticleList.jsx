import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

export default function ArticleList({ category = '' }) {
  const { articles = [], loading } = useData();

  if (loading) return <div className="loading-hint">加载文章中...</div>;

  const filtered = category
    ? articles.filter((a) => a.category === category || a.category.startsWith(category + '/'))
    : articles;

  return (
    <div className="list-container">
      <div className="banner">
        <h1>📖 国学读书分享</h1>
        {category ? (
          <p>品味经典，传承智慧</p>
        ) : (
          <p className="slogan">罢黜百家，独尊娄术</p>
        )}
      </div>

      <div className="list-head">
        <h2>{category ? `分类：${category}` : '全部文章'}</h2>
        <span className="list-count">
          共 {filtered.length} 篇
          {category && (
            <Link to="/" className="clear-filter">
              ← 查看全部
            </Link>
          )}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-hint">
          <span className="big">📭</span>
          该分类下暂无文章
        </div>
      ) : (
        <div className="article-list">
          {filtered.map((article) => (
            <article className="article-card" key={article.slug}>
              <div className="title">
                <Link to={`/article/${encodeURIComponent(article.slug)}`}>{article.title}</Link>
              </div>
              <div className="meta">
                <span>📅 {article.date}</span>
                <span>📂 {article.category}</span>
              </div>
              {article.tags && article.tags.length > 0 && (
                <div className="tags">
                  {article.tags.map((t) => (
                    <span className="tag" key={t}>{t}</span>
                  ))}
                </div>
              )}
              <p className="excerpt">{article.excerpt}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
