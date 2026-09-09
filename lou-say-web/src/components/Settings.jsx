import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

const THEME_OPTIONS = [
  { value: 'light', label: '☀️ 白天' },
  { value: 'dark', label: '🌙 黑夜' },
  { value: 'auto', label: '🖥️ 跟随系统' },
];

export default function Settings() {
  const { theme, setTheme, fontSize, setFontSize } = useSettings();

  return (
    <div className="settings-page">
      <div className="banner">
        <h1>⚙️ 设置</h1>
        <p>外观与字号偏好保存在本机浏览器，下次访问自动生效。</p>
      </div>

      <div className="settings-card">
        <h3>外观主题</h3>
        <div className="setting-row">
          <span className="setting-label">白天 / 黑夜模式</span>
          <div className="segmented">
            {THEME_OPTIONS.map((o) => (
              <button
                type="button"
                key={o.value}
                className={theme === o.value ? 'active' : ''}
                onClick={() => setTheme(o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <p className="settings-note">「跟随系统」会随设备的深色模式自动切换。</p>
      </div>

      <div className="settings-card">
        <h3>字体大小</h3>
        <div className="setting-row">
          <span className="setting-label">页面整体字号</span>
          <button type="button" className="reset-btn" onClick={() => setFontSize(100)}>
            恢复默认
          </button>
        </div>
        <div className="font-size-row">
          <span className="font-size-hint">小</span>
          <input
            type="range"
            className="font-size-slider"
            min="80"
            max="160"
            step="5"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            aria-label="页面整体字号"
          />
          <span className="font-size-hint">大</span>
          <span className="font-size-hint">{fontSize}%</span>
        </div>
        <p className="settings-note">拖动滑杆，全站文字实时放大缩小（80%～160%）。</p>
      </div>

      <p>
        <Link to="/" className="back-link">« 返回首页</Link>
      </p>
    </div>
  );
}
