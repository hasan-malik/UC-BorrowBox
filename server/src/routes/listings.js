import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

const TYPES = new Set(['borrow', 'cobuy', 'offer']);
const RESIDENCES = new Set(['whitney', 'sir_daniels', 'morrison']);

router.get('/', async (req, res) => {
  const { type, residence, status } = req.query;
  const where = [];
  const params = [];
  if (type && TYPES.has(type)) {
    params.push(type);
    where.push(`l.type = $${params.length}`);
  }
  if (residence && RESIDENCES.has(residence)) {
    params.push(residence);
    where.push(`u.residence = $${params.length}`);
  }
  if (status === 'open' || status === 'closed') {
    params.push(status);
    where.push(`l.status = $${params.length}`);
  }
  const sql = `
    SELECT l.id, l.type, l.title, l.description, l.status, l.created_at,
           u.id AS user_id, u.name AS user_name, u.residence AS user_residence,
           (SELECT COUNT(*)::int FROM comments c WHERE c.listing_id = l.id) AS comment_count
      FROM listings l
      JOIN users u ON u.id = l.user_id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY l.created_at DESC
     LIMIT 200`;
  const { rows } = await query(sql, params);
  res.json({ listings: rows });
});

router.get('/:id', async (req, res) => {
  const { rows } = await query(
    `SELECT l.id, l.type, l.title, l.description, l.status, l.created_at,
            u.id AS user_id, u.name AS user_name, u.residence AS user_residence
       FROM listings l JOIN users u ON u.id = l.user_id
      WHERE l.id = $1`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Listing not found' });
  res.json({ listing: rows[0] });
});

router.post('/', requireAuth, async (req, res) => {
  const { type, title, description } = req.body || {};
  if (!type || !TYPES.has(type)) return res.status(400).json({ error: 'Invalid type' });
  if (!title || !title.trim()) return res.status(400).json({ error: 'Title required' });

  const { rows } = await query(
    `INSERT INTO listings (user_id, type, title, description)
     VALUES ($1, $2, $3, $4)
     RETURNING id, type, title, description, status, created_at`,
    [req.user.id, type, title.trim(), (description || '').trim()]
  );
  res.json({ listing: rows[0] });
});

router.patch('/:id', requireAuth, async (req, res) => {
  const { status } = req.body || {};
  if (status !== 'open' && status !== 'closed') {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const owner = await query('SELECT user_id FROM listings WHERE id=$1', [req.params.id]);
  if (!owner.rows[0]) return res.status(404).json({ error: 'Listing not found' });
  if (owner.rows[0].user_id !== req.user.id) return res.status(403).json({ error: 'Not your listing' });

  await query('UPDATE listings SET status=$1 WHERE id=$2', [status, req.params.id]);
  res.json({ ok: true });
});

router.delete('/:id', requireAuth, async (req, res) => {
  const owner = await query('SELECT user_id FROM listings WHERE id=$1', [req.params.id]);
  if (!owner.rows[0]) return res.status(404).json({ error: 'Listing not found' });
  if (owner.rows[0].user_id !== req.user.id) return res.status(403).json({ error: 'Not your listing' });
  await query('DELETE FROM listings WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

export default router;
