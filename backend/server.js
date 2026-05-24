const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const deckRoutes = require('./routes/decks');
const flashcardRoutes = require('./routes/flashcards');
const historyRoutes = require('./routes/history');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/decks', deckRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/admin', adminRoutes);

//404
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Flashcard backend running on http://localhost:${PORT}`);
});
