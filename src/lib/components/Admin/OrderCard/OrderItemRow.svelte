<script lang="ts">
	import type { OrderItem, OrderStatus } from '$lib/api/types/order';
	import StatusBadge from '$lib/components/Badges/StatusBadge.svelte';

	let {
		item,
		prepared = 0,
		onitemdelta
	}: {
		item: OrderItem;
		prepared?: number;
		isDrink?: boolean;
		onitemdelta?: (itemId: number, quantity: number, delta: 1 | -1) => void;
	} = $props();

	const currentLanguage = import.meta.env.VITE_CURRENT_LANGUAGE as 'English' | 'Dutch';

	const progressColor: Record<OrderStatus, string> = {
		Pending: 'bg-amber-400/30',
		InProgress: 'bg-primary-400/40',
		Ready: 'bg-gradient-to-r from-green-400/15 to-green-400/25',
		PickedUp: 'bg-400/20'
	};

	const rowColor: Record<OrderStatus, string> = {
		Pending: 'border-amber-400/40 shadow-[inset_0_0_0_1px] shadow-amber-400/20 bg-amber-400/5',
		InProgress:
			'border-primary-400/40 shadow-[inset_0_0_0_1px] shadow-primary-400/20 bg-primary-400/5',
		Ready:
			'border-green-400/40 shadow-[inset_0_0_0_1px] shadow-green-400/20 bg-[linear-gradient(90deg, green-400/5, green-400/10)]',
		PickedUp: 'border-400/20 bg-400/5 opacity-40'
	};

	const status = $derived((): OrderStatus => {
		if (item.status === 'PickedUp') return 'PickedUp';
		if (prepared >= item.quantity) return 'Ready';
		if (prepared > 0) return 'InProgress';
		return item.status;
	});

	const pct = $derived(item.quantity > 0 ? (prepared / item.quantity) * 100 : 0);
	const isPickedUp = $derived(item.status === 'PickedUp');

	function handleTap(e: MouseEvent) {
		e.stopPropagation();
		if (!onitemdelta || isPickedUp) return;
		const delta: 1 | -1 = prepared >= item.quantity ? -1 : 1;
		onitemdelta(item.id, item.quantity, delta);
	}
</script>

<button
	onclick={handleTap}
	disabled={isPickedUp || !onitemdelta}
	class="relative flex cursor-pointer items-center gap-2 overflow-hidden rounded-2xl border px-3 py-1.5
    transition-all {status() != 'Pending'
		? 'active:scale-95'
		: ''}  disabled:cursor-default {rowColor[status()]}"
>
	<div
		class="pointer-events-none absolute inset-0 origin-left rounded-2xl transition-all duration-300 {progressColor[
			status()
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

						if (!acc[id]) {
							acc[id] = {
								product: choice.product,
								quantity: 1
							};
						} else {
							acc[id].quantity++;
						}

						return acc;
					},
					{} as Record<
						number,
						{
							product: (typeof item.choices)[number]['product'];
							quantity: number;
						}
					>
				)
			)}
			<p class="text-main/40 text-xs">
				{#each groupedChoices as choice, i}
					<span>
						{choice.quantity > 1
							? `${choice.product.title[currentLanguage]} x${choice.quantity}`
							: choice.product.title[currentLanguage]}
					</span>
					{#if i < groupedChoices.length - 1}
						<span class="-ml-0.5">,&nbsp;</span>
					{/if}
				{/each}
			</p>
		{/if}
	</div>

	<div class="relative flex shrink-0 items-center gap-1.5">
		{#if item.quantity > 1}
			<span class="text-main/40 text-xs tabular-nums">{prepared}/{item.quantity}</span>
		{/if}
		<StatusBadge status={status()} />
	</div>
</button>
