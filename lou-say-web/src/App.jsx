

import React from 'react';
import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import Layout from './components/Layout';
import ArticleList from './components/ArticleList';
import ArticleDetail from './components/ArticleDetail';
import { DataProvider } from './context/DataContext';

function HomeWrapper() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || '';
  return <ArticleList category={category} />;
}

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomeWrapper />} />
            <Route path="article/:slug" element={<ArticleDetail />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}