import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Hono } from 'hono';
import { users } from '../db/schema';
import { hashPassword } from '../helpers/utils';
import { eq } from 'drizzle-orm';

export type Env = {
	DATABASE_URL: string;
};

type PostBody = {
	name: string;
	email: string;
	password: string;
	passwordConfirmation: string;
};

const user = new Hono<{ Bindings: Env }>();

user.get('/', async (c) => {
	try {
		const client = new Pool({ connectionString: c.env.DATABASE_URL });
		const db = drizzle(client);

		const result = await db.select().from(users);

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

user.post('/register', async (c) => {
	try {
		const client = new Pool({ connectionString: c.env.DATABASE_URL });
		const db = drizzle(client);

		const { name, email, password, passwordConfirmation }: PostBody = await c.req.json();

		//Verify if password and password confirmation match
		if (password !== passwordConfirmation) {
			return c.json(
				{
					error: 'Password and password confirmation must match',
				},
				400,
			);
		}

		//Verify if user already exists
		const userExists = await db.select().from(users).where(eq(users.email, email));

		if (userExists) {
			return c.json(
				{
					error: 'User already exists',
				},
				400,
			);
		}

		const encryptedPassword = await hashPassword(password);

		const result = await db.insert(users).values({
			name,
			email,
			password: encryptedPassword,
		});

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

export default user;
