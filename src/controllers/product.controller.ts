import { Context } from 'hono';

export const createProduct = async (c: Context) => {
	return c.json({ message: 'createProduct' });
};
