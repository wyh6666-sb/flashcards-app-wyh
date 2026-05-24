import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function StudyView({ deck, onBack }) {
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, skipped: 0 });
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      const c = await api.listCards({ deck_id: deck.id });
      // simple shuffle
      const shuffled = [...c].sort(() => Math.random() - 0.5);
      setCards(shuffled);
    })();
  }, [deck.id]);

  if (cards.length === 0) return <div className="empty">Loading...</div>;
  if (done) {
    const total = stats.correct + stats.incorrect + stats.skipped;
    const accuracy = total ? Math.round((stats.correct / total) * 100) : 0;
    return (
      <div className="study-done">
        <h2>Session complete 🎉</h2>
        <p className="muted">{deck.title}</p>
        <div className="result-stats">
          <div><big>{stats.correct}</big><span>Correct</span></div>
          <div><big>{stats.incorrect}</big><span>Incorrect</span></div>
          <div><big>{stats.skipped}</big><span>Skipped</span></div>
          <div><big>{accuracy}%</big><span>Accuracy</span></div>
        </div>
        <div className="actions">
          <button className="btn btn-ghost" onClick={onBack}>Back to decks</button>
          <button className="btn btn-primary" onClick={() => { setIndex(0); setFlipped(false); setStats({ correct: 0, incorrect: 0, skipped: 0 }); setDone(false); }}>
            Study again
          </button>
        </div>
      </div>
    );
  }

  const card = cards[index];

  const answer = async (result) => {
    try {
      await api.recordHistory({ flashcard_id: card.id, result });
    } catch (e) {}
    setStats((s) => ({ ...s, [result]: s[result] + 1 }));
    if (index + 1 >= cards.length) setDone(true);
    else { setIndex(index + 1); setFlipped(false); }
  };

  return (
    <div className="study">
      <div className="study-head">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
        <h2>{deck.title}</h2>
        <span className="muted">{index + 1} / {cards.length}</span>
      </div>

      <div className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)}>
        <div className="flashcard-inner">
          <div className="flashcard-face front">
            <span className="face-label">Question</span>
            <p>{card.question}</p>
            <span className="hint muted">Click to flip</span>
          </div>
          <div className="flashcard-face back">
            <span className="face-label">Answer</span>
            <p>{card.answer}</p>
          </div>
        </div>
      </div>

      <div className="study-actions">
        <button className="btn btn-ghost" onClick={() => answer('skipped')}>Skip</button>
        <button className="btn btn-danger" onClick={() => answer('incorrect')} disabled={!flipped}>✗ Incorrect</button>
        <button className="btn btn-success" onClick={() => answer('correct')} disabled={!flipped}>✓ Correct</button>
      </div>
      <div className="study-tally muted small">
        Session: ✓ {stats.correct} · ✗ {stats.incorrect} · ⤳ {stats.skipped}
      </div>
    </div>
  );
}
