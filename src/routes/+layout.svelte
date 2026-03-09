<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
	let currentYear = new Date().getFullYear();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<header></header>
<main class="p-3">
	{@render children()}
</main>
<footer class="my-1 text-center">© {currentYear}</footer>
