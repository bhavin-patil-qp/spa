import { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';

const TOOLS = [
  { to: '/markdown', label: 'Markdown',  icon: '✍️' },
  { to: '/editor',   label: 'Editor',    icon: '📝' },
  { to: '/json',     label: 'JSON',      icon: '{ }' },
  { to: '/diff',     label: 'Diff',      icon: '⇄'  },
  { to: '/time',     label: 'Time',      icon: '🕐' },
  { to: '/color',    label: 'Colors',    icon: '🎨' },
];

const Navbar = () => {
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav className="ws-navbar">
      <div className="ws-navbar-inner">
        <Link to="/" className="ws-brand">
          <span className="brand-dot" aria-hidden="true" />
          Workspace
        </Link>

        <ul className="ws-nav">
          <li><NavLink to="/" end>Home</NavLink></li>
          <li><NavLink to="/articles">Articles</NavLink></li>

          {/* Tools dropdown */}
          <li ref={dropRef} style={{ position: 'relative' }}>
            <button
              className={`ws-nav-drop-btn${dropOpen ? ' active' : ''}`}
              onClick={() => setDropOpen(o => !o)}
            >
              Tools <span className="ws-nav-caret">{dropOpen ? '▲' : '▼'}</span>
            </button>

            {dropOpen && (
              <div className="ws-dropdown">
                {TOOLS.map(t => (
                  <NavLink
                    key={t.to}
                    to={t.to}
                    className={({ isActive }) => `ws-dropdown-item${isActive ? ' active' : ''}`}
                    onClick={() => setDropOpen(false)}
                  >
                    <span className="ws-dropdown-icon">{t.icon}</span>
                    {t.label}
                  </NavLink>
                ))}
              </div>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
