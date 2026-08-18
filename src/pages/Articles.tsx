import { useState, useMemo } from 'react';

const ARTICLES = [
  {
    title: 'The Art of Food Photography',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
    excerpt: 'Professional secrets behind stunning food images — styling, lighting, and composition that make mouths water.',
    author: 'Sarah Johnson',
    date: 'Mar 15, 2024',
    readTime: '5 min',
    category: 'Food Trends',
    tags: ['Photography', 'Tips'],
  },
  {
    title: 'Top 10 Food Trends in 2024',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80',
    excerpt: 'From plant-based innovations to sustainable dining — the biggest shifts reshaping food culture this year.',
    author: 'Michael Chen',
    date: 'Mar 10, 2024',
    readTime: '8 min',
    category: 'Food Trends',
    tags: ['Trends', 'Innovation'],
  },
  {
    title: 'The Rise of Ghost Kitchens',
    image: 'https://images.unsplash.com/photo-1557555187-23d685287bc3?w=600&q=80',
    excerpt: 'How virtual restaurants are flipping the delivery model and what it means for the food industry at large.',
    author: 'David Smith',
    date: 'Mar 5, 2024',
    readTime: '6 min',
    category: 'Industry News',
    tags: ['Ghost Kitchens', 'Delivery'],
  },
  {
    title: 'Sustainable Delivery: Reducing Carbon Footprint',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&q=80',
    excerpt: 'Eco-friendly packaging, route optimisation, and the companies leading the charge toward greener deliveries.',
    author: 'Emma Wilson',
    date: 'Mar 1, 2024',
    readTime: '7 min',
    category: 'Industry News',
    tags: ['Sustainability', 'Environment'],
  },
  {
    title: 'Psychology of Food Ordering',
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&q=80',
    excerpt: 'Why we choose what we order — and how menu design, colours, and framing quietly drive our decisions.',
    author: 'Lisa Anderson',
    date: 'Feb 28, 2024',
    readTime: '6 min',
    category: 'Health & Nutrition',
    tags: ['Psychology', 'Behaviour'],
  },
  {
    title: 'From Farm to Doorstep',
    image: 'https://images.unsplash.com/photo-1595351298020-7f0ee678462a?w=600&q=80',
    excerpt: 'Tracing the journey food takes from producers through logistics to land on your table, hot and on time.',
    author: 'James Brown',
    date: 'Feb 25, 2024',
    readTime: '8 min',
    category: 'Industry News',
    tags: ['Supply Chain', 'Process'],
  },
];

const CATEGORIES = ['All', 'Food Trends', 'Industry News', 'Health & Nutrition'];

const Articles = () => {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('All');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return ARTICLES.filter(a => {
      const matchCat = active === 'All' || a.category === active;
      const matchQ = !q || a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [query, active]);

  return (
    <div className="articles-page">
      <div className="articles-header">
        <h1>Articles</h1>
        <p>Insights on food, delivery, and industry trends.</p>

        <div className="search-bar">
          <input
            type="search"
            placeholder="Search articles…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button type="button">Search</button>
        </div>
      </div>

      <div className="categories">
        {CATEGORIES.map(c => (
          <button
            key={c}
            className={`cat-btn${active === c ? ' active' : ''}`}
            onClick={() => setActive(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: '#9ca3af', marginTop: 40 }}>No articles match your search.</p>
      ) : (
        <div className="articles-grid">
          {filtered.map(a => (
            <article key={a.title} className="article-card">
              <img src={a.image} alt={a.title} loading="lazy" />
              <div className="article-body">
                <div className="article-cat">{a.category}</div>
                <h2 className="article-title">{a.title}</h2>
                <p className="article-excerpt">{a.excerpt}</p>
                <div className="article-meta">
                  <span>{a.author}</span>
                  <span>·</span>
                  <span>{a.date}</span>
                  <span>·</span>
                  <span>{a.readTime} read</span>
                </div>
                <div className="article-tags">
                  {a.tags.map(t => <span key={t} className="tag-pill">{t}</span>)}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Articles;
