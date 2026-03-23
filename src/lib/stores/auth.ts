import { writable } from 'svelte/store';

import { decodeToken } from '$lib/utils/jwt';
import { browser } from '$app/environment';

type User = {
	displayName: string;
	userId: number;
	isAdmin: boolean;
};

type AuthState = {
	token: string | null;
	user: User | null;
};

function loadAuthState(): AuthState | null {
	if (!browser) {
		return null;
	}
	const token = localStorage.getItem('token');
	if (!token) return null;

	const parsed = decodeToken(token);
	if (!parsed) return null;

	return {
		token,
		user: {
			displayName: parsed.DisplayName,
			userId: parsed.UserId,
			isAdmin: parsed.IsAdmin
		}
	};
}

function createAuth() {
	const { subscribe, set } = writable<AuthState>({
		token: null,
		user: null
	});

	const authState = loadAuthState();
	if (authState) {
		set(authState);
	}

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
			set({ token: null, user: null });
		}
	};
}

export const auth = createAuth();
