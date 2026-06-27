'use client';

import { useState } from 'react';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'technical', label: 'Technical' },
  { key: 'saas', label: 'SaaS' },
  { key: 'creative', label: 'Creative' },
  { key: 'lifestyle', label: 'Lifestyle' },
  { key: 'jewellery', label: 'Jewellery' },
];

export default function WritingSection({ blogs }) {
  const [active, setActive] = useState('all');

  const published = blogs.filter((b) => b.published);
  const filtered =
    active === 'all' ? published : published.filter((b) => b.category === active);

  return (
    <section id="work">
      <div className="wrap">
        <span className="label">Selected work</span>
        <h2 className="section-title">Writing worth reading</h2>
        <p className="section-intro">
          A cross-section of formats and voices — from technical documentation to lyrical
          jewellery narratives.
        </p>

        <div className="samples-filter">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              className={`filter-btn${active === c.key ? ' active' : ''}`}
              onClick={() => setActive(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="samples-grid-empty">No posts in this category yet.</div>
        ) : (
          <div className="samples-grid">
            {filtered.map((blog) => (
              <div key={blog.id} className="sample-card">
                <span className="sample-tag">{blog.tag}</span>
                <div className="sample-title">{blog.title}</div>
                <p className="sample-excerpt">{blog.excerpt}</p>
                {blog.date && (
                  <span className="sample-date">
                    {new Date(blog.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                )}
                {blog.link && blog.link !== '#' && (
                  <a
                    href={blog.link}
                    className="btn-view-blog"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Blog ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
