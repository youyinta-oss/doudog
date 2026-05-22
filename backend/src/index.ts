import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import { SimulationEngine } from './services/SimulationEngine.js';
import type { Config } from './models/types.js';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

const engine = new SimulationEngine();

const PORT = process.env.PORT || 3001;

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/state', (req, res) => {
  res.json(engine.getState());
});

app.get('/api/history', (req, res) => {
  res.json(engine.getHistory());
});

app.get('/api/logs', (req, res) => {
  res.json(engine.getLogs());
});

app.get('/api/config', (req, res) => {
  res.json(engine.getConfig());
});

app.post('/api/config', (req, res) => {
  const config = req.body as Partial<Config>;
  engine.setConfig(config);
  res.json(engine.getConfig());
});

app.post('/api/start', (req, res) => {
  engine.start();
  res.json({ success: true });
});

app.post('/api/pause', (req, res) => {
  engine.pause();
  res.json({ success: true });
});

app.post('/api/stop', (req, res) => {
  engine.stop();
  res.json({ success: true });
});

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');
  engine.addClient(ws);
  
  ws.on('close', () => {
    console.log('Client disconnected');
    engine.removeClient(ws);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
