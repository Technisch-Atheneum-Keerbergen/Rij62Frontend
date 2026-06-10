<script lang="ts">
	import SvgImage from '../SVG/SvgImage.svelte';

	let {
		src,
		alt,
		class: className = '',
		...restProps
	}: {
		src?: string | null;
		alt: string;
		class?: string;
		[key: string]: unknown;
	} = $props();

	let imageLoaded = $state(false);
	let imageError = $state(false);

	const showPlaceholder = $derived(!src || !imageLoaded || imageError);

	$effect(() => {
		src;
		imageLoaded = false;
		imageError = false;

		if (!src) return;

		const img = new Image();
		img.onload = () => (imageLoaded = true);
		img.onerror = () => (imageError = true);
		img.src = src;
	});
</script>

<div class="relative overflow-hidden {className}" {...restProps}>
	{#if showPlaceholder}
		<div class="absolute inset-0 flex items-center justify-center bg-300">
			<span class="stroke-main aspect-square h-[50%] min-h-10 stroke-1 opacity-20"
				><SvgImage /></span
			>
		</div>
	{/if}
	{#if src && imageLoaded}
		<img {src} {alt} class="h-full w-full object-cover" />
	{/if}
</div>
