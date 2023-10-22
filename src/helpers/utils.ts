import * as bcrypt from 'bcryptjs';

export const hashPassword = (password: string) => {
	return bcrypt.hash(password, 10);
};
