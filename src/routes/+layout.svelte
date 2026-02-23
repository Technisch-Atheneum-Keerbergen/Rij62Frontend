<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<header>
	<nav class="bg-gray-900 p-2 text-center text-2xl text-white">
		<p>Hello world</p>
	</nav>
</header>
<main class="p-3">
	{@render children()}
</main>
<footer class="mx-1 text-center">© 2026</footer>
