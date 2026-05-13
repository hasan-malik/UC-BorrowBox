import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router({ mergeParams: true });

router.get('/listings/:id/comments', async (req, res) => {
  const { rows } = await query(
    `SELECT c.id, c.body, c.created_at,
            u.id AS user_id, u.name AS user_name, u.residence AS user_residence
       FROM comments c JOIN users u ON u.id = c.user_id
      WHERE c.listing_id = $1
      ORDER BY c.created_at ASC`,
    [req.params.id]
  );
  res.json({ comments: rows });
});

router.post('/listings/:id/comments', requireAuth, async (req, res) => {
  const { body } = req.body || {};
  if (!body || !body.trim()) return res.status(400).json({ error: 'Comment body required' });

  const exists = await query('SELECT 1 FROM listings WHERE id=$1', [req.params.id]);
  if (!exists.rows[0]) return res.status(404).json({ error: 'Listing not found' });

  const { rows } = await query(
    `INSERT INTO comments (listing_id, user_id, body)
     VALUES ($1, $2, $3)
     RETURNING id, body, created_at`,
    [req.params.id, req.user.id, body.trim()]
  );
  res.json({ comment: rows[0] });
});

router.delete('/comments/:cid', requireAuth, async (req, res) => {
  const { rows } = await query('SELECT user_id FROM comments WHERE id=$1', [req.params.cid]);
  if (!rows[0]) return res.status(404).json({ error: 'Comment not found' });
  if (rows[0].user_id !== req.user.id) return res.status(403).json({ error: 'Not your comment' });
  await query('DELETE FROM comments WHERE id=$1', [req.params.cid]);
  res.json({ ok: true });
});

export default router;
