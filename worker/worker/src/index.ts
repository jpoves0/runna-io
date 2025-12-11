import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { registerRoutes } from './routes';

export interface Env {
  DATABASE_URL: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', logger());
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

registerRoutes(app);

app.get('/', (c) => {
  return c.json({ message: 'Runna.io API - Cloudflare Workers' });
});

export default app;
