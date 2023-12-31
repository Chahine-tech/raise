import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Hono } from 'hono';
import { products } from '../db/schema';
import { PostBody } from '../types';

export type Env = {
	DATABASE_URL: string;
};

const product = new Hono<{ Bindings: Env }>();

product.get('/', async (c) => {
	try {
		const client = new Pool({ connectionString: c.env.DATABASE_URL });

		const db = drizzle(client);
		const result = await db.select().from(products);

		return c.json({
			result,
		});
	} catch (error) {
		return c.json(
			{
				error,
			},
			400,
		);
	}
});

product.post('/', async (c) => {
	try {
		const client = new Pool({ connectionString: c.env.DATABASE_URL });

		const db = drizzle(client);

		const { name, ownerId, description, price }: PostBody = await c.req.json();

		const result = await db.insert(products).values({ name, ownerId, description, price });

		return c.json({
			result,
		});
	} catch (error) {
		return c.json(
			{
				error,
			},
			400,
		);
	}
});

export default product;
