import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAllowedOrigins, PORT } from './config.js';
import { stripeRoutes } from './routes/stripe.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distRoot = path.resolve(__dirname, '../../dist');

const app = new Hono();

app.get('/health', (c) => c.text('ok'));

app.use(
   '/api/*',
   cors({
      origin: (origin) => {
         if (!origin) {
            return '';
         }
         const allowed = getAllowedOrigins();
         return allowed.some((allowedOrigin) => allowedOrigin === origin.replace(/\/$/, ''))
            ? origin
            : '';
      },
      allowMethods: ['POST', 'OPTIONS'],
      allowHeaders: ['Content-Type'],
   }),
);

app.route('/api/stripe', stripeRoutes);

app.use(
   '/*',
   serveStatic({
      root: distRoot,
   }),
);

app.notFound(async (c) => {
   if (c.req.path.startsWith('/api/')) {
      return c.json({ error: 'Not found' }, 404);
   }

   const indexPath = path.join(distRoot, 'index.html');
   try {
      const html = await readFile(indexPath, 'utf8');
      return c.html(html);
   } catch {
      return c.text('Frontend build not found', 404);
   }
});

serve(
   {
      fetch: app.fetch,
      port: PORT,
   },
   (info) => {
      console.info(`[server] listening on http://localhost:${info.port}`);
   },
);
