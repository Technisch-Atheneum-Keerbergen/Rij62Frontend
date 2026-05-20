<script lang="ts">
	import type { ChefDish } from '$lib/api/types/dish';
	import { slide } from 'svelte/transition';

	let {
		dish,
		onAdjust
	}: {
		dish: ChefDish;
		onAdjust: (delta: 1 | -1) => void;
	} = $props();
</script>

<button
	transition:slide={{ axis: 'x', duration: 200 }}
	class="flex h-fit w-56 shrink-0 flex-col gap-1 overflow-hidden rounded-3xl border-300 bg-200 p-1 px-3 py-2 shadow-sm ring-2 ring-green-400/40 transition-all"
	onclick={() => {
		for (let i = 0; i < dish.prepared; i++) onAdjust(-1);
	}}
>
	<!-- Title row -->
	<div class="flex items-center gap-2">
		<span
			class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-300/30 text-sm font-bold text-primary-600 dark:bg-primary-600 dark:text-primary-100"
		>
			{dish.totalQuantity}×
		</span>
		<p class="text-main min-w-0 flex-1 text-left text-sm font-bold">
			{dish.title}
		</p>
	</div>

	{#if dish.choicesLabel}
		<p class="text-main/50 text-xs">+ {dish.choicesLabel}</p>
	{/if}
</button>
