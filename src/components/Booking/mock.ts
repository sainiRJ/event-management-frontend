// mock.ts
export interface User {
	company: string;
	city: string;
	street: string;
	postcode: string;
}

export const mockUsers = (count: number): User[] => {
	return Array.from({length: count}).map((_, index) => ({
		company: `Company ${index + 1}`,
		city: `City ${index + 1}`,
		street: `Street ${index + 1}`,
		postcode: `12345${index}`,
	}));
};
