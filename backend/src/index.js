import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const seedEmail = (process.env.SEED_EMAIL || '').trim().toLowerCase();
const seedPassword = process.env.SEED_PASSWORD || '';

if (!seedEmail || !seedPassword) {
  throw new Error('SEED_EMAIL and SEED_PASSWORD must be configured in the backend .env file.');
}

const adminUser = {
  email: seedEmail,
  fullName: 'Aditi',
  birthdayMessage: 'Happy Birthday, my love. You make every day brighter. I love you more than words can say.',
  passwordHash: await bcrypt.hash(seedPassword, 10),
};

const gifts = [
  {
    id: 1,
    name: 'Love letter',
    description: 'A heartfelt note filled with love, gratitude, and future dreams.',
    emoji: '💌',
    tag: 'letter',
  },
  {
    id: 2,
    name: 'Candlelight dinner',
    description: 'A romantic evening with good food, warm lights, and your favorite smile.',
    emoji: '🥂',
    tag: 'romance',
  },
  {
    id: 3,
    name: 'Dream trip',
    description: 'A getaway where we make memories and chase adventures together.',
    emoji: '✈️',
    tag: 'travel',
  },
  {
    id: 4,
    name: 'Jewellery treasure',
    description: 'Something beautiful to keep close and remind you how precious you are.',
    emoji: '💍',
    tag: 'gift',
  },
];

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Backend running without database.' });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ ok: false, message: 'Email and password are required.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  if (normalizedEmail !== adminUser.email) {
    return res.status(401).json({ ok: false, message: 'Invalid email or password.' });
  }

  const passwordMatches = await bcrypt.compare(password, adminUser.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ ok: false, message: 'Invalid email or password.' });
  }

  return res.json({
    ok: true,
    user: {
      id: 1,
      email: adminUser.email,
      fullName: adminUser.fullName,
    },
  });
});

app.get('/api/profile', (req, res) => {
  const email = (req.query.email || '').toString().trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ ok: false, message: 'Email is required.' });
  }

  if (email !== adminUser.email) {
    return res.status(404).json({ ok: false, message: 'User not found.' });
  }

  return res.json({
    ok: true,
    user: {
      id: 1,
      email: adminUser.email,
      full_name: adminUser.fullName,
      birthday_message: adminUser.birthdayMessage,
    },
  });
});

app.get('/api/gifts', (_req, res) => {
  res.json({ ok: true, gifts });
});

export default app;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}
