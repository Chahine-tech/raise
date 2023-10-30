import { pgTable, serial, text, doublePrecision, timestamp, integer } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
	id: serial('id').primaryKey(),
	name: text('name'),
	description: text('description'),
	price: doublePrecision('price'),
	ownerId: integer('owner_id')
		.notNull()
		.references(() => users.id),
});

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	password: text('password').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
});
