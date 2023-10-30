import { Hono } from 'hono';
import user from './user';
import product from './product';
import secured from './secured';

const api = new Hono();

api.get('/', (c) => {
	return c.json({
		message: 'Welcome to my API!',
	});
});

api.route('/user', user);
api.route('/product', product);
api.route('/secured', secured);
api.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404));

export default api;
