export type PostBody = {
	name: string;
	description: string;
	price: number;
	ownerId: number;
};

export type PostUserBody = {
	name: string;
	email: string;
	password: string;
	passwordConfirmation: string;
};
