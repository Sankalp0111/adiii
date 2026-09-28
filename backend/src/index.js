import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const app = express();
const PORT = Number(process.env.PORT) || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const DEFAULT_DATABASE_URL = 'postgresql://gh_user:gh_pass@localhost:5433/guesthouse';
const databaseUrl = process.env.DATABASE_URL || DEFAULT_DATABASE_URL;
const isLocalDatabase = !databaseUrl.includes('localhost') && !databaseUrl.includes('127.0.0.1') ? false : true;

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: isLocalDatabase ? false : { rejectUnauthorized: false },
});

const allowedOrigins = new Set(['http://localhost:5173', 'http://127.0.0.1:5173']);

const ensureDatabaseSchema = async () => {
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
};

await ensureDatabaseSchema();

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ ok: true, time: result.rows[0].now, database: 'connected' });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Database unavailable', error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ ok: false, message: 'Email and password are required.' });
  }

  try {
    const result = await pool.query(
      'SELECT id, email, password_hash, full_name FROM users WHERE email = $1 LIMIT 1',
      [email.trim().toLowerCase()]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ ok: false, message: 'Invalid email or password.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ ok: false, message: 'Invalid email or password.' });
    }

    return res.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
      },
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: 'Login failed.', error: error.message });
  }
});

app.get('/api/profile', async (req, res) => {
  const email = (req.query.email || '').toString().trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ ok: false, message: 'Email is required.' });
  }

  try {
    const result = await pool.query(
      'SELECT id, email, full_name, birthday_message FROM users WHERE email = $1 LIMIT 1',
      [email]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ ok: false, message: 'User not found.' });
    }

    res.json({ ok: true, user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Could not load profile.', error: error.message });
  }
});

app.get('/api/gifts', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM birthday_gifts ORDER BY id ASC');
    res.json({ ok: true, gifts: rows });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Could not load gifts.', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
