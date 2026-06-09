/**
 * Client API Routes
 */

import { Router } from 'express';
import { ClientService } from '../services/client.service.js';
import { logger } from '../lib/logger.js';

export const clientRoutes = Router();

// List clients
clientRoutes.get('/', (_req, res) => {
  res.json(ClientService.list());
});

// Get client
clientRoutes.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const client = ClientService.getById(id);
  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }
  res.json(client);
});

// Create client
clientRoutes.post('/', (req, res) => {
  const { name, email, notes } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  try {
    const client = ClientService.create({ name, email, notes });
    res.status(201).json(client);
  } catch (error) {
    logger.error('Failed to create client', { error: (error as Error).message });
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// Update client
clientRoutes.put('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, email, notes } = req.body;

  try {
    const client = ClientService.update(id, { name, email, notes });
    res.json(client);
  } catch (error) {
    if ((error as Error).message.includes('not found')) {
      return res.status(404).json({ error: 'Client not found' });
    }
    logger.error('Failed to update client', { id, error: (error as Error).message });
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// Delete client
clientRoutes.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  ClientService.delete(id);
  res.status(204).send();
});
