
import { Router, Request, Response } from 'express';
import { store } from '../data/store';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json(store.services);
});

router.post('/:id/start', (req: Request, res: Response) => {
  const { id } = req.params;
  const service = store.services.find(s => s.id === id);
  if (service) {
    service.status = 'running';
    service.uptime = Math.floor(Math.random() * 100000);
    res.json(service);
  } else {
    res.status(404).json({ error: 'Service not found' });
  }
});

router.post('/:id/stop', (req: Request, res: Response) => {
  const { id } = req.params;
  const service = store.services.find(s => s.id === id);
  if (service) {
    service.status = 'stopped';
    service.uptime = 0;
    res.json(service);
  } else {
    res.status(404).json({ error: 'Service not found' });
  }
});

router.post('/:id/restart', (req: Request, res: Response) => {
  const { id } = req.params;
  const service = store.services.find(s => s.id === id);
  if (service) {
    service.status = 'running';
    service.uptime = 0;
    setTimeout(() => {
      service.uptime = Math.floor(Math.random() * 100000);
    }, 1000);
    res.json(service);
  } else {
    res.status(404).json({ error: 'Service not found' });
  }
});

export default router;

