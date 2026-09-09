import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="app" style={{ display: 'flex' }}>
      <div className={"sidebar" + (collapsed ? ' collapsed' : '')}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h2 style={{margin:0}}>内容目录</h2>
          <button onClick={()=>setCollapsed(true)} aria-label="隐藏侧边栏">隐藏</button>
        </div>
        <Sidebar />
      </div>

      {collapsed && (
        <button className="sidebar-open-btn" onClick={()=>setCollapsed(false)} aria-label="打开侧边栏">☰</button>
      )}

      <main className="content" style={{ flex: 1, padding: '20px' }}>
        <Outlet />
      </main>
    </div>
  );
}