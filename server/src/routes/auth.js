import { Router } from 'express';
import bcrypt from 'bcrypt';
import { query } from '../db.js';
import { signToken, requireAuth } from '../auth.js';
import { sendOtpEmail, sendWelcomeEmail, sendLoginAlertEmail } from '../email.js';

const router = Router();

const RESIDENCES = new Set(['whitney', 'sir_daniels', 'morrison']);
const TERMS = new Set(['summer', 'fall_winter']);
const UTORONTO_RE = /^[^\s@]+@(mail\.utoronto\.ca|utoronto\.ca)$/i;
// Open signup by default — only gate to utoronto.ca when explicitly enabled.
const RESTRICT_UOFT_EMAIL = process.env.RESTRICT_UOFT_EMAIL === 'true';

function genOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

router.post('/signup', async (req, res) => {
  const { email, password, name, residence, term } = req.body || {};
  if (!email || !password || !name || !residence || !term) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (RESTRICT_UOFT_EMAIL && !UTORONTO_RE.test(email)) {
    return res.status(400).json({ error: 'Must be a utoronto.ca email address' });
  }
  if (!RESIDENCES.has(residence)) {
    return res.status(400).json({ error: 'Invalid residence' });
  }
  if (!TERMS.has(term)) {
    return res.status(400).json({ error: 'Invalid term' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await query('SELECT id, verified FROM users WHERE email = $1', [normalizedEmail]);
  if (existing.rows[0]?.verified) {
    return res.status(409).json({ error: 'An account with that email already exists' });
  }

  const password_hash = await bcrypt.hash(password, 10);
  const otp = genOtp();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  if (existing.rows[0]) {
    await query(
      `UPDATE users SET password_hash=$1, name=$2, residence=$3, term=$4,
         otp_code=$5, otp_expires_at=$6 WHERE email=$7`,
      [password_hash, name, residence, term, otp, otpExpires, normalizedEmail]
    );
  } else {
    await query(
      `INSERT INTO users (email, password_hash, name, residence, term, otp_code, otp_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [normalizedEmail, password_hash, name, residence, term, otp, otpExpires]
    );
  }

  sendOtpEmail(normalizedEmail, otp).catch((err) => console.error('OTP email failed:', err));

  res.json({ ok: true, message: 'Verification code sent. Check your utoronto email.' });
});

router.post('/verify', async (req, res) => {
  const { email, code } = req.body || {};
  if (!email || !code) return res.status(400).json({ error: 'Missing email or code' });

  const { rows } = await query(
    `SELECT id, email, name, residence, term, verified, otp_code, otp_expires_at
       FROM users WHERE email = $1`,
    [email.toLowerCase().trim()]
  );
  const user = rows[0];
  if (!user) return res.status(404).json({ error: 'No account found for that email' });
  if (user.verified) return res.status(400).json({ error: 'Account already verified' });
  if (!user.otp_code || !user.otp_expires_at) {
    return res.status(400).json({ error: 'No active verification code' });
  }
  if (new Date(user.otp_expires_at) < new Date()) {
    return res.status(400).json({ error: 'Verification code expired' });
  }
  if (user.otp_code !== String(code).trim()) {
    return res.status(400).json({ error: 'Incorrect code' });
  }

  await query(
    `UPDATE users SET verified=TRUE, otp_code=NULL, otp_expires_at=NULL WHERE id=$1`,
    [user.id]
  );

  sendWelcomeEmail(user.email, user.name).catch(() => {});

  const token = signToken(user);
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, residence: user.residence, term: user.term },
  });
});

router.post('/resend', async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Missing email' });
  const normalizedEmail = email.toLowerCase().trim();
  const { rows } = await query('SELECT id, verified FROM users WHERE email=$1', [normalizedEmail]);
  if (!rows[0]) return res.status(404).json({ error: 'No account found for that email' });
  if (rows[0].verified) return res.status(400).json({ error: 'Account already verified' });

  const otp = genOtp();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await query('UPDATE users SET otp_code=$1, otp_expires_at=$2 WHERE id=$3', [otp, otpExpires, rows[0].id]);
  sendOtpEmail(normalizedEmail, otp).catch((err) => console.error('OTP email failed:', err));
  res.json({ ok: true });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  const { rows } = await query(
    `SELECT id, email, password_hash, name, residence, term, verified
       FROM users WHERE email=$1`,
    [email.toLowerCase().trim()]
  );
  const user = rows[0];
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
  if (!user.verified) {
    return res.status(403).json({ error: 'Email not yet verified', needsVerification: true });
  }

  sendLoginAlertEmail(user.email, user.name).catch(() => {});

  const token = signToken(user);
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, residence: user.residence, term: user.term },
  });
});

router.get('/me', requireAuth, async (req, res) => {
  const { rows } = await query(
    'SELECT id, email, name, residence, term FROM users WHERE id=$1',
    [req.user.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'User not found' });
  res.json({ user: rows[0] });
});

router.patch('/me', requireAuth, async (req, res) => {
  const { residence, term } = req.body || {};
  if (residence && !RESIDENCES.has(residence)) return res.status(400).json({ error: 'Invalid residence' });
  if (term && !TERMS.has(term)) return res.status(400).json({ error: 'Invalid term' });
  if (!residence && !term) return res.status(400).json({ error: 'Nothing to update' });

  const sets = [];
  const vals = [];
  if (residence) { vals.push(residence); sets.push(`residence=$${vals.length}`); }
  if (term)      { vals.push(term);      sets.push(`term=$${vals.length}`); }
  vals.push(req.user.id);
  await query(`UPDATE users SET ${sets.join(', ')} WHERE id=$${vals.length}`, vals);

  const { rows } = await query(
    'SELECT id, email, name, residence, term FROM users WHERE id=$1',
    [req.user.id]
  );
  res.json({ user: rows[0] });
});

export default router;
