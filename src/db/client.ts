//file not used for now

import { Pool } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-serverless';

config({ path: '.dev.vars' });

const client = new Pool({ connectionString: `${process.env.DATABASE_URL}` });
export const db = drizzle(client);
