import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

export default function ArticleDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { articles, loading } = useData();
  const contentRef = useRef(null);
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [tocVisible, setTocVisible] = useState(true);

  const article = articles.find((a) => a.slug === slug);

  // 切换文章时回到页面顶部
  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveId('');
  }, [slug]);

  // 内容渲染后提取标题生成目录（构建脚本已生成 id，这里兜底补齐）
  useEffect(() => {
    if (!contentRef.current) return;
    const elements = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const items = [];
    elements.forEach((el, index) => {
      if (!el.id) el.id = `heading-${index}`;
      items.push({
        id: el.id,
        text: el.textContent.trim(),
        level: parseInt(el.tagName[1], 10), // 1~6
      });
    });
    setHeadings(items);
  }, [article?.content]);

  // 滚动监听：高亮当前阅读位置对应的目录项
  useEffect(() => {
    if (headings.length === 0) return;
    const onScroll = () => {
      const wrapper = contentRef.current;
      if (!wrapper) return;
      const elements = wrapper.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let current = '';
      elements.forEach((el) => {
        if (el.getBoundingClientRect().top <= 100) current = el.id;
      });
      // 滚动到底部附近时激活最后一个标题
      if (wrapper.getBoundingClientRect().bottom <= window.innerHeight && elements.length) {
        current = elements[elements.length - 1].id;
      }
      setActiveId(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [headings]);

  // 上一篇（更早）/ 下一篇（更新），按日期倒序
  const prevArticle = useMemo(() => {
    const sorted = [...articles].sort((a, b) => (a.date < b.date ? 1 : -1));
    const idx = sorted.findIndex((a) => a.slug === slug);
    if (idx === -1) return null;
    return sorted[idx + 1] || null;
  }, [articles, slug]);

  const nextArticle = useMemo(() => {
    const sorted = [...articles].sort((a, b) => (a.date < b.date ? 1 : -1));
    const idx = sorted.findIndex((a) => a.slug === slug);
    if (idx === -1) return null;
    return sorted[idx - 1] || null;
  }, [articles, slug]);

  if (loading) return <div className="loading-hint">加载文章详情...</div>;
  if (!article) {
    return (
      <div className="not-found">
        <span className="big">📭</span>
        未找到文章。
        <Link to="/">返回文章列表</Link>
      </div>
    );
  }

  const showToc = headings.length > 1;

  // 返回上一页：优先回浏览器历史（站内前进而来）；直接打开文章（无历史）时回所属分类列表
  const goBack = () => {
    const idx = window.history.state && window.history.state.idx;
    if (idx > 0) navigate(-1);
    else navigate(`/?category=${encodeURIComponent(article.category)}`);
  };

  return (
    <div className="article-detail-wrapper">
      {showToc && tocVisible && (
        <aside className="toc-sidebar">
          <h4>📑 目录</h4>
          <ul>
            {headings.map((h) => (
              <li key={h.id} style={{ paddingLeft: (h.level - 1) * 14 }}>
                <a href={`#${h.id}`} className={activeId === h.id ? 'active' : ''}>
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      )}

      <div className="article-detail">
        <div className="detail-toolbar">
          <button type="button" className="back-btn" onClick={goBack}>
            ← 返回上一页
          </button>
          {showToc && (
            <button
              type="button"
              className="toc-toggle"
              onClick={() => setTocVisible((v) => !v)}
            >
              {tocVisible ? '隐藏目录' : '显示目录'}
            </button>
          )}
        </div>
        <h1>{article.title}</h1>
        <div className="meta">
          {article.date} — 📂 {article.category}
          {article.tags && article.tags.length > 0 && (
            <div className="tags">
              {article.tags.map((t) => (
                <span className="tag" key={t}>{t}</span>
              ))}
            </div>
          )}
        </div>
        <div
          className="content"
          ref={contentRef}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <nav className="article-nav">
          <div className="nav-item prev">
            {prevArticle && (
              <Link to={`/article/${encodeURIComponent(prevArticle.slug)}`}>
                <span className="nav-label">← 上一篇</span>
                {prevArticle.title}
              </Link>
            )}
          </div>
          <div className="nav-item next">
            {nextArticle && (
              <Link to={`/article/${encodeURIComponent(nextArticle.slug)}`}>
                <span className="nav-label">下一篇 →</span>
                {nextArticle.title}
              </Link>
            )}
          </div>
        </nav>

        <Link to="/" className="back-link">← 返回列表</Link>
      </div>
    </div>
  );
}
