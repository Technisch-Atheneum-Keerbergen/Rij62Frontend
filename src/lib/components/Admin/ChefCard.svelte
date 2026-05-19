<script lang="ts">
	import type { ChefDish } from '$lib/api/types/dish';
	import { slide } from 'svelte/transition';
	import SvgMinus from '../SVG/SvgMinus.svelte';
	import SvgPlus from '../SVG/SvgPlus.svelte';

	let {
		dish,
		onAdjust
	}: {
		dish: ChefDish;
		onAdjust: (delta: 1 | -1) => void;
	} = $props();

	const allDone = $derived(dish.prepared >= dish.totalQuantity);
</script>

<div
	transition:slide={{ axis: 'x', duration: 200 }}
	class="flex h-fit w-56 shrink-0 flex-col overflow-hidden rounded-3xl border-300 bg-200 p-1 shadow-sm transition-all"
>
	<!-- Header -->
	<div class="relative m-1 flex flex-col gap-1 rounded-2xl border border-400/50 bg-300 px-3 py-2">
		<div class="flex items-center gap-2">
			<span
				class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-300/30 text-sm font-bold text-primary-600 dark:bg-primary-600 dark:text-primary-100"
			>
				{dish.totalQuantity}×
			</span>
			<p class="text-main min-w-0 flex-1 truncate text-sm font-bold">
				{dish.title}
			</p>
		</div>

		{#if dish.choicesLabel}
			<p class="text-main/50 truncate text-xs">+ {dish.choicesLabel}</p>
		{/if}
	</div>

	<!-- Progress + controls -->
	<div
		class="mx-1 mt-0.5 mb-1 flex flex-col gap-1.5 rounded-2xl border border-400/30 bg-300 px-3 py-2"
	>
		<div class="flex items-center gap-2">
			<div class="h-2 flex-1 overflow-hidden rounded-full bg-400/30">
				<div
					class="h-full rounded-full transition-all duration-300 {allDone
						? 'bg-green-500'
						: 'bg-primary-500'}"
					style="width: {(dish.prepared / dish.totalQuantity) * 100}%"
				></div>
			</div>
			<span class="text-main/50 text-xs tabular-nums">
				{dish.prepared}/{dish.totalQuantity}
			</span>
		</div>

		<div class="flex items-center gap-1">
			<button
				onclick={() => onAdjust(-1)}
				disabled={dish.prepared === 0}
				class="stroke-main flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-400/50 bg-200 p-0.5 text-sm font-bold transition hover:bg-400/30 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
				aria-label="Decrease"
			>
				<SvgMinus />
			</button>

			<button
				onclick={() => onAdjust(1)}
				disabled={allDone}
				class="stroke-main flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-400/50 bg-200 p-0.5 text-sm font-bold transition hover:bg-400/30 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
				aria-label="Increase"
			>
				<SvgPlus />
			</button>

			<button
				onclick={() => {
					for (let i = dish.prepared; i < dish.totalQuantity; i++) onAdjust(1);
				}}
				disabled={allDone}
				class="flex-1 cursor-pointer rounded-full px-2 py-1 text-xs font-semibold transition active:scale-95 disabled:cursor-not-allowed {allDone
					? 'bg-green-400/20 text-green-500 dark:bg-green-600 dark:text-green-50'
					: 'bg-primary-300/20 text-primary-500 dark:bg-primary-500 dark:text-primary-50'}"
			>
				{allDone ? 'Ready' : 'Mark ready'}
			</button>
		</div>
	</div>
</div>
