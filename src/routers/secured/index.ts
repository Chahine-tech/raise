import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Hono } from 'hono';
import { jwt } from 'hono/jwt';
import { users } from '../../db/schema';

export type Env = {
	DATABASE_URL: string;
	JWT_SECRET: string;
};

const secured = new Hono<{ Bindings: Env }>();

secured.use('/auth/*', async (c, next) => {
	const token = await jwt({
		secret: c.env.JWT_SECRET,
	});
	return token(c, next);
});

secured.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404));

secured.get('/auth', async (c) => {
	return c.json({
		message: 'Route is secured',
	});
});

secured.get('/auth/user', async (c) => {
	try {
		const client = new Pool({ connectionString: c.env.DATABASE_URL });
		const db = drizzle(client);

		const result = await db.select().from(users);

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
export default secured;
