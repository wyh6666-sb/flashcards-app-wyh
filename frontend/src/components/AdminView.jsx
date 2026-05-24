import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';

export default function AdminView() {
  const [tab, setTab] = useState('users');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [history, setHistory] = useState([]);
  const [userFilter, setUserFilter] = useState('');
  const [historyFilter, setHistoryFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  const refresh = async () => {
    try {
      const [s, u] = await Promise.all([api.adminStats(), api.adminUsers()]);
      setStats(s);
      setUsers(u);
    } catch (e) { console.error(e); }
  };
  const refreshHistory = async () => {
    const h = await api.adminHistory(selectedUser || undefined);
    setHistory(h);
  };

  useEffect(() => { refresh(); }, []);
  useEffect(() => { if (tab === 'history') refreshHistory(); }, [tab, selectedUser]);

  const filteredUsers = useMemo(() => {
    if (!userFilter) return users;
    const t = userFilter.toLowerCase();
    return users.filter((u) => u.username.toLowerCase().includes(t) || u.email.toLowerCase().includes(t));
  }, [users, userFilter]);

  const filteredHistory = useMemo(() => {
    if (!historyFilter) return history;
    const t = historyFilter.toLowerCase();
    return history.filter((h) =>
      h.username.toLowerCase().includes(t) ||
      h.question.toLowerCase().includes(t) ||
      h.answer.toLowerCase().includes(t)
    );
  }, [history, historyFilter]);

  const deleteUser = async (id) => {
    if (!confirm('Delete this user and all their data?')) return;
    await api.adminDeleteUser(id);
    refresh();
  };

  return (
    <div className="admin">
      <div className="content-head">
        <h2>Admin Panel</h2>
      </div>

      {stats && (
        <div className="stats-row">
          <Stat label="Users" value={stats.users} />
          <Stat label="Decks" value={stats.decks} />
          <Stat label="Flashcards" value={stats.flashcards} />
          <Stat label="Study Events" value={stats.history_entries} />
        </div>
      )}

      <div className="admin-tabs">
        <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>Users</button>
        <button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>All Learning History</button>
      </div>

      {tab === 'users' && (
        <>
          <div className="search-row">
            <input className="search" type="search" placeholder="🔍 Search users..."
              value={userFilter} onChange={(e) => setUserFilter(e.target.value)} />
          </div>
          <table className="data-table">
            <thead>
              <tr><th>User</th><th>Email</th><th>Role</th><th>Decks</th><th>Cards</th><th>Studied</th><th>Joined</th><th>History</th></tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.username}</strong></td>
                  <td>{u.email}</td>
                  <td><span className={`pill role-${u.role}`}>{u.role}</span></td>
                  <td>{u.deck_count}</td>
                  <td>{u.card_count}</td>
                  <td>{u.history_count}</td>
                  <td className="muted small">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedUser(String(u.id)); setTab('history'); }}>View history</button>
                    {u.role !== 'admin' && (
                      <button className="icon-btn danger" onClick={() => deleteUser(u.id)}>🗑</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {tab === 'history' && (
        <>
          <div className="search-row">
            <input className="search" type="search" placeholder="🔍 Filter..."
              value={historyFilter} onChange={(e) => setHistoryFilter(e.target.value)} />
          </div>
          <div className="search-row">
            <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
              <option value="">All users</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.username}</option>)}
            </select>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Active Time</th><th>User</th><th>Question</th><th>Answer</th><th>Result</th></tr>
            </thead>
            <tbody>
              {filteredHistory.map((h) => (
                <tr key={h.id}>
                  <td className="muted small">{new Date(h.viewed_at).toLocaleString()}</td>
                  <td><strong>{h.username}</strong></td>
                  <td>{h.question}</td>
                  <td>{h.answer}</td>
                  <td><span className={`pill result-${h.result}`}>{h.result}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat-box">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
