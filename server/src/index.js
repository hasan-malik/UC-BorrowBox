import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import authRoutes from './routes/auth.js';
import listingsRoutes from './routes/listings.js';
import commentsRoutes from './routes/comments.js';

const app = express();

const clientOrigin = process.env.CLIENT_ORIGIN;
app.use(cors({
  origin: clientOrigin
    ? clientOrigin.split(',').map((s) => s.trim()).filter(Boolean)
    : true,
}));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api', commentsRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
  console.log(`UC BorrowBox server listening on http://localhost:${PORT}`);
});
