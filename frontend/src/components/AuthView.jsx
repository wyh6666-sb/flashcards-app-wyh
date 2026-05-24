import React, { useState } from 'react';
import { useAuth } from '../auth.jsx';

export default function AuthView() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(form.username, form.password);
      } else {
        await register(form.username, form.email, form.password);
      }
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-header">
          <span className="brand-icon">🎓</span>
          <h1>Flashcard Learn</h1>
          <p className="muted">Build your own decks and study smarter.</p>
        </div>
        <div className="auth-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Sign in</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Create account</button>
        </div>
        <form onSubmit={onSubmit} className="auth-form">
          <label>Username
            <input name="username" value={form.username} onChange={onChange} required autoFocus />
          </label>
          {mode === 'register' && (
            <label>Email
              <input name="email" type="email" value={form.email} onChange={onChange} required />
            </label>
          )}
          <label>Password
            <input name="password" type="password" value={form.password} onChange={onChange} required minLength={mode === 'register' ? 6 : 1} />
          </label>
          {err && <div className="error">{err}</div>}
          <button className="btn btn-primary" disabled={busy} type="submit">
            {busy ? '...' : (mode === 'login' ? 'Sign in' : 'Create account')}
          </button>
        </form>
      </div>
    </div>
  );
}
