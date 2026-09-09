import React from 'react';
import { BrowserRouter, Routes, Route, useSearchParams, Link } from 'react-router-dom';
import Layout from './components/Layout';
import ArticleList from './components/ArticleList';
import ArticleDetail from './components/ArticleDetail';
import { DataProvider } from './context/DataContext';

function HomeWrapper() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || '';
  return <ArticleList category={category} />;
}

function NotFound() {
  return (
    <div className="not-found">
      <span className="big">🧭</span>
      <p>页面不存在。</p>
      <p>
        <Link to="/">返回首页</Link>
      </p>
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomeWrapper />} />
            <Route path="article/:slug" element={<ArticleDetail />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}
