const bcrypt = require('bcryptjs');
const pool = require('./config/db');

async function main() {
  console.log('Seeding database...');

  await pool.query('SET FOREIGN_KEY_CHECKS = 0');
  await pool.query('TRUNCATE TABLE view_history');
  await pool.query('TRUNCATE TABLE flashcards');
  await pool.query('TRUNCATE TABLE decks');
  await pool.query('TRUNCATE TABLE users');
  await pool.query('SET FOREIGN_KEY_CHECKS = 1');

  const adminHash = await bcrypt.hash('admin123', 10);
  const wyhHash = await bcrypt.hash('wyh123', 10);

  const [u1] = await pool.query(
    'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
    ['admin', 'admin@admin.com', adminHash, 'admin']
  );
  const [u2] = await pool.query(
    'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
    ['wyh', 'wyh@example.com', wyhHash, 'user']
  );

  const wyhId = u2.insertId;

  const [d1] = await pool.query(
    'INSERT INTO decks (user_id, title, description) VALUES (?, ?, ?)',
    [wyhId, 'Spanish Basics', 'Common Spanish vocabulary for beginners.']
  );
  const [d2] = await pool.query(
    'INSERT INTO decks (user_id, title, description) VALUES (?, ?, ?)',
    [wyhId, 'Chinese Basics', 'Common Chinese vocabulary for beginners.']
  );
 

  const cards = [
    [d1.insertId, wyhId, 'How do you say "Hello" in Spanish?', 'Hola', 'easy'],
    [d1.insertId, wyhId, 'Translate: "Thank you"', 'Gracias', 'easy'],
    [d1.insertId, wyhId, 'How do you say "Good morning" in Spanish?', 'Buenos dias', 'medium'],
    [d2.insertId, wyhId, 'How do you say "Hello" in Chinese?', '你好', 'easy'],
    [d2.insertId, wyhId, 'Translate: "Thank you"', '谢谢你', 'medium'],
    [d2.insertId, wyhId, 'How do you say "Good morning" in Chinese?', '早上好', 'hard'],
  ];

  const cardIds = [];
  for (const c of cards) {
    const [r] = await pool.query(
      'INSERT INTO flashcards (deck_id, user_id, question, answer, difficulty) VALUES (?, ?, ?, ?, ?)',
      c
    );
    cardIds.push(r.insertId);
  }

  const history = [
    [wyhId, cardIds[0], 'correct'],
    [wyhId, cardIds[1], 'correct'],
    [wyhId, cardIds[2], 'incorrect'],
    [wyhId, cardIds[3], 'correct'],
  ];
  for (const h of history) {
    await pool.query(
      'INSERT INTO view_history (user_id, flashcard_id, result) VALUES (?, ?, ?)',
      h
    );
  }

  console.log('✓ Seed complete. Demo accounts:');
  console.log('  admin / admin123  (role: admin)');
  console.log('  wyh / wyh123  (role: user)');
  await pool.end();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
