import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { products } from './db/schema';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json';
import { logger } from 'hono/logger';
import api from './router';

export type Env = {
	DATABASE_URL: string;
};

type PostBody = {
	name: string;
	description: string;
	price: number;
};

const app = new Hono<{ Bindings: Env }>();

app.use('*', logger());
app.use('*', prettyJSON());
app.use('/api/*', cors());

app.route('/api', api);
app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404));

app.get('/', async (c) => {
	try {
		const client = new Pool({ connectionString: c.env.DATABASE_URL });

		const db = drizzle(client);

		const result = await db.select().from(products);

		return c.json({
			result,
		});
	} catch (error) {
		console.log(error);
		return c.json(
			{
				error,
			},
			400,
		);
	}
});

app.post('/', async (c) => {
	try {
		const client = new Pool({ connectionString: c.env.DATABASE_URL });

		const db = drizzle(client);

		const body: PostBody = await c.req.json();

		const result = await db.insert(products).values(body);

		return c.json({
			result,
		});
	} catch (error) {
		console.log(error);
		return c.json(
			{
				error,
			},
			400,
		);
	}
});

export default app;
