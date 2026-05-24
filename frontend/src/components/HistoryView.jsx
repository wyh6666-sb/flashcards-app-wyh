import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';

export default function HistoryView() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.myHistory();
      setItems(data);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const t = q.toLowerCase();
    return items.filter((i) =>
      i.question.toLowerCase().includes(t) ||
      i.answer.toLowerCase().includes(t) ||
      i.result.toLowerCase().includes(t)
    );
  }, [items, q]);

  const remove = async (id) => {
    if (!confirm('Delete this history entry?')) return;
    await api.deleteHistory(id);
    load();
  };

  const summary = useMemo(() => {
    const s = { correct: 0, incorrect: 0, skipped: 0 };
    items.forEach((i) => { s[i.result] = (s[i.result] || 0) + 1; });
    return s;
  }, [items]);

  return (
    <div className="history">
      <div className="content-head">
        <div>
          <h2>My Learning History</h2>
          <p className="muted">Total: {items.length} · ✓ {summary.correct} · ✗ {summary.incorrect} · ⤳ {summary.skipped}</p>
        </div>
      </div>
      <div className="search-row">
        <input className="search" type="search" placeholder="🔍 Filter history..."
          value={q} onChange={(e) => setQ(e.target.value)} />
        {q && <button className="btn btn-ghost btn-sm" onClick={() => setQ('')}>Clear</button>}
      </div>
      {loading ? <p className="muted">Loading...</p> : (
        filtered.length === 0
          ? <div className="empty">No history yet — start a study session!</div>
          : (
            <table className="data-table">
              <thead>
                <tr><th>When</th><th>Question</th><th>Answer</th><th>Result</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map((i) => (
                  <tr key={i.id}>
                    <td className="muted small">{new Date(i.viewed_at).toLocaleString()}</td>
                    <td>{i.question}</td>
                    <td>{i.answer}</td>
                    <td><span className={`pill result-${i.result}`}>{i.result}</span></td>
                    <td><button className="icon-btn danger" onClick={() => remove(i.id)}>🗑</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
      )}
    </div>
  );
}
