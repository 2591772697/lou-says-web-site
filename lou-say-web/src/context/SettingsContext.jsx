import { createContext, useContext, useEffect, useState } from 'react';

const SettingsContext = createContext(null);

const THEME_KEY = 'ls-theme';      // localStorage 键：light | dark | auto
const FONT_KEY = 'ls-font-size';   // localStorage 键：80~160 的数字（百分比）

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'auto') return saved;
  } catch (e) { /* 隐私模式等场景 localStorage 不可用 */ }
  return 'auto';
}

function getInitialFontSize() {
  try {
    const saved = Number(localStorage.getItem(FONT_KEY));
    if (saved >= 80 && saved <= 160) return saved;
  } catch (e) { /* ignore */ }
  return 100;
}

export function SettingsProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const [fontSize, setFontSize] = useState(getInitialFontSize);

  // 监听系统深色模式变化（「跟随系统」时需要）
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // 实际生效的主题：auto 时跟随系统
  const resolvedTheme = theme === 'auto' ? (systemDark ? 'dark' : 'light') : theme;

  // 把生效主题写到 <html data-theme="...">，CSS 变量随之切换
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  // 字号缩放：全站字号基于 rem，只改根元素基准百分比即可整体缩放
  useEffect(() => {
    document.documentElement.style.fontSize = fontSize + '%';
    try { localStorage.setItem(FONT_KEY, String(fontSize)); } catch (e) { /* ignore */ }
  }, [fontSize]);

  const setThemePersist = (t) => {
    setTheme(t);
    try { localStorage.setItem(THEME_KEY, t); } catch (e) { /* ignore */ }
  };

  // 快速切换：明↔暗；若当前是「跟随系统」，则切换为与系统相反的固定模式
  const toggleTheme = () => {
    setThemePersist(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const value = {
    theme,           // 用户选择：light | dark | auto
    resolvedTheme,   // 实际生效：light | dark
    setTheme: setThemePersist,
    toggleTheme,
    fontSize,
    setFontSize,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings 必须在 SettingsProvider 内使用');
  return ctx;
}
