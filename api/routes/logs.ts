
import { Router, Request, Response } from 'express';
import { store } from '../data/store';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { level, source } = req.query;
  let logs = [...store.logs];
  
  if (level) {
    logs = logs.filter(log => log.level === level);
  }
  if (source) {
    logs = logs.filter(log => log.source === source);
  }
  
  res.json(logs);
});

export default router;

