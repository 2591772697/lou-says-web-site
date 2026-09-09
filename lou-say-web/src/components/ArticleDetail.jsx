import React, { useRef, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

export default function ArticleDetail() {
  const { slug } = useParams();
  const { articles, loading } = useData();
  const contentRef = useRef(null);
  const [headings, setHeadings] = useState([]);
  const [tocVisible, setTocVisible] = useState(true);

  const article = articles.find(a => a.slug === slug);

  // 当文章数据加载完成且内容渲染后，提取标题生成 TOC
  useEffect(() => {
    if (!article) {
      setHeadings([])
      return
    }
    if (contentRef.current) {
      // 提取所有 h1~h6 标签
      const elements = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const items = [];
      elements.forEach((el, index) => {
        // 如果标题没有 id，自动生成一个
        if (!el.id) el.id = `heading-${index}`;
        items.push({
          id: el.id,
          text: el.textContent,
          level: parseInt(el.tagName[1], 10) // 1~6
        });
      });
      setHeadings(items);
    }
  }, [article?.content]); // 依赖文章内容变化（当文章切换或内容改变时重新生成）

  if (loading) return <div>加载文章详情...</div>;
  if (!article) {
    return (
      <div>
        未找到文章。<Link to="/">返回</Link>
      </div>
    );
  }

  // 如果标题少于 2 个，不显示 TOC（避免单个标题）
  const showToc = headings.length > 1;
  const visibleToc = showToc && tocVisible;

  return (
    <div className="article-detail-wrapper">
      {visibleToc && (
        <aside className={"toc-sidebar" + (tocVisible ? '' : ' collapsed')}>
          <h4>📑 目录</h4>
          <ul>
            {headings.map((h) => (
              <li key={h.id} style={{ paddingLeft: (h.level - 1) * 16 }}>
                <a href={`#${h.id}`}>{h.text}</a>
              </li>
            ))}
          </ul>
        </aside>
      )}
      <div className="article-detail">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div />
          <button className="toc-toggle" onClick={() => setTocVisible(v => !v)}>{tocVisible ? '隐藏目录' : '显示目录'}</button>
        </div>
        <h1>{article.title}</h1>
        <div className="meta">{article.date} — {article.category}</div>
        <div className="content" ref={contentRef} dangerouslySetInnerHTML={{ __html: article.content }} />
        <Link to="/" className="back-link">← 返回列表</Link>
      </div>
    </div>
  );
}

