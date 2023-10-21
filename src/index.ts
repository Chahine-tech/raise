import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { products } from './db/schema';
import { Hono } from 'hono';

export type Env = {
	DATABASE_URL: string;
};

// type PostBody = {
// 	name: string;
// 	description: string;
// 	price: number;
// };

const app = new Hono<{ Bindings: Env }>();

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

		const body = await c.req.json();

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
