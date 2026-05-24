const express = require('express');
const pool = require('../config/db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// List flashcards
router.get('/', authRequired, async (req, res) => {
  const { q, deck_id } = req.query;
  const conditions = ['f.user_id = ?'];
  const params = [req.user.id];

  if (deck_id) {
    conditions.push('f.deck_id = ?');
    params.push(deck_id);
  }
  if (q && q.trim() !== '') {
    conditions.push('(f.question LIKE ? OR f.answer LIKE ?)');
    const like = `%${q.trim()}%`;
    params.push(like, like);
  }

  const sql = `
    SELECT f.*, d.title AS deck_title
    FROM flashcards f
    LEFT JOIN decks d ON d.id = f.deck_id
    WHERE ${conditions.join(' AND ')}
    ORDER BY f.created_at DESC
    LIMIT 500`;

  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch flashcards' });
  }
});

// Get one flashcard
router.get('/:id', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM flashcards WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Flashcard not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch flashcard' });
  }
});

// Create flashcard
router.post('/', authRequired, async (req, res) => {
  const { deck_id, question, answer, difficulty } = req.body || {};
  if (!deck_id || !question || !answer) {
    return res.status(400).json({ error: 'deck_id, question, answer are required' });
  }
  try {
    // Ensure deck belongs to current user
    const [d] = await pool.query('SELECT id FROM decks WHERE id = ? AND user_id = ?', [deck_id, req.user.id]);
    if (d.length === 0) return res.status(403).json({ error: 'Deck does not belong to user' });

    const [result] = await pool.query(
      'INSERT INTO flashcards (deck_id, user_id, question, answer, difficulty) VALUES (?, ?, ?, ?, ?)',
      [deck_id, req.user.id, question, answer, difficulty || 'medium']
    );
    res.status(201).json({ id: result.insertId, deck_id, user_id: req.user.id, question, answer, difficulty: difficulty || 'medium' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create flashcard' });
  }
});

// Update flashcard
router.put('/:id', authRequired, async (req, res) => {
  const { question, answer, difficulty, deck_id } = req.body || {};
  try {
    const [result] = await pool.query(
      `UPDATE flashcards
       SET question = COALESCE(?, question),
           answer = COALESCE(?, answer),
           difficulty = COALESCE(?, difficulty),
           deck_id = COALESCE(?, deck_id)
       WHERE id = ? AND user_id = ?`,
      [question || null, answer || null, difficulty || null, deck_id || null, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Flashcard not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update flashcard' });
  }
});

// Delete flashcard
router.delete('/:id', authRequired, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM flashcards WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Flashcard not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete flashcard' });
  }
});

module.exports = router;
