'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const EMPTY_FORM = {
  title: '',
  category: 'technical',
  tag: '',
  excerpt: '',
  content: '',
  link: '',
  date: '',
  published: true,
};

const CATEGORY_OPTIONS = [
  { value: 'technical', label: 'Technical' },
  { value: 'saas', label: 'SaaS' },
  { value: 'creative', label: 'Creative' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'jewellery', label: 'Jewellery' },
];

export default function AdminPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // URL auto-fill state
  const [urlInput, setUrlInput] = useState('');
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  async function loadBlogs() {
    setLoading(true);
    try {
      const res = await fetch('/api/blogs');
      const data = await res.json();
      setBlogs(data);
    } catch {
      showToast('Failed to load blogs', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBlogs();
  }, []);

  function openAdd() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, date: new Date().toISOString().slice(0, 10) });
    setUrlInput('');
    setFetchError('');
    setModalOpen(true);
  }

  function openEdit(blog) {
    setEditingId(blog.id);
    setForm({
      title: blog.title || '',
      category: blog.category || 'technical',
      tag: blog.tag || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      link: blog.link || '',
      date: blog.date || '',
      published: blog.published ?? true,
    });
    setUrlInput(blog.link && blog.link !== '#' ? blog.link : '');
    setFetchError('');
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setUrlInput('');
    setFetchError('');
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleAutoFill() {
    const url = urlInput.trim();
    if (!url) return;
    setFetching(true);
    setFetchError('');
    try {
      const res = await fetch(`/api/fetch-meta?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');

      setForm((f) => ({
        ...f,
        title: data.title || f.title,
        excerpt: data.description || f.excerpt,
        link: url,
        tag: f.tag || data.siteName || '',
      }));
    } catch (err) {
      setFetchError(err.message || 'Could not fetch metadata from this URL');
    } finally {
      setFetching(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/blogs/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error();
        showToast('Blog updated successfully');
      } else {
        const res = await fetch('/api/blogs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error();
        showToast('Blog created successfully');
      }
      closeModal();
      await loadBlogs();
    } catch {
      showToast('Something went wrong', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      const res = await fetch(`/api/blogs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('Blog deleted');
      setDeleteConfirm(null);
      await loadBlogs();
    } catch {
      showToast('Failed to delete', 'error');
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">
          Blog <span>Manager</span>
        </h1>
        <div className="admin-header-right">
          <Link href="/" className="admin-back">
            ← Back to site
          </Link>
          <button className="btn-add" onClick={openAdd}>
            + Add New Blog
          </button>
          <button className="btn-logout" onClick={handleLogout} title="Sign out">
            Sign out
          </button>
        </div>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-empty">Loading…</div>
        ) : blogs.length === 0 ? (
          <div className="admin-empty">No blogs yet. Add your first one!</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog.id}>
                  <td>
                    <div className="admin-td-title">{blog.title}</div>
                    {blog.link && blog.link !== '#' && (
                      <a
                        href={blog.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '11px',
                          color: 'var(--accent)',
                          display: 'block',
                          marginTop: '3px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '280px',
                        }}
                      >
                        ↗ {blog.link}
                      </a>
                    )}
                  </td>
                  <td>
                    <span
                      className="admin-badge"
                      style={{ background: 'var(--gold-pale)', color: 'var(--gold)' }}
                    >
                      {blog.tag || blog.category}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap', color: 'var(--ink-muted)', fontSize: '13px' }}>
                    {blog.date
                      ? new Date(blog.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td>
                    {blog.published ? (
                      <span className="admin-badge admin-badge-pub">Published</span>
                    ) : (
                      <span className="admin-badge admin-badge-draft">Draft</span>
                    )}
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button className="btn-edit" onClick={() => openEdit(blog)}>
                        Edit
                      </button>
                      {deleteConfirm === blog.id ? (
                        <>
                          <button className="btn-delete" onClick={() => handleDelete(blog.id)}>
                            Confirm
                          </button>
                          <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button className="btn-delete" onClick={() => setDeleteConfirm(blog.id)}>
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="modal">
            <h2 className="modal-title">
              {editingId ? 'Edit Blog' : 'Add New Blog'}
            </h2>

            {/* ── URL auto-fill ── */}
            <div className="url-autofill-box">
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                Paste blog URL to auto-fill
              </label>
              <div className="url-autofill-row">
                <input
                  type="url"
                  className="form-input"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://taggbox.com/blog/..."
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAutoFill())}
                />
                <button
                  type="button"
                  className="btn-autofill"
                  onClick={handleAutoFill}
                  disabled={fetching || !urlInput.trim()}
                >
                  {fetching ? '…' : '⚡ Auto-fill'}
                </button>
              </div>
              {fetchError && (
                <p style={{ fontSize: '12px', color: '#e57373', marginTop: '6px' }}>
                  {fetchError}
                </p>
              )}
            </div>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label" htmlFor="title">Title *</label>
                <input
                  id="title"
                  name="title"
                  className="form-input"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="Blog post title"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    className="form-select"
                    value={form.category}
                    onChange={handleChange}
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="tag">Tag label</label>
                  <input
                    id="tag"
                    name="tag"
                    className="form-input"
                    value={form.tag}
                    onChange={handleChange}
                    placeholder="e.g. SaaS Content"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="excerpt">Excerpt</label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  className="form-textarea"
                  value={form.excerpt}
                  onChange={handleChange}
                  placeholder="Short description shown on the portfolio card"
                  style={{ minHeight: '80px' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="content">Notes / Full content</label>
                <textarea
                  id="content"
                  name="content"
                  className="form-textarea"
                  value={form.content}
                  onChange={handleChange}
                  placeholder="Optional additional notes"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="link">Live link URL</label>
                  <input
                    id="link"
                    name="link"
                    className="form-input"
                    value={form.link}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="date">Date</label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    className="form-input"
                    value={form.date}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="form-checkbox-row">
                  <input
                    id="published"
                    name="published"
                    type="checkbox"
                    checked={form.published}
                    onChange={handleChange}
                  />
                  <label htmlFor="published" className="form-label" style={{ margin: 0 }}>
                    Published (visible on portfolio)
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create blog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
