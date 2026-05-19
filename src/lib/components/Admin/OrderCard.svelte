<script lang="ts">
	import { slide } from 'svelte/transition';
	import { apiFetch } from '$lib/api/client';
	import type { Order, OrderId, OrderItem, OrderStatus } from '$lib/api/types/order';
	import StatusBadge from '../Badges/StatusBadge.svelte';

	let {
		order = {
			id: '05d3575b-5a06-437c-9c20-5534304d91b4' as OrderId,
			tableNumber: null,
			createdTime: 1778531035,
			pickupTime: 1778535035,
			items: [
				{
					id: 1,
					product: {
						productId: 1,
						title: { English: 'Hummus', Dutch: 'Hummus' },
						description: { English: 'Standard', Dutch: 'Standard' },
						price: 6.9,
						btw: 21,
						imgUrl: 'http://localhost:5148/api/image/4133bdf9-bbbd-422a-8747-57c895adc9f2'
					},
					choices: [],
					status: 'Pending' as OrderStatus,
					quantity: 1
				}
			]
		},
		onclick,
		class: className = '',
		...restProps
	}: {
		order?: Order;
		onclick?: () => void;
		class?: string;
	} = $props();

	const currentLanguage = import.meta.env.VITE_CURRENT_LANGUAGE as 'English' | 'Dutch';

	const statusCycle: OrderStatus[] = ['Pending', 'InProgress', 'Ready', 'PickedUp'];

	// Row background tint per status
	const statusRowColor: Record<OrderStatus, string> = {
		Pending: 'border-yellow-400/40 shadow-[inset_0_0_0_1px] shadow-yellow-400/20 bg-yellow-400/5',
		InProgress: 'border-blue-400/40   shadow-[inset_0_0_0_1px] shadow-blue-400/20   bg-blue-400/5',
		Ready: 'border-green-400/40  shadow-[inset_0_0_0_1px] shadow-green-400/20  bg-green-400/5',
		PickedUp: 'border-gray-400/20   bg-300'
	};

	// Badge colours per status

	function formatTime(unix: number) {
		return new Date(unix * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	const totalItems = $derived(order.items.reduce((sum, item) => sum + item.quantity, 0));
	const totalPrice = $derived(
		order.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
	);

	// Optimistic local status overrides: itemId → status
	let localStatuses = $state<Record<number, OrderStatus>>({});

	function getStatus(item: OrderItem): OrderStatus {
		return localStatuses[item.id] ?? item.status;
	}

	async function cycleStatus(e: MouseEvent, item: OrderItem) {
		e.stopPropagation();
		const current = getStatus(item);
		const next = statusCycle[(statusCycle.indexOf(current) + 1) % statusCycle.length];

		localStatuses[item.id] = next; // optimistic

		try {
			await apiFetch(`/order/${order.id}/status/${item.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(next)
			});
		} catch {
			localStatuses[item.id] = current; // rollback
		}
	}
</script>

<div
	{...restProps}
	role="button"
	transition:slide={{ duration: 200 }}
	tabindex="0"
	{onclick}
	onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && onclick?.()}
	class="flex h-fit w-72 cursor-pointer flex-col overflow-hidden rounded-3xl border-300 bg-200 p-1
		shadow-sm {className}"
>
	<!-- Header -->
	<div
		class="relative m-1 flex flex-col justify-between rounded-2xl border border-400/50 bg-300 px-3 py-2"
	>
		<div class="flex flex-row items-center justify-between">
			<div class="flex flex-col">
				<span class="text-main/50 text-xs font-semibold">
					{order.tableNumber ? `Table ${order.tableNumber}` : 'Takeaway'}
				</span>
				<span class="text-main text-sm font-bold">
					{totalItems} item{totalItems !== 1 ? 's' : ''}
					&middot; €{totalPrice.toFixed(2)}
				</span>
			</div>
			<div class="flex flex-col items-end gap-0.5">
				<span class="text-main/40 text-xs">Ordered {formatTime(order.createdTime)}</span>
				{#if order.pickupTime}
					<span class="text-main/60 text-xs font-medium">Pickup {formatTime(order.pickupTime)}</span
					>
				{/if}
			</div>
		</div>
	</div>

	<!-- Items -->
	<div class="mx-1 mt-0.5 mb-1 flex flex-col gap-1">
		{#each order.items as item (item.id)}
			{@const status = getStatus(item)}
			<button
				onclick={(e) => cycleStatus(e, item)}
				class="flex cursor-pointer items-center gap-2 rounded-2xl border px-3 py-1.5 transition-all active:scale-95 {statusRowColor[
					status
				]}"
			>
				<span
					class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-300/30 text-xs font-bold text-primary-600 dark:bg-primary-600 dark:text-primary-100"
				>
					{item.quantity}
				</span>

				<div class="min-w-0 flex-1 text-left">
					<p class="text-main truncate text-sm font-semibold">
						{item.product.title[currentLanguage]}
					</p>
					{#if item.choices && item.choices.length > 0}
						<p class="text-main/40 truncate text-xs">
							{item.choices.map((c) => c.product.title[currentLanguage]).join(', ')}
						</p>
					{/if}
				</div>

				<StatusBadge {status} />
			</button>
		{/each}
	</div>
</div>
