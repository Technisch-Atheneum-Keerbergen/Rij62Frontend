<script lang="ts">
	import type { OrderItem, OrderStatus } from '$lib/api/types/order';
	import StatusBadge from '$lib/components/Badges/StatusBadge.svelte';

	let {
		items,
		preparedCounts = {},
		onitemdelta
	}: {
		items: OrderItem[]; // all identical items grouped together
		preparedCounts?: Record<number, number>;
		onitemdelta?: (itemId: number, delta: 1 | -1) => void;
	} = $props();

	const currentLanguage = import.meta.env.VITE_CURRENT_LANGUAGE as 'English' | 'Dutch';

	// Representative item for display
	const item = $derived(items[0]);
	const quantity = $derived(items.length);

	// Count how many in this group are "prepared" (status Ready/PickedUp or manually ticked)
	const prepared = $derived(
		items.filter((i) => i.status === 'PickedUp' || (preparedCounts[i.id] ?? 0) >= 1).length
	);

	const allPickedUp = $derived(items.every((i) => i.status === 'PickedUp'));

	const effectiveStatus = $derived((): OrderStatus => {
		if (allPickedUp) return 'PickedUp';
		if (prepared >= quantity) return 'Ready';
		if (prepared > 0) return 'InProgress';
		// fall back to the actual status of the first non-pickedup item
		return items.find((i) => i.status !== 'PickedUp')?.status ?? 'Pending';
	});

	const pct = $derived(quantity > 0 ? (prepared / quantity) * 100 : 0);

	const progressColor: Record<OrderStatus, string> = {
		Pending: 'bg-yellow-400/30',
		InProgress: 'bg-primary-400/40',
		Ready: 'bg-gradient-to-r from-green-400/15 to-green-400/25',
		PickedUp: 'bg-400/20'
	};

	const rowColor: Record<OrderStatus, string> = {
		Pending: 'border-yellow-400/40 bg-yellow-400/5',
		InProgress: 'border-primary-400/40 bg-primary-400/5',
		Ready: 'border-green-400/40 bg-green-400/5',
		PickedUp: 'border-400/20 bg-400/5 opacity-40'
	};

	function handleTap(e: MouseEvent) {
		e.stopPropagation();
		if (!onitemdelta || allPickedUp) return;

		if (prepared >= quantity) {
			// All ready — undo ALL prepared items at once
			for (const i of items) {
				if (i.status !== 'PickedUp' && (preparedCounts[i.id] ?? 0) >= 1) {
					onitemdelta(i.id, -1);
				}
			}
		} else {
			// Advance: find first unprepared non-pickedup item
			const target = items.find((i) => i.status !== 'PickedUp' && (preparedCounts[i.id] ?? 0) < 1);
			if (target) onitemdelta(target.id, 1);
		}
	}
</script>

<button
	onclick={handleTap}
	disabled={allPickedUp || !onitemdelta}
	class="relative flex cursor-pointer items-center gap-2 overflow-hidden rounded-2xl border p-1.5 pl-2.5
		transition-all {effectiveStatus() !== 'Pending' ? 'active:scale-95' : ''}
		disabled:cursor-default {rowColor[effectiveStatus()]}"
>
	<div
		class="pointer-events-none absolute inset-0 origin-left rounded-2xl transition-all duration-300 {progressColor[
			effectiveStatus()
		]}"
		style="width: {pct}%"
	></div>

	<div class="relative min-w-0 flex-1 text-left">
		<p class="text-main truncate text-sm font-semibold">
			{item.product.title[currentLanguage]}
		</p>
		{#if item.choices?.length > 0}
			{@const groupedChoices = Object.values(
				item.choices.reduce(
					(acc, choice) => {
						const id = choice.product.productId;
						if (!acc[id]) acc[id] = { product: choice.product, count: 1 };
						else acc[id].count++;
						return acc;
					},
					{} as Record<number, { product: (typeof item.choices)[number]['product']; count: number }>
				)
			)}
			<p class="text-main/40 text-xs">
				{#each groupedChoices as choice, i}
					<span>
						{choice.count > 1
							? `${choice.count}x ${choice.product.title[currentLanguage]} `
							: choice.product.title[currentLanguage]}
					</span>
					{#if i < groupedChoices.length - 1}<span class="-ml-0.5">,&nbsp;</span>{/if}
				{/each}
			</p>
		{/if}
	</div>

	<div class="relative flex shrink-0 items-center gap-1.5">
		{#if quantity > 1}
			<span class="text-main/40 text-xs tabular-nums">{prepared}/{quantity}</span>
		{/if}
		<StatusBadge status={effectiveStatus()} />
	</div>
</button>
