import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import Modal from './Modal.jsx';

export default function DashboardView({ onStudy }) {
  const [decks, setDecks] = useState([]);
  const [cards, setCards] = useState([]);
  const [activeDeckId, setActiveDeckId] = useState(null);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [deckModal, setDeckModal] = useState(null);  // null | {} | {id,...}
  const [cardModal, setCardModal] = useState(null);

  // Live search debounce
  useEffect(() => {
    const id = setTimeout(() => refreshCards(), 200);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, activeDeckId]);

  useEffect(() => { refreshAll(); }, []);

  const refreshAll = async () => {
    setLoading(true);
    try {
      const d = await api.listDecks();
      setDecks(d);
      if (!activeDeckId && d.length > 0) setActiveDeckId(d[0].id);
      await refreshCards();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const refreshCards = async () => {
    try {
      const params = {};
      if (activeDeckId) params.deck_id = activeDeckId;
      if (q.trim()) params.q = q.trim();
      const c = await api.listCards(params);
      setCards(c);
    } catch (e) { console.error(e); }
  };

  const activeDeck = useMemo(() => decks.find((d) => d.id === activeDeckId), [decks, activeDeckId]);

  const saveDeck = async (form) => {
    if (deckModal?.id) {
      await api.updateDeck(deckModal.id, form);
    } else {
      const created = await api.createDeck(form);
      setActiveDeckId(created.id);
    }
    setDeckModal(null);
    await refreshAll();
  };

  const deleteDeck = async (id) => {
    if (!confirm('Delete this deck and all its cards?')) return;
    await api.deleteDeck(id);
    if (activeDeckId === id) setActiveDeckId(null);
    await refreshAll();
  };

  const saveCard = async (form) => {
    if (cardModal?.id) {
      await api.updateCard(cardModal.id, form);
    } else {
      await api.createCard({ ...form, deck_id: activeDeckId });
    }
    setCardModal(null);
    await refreshAll();
  };

  const deleteCard = async (id) => {
    if (!confirm('Delete this card?')) return;
    await api.deleteCard(id);
    refreshCards();
    // refresh deck counts
    const d = await api.listDecks();
    setDecks(d);
  };

  return (
    <div className="dash">
      <aside className="sidebar">
        <div className="sidebar-head">
          <h2>Decks</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setDeckModal({})}>+ New</button>
        </div>
        {loading && <p className="muted">Loading...</p>}
        {!loading && decks.length === 0 && (
          <p className="muted">No decks yet. Click "+ New" to create one.</p>
        )}
        <ul className="deck-list">
          {decks.map((d) => (
            <li
              key={d.id}
              className={d.id === activeDeckId ? 'active' : ''}
              onClick={() => setActiveDeckId(d.id)}
            >
              <div className="deck-info">
                <div className="deck-title">{d.title}</div>
                <div className="deck-meta">{d.card_count} cards</div>
              </div>
              <div className="row-actions">
                <button className="icon-btn" title="Edit"
                  onClick={(e) => { e.stopPropagation(); setDeckModal(d); }}>✎</button>
                <button className="icon-btn danger" title="Delete"
                  onClick={(e) => { e.stopPropagation(); deleteDeck(d.id); }}>🗑</button>
              </div>
            </li>
          ))}
        </ul>
      </aside>

      <section className="content">
        <div className="content-head">
          <div>
            <h2>{activeDeck ? activeDeck.title : 'Select a deck'}</h2>
            {activeDeck?.description && <p className="muted">{activeDeck.description}</p>}
          </div>
          <div className="content-actions">
            {activeDeck && cards.length > 0 && (
              <button className="btn btn-success" onClick={() => onStudy(activeDeck)}>▶ Study</button>
            )}
            {activeDeck && (
              <button className="btn btn-primary" onClick={() => setCardModal({})}>+ Add card</button>
            )}
          </div>
        </div>

        <div className="search-row">
          <input
            className="search"
            type="search"
            placeholder="🔍 Search cards (live)..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {q && <button className="btn btn-ghost btn-sm" onClick={() => setQ('')}>Clear</button>}
          <span className="muted small">{cards.length} result{cards.length !== 1 ? 's' : ''}</span>
        </div>

        {cards.length === 0 ? (
          <div className="empty">
            {activeDeck ? (q ? 'No cards match your search.' : 'This deck is empty. Add your first card!') : 'Pick a deck on the left.'}
          </div>
        ) : (
          <ul className="card-grid">
            {cards.map((c) => (
              <li className="card" key={c.id}>
                <div className="card-q">{c.question}</div>
                <div className="card-a">{c.answer}</div>
                <div className="card-foot">
                  <span className={`pill diff-${c.difficulty}`}>{c.difficulty}</span>
                  <div className="row-actions">
                    <button className="icon-btn" onClick={() => setCardModal(c)}>✎</button>
                    <button className="icon-btn danger" onClick={() => deleteCard(c.id)}>🗑</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {deckModal && (
        <DeckForm
          initial={deckModal}
          onClose={() => setDeckModal(null)}
          onSave={saveDeck}
        />
      )}
      {cardModal && (
        <CardForm
          initial={cardModal}
          decks={decks}
          activeDeckId={activeDeckId}
          onClose={() => setCardModal(null)}
          onSave={saveCard}
        />
      )}
    </div>
  );
}

function DeckForm({ initial, onClose, onSave }) {
  const [form, setForm] = useState({ title: initial.title || '', description: initial.description || '' });
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { await onSave(form); } finally { setBusy(false); }
  };
  return (
    <Modal title={initial.id ? 'Edit deck' : 'New deck'} onClose={onClose}>
      <form onSubmit={submit} className="stack">
        <label>Title
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
        </label>
        <label>Description
          <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <div className="actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={busy} type="submit">{busy ? '...' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}

function CardForm({ initial, decks, activeDeckId, onClose, onSave }) {
  const [form, setForm] = useState({
    question: initial.question || '',
    answer: initial.answer || '',
    difficulty: initial.difficulty || 'medium',
    deck_id: initial.deck_id || activeDeckId,
  });
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { await onSave(form); } finally { setBusy(false); }
  };
  return (
    <Modal title={initial.id ? 'Edit card' : 'New card'} onClose={onClose}>
      <form onSubmit={submit} className="stack">
        <label>Deck
          <select value={form.deck_id || ''} onChange={(e) => setForm({ ...form, deck_id: Number(e.target.value) })} required>
            {decks.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
          </select>
        </label>
        <label>Question
          <textarea required rows={2} value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} autoFocus />
        </label>
        <label>Answer
          <textarea required rows={3} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
        </label>
        <label>Difficulty
          <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>
        <div className="actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={busy} type="submit">{busy ? '...' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}
