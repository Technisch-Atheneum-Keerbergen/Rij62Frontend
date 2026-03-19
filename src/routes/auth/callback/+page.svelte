<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(() => {
		const params = new URLSearchParams(window.location.search);
		const token = params.get('token');

		if (token) {
			localStorage.setItem('token', token);

			// redirect after login
			goto('/admin/overview'); // or /dashboard if you add one
		} else {
			goto('/login');
		}
	});
</script>

<p>Logging you in...</p>
