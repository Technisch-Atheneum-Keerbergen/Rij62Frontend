<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	type Size = 'sm' | 'md' | 'lg';
	let {
		size = 'sm'
	}: HTMLButtonAttributes & {
		size?: Size;
	} = $props();
	const sizeStyle: Record<Size, string> = {
		sm: 'w-4 border-2',
		md: 'w-6 border-2',
		lg: 'w-8 border-3'
	};
</script>

<span class="{sizeStyle[size]} aspect-square animate-spin rounded-full border-400/40 border-t-800"
></span>
