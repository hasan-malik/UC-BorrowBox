import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../auth.js';
import { sendReplyNotificationEmail } from '../email.js';

const router = Router({ mergeParams: true });

// True when the commenter signed up with a University of Toronto email.
const UOFT_VERIFIED_EXPR =
  "(lower(u.email) LIKE '%@utoronto.ca' OR lower(u.email) LIKE '%@mail.utoronto.ca') AS user_uoft_verified";

router.get('/listings/:id/comments', async (req, res) => {
  const { rows } = await query(
    `SELECT c.id, c.body, c.created_at,
            u.id AS user_id, u.name AS user_name, u.residence AS user_residence,
            ${UOFT_VERIFIED_EXPR}
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

  // Notify listing owner (skip if they're replying to their own listing)
  const { rows: meta } = await query(
    `SELECT l.title, l.user_id, u.email AS owner_email, u.name AS owner_name,
            cu.name AS commenter_name
       FROM listings l
       JOIN users u  ON u.id  = l.user_id
       JOIN users cu ON cu.id = $2
      WHERE l.id = $1`,
    [req.params.id, req.user.id]
  );
  if (meta[0] && meta[0].user_id !== req.user.id) {
    sendReplyNotificationEmail(meta[0].owner_email, meta[0].owner_name, {
      commenterName: meta[0].commenter_name,
      listingTitle:  meta[0].title,
      commentBody:   body.trim(),
    }).catch(() => {});
  }

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
