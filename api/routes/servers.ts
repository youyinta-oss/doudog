
import { Router, Request, Response } from 'express';
import { store } from '../data/store';
import { Server } from '../../shared/types';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json(store.servers);
});

router.post('/', (req: Request, res: Response) => {
  const server: Omit<Server, 'id'> = req.body;
  const newServer: Server = {
    ...server,
    id: 'srv-' + Math.random().toString(36).substring(2, 6)
  };
  store.servers.push(newServer);
  res.json(newServer);
});

router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;
  const index = store.servers.findIndex(s => s.id === id);
  if (index !== -1) {
    store.servers[index] = { ...store.servers[index], ...updateData };
    res.json(store.servers[index]);
  } else {
    res.status(404).json({ error: 'Server not found' });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = store.servers.findIndex(s => s.id === id);
  if (index !== -1) {
    store.servers.splice(index, 1);
    delete store.metrics[id];
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Server not found' });
  }
});

router.get('/:id/metrics', (req: Request, res: Response) => {
  const { id } = req.params;
  const metrics = store.metrics[id];
  if (metrics) {
    res.json(metrics);
  } else {
    res.status(404).json({ error: 'Metrics not found' });
  }
});

export default router;

