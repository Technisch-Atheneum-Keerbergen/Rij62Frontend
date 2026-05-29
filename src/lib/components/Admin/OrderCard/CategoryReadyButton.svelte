<script lang="ts">
	import { slide } from 'svelte/transition';
	import type { OrderItem } from '$lib/api/types/order';

	let {
		items,
		preparedCounts = {},
		onitemdelta
	}: {
		items: OrderItem[];
		preparedCounts?: Record<number, number>;
		onitemdelta?: (itemId: number, delta: 1 | -1) => void;
	} = $props();

	const isFood = $derived((items[0]?.product.rootCategory ?? 'Food') !== 'Drinks');

	const liveItems = $derived(items.filter((i) => i.status !== 'PickedUp'));

	const allReady = $derived(
		liveItems.length > 0 &&
			liveItems.every((i) => i.status === 'Ready' || (preparedCounts[i.id] ?? 0) >= 1)
	);
	const anyInProgress = $derived(
		liveItems.some((i) => i.status === 'InProgress' || (preparedCounts[i.id] ?? 0) > 0)
	);
	const anyPickedUp = $derived(items.some((i) => i.status === 'PickedUp'));

	// FIX: Wrapped in $derived so it re-evaluates whenever `isFood` changes
	const ACTION = $derived({
		ready: {
			label: isFood ? 'Food ready' : 'Drinks ready',
			style:
				'rounded-2xl bg-green-400/15 px-3 py-2 text-sm font-semibold text-green-500 active:bg-green-400/25 dark:bg-green-500/20 dark:text-green-300'
		},
		undo: {
			label: '↩ Undo ready',
			style: 'text-main/30 hover:text-main/60'
		}
	});

	function markReady() {
		for (const item of liveItems) {
			if (item.status !== 'Ready' && (preparedCounts[item.id] ?? 0) < 1) {
				onitemdelta?.(item.id, 1);
			}
		}
	}

	function undoReady() {
		for (const item of liveItems) {
			if (item.status === 'Ready' || (preparedCounts[item.id] ?? 0) >= 1) {
				onitemdelta?.(item.id, -1);
			}
		}
	}
</script>

{#if (anyInProgress || allReady) && !anyPickedUp}
	<div transition:slide={{ duration: 150 }} class="">
		{#if allReady}
			<button
				onclick={(e) => {
					e.stopPropagation();
					undoReady();
				}}
				class="w-full px-3 text-right text-xs transition-colors {ACTION.undo.style}"
			>
				{ACTION.undo.label}
			</button>
		{:else}
			<button
				onclick={(e) => {
					e.stopPropagation();
					markReady();
				}}
				class="w-full rounded-2xl px-3 py-2 text-sm font-semibold transition-all active:scale-[0.97] {ACTION
					.ready.style}"
			>
				{ACTION.ready.label}
			</button>
		{/if}
	</div>
{/if}
