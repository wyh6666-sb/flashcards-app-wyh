const express = require('express');
const pool = require('../config/db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// Record a study event
router.post('/', authRequired, async (req, res) => {
  const { flashcard_id, result } = req.body || {};
  if (!flashcard_id) return res.status(400).json({ error: 'flashcard_id is required' });
  if (result && !['correct', 'incorrect', 'skipped'].includes(result)) {
    return res.status(400).json({ error: 'invalid result' });
  }
  try {
    const [insert] = await pool.query(
      'INSERT INTO view_history (user_id, flashcard_id, result) VALUES (?, ?, ?)',
      [req.user.id, flashcard_id, result || 'skipped']
    );
    res.status(201).json({ id: insert.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record history' });
  }
});

// User's own history
router.get('/me', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT vh.*, f.question, f.answer
       FROM view_history vh
       JOIN flashcards f ON f.id = vh.flashcard_id
       WHERE vh.user_id = ?
       ORDER BY vh.viewed_at DESC
       LIMIT 200`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Delete a single history
router.delete('/:id', authRequired, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM view_history WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Entry not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete history entry' });
  }
});

module.exports = router;
