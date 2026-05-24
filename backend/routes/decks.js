const express = require('express');
const pool = require('../config/db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// List all decks for current user
router.get('/', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.*, (SELECT COUNT(*) FROM flashcards f WHERE f.deck_id = d.id) AS card_count
       FROM decks d WHERE d.user_id = ?
       ORDER BY d.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch decks' });
  }
});

// Create deck
router.post('/', authRequired, async (req, res) => {
  const { title, description } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title is required' });
  try {
    const [result] = await pool.query(
      'INSERT INTO decks (user_id, title, description) VALUES (?, ?, ?)',
      [req.user.id, title, description || null]
    );
    res.status(201).json({ id: result.insertId, user_id: req.user.id, title, description });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create deck' });
  }
});

// Update deck
router.put('/:id', authRequired, async (req, res) => {
  const { title, description } = req.body || {};
  try {
    const [result] = await pool.query(
      'UPDATE decks SET title = COALESCE(?, title), description = COALESCE(?, description) WHERE id = ? AND user_id = ?',
      [title || null, description ?? null, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Deck not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update deck' });
  }
});

// Delete deck
router.delete('/:id', authRequired, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM decks WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Deck not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete deck' });
  }
});

module.exports = router;
