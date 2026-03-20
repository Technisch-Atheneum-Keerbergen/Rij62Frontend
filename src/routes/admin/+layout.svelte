<script lang="ts">
	import { onMount } from 'svelte';
	import { auth } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { get } from 'svelte/store';

	onMount(() => {
		auth.init();

		const { token } = get(auth);

		if (!token) {
			goto('/login');
		}
	});
</script>

<slot />