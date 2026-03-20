import { writable } from 'svelte/store';
import { decodeToken } from '$lib/utils/jwt';

type User = {
	displayName: string;
	userId: number;
	isAdmin: boolean;
};

type AuthState = {
	token: string | null;
	user: User | null;
};

function createAuth() {
	const { subscribe, set } = writable<AuthState>({
		token: null,
		user: null
	});

	return {
		subscribe,

		login(token: string) {
			const parsed = decodeToken(token);

			if (!parsed) {
				console.error('Invalid token');
				return;
			}

			localStorage.setItem('token', token);

			set({
				token,
				user: {
					displayName: parsed.DisplayName,
					userId: parsed.UserId,
					isAdmin: parsed.IsAdmin
				}
			});
		},

		logout() {
			localStorage.removeItem('token');
			set({ token: null, user: null });
		},

		init() {
			const token = localStorage.getItem('token');
			if (!token) return;

			const parsed = decodeToken(token);
			if (!parsed) return;

			set({
				token,
				user: {
					displayName: parsed.DisplayName,
					userId: parsed.UserId,
					isAdmin: parsed.IsAdmin
				}
			});
		}
	};
}

export const auth = createAuth();