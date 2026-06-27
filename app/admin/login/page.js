'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Incorrect password');
      }
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-eyebrow">
          <span className="login-eyebrow-line" />
          <span className="login-eyebrow-text">Admin access</span>
        </div>
        <h1 className="login-title">Blog Manager</h1>
        <p className="login-sub">Enter the password to continue.</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoFocus
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            {loading ? 'Checking…' : 'Enter Admin →'}
          </button>
        </form>

        <a href="/" className="login-back">← Back to portfolio</a>
      </div>
    </div>
  );
}
