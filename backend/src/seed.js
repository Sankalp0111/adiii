import bcrypt from 'bcryptjs';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://gh_user:gh_pass@localhost:5433/guesthouse',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

const seed = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      birthday_message TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS birthday_gifts (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      emoji TEXT NOT NULL,
      tag TEXT NOT NULL
    );
  `);

  const email = 'aditiullas123@gmail.com';
  const passwordHash = await bcrypt.hash('SankalpAditi@290103', 10);

  await pool.query(
    `INSERT INTO users (email, password_hash, full_name, birthday_message)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET
       password_hash = EXCLUDED.password_hash,
       full_name = EXCLUDED.full_name,
       birthday_message = EXCLUDED.birthday_message`,
    [email, passwordHash, 'Aditi', 'Happy Birthday, my love. You make every day brighter. I love you more than words can say.']
  );

  const gifts = [
    { name: 'Love letter', description: 'A heartfelt note filled with love, gratitude, and future dreams.', emoji: '💌', tag: 'letter' },
    { name: 'Candlelight dinner', description: 'A romantic evening with good food, warm lights, and your favorite smile.', emoji: '🥂', tag: 'romance' },
    { name: 'Dream trip', description: 'A getaway where we make memories and chase adventures together.', emoji: '✈️', tag: 'travel' },
    { name: 'Jewellery treasure', description: 'Something beautiful to keep close and remind you how precious you are.', emoji: '💍', tag: 'gift' },
  ];

  for (const gift of gifts) {
    await pool.query(
      `INSERT INTO birthday_gifts (name, description, emoji, tag)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (name) DO UPDATE SET
         description = EXCLUDED.description,
         emoji = EXCLUDED.emoji,
         tag = EXCLUDED.tag`,
      [gift.name, gift.description, gift.emoji, gift.tag]
    );
  }

  console.log('Seed complete.');
};

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
}).finally(() => {
  pool.end();
});
