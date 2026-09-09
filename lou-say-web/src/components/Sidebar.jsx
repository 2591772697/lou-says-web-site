import { useSearchParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

export default function Sidebar() {
  const { articles, loading } = useData();
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || '';

  if (loading) return <aside style={{ padding: '20px' }}>加载分类中...</aside>;

  // 构建分类树（同之前逻辑）
  const categoryMap = {};
  articles.forEach((article) => {
    const parts = article.category.split('/');
    let current = categoryMap;
    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = index === parts.length - 1 ? { __articles: [] } : {};
      }
      if (index === parts.length - 1) {
        current[part].__articles.push(article);
      }
      current = current[part];
    });
  });

  const renderTree = (tree, path = '') => {
    return Object.keys(tree).map((key) => {
      const fullPath = path ? `${path}/${key}` : key;
      const node = tree[key];
      const isLeaf = !!node.__articles;
      const hasChildren = Object.keys(node).filter(k => k !== '__articles').length > 0;

      return (
        <div key={fullPath} style={{ marginLeft: '8px' }}>
          <div>
            <Link
              to={`/?category=${encodeURIComponent(fullPath)}`}
              style={{
                fontWeight: currentCategory === fullPath ? 'bold' : 'normal',
                color: currentCategory === fullPath ? '#0070f3' : 'inherit',
              }}
            >
              {key} {isLeaf && `(${node.__articles.length})`}
            </Link>
          </div>
          {hasChildren && <div style={{ paddingLeft: '16px' }}>{renderTree(node, fullPath)}</div>}
        </div>
      );
    });
  };

  return (
    <div style={{ padding: '12px' }}>
      <h3>📚 分类</h3>
      <div>
        <Link to="/" style={{ fontWeight: !currentCategory ? 'bold' : 'normal' }}>
          全部文章
        </Link>
      </div>
      {renderTree(categoryMap)}
    </div>
  );
}