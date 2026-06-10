/**
 * Victor Collective API Server
 *
 * Backend for invoices, proposals, and business operations.
 * Deployed on Railway.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { invoiceRoutes } from './routes/invoices.js';
import { inboxRoutes } from './routes/inbox.js';
import { clientRoutes } from './routes/clients.js';
import { authRoutes } from './routes/auth.js';
import { requireAuth } from './middleware/require-auth.js';
import { initDb } from './lib/db.js';
import { logger } from './lib/logger.js';

const app = express();

// CORS - allow Vercel frontend
const allowedOrigins = [
  'http://localhost:3000',
  'https://victorcollective.com',
  'https://www.victorcollective.com',
  'https://portfolio-site-tau-flax.vercel.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.some(
          (allowed) => origin.startsWith(allowed) || origin.includes('vercel.app')
        )
      ) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json());

// Initialize database
initDb();

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes — everything except auth itself sits behind the session gate
app.use('/api/auth', authRoutes);
app.use('/api/invoices', requireAuth, invoiceRoutes);
app.use('/api/inbox', requireAuth, inboxRoutes);
app.use('/api/clients', requireAuth, clientRoutes);

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message });
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  logger.info('Server started', { port: PORT });
  console.log(`Victor Collective API running on port ${PORT}`);
});
