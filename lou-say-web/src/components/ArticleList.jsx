import { Link, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';

export default function ArticleList({ category: propCategory = '' }) {
  const { articles = [], loading } = useData();
  const [searchParams] = useSearchParams();
  const category = propCategory || searchParams.get('category') || '';

  if (loading) return <div className="loading-hint">加载文章中...</div>;

  const filtered = category
    ? articles.filter((a) => a.category === category || a.category.startsWith(category + '/'))
    : articles;

  return (
    <div className="list-container">
      <div className="banner">
        <h1>📖 国学读书分享</h1>
        <p>品味经典，传承智慧</p>
      </div>

      <div className="list-head">
        <h2>{category ? `分类：${category}` : '文章列表'}</h2>
        {category && (
          <Link to="/" className="clear-filter">
            ← 查看全部
          </Link>
        )}
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
              <p className="excerpt">{article.excerpt}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
