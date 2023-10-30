import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json';
import { logger } from 'hono/logger';
import api from './router';

export type Env = {
	DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use('*', logger());
app.use('*', prettyJSON());
app.use('/api/*', cors());

app.route('/api', api);
app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404));

export default app;
