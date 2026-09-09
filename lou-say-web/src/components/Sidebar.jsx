import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { buildCategoryTree } from '../utils/helpers';

export default function Sidebar({ onNavigate }) {
  const { articles, loading } = useData();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // 当前分类：优先取 ?category=；在文章详情页则高亮文章所属分类
  let currentCategory = searchParams.get('category') || '';
  if (!currentCategory && location.pathname.startsWith('/article/')) {
    const slug = decodeURIComponent(location.pathname.split('/article/')[1] || '');
    const article = articles.find((a) => a.slug === slug);
    if (article) currentCategory = article.category;
  }

  const tree = useMemo(() => buildCategoryTree(articles), [articles]);

  // 已折叠节点：path -> true
  const [collapsedNodes, setCollapsedNodes] = useState({});

  // 当前分类变化时，自动展开其所有祖先节点
  useEffect(() => {
    if (!currentCategory) return;
    setCollapsedNodes((prev) => {
      const parts = currentCategory.split('/');
      const next = { ...prev };
      let acc = '';
      parts.forEach((part, idx) => {
        if (idx === parts.length - 1) return;
        acc = acc ? `${acc}/${part}` : part;
        delete next[acc];
      });
      return next;
    });
  }, [currentCategory]);

  if (loading) return <div className="sidebar-loading">加载分类中...</div>;

  const toggleNode = (path) => {
    setCollapsedNodes((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const renderNodes = (nodes, path = '') =>
    nodes.map((node) => {
      const fullPath = path ? `${path}/${node.name}` : node.name;
      const hasChildren = node.children.length > 0;
      const isCollapsed = !!collapsedNodes[fullPath];
      const isActive = currentCategory === fullPath;
      // 当前分类的祖先节点：淡色高亮
      const isOnPath =
        !isActive &&
        currentCategory &&
        currentCategory.startsWith(fullPath + '/');

      return (
        <div className="category-node" key={fullPath}>
          <div className="cat-row">
            {hasChildren ? (
              <button
                type="button"
                className="cat-chevron"
                onClick={() => toggleNode(fullPath)}
                aria-label={isCollapsed ? `展开 ${node.name}` : `折叠 ${node.name}`}
              >
                {isCollapsed ? '▸' : '▾'}
              </button>
            ) : (
              <span className="cat-chevron placeholder" aria-hidden="true">▸</span>
            )}
            <Link
              to={`/?category=${encodeURIComponent(fullPath)}`}
              onClick={onNavigate}
              className={
                'cat-label' + (isActive ? ' active' : '') + (isOnPath ? ' on-path' : '')
              }
              title={fullPath}
            >
              {node.name}
              {node.total > 0 && <span className="cat-count">({node.total})</span>}
            </Link>
          </div>
          {hasChildren && !isCollapsed && (
            <div className="category-children">{renderNodes(node.children, fullPath)}</div>
          )}
        </div>
      );
    });

  return (
    <nav>
      <Link
        to="/"
        onClick={onNavigate}
        className={'all-link' + (!currentCategory ? ' active' : '')}
      >
        全部文章
      </Link>
      <div className="category-tree">{renderNodes(tree)}</div>
    </nav>
  );
}
