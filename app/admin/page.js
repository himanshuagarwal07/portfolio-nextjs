'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const NAV = [
  { key: 'hero',      label: 'Hero',      icon: '✦' },
  { key: 'about',     label: 'About',     icon: '◎' },
  { key: 'expertise', label: 'Expertise', icon: '◈' },
  { key: 'process',   label: 'Process',   icon: '◷' },
  { key: 'contact',   label: 'Contact',   icon: '◉' },
  { key: 'footer',    label: 'Footer',    icon: '◻' },
  { key: 'colors',    label: 'Colors',    icon: '◑' },
  { key: 'blogs',     label: 'Blogs',     icon: '✎' },
];

const BLOG_EMPTY = {
  title: '', category: 'technical', tag: '',
  excerpt: '', content: '', link: '', date: '', published: true,
};
const CAT_OPTIONS = [
  { value: 'technical', label: 'Technical' },
  { value: 'saas',      label: 'SaaS' },
  { value: 'creative',  label: 'Creative' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'jewellery', label: 'Jewellery' },
];

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState('hero');
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Blog modal state
  const [blogModal, setBlogModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [blogForm, setBlogForm] = useState(BLOG_EMPTY);
  const [blogSaving, setBlogSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    fetch('/api/content')
      .then((r) => r.json())
      .then((d) => { setContent(d); setLoading(false); })
      .catch(() => { showToast('Failed to load', 'error'); setLoading(false); });
  }, []);

  async function saveSection(key, val) {
    setSaving(true);
    const updated = { ...content, [key]: val };
    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error();
      setContent(updated);
      showToast('Saved successfully!');
    } catch {
      showToast('Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  // ── Blog helpers ──────────────────────────────────
  function openAddBlog() {
    setEditingId(null);
    setBlogForm({ ...BLOG_EMPTY, date: new Date().toISOString().slice(0, 10) });
    setUrlInput(''); setFetchError('');
    setBlogModal(true);
  }
  function openEditBlog(b) {
    setEditingId(b.id);
    setBlogForm({ title: b.title||'', category: b.category||'technical', tag: b.tag||'',
      excerpt: b.excerpt||'', content: b.content||'', link: b.link||'',
      date: b.date||'', published: b.published??true });
    setUrlInput(b.link && b.link !== '#' ? b.link : '');
    setFetchError('');
    setBlogModal(true);
  }
  function closeBlogModal() {
    setBlogModal(false); setEditingId(null);
    setBlogForm(BLOG_EMPTY); setUrlInput(''); setFetchError('');
  }

  async function handleAutoFill() {
    const url = urlInput.trim();
    if (!url) return;
    setFetching(true); setFetchError('');
    try {
      const res = await fetch(`/api/fetch-meta?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setBlogForm((f) => ({ ...f,
        title: data.title || f.title,
        excerpt: data.description || f.excerpt,
        link: url,
        tag: f.tag || data.siteName || '',
      }));
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setFetching(false);
    }
  }

  async function handleBlogSave(e) {
    e.preventDefault();
    if (!blogForm.title.trim()) return;
    setBlogSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/blogs/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(blogForm),
        });
        if (!res.ok) throw new Error();
        showToast('Blog updated');
      } else {
        const res = await fetch('/api/blogs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(blogForm),
        });
        if (!res.ok) throw new Error();
        showToast('Blog created');
      }
      closeBlogModal();
      const updated = await fetch('/api/content').then((r) => r.json());
      setContent(updated);
    } catch {
      showToast('Something went wrong', 'error');
    } finally {
      setBlogSaving(false);
    }
  }

  async function handleBlogDelete(id) {
    try {
      await fetch(`/api/blogs/${id}`, { method: 'DELETE' });
      showToast('Blog deleted');
      setDeleteConfirm(null);
      const updated = await fetch('/api/content').then((r) => r.json());
      setContent(updated);
    } catch {
      showToast('Failed to delete', 'error');
    }
  }

  if (loading) return <div className="admin-page"><div className="admin-empty">Loading…</div></div>;
  if (!content) return <div className="admin-page"><div className="admin-empty">Could not load content.</div></div>;

  return (
    <div className="admin-layout">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">Portfolio<br /><span>Admin</span></div>
        <div className="admin-sidebar-nav">
          {NAV.map((n) => (
            <button
              key={n.key}
              className={`admin-nav-item${tab === n.key ? ' active' : ''}`}
              onClick={() => setTab(n.key)}
            >
              <span className="admin-nav-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </div>
        <div className="admin-sidebar-footer">
          <Link href="/" className="admin-nav-item" style={{ textDecoration: 'none' }}>
            <span className="admin-nav-icon">↗</span> View Site
          </Link>
          <button className="admin-nav-item admin-nav-logout" onClick={handleLogout}>
            <span className="admin-nav-icon">⎋</span> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="admin-main">
        {tab === 'hero'      && <HeroSection      data={content.hero}      onSave={(v) => saveSection('hero', v)}      saving={saving} />}
        {tab === 'about'     && <AboutSection     data={content.about}     onSave={(v) => saveSection('about', v)}     saving={saving} />}
        {tab === 'expertise' && <ExpertiseSection data={content.expertise} onSave={(v) => saveSection('expertise', v)} saving={saving} />}
        {tab === 'process'   && <ProcessSection   data={{ steps: content.process, tools: content.tools }}
                                                  onSave={(v) => { saveSection('process', v.steps); saveSection('tools', v.tools); }}
                                                  saving={saving} />}
        {tab === 'contact'   && <ContactSection   data={content.contact}   onSave={(v) => saveSection('contact', v)}   saving={saving} />}
        {tab === 'footer'    && <FooterSection    data={content.footer}    onSave={(v) => saveSection('footer', v)}    saving={saving} />}
        {tab === 'colors'    && <ColorsSection    data={content.colors}    onSave={(v) => saveSection('colors', v)}    saving={saving} />}
        {tab === 'blogs'     && (
          <BlogsSection
            blogs={content.blogs || []}
            blogModal={blogModal} editingId={editingId}
            blogForm={blogForm} setBlogForm={setBlogForm}
            blogSaving={blogSaving} deleteConfirm={deleteConfirm}
            setDeleteConfirm={setDeleteConfirm}
            urlInput={urlInput} setUrlInput={setUrlInput}
            fetching={fetching} fetchError={fetchError}
            onAdd={openAddBlog} onEdit={openEditBlog} onClose={closeBlogModal}
            onSave={handleBlogSave} onDelete={handleBlogDelete}
            onAutoFill={handleAutoFill}
          />
        )}
      </main>

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   HERO SECTION
════════════════════════════════════════════════════ */
function HeroSection({ data, onSave, saving }) {
  const [d, setD] = useState(data);
  const set = (k, v) => setD((p) => ({ ...p, [k]: v }));

  function handleRoleRemove(i) {
    setD((p) => ({ ...p, roles: p.roles.filter((_, idx) => idx !== i) }));
  }
  function handleRoleAdd(e) {
    if (e.key === 'Enter' && e.target.value.trim()) {
      setD((p) => ({ ...p, roles: [...p.roles, e.target.value.trim()] }));
      e.target.value = '';
      e.preventDefault();
    }
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Hero Section</h2>
        <SaveBtn onClick={() => onSave(d)} saving={saving} />
      </div>
      <div className="form-grid-2">
        <Field label="First Name"><input className="form-input" value={d.firstName} onChange={(e) => set('firstName', e.target.value)} /></Field>
        <Field label="Last Name"><input className="form-input" value={d.lastName} onChange={(e) => set('lastName', e.target.value)} /></Field>
      </div>
      <Field label="Eyebrow text (small line above name)"><input className="form-input" value={d.eyebrow} onChange={(e) => set('eyebrow', e.target.value)} /></Field>
      <Field label="Tagline (italic quote below name)"><input className="form-input" value={d.tagline} onChange={(e) => set('tagline', e.target.value)} /></Field>
      <Field label="Description paragraph"><textarea className="form-textarea" value={d.description} onChange={(e) => set('description', e.target.value)} /></Field>
      <div className="form-grid-2">
        <Field label="Primary button text"><input className="form-input" value={d.ctaPrimary} onChange={(e) => set('ctaPrimary', e.target.value)} /></Field>
        <Field label="Secondary button text"><input className="form-input" value={d.ctaSecondary} onChange={(e) => set('ctaSecondary', e.target.value)} /></Field>
      </div>
      <Field label="Role pills (press Enter to add)">
        <div className="tag-list">
          {d.roles.map((r, i) => (
            <span key={i} className="tag-item">{r} <button className="tag-remove" onClick={() => handleRoleRemove(i)}>×</button></span>
          ))}
        </div>
        <input className="form-input" placeholder="Type a role and press Enter…" onKeyDown={handleRoleAdd} style={{ marginTop: '8px' }} />
      </Field>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   ABOUT SECTION
════════════════════════════════════════════════════ */
function AboutSection({ data, onSave, saving }) {
  const [d, setD] = useState(data);

  function setParas(idx, val) {
    const p = [...d.paragraphs]; p[idx] = val;
    setD((prev) => ({ ...prev, paragraphs: p }));
  }
  function addPara() { setD((p) => ({ ...p, paragraphs: [...p.paragraphs, ''] })); }
  function removePara(i) { setD((p) => ({ ...p, paragraphs: p.paragraphs.filter((_, idx) => idx !== i) })); }

  function setStat(i, k, v) {
    const s = d.stats.map((st, idx) => idx === i ? { ...st, [k]: v } : st);
    setD((p) => ({ ...p, stats: s }));
  }
  function addStat() { setD((p) => ({ ...p, stats: [...p.stats, { id: Date.now(), num: '', label: '' }] })); }
  function removeStat(i) { setD((p) => ({ ...p, stats: p.stats.filter((_, idx) => idx !== i) })); }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">About Section</h2>
        <SaveBtn onClick={() => onSave(d)} saving={saving} />
      </div>
      <Field label="Pull quote"><textarea className="form-textarea" value={d.quote} onChange={(e) => setD((p) => ({ ...p, quote: e.target.value }))} /></Field>

      <div className="admin-subsection-label">Paragraphs</div>
      {d.paragraphs.map((para, i) => (
        <div key={i} className="list-item-row">
          <textarea className="form-textarea" value={para} onChange={(e) => setParas(i, e.target.value)} style={{ minHeight: '80px' }} />
          <button className="btn-remove-item" onClick={() => removePara(i)}>✕</button>
        </div>
      ))}
      <button className="btn-add-item" onClick={addPara}>+ Add paragraph</button>

      <div className="admin-subsection-label" style={{ marginTop: '1.5rem' }}>Stats</div>
      {d.stats.map((s, i) => (
        <div key={i} className="list-item-row">
          <input className="form-input" value={s.num} onChange={(e) => setStat(i, 'num', e.target.value)} placeholder="5+" style={{ width: '80px', flexShrink: 0 }} />
          <input className="form-input" value={s.label} onChange={(e) => setStat(i, 'label', e.target.value)} placeholder="Years of experience" style={{ flex: 1 }} />
          <button className="btn-remove-item" onClick={() => removeStat(i)}>✕</button>
        </div>
      ))}
      <button className="btn-add-item" onClick={addStat}>+ Add stat</button>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   EXPERTISE SECTION
════════════════════════════════════════════════════ */
function ExpertiseSection({ data, onSave, saving }) {
  const [items, setItems] = useState(data);

  function setItem(i, k, v) {
    setItems((prev) => prev.map((it, idx) => idx === i ? { ...it, [k]: v } : it));
  }
  function addItem() {
    setItems((p) => [...p, { id: Date.now(), icon: '✦', title: '', desc: '' }]);
  }
  function removeItem(i) { setItems((p) => p.filter((_, idx) => idx !== i)); }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Expertise Cards</h2>
        <SaveBtn onClick={() => onSave(items)} saving={saving} />
      </div>
      {items.map((item, i) => (
        <div key={item.id} className="card-editor">
          <div className="card-editor-header">
            <span className="card-editor-num">Card {i + 1}</span>
            <button className="btn-remove-item" onClick={() => removeItem(i)}>✕ Remove</button>
          </div>
          <div className="form-grid-2">
            <Field label="Icon (emoji)"><input className="form-input" value={item.icon} onChange={(e) => setItem(i, 'icon', e.target.value)} /></Field>
            <Field label="Title"><input className="form-input" value={item.title} onChange={(e) => setItem(i, 'title', e.target.value)} /></Field>
          </div>
          <Field label="Description"><textarea className="form-textarea" value={item.desc} onChange={(e) => setItem(i, 'desc', e.target.value)} style={{ minHeight: '70px' }} /></Field>
        </div>
      ))}
      <button className="btn-add-item btn-add-card" onClick={addItem}>+ Add expertise card</button>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   PROCESS & TOOLS SECTION
════════════════════════════════════════════════════ */
function ProcessSection({ data, onSave, saving }) {
  const [steps, setSteps] = useState(data.steps);
  const [tools, setTools] = useState(data.tools);

  function setStep(i, k, v) {
    setSteps((p) => p.map((s, idx) => idx === i ? { ...s, [k]: v } : s));
  }
  function addStep() {
    setSteps((p) => [...p, { id: Date.now(), num: `0${p.length + 1}`, name: '', desc: '' }]);
  }
  function removeStep(i) { setSteps((p) => p.filter((_, idx) => idx !== i)); }

  function removeTool(i) { setTools((p) => p.filter((_, idx) => idx !== i)); }
  function addTool(e) {
    if (e.key === 'Enter' && e.target.value.trim()) {
      setTools((p) => [...p, e.target.value.trim()]);
      e.target.value = '';
      e.preventDefault();
    }
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Process & Tools</h2>
        <SaveBtn onClick={() => onSave({ steps, tools })} saving={saving} />
      </div>

      <div className="admin-subsection-label">Process Steps</div>
      {steps.map((s, i) => (
        <div key={s.id} className="card-editor">
          <div className="card-editor-header">
            <span className="card-editor-num">Step {i + 1}</span>
            <button className="btn-remove-item" onClick={() => removeStep(i)}>✕ Remove</button>
          </div>
          <div className="form-grid-2">
            <Field label="Number (e.g. 01)"><input className="form-input" value={s.num} onChange={(e) => setStep(i, 'num', e.target.value)} /></Field>
            <Field label="Step name"><input className="form-input" value={s.name} onChange={(e) => setStep(i, 'name', e.target.value)} /></Field>
          </div>
          <Field label="Description"><textarea className="form-textarea" value={s.desc} onChange={(e) => setStep(i, 'desc', e.target.value)} style={{ minHeight: '70px' }} /></Field>
        </div>
      ))}
      <button className="btn-add-item" onClick={addStep}>+ Add step</button>

      <div className="admin-subsection-label" style={{ marginTop: '2rem' }}>Tools (press Enter to add)</div>
      <div className="tag-list" style={{ marginBottom: '8px' }}>
        {tools.map((t, i) => (
          <span key={i} className="tag-item">{t} <button className="tag-remove" onClick={() => removeTool(i)}>×</button></span>
        ))}
      </div>
      <input className="form-input" placeholder="Type a tool name and press Enter…" onKeyDown={addTool} />
    </div>
  );
}

/* ════════════════════════════════════════════════════
   CONTACT SECTION
════════════════════════════════════════════════════ */
function ContactSection({ data, onSave, saving }) {
  const [d, setD] = useState(data);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const set = (k, v) => setD((p) => ({ ...p, [k]: v }));

  async function handleCvUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg('');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload-cv', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      set('cvUrl', json.url);
      setUploadMsg('✓ Uploaded: ' + file.name);
    } catch (err) {
      setUploadMsg('✗ ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Contact Section</h2>
        <SaveBtn onClick={() => onSave(d)} saving={saving} />
      </div>
      <Field label="Eyebrow label"><input className="form-input" value={d.label} onChange={(e) => set('label', e.target.value)} /></Field>
      <Field label="Heading"><input className="form-input" value={d.title} onChange={(e) => set('title', e.target.value)} /></Field>
      <Field label="Subtitle text"><textarea className="form-textarea" value={d.subtitle} onChange={(e) => set('subtitle', e.target.value)} style={{ minHeight: '70px' }} /></Field>
      <div className="form-grid-2">
        <Field label="Email address"><input className="form-input" type="email" value={d.email} onChange={(e) => set('email', e.target.value)} /></Field>
        <Field label="LinkedIn URL"><input className="form-input" value={d.linkedin} onChange={(e) => set('linkedin', e.target.value)} /></Field>
      </div>

      <div className="form-group">
        <label className="form-label">CV / Resume</label>
        <div className="cv-upload-box">
          <div className="cv-upload-left">
            <label className="btn-upload-cv" style={{ opacity: uploading ? 0.6 : 1 }}>
              {uploading ? 'Uploading…' : '⬆ Upload CV file'}
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleCvUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
            <span className="cv-upload-hint">PDF, DOC, DOCX · max 5 MB</span>
          </div>
          {d.cvUrl && (
            <a href={d.cvUrl} target="_blank" rel="noopener noreferrer" className="cv-current-link">
              ↗ View current CV
            </a>
          )}
        </div>
        {uploadMsg && (
          <p style={{
            fontSize: '12px', marginTop: '8px',
            color: uploadMsg.startsWith('✓') ? '#065f46' : '#b91c1c'
          }}>{uploadMsg}</p>
        )}
        <div style={{ marginTop: '10px' }}>
          <label className="form-label" style={{ fontSize: '10px' }}>Or paste a direct URL</label>
          <input className="form-input" value={d.cvUrl} onChange={(e) => set('cvUrl', e.target.value)} placeholder="https://... or /cv.pdf" />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   COLORS SECTION
════════════════════════════════════════════════════ */
const COLOR_FIELDS = [
  { key: 'heroFirst',  label: 'First name color',           hint: 'e.g. Supradarsana' },
  { key: 'heroLast',   label: 'Last name color (italic)',   hint: 'e.g. Chanda' },
  { key: 'primary',    label: 'Primary color',              hint: 'Buttons, highlights, progress bar' },
  { key: 'accent',     label: 'Accent / link color',        hint: 'Nav links, badges, view-blog button' },
  { key: 'background', label: 'Page background color',      hint: 'Main cream/white background' },
];

function ColorsSection({ data, onSave, saving }) {
  const defaults = {
    heroFirst: '#2C5545', heroLast: '#4E78B8',
    primary: '#C4607A', accent: '#4E78B8', background: '#FDF2F6',
  };
  const [d, setD] = useState({ ...defaults, ...(data || {}) });
  const set = (k, v) => setD((p) => ({ ...p, [k]: v }));

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Colors</h2>
        <SaveBtn onClick={() => onSave(d)} saving={saving} />
      </div>
      <p style={{ fontSize: '13px', color: 'var(--ink-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
        Changes take effect immediately on the live site. Click a color swatch to open the color picker, or type a hex code directly.
      </p>
      {COLOR_FIELDS.map(({ key, label, hint }) => (
        <div key={key} className="form-group color-field-row">
          <label className="form-label">{label}</label>
          <p style={{ fontSize: '11px', color: 'var(--ink-muted)', marginBottom: '8px', marginTop: '-2px' }}>{hint}</p>
          <div className="color-input-row">
            <input
              type="color"
              value={d[key] || defaults[key]}
              onChange={(e) => set(key, e.target.value)}
              className="color-swatch-input"
              title="Click to pick a color"
            />
            <input
              type="text"
              className="form-input"
              value={d[key] || defaults[key]}
              onChange={(e) => set(key, e.target.value)}
              placeholder="#000000"
              style={{ fontFamily: 'monospace', maxWidth: '140px' }}
            />
            <span className="color-preview-box" style={{ background: d[key] || defaults[key] }} />
            <button
              className="btn-cancel"
              style={{ fontSize: '11px', padding: '8px 14px' }}
              onClick={() => set(key, defaults[key])}
              title="Reset to default"
            >
              Reset
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   FOOTER SECTION
════════════════════════════════════════════════════ */
function FooterSection({ data, onSave, saving }) {
  const [d, setD] = useState(data);
  const set = (k, v) => setD((p) => ({ ...p, [k]: v }));

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Footer</h2>
        <SaveBtn onClick={() => onSave(d)} saving={saving} />
      </div>
      <Field label="Name (© 2026 Name)"><input className="form-input" value={d.name} onChange={(e) => set('name', e.target.value)} /></Field>
      <Field label="Location"><input className="form-input" value={d.location} onChange={(e) => set('location', e.target.value)} /></Field>
      <Field label="Availability text"><input className="form-input" value={d.availability} onChange={(e) => set('availability', e.target.value)} /></Field>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   BLOGS SECTION
════════════════════════════════════════════════════ */
function BlogsSection({ blogs, blogModal, editingId, blogForm, setBlogForm, blogSaving,
  deleteConfirm, setDeleteConfirm, urlInput, setUrlInput, fetching, fetchError,
  onAdd, onEdit, onClose, onSave, onDelete, onAutoFill }) {

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setBlogForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Blogs</h2>
        <button className="btn-add" onClick={onAdd}>+ Add New Blog</button>
      </div>

      {blogs.length === 0 ? (
        <div className="admin-empty">No blogs yet. Add your first one!</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th><th>Category</th><th>Date</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog) => (
              <tr key={blog.id}>
                <td>
                  <div className="admin-td-title">{blog.title}</div>
                  {blog.link && blog.link !== '#' && (
                    <a href={blog.link} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: '11px', color: 'var(--accent)', display: 'block',
                        marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap', maxWidth: '260px' }}>
                      ↗ {blog.link}
                    </a>
                  )}
                </td>
                <td><span className="admin-badge" style={{ background: 'var(--gold-pale)', color: 'var(--gold)' }}>{blog.tag || blog.category}</span></td>
                <td style={{ whiteSpace: 'nowrap', color: 'var(--ink-muted)', fontSize: '13px' }}>
                  {blog.date ? new Date(blog.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                </td>
                <td>
                  {blog.published
                    ? <span className="admin-badge admin-badge-pub">Published</span>
                    : <span className="admin-badge admin-badge-draft">Draft</span>}
                </td>
                <td>
                  <div className="admin-actions">
                    <button className="btn-edit" onClick={() => onEdit(blog)}>Edit</button>
                    {deleteConfirm === blog.id ? (
                      <>
                        <button className="btn-delete" onClick={() => onDelete(blog.id)}>Confirm</button>
                        <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                      </>
                    ) : (
                      <button className="btn-delete" onClick={() => setDeleteConfirm(blog.id)}>Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {blogModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
          <div className="modal">
            <h2 className="modal-title">{editingId ? 'Edit Blog' : 'Add New Blog'}</h2>

            <div className="url-autofill-box">
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Paste blog URL to auto-fill</label>
              <div className="url-autofill-row">
                <input type="url" className="form-input" value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://taggbox.com/blog/..."
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAutoFill())} />
                <button type="button" className="btn-autofill" onClick={onAutoFill} disabled={fetching || !urlInput.trim()}>
                  {fetching ? '…' : '⚡ Auto-fill'}
                </button>
              </div>
              {fetchError && <p style={{ fontSize: '12px', color: '#e57373', marginTop: '6px' }}>{fetchError}</p>}
            </div>

            <form onSubmit={onSave}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input name="title" className="form-input" value={blogForm.title} onChange={handleChange} required placeholder="Blog post title" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select name="category" className="form-select" value={blogForm.category} onChange={handleChange}>
                    {CAT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tag label</label>
                  <input name="tag" className="form-input" value={blogForm.tag} onChange={handleChange} placeholder="e.g. SaaS Content" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Excerpt</label>
                <textarea name="excerpt" className="form-textarea" value={blogForm.excerpt} onChange={handleChange} placeholder="Short description" style={{ minHeight: '80px' }} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Live Link URL</label>
                  <input name="link" className="form-input" value={blogForm.link} onChange={handleChange} placeholder="https://..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input name="date" type="date" className="form-input" value={blogForm.date} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <div className="form-checkbox-row">
                  <input id="pub" name="published" type="checkbox" checked={blogForm.published} onChange={handleChange} />
                  <label htmlFor="pub" className="form-label" style={{ margin: 0 }}>Published (visible on portfolio)</label>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn-save" disabled={blogSaving}>
                  {blogSaving ? 'Saving…' : editingId ? 'Save changes' : 'Create blog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Shared helpers ── */
function Field({ label, children }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

function SaveBtn({ onClick, saving }) {
  return (
    <button className="btn-save" onClick={onClick} disabled={saving} style={{ minWidth: '130px' }}>
      {saving ? 'Saving…' : '✓ Save changes'}
    </button>
  );
}
