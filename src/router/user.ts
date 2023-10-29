import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { users } from '../db/schema';
import { comparePassword, hashPassword } from '../helpers/utils';
import { eq } from 'drizzle-orm';

export type Env = {
	DATABASE_URL: string;
	JWT_SECRET: string;
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

user.post('/login', async (c) => {
	try {
		const client = new Pool({ connectionString: c.env.DATABASE_URL });
		const db = drizzle(client);

		const { email, password }: PostBody = await c.req.json();

		const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

		if (user.length === 0) {
			return c.json(
				{
					error: 'User not found',
				},
				404,
			);
		}

		const isMatch = await comparePassword(password, user[0].password);

		if (!isMatch) {
			return c.json(
				{
					error: 'Invalid password',
				},
				400,
			);
		}

		const secret = c.env.JWT_SECRET;
		console.log(secret);
		const token = await sign(user, secret);

		return c.json({
			user,
			token,
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
		const userExists = await db.select().from(users).where(eq(users.email, email)).limit(1);

		if (userExists.length > 0) {
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

		const secret = c.env.JWT_SECRET;
		console.log(secret);
		const token = await sign(result, secret);

		return c.json({
			result,
			token,
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
