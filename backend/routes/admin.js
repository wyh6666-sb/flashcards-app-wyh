const express = require('express');
const pool = require('../config/db');
const { authRequired, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(authRequired, adminOnly);

// All users
router.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.email, u.role, u.created_at,
              (SELECT COUNT(*) FROM decks d WHERE d.user_id = u.id) AS deck_count,
              (SELECT COUNT(*) FROM flashcards f WHERE f.user_id = u.id) AS card_count,
              (SELECT COUNT(*) FROM view_history vh WHERE vh.user_id = u.id) AS history_count
       FROM users u ORDER BY u.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Delete a user
router.delete('/users/:id', async (req, res) => {
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete yourself' });
  }
  try {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// All users' learning history
router.get('/history', async (req, res) => {
  const { user_id } = req.query;
  const conditions = [];
  const params = [];
  if (user_id) { conditions.push('vh.user_id = ?'); params.push(user_id); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  try {
    const [rows] = await pool.query(
      `SELECT vh.id, vh.viewed_at, vh.result,
              u.username, u.id AS user_id,
              f.question, f.answer, f.id AS flashcard_id
       FROM view_history vh
       JOIN users u ON u.id = vh.user_id
       JOIN flashcards f ON f.id = vh.flashcard_id
       ${where}
       ORDER BY vh.viewed_at DESC
       LIMIT 500`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Aggregate statistics
router.get('/stats', async (req, res) => {
  try {
    const [[totals]] = await pool.query(
      `SELECT
        (SELECT COUNT(*) FROM users) AS users,
        (SELECT COUNT(*) FROM decks) AS decks,
        (SELECT COUNT(*) FROM flashcards) AS flashcards,
        (SELECT COUNT(*) FROM view_history) AS history_entries`
    );
    res.json(totals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
