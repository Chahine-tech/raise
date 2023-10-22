import { Hono } from 'hono';
import user from './user';

const api = new Hono();

api.route('/user', user);

export default api;
