<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Rij62 | Coffee & More</title>
</svelte:head>

<div class="min-h-screen flex flex-col">
	<Header />

	<main class="flex-grow">
		{@render children()}
	</main>

	<Footer />
</div>
