import { PostUserBody } from '../types';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { hashPassword } from '../helpers/utils';
import { users } from '../db/schema';
import { sign } from 'hono/jwt';
import { Context } from 'hono';
import { eq } from 'drizzle-orm';

// export const login = async (c: Context) => {

// };

export const singup = async (c: Context) => {
	try {
		const client = new Pool({ connectionString: c.env.DATABASE_URL });
		const db = drizzle(client);

		const { name, email, password, passwordConfirmation }: PostUserBody = await c.req.json();

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
		const token = await sign(result, secret);

		return c.json({
			result,
			token,
		});
	} catch (error) {
		return c.json(
			{
				error,
			},
			400,
		);
	}
};
