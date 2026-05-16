export interface User {
	id: number;
	displayName: string;
	email?: string;
	isAdmin: boolean;
}

export interface CreateUserResponse {
	linkKey: string;
	id: number;
	user: User;
}

export interface UpdateUserRequest {
	displayName: string;
	isAdmin: boolean;
}
