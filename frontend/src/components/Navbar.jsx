import React from 'react';
import { useAuth } from '../auth.jsx';

export default function Navbar({ route, onNavigate }) {
  const { user, logout } = useAuth();
  const tab = (name, label) => (
    <button
      className={`nav-tab ${route.name === name ? 'active' : ''}`}
      onClick={() => onNavigate({ name })}
    >
      {label}
    </button>
  );

  return (
    <header className="navbar">
      <div className="brand">
        <span className="brand-icon">🎓</span>
        <span>Flashcard Learn</span>
      </div>
      <nav className="nav-tabs">
        {tab('dashboard', 'My Decks')}
        {tab('history', 'History')}
        {user.role === 'admin' && tab('admin', 'Admin')}
      </nav>
      <div className="user-area">
        <span className="user-chip">
          {user.username}
          <span className="badge">{user.role}</span>
        </span>
        <button className="btn btn-ghost" onClick={logout}>Logout</button>
      </div>
    </header>
  );
}
