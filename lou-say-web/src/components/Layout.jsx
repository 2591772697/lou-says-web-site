import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';

export default function Layout() {
  // 小屏默认收起侧边栏（抽屉模式），大屏默认展开
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches
  );

  // 移动端点击导航链接后自动收起抽屉
  const closeOnMobileNavigate = () => {
    if (window.matchMedia('(max-width: 900px)').matches) {
      setCollapsed(true);
    }
  };

  return (
    <div className="app-layout">
      {!collapsed && (
        <div
          className="sidebar-backdrop"
          onClick={() => setCollapsed(true)}
          aria-hidden="true"
        />
      )}

      <aside className={'sidebar' + (collapsed ? ' collapsed' : '')}>
        <header className="sidebar-header">
          <h2>📚 内容目录</h2>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setCollapsed(true)}
            aria-label="收起目录"
            title="收起目录"
          >
            «
          </button>
        </header>
        <Sidebar onNavigate={closeOnMobileNavigate} />
      </aside>

      {collapsed && (
        <button
          type="button"
          className="sidebar-open-btn"
          onClick={() => setCollapsed(false)}
          aria-label="打开目录"
        >
          ☰ 目录
        </button>
      )}

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
