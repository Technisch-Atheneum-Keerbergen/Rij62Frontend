import { derived } from 'svelte/store';
import { page } from '$app/stores';

// Map route paths to friendly names
export const pageName = derived(page, ($page) => {
	const path = $page.url.pathname;
	if (path === '/') return 'Home';
	if (path === '/apitest') return 'API Test';
	// Add more routes as needed
	return path.replace(/^\//, '').replace(/\/.*/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Page';
});
