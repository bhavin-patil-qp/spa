import { Link } from 'react-router-dom';

const Home = () => {
  const tools = [
    {
      to: '/markdown',
      icon: '✍️',
      bg: '#eeeeff',
      title: 'Markdown Editor',
      desc: 'Write, preview and export Markdown with live rendering and Mermaid diagram support.',
    },
    {
      to: '/articles',
      icon: '📰',
      bg: '#dcfce7',
      title: 'Articles',
      desc: 'Browse and read curated articles. Filter by category and find what matters today.',
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero-text">
          <div className="home-tag">✦ Your daily workspace</div>
          <h1 className="home-h1">
            Write, Read,<br />
            <em>Stay focused.</em>
          </h1>
          <p className="home-sub">
            A clean, fast workspace for everyday writing and reading.
            No clutter — just the tools you actually use.
          </p>
          <div className="home-actions">
          <Link  className="ws-btn ws-btn-primary" id="testme">Button click rule</Link>

            <Link to="/markdown" className="ws-btn ws-btn-primary" id="sam">Open Editor →</Link>
            <Link to="/articles" className="ws-btn ws-btn-ghost">Browse Articles</Link>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-card">
            <div className="hero-icon purple">✍️</div>
            <h4>Markdown Editor</h4>
            <p>Live preview · Mermaid charts · PDF export</p>
            <div className="hero-bar"><div className="hero-bar-fill" style={{ width: '78%' }} /></div>
          </div>
          <div className="hero-card-row">
            <div className="hero-card">
              <div className="hero-icon green">📰</div>
              <h4>6 Articles</h4>
              <p>Food · Tech · Industry</p>
            </div>
            <div className="hero-card">
              <div className="hero-icon amber">⚡</div>
              <h4>Instant</h4>
              <p>No login needed</p>
            </div>
          </div>
        </div>
      </section>

      <div className="home-divider" />

<div data-qp-intercept="test"></div>      {/* Tools */}
      <section className="home-tools">
        <div className="section-label">Quick Access</div>
        <div className="tools-grid">
          {tools.map(t => (
            <Link key={t.to} to={t.to} className="tool-card">
              <div className="tool-icon" style={{ background: t.bg }}>{t.icon}</div>
              <h3>{t.title}</h3>
              <p>{t.desc}</p>
              <span className="tool-arrow">↗</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
};

export default Home;
