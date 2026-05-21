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
		onitemdelta?: (itemId: number, quantity: number, delta: 1 | -1) => void;
	} = $props();

	const isFood = $derived((items[0]?.product.rootCategory ?? 'Food') !== 'Drinks');

	const allReady = $derived(items.every((i) => i.status === 'Ready' || i.status === 'PickedUp'));
	const anyInProgress = $derived(items.some((i) => i.status === 'InProgress'));

	const anyPickedUp = $derived(items.some((i) => i.status === 'PickedUp'));

	const ACTION = {
		ready: {
			// svelte-ignore state_referenced_locally
			label: isFood ? '🍽️ Food ready' : '🥤 Drinks ready',
			// svelte-ignore state_referenced_locally
			style:
				'rounded-2xl bg-green-400/15 px-3 py-2 text-sm font-semibold text-green-500 active:bg-green-400/25 dark:bg-green-500/20 dark:text-green-300'
		},
		undo: {
			// svelte-ignore state_referenced_locally
			label: '↩ Undo ready',
			style: 'text-main/30 hover:text-main/60'
		}
	};

	function markReady() {
		for (const item of items) {
			if (item.status !== 'Ready' && item.status !== 'PickedUp') {
				const remaining = item.quantity - (preparedCounts[item.id] ?? 0);
				for (let i = 0; i < remaining; i++) {
					onitemdelta?.(item.id, item.quantity, 1);
				}
			}
		}
	}

	function undoReady() {
		for (const item of items) {
			if (item.status === 'Ready') {
				const prepared = preparedCounts[item.id] ?? item.quantity;
				for (let i = 0; i < prepared; i++) {
					onitemdelta?.(item.id, item.quantity, -1);
				}
			}
		}
	}
</script>

{#if (anyInProgress || allReady) && !anyPickedUp}
	<div transition:slide={{ duration: 150 }} class="px-1">
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
