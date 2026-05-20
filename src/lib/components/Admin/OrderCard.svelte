<script lang="ts">
	import { slide } from 'svelte/transition';
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
						imgUrl: 'http://localhost:5148/api/image/4133bdf9-bbbd-422a-8747-57c895adc9f2',
						rootCategory: 'Food'
					},
					choices: [],
					status: 'Pending' as OrderStatus,
					quantity: 1
				}
			]
		},
		preparedCounts = {},
		onitemdelta,
		onprimaryaction,
		onclick,
		class: className = '',
		...restProps
	}: {
		order?: Order;
		preparedCounts?: Record<number, number>;
		onitemdelta?: (itemId: number, quantity: number, delta: 1 | -1) => void;
		onprimaryaction?: (nextStatus: OrderStatus) => void;
		onclick?: () => void;
		class?: string;
	} = $props();

	const currentLanguage = import.meta.env.VITE_CURRENT_LANGUAGE as 'English' | 'Dutch';

	function formatTime(unix: number) {
		return new Date(unix * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	const totalItems = $derived(order.items.reduce((sum, item) => sum + item.quantity, 0));
	const totalPrice = $derived(
		order.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
	);

	// Live items = not yet PickedUp
	const liveItems = $derived(order.items.filter((i) => i.status !== 'PickedUp'));

	const allPending = $derived(
		liveItems.length > 0 && liveItems.every((i) => i.status === 'Pending')
	);
	const allInProgress = $derived(
		liveItems.length > 0 && liveItems.every((i) => i.status === 'InProgress')
	);
	const allReady = $derived(liveItems.length > 0 && liveItems.every((i) => i.status === 'Ready'));
	const allPickedUp = $derived(order.items.every((i) => i.status === 'PickedUp'));

	// Cycle: 0 → 1 → … → quantity → 0 (wraps back down)
	function handleItemTap(e: MouseEvent, item: OrderItem) {
		e.stopPropagation();
		if (!onitemdelta || item.status === 'PickedUp') return;
		const prepared = preparedCounts[item.id] ?? 0;
		// If fully prepared, wrap back to 0 by decrementing all the way
		const delta: 1 | -1 = prepared >= item.quantity ? -1 : 1;
		onitemdelta(item.id, item.quantity, delta);
	}

	// Effective status for a single-item row, accounting for partial preparation
	function effectiveStatus(item: OrderItem): OrderStatus {
		if (item.status === 'PickedUp') return 'PickedUp';
		const prepared = preparedCounts[item.id] ?? 0;
		if (prepared >= item.quantity) return 'Ready';
		if (prepared > 0) return 'InProgress';
		return item.status;
	}

	// Progress bar fill colour (matches row accent)
	const progressColor: Record<OrderStatus, string> = {
		Pending: 'bg-amber-400/30',
		InProgress: 'bg-primary-400/40',
		Ready: 'bg-green-400/35',
		PickedUp: 'bg-400/20'
	};

	// Outer row border / shadow tint — same as before
	const rowColor: Record<OrderStatus, string> = {
		Pending: 'border-amber-400/40 shadow-[inset_0_0_0_1px] shadow-amber-400/20 bg-amber-400/5',
		InProgress:
			'border-primary-400/40 shadow-[inset_0_0_0_1px] shadow-primary-400/20 bg-primary-400/5',
		Ready: 'border-green-400/40 shadow-[inset_0_0_0_1px] shadow-green-400/20 bg-green-400/5',
		PickedUp: 'border-400/20 bg-400/5 opacity-40'
	};

	// Category grouping
	const foodItems = $derived(
		order.items.filter((i) => (i.product.rootCategory ?? 'Food') !== 'Drinks')
	);
	const drinkItems = $derived(order.items.filter((i) => i.product.rootCategory === 'Drinks'));
	const hasBoth = $derived(foodItems.length > 0 && drinkItems.length > 0);
</script>

<div
	{...restProps}
	role="button"
	transition:slide={{ duration: 200 }}
	tabindex="0"
	{onclick}
	onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && onclick?.()}
	class="flex h-fit w-72 cursor-pointer flex-col overflow-hidden rounded-3xl border-300 bg-200 p-1 shadow-sm {className}"
>
	<!-- Header — tap target when allPending (→ InProgress) or allReady (→ PickedUp) -->
	<button
		onclick={(e) => {
			e.stopPropagation();
			if (allPending) onprimaryaction?.('InProgress');
			else if (allReady) onprimaryaction?.('PickedUp');
		}}
		disabled={!allPending && !allReady}
		class="relative m-1 flex flex-col justify-between rounded-2xl border border-400/50 bg-300 px-3 py-2
			text-left transition-all
			{allPending ? 'hover:border-amber-400/40' : ''}
			{allReady ? 'hover:border-green-400/40' : ''}"
	>
		<span
			class="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full transition-colors
			{allPending
				? 'animate-pulse bg-amber-400'
				: allReady
					? 'bg-green-400'
					: allPickedUp
						? 'bg-400/50'
						: 'bg-blue-400'}"
		></span>

		<div class="flex flex-row items-center justify-between pr-5">
			<div class="flex flex-col">
				<span class="text-main/50 text-xs font-semibold">
					{order.tableNumber ? `Table ${order.tableNumber}` : 'Takeaway'}
				</span>
				<span class="text-main text-sm font-bold">
					{totalItems} item{totalItems !== 1 ? 's' : ''} &middot; €{totalPrice.toFixed(2)}
				</span>
			</div>
			<div class="flex flex-col items-end gap-0.5">
				<span class="text-main/40 text-xs">Ordered {formatTime(order.createdTime)}</span>
				{#if order.pickupTime}
					<span class="text-main/60 text-sm font-bold">Pickup {formatTime(order.pickupTime)}</span>
				{/if}
			</div>
		</div>
	</button>

	<!-- Items grouped by category — one row per item, progress bar background -->
	<div class="mx-1 mt-0.5 flex flex-col gap-1">
		{#if foodItems.length > 0}
			{#if hasBoth}
				<div class="flex items-center gap-1.5 px-1 pt-0.5">
					<span class="text-[10px] font-semibold tracking-wide text-orange-500/70 uppercase">
						🍽️ Food
					</span>
					<div class="h-px flex-1 bg-orange-400/20"></div>
				</div>
			{/if}
			{#each foodItems as item (item.id)}
				{@const prepared = preparedCounts[item.id] ?? 0}
				{@const status = effectiveStatus(item)}
				{@const pct = item.quantity > 0 ? (prepared / item.quantity) * 100 : 0}
				{@const isPickedUp = item.status === 'PickedUp'}
				<button
					onclick={(e) => handleItemTap(e, item)}
					disabled={isPickedUp || !onitemdelta}
					class="relative flex cursor-pointer items-center gap-2 overflow-hidden rounded-2xl border px-3 py-1.5
						transition-all active:scale-95 disabled:cursor-default
						{rowColor[status]}"
				>
					<!-- Progress bar fills from left, same accent colour -->
					{#if !isPickedUp && item.quantity > 1}
						<div
							class="pointer-events-none absolute inset-0 origin-left rounded-2xl transition-all duration-300 {progressColor[
								status
							]}"
							style="width: {pct}%"
						></div>
					{/if}

					<div class="relative min-w-0 flex-1 text-left">
						<p class="text-main truncate text-sm font-semibold">
							{item.product.title[currentLanguage]}
						</p>
						{#if item.choices && item.choices.length > 0}
							<p class="text-main/40 truncate text-xs">
								{item.choices.map((c) => c.product.title[currentLanguage]).join(', ')}
							</p>
						{/if}
					</div>

					<!-- Quantity + status badge -->
					<div class="relative flex shrink-0 items-center gap-1.5">
						{#if item.quantity > 1}
							<span class="text-main/40 text-xs tabular-nums">
								{prepared}/{item.quantity}
							</span>
						{/if}
						<StatusBadge {status} />
					</div>
				</button>
			{/each}
		{/if}

		{#if drinkItems.length > 0}
			{#if hasBoth}
				<div class="flex items-center gap-1.5 px-1 pt-1">
					<span class="text-[10px] font-semibold tracking-wide text-blue-500/70 uppercase">
						🥤 Drinks
					</span>
					<div class="h-px flex-1 bg-blue-400/20"></div>
				</div>
			{/if}
			{#each drinkItems as item (item.id)}
				{@const prepared = preparedCounts[item.id] ?? 0}
				{@const status = effectiveStatus(item)}
				{@const pct = item.quantity > 0 ? (prepared / item.quantity) * 100 : 0}
				{@const isPickedUp = item.status === 'PickedUp'}
				<button
					onclick={(e) => handleItemTap(e, item)}
					disabled={isPickedUp || !onitemdelta}
					class="relative flex cursor-pointer items-center gap-2 overflow-hidden rounded-2xl border px-3 py-1.5
						transition-all active:scale-95 disabled:cursor-default
						{rowColor[status]}"
				>
					{#if !isPickedUp && item.quantity > 1}
						<div
							class="pointer-events-none absolute inset-0 origin-left rounded-2xl transition-all duration-300 {progressColor[
								status
							]}"
							style="width: {pct}%"
						></div>
					{/if}

					<span
						class="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-300/30 text-xs font-bold text-blue-600 dark:bg-blue-600 dark:text-blue-100"
						>🥤</span
					>

					<div class="relative min-w-0 flex-1 text-left">
						<p class="text-main truncate text-sm font-semibold">
							{item.product.title[currentLanguage]}
						</p>
						{#if item.choices && item.choices.length > 0}
							<p class="text-main/40 truncate text-xs">
								{item.choices.map((c) => c.product.title[currentLanguage]).join(', ')}
							</p>
						{/if}
					</div>

					<div class="relative flex shrink-0 items-center gap-1.5">
						{#if item.quantity > 1}
							<span class="text-main/40 text-xs tabular-nums">
								{prepared}/{item.quantity}
							</span>
						{/if}
						<StatusBadge {status} />
					</div>
				</button>
			{/each}
		{/if}
	</div>

	<!-- Footer -->
	{#if allPending}
		<div class="m-1" transition:slide={{ duration: 150 }}>
			<button
				onclick={(e) => {
					e.stopPropagation();
					onprimaryaction?.('InProgress');
				}}
				class="w-full rounded-2xl bg-amber-400/15 px-3 py-2 text-sm font-semibold text-amber-500
					transition-all active:scale-[0.97] active:bg-amber-400/25 dark:bg-amber-500/20 dark:text-amber-300"
			>
				Accept order
			</button>
		</div>
	{:else if allInProgress}
		<div class="m-1 flex justify-end" transition:slide={{ duration: 150 }}>
			<button
				onclick={(e) => {
					e.stopPropagation();
					onprimaryaction?.('Pending');
				}}
				class="text-main/30 hover:text-main/60 px-3 py-1.5 text-xs transition-all active:scale-95"
			>
				↩ Reset to pending
			</button>
		</div>
	{:else if allReady}
		<div class="m-1" transition:slide={{ duration: 150 }}>
			<button
				onclick={(e) => {
					e.stopPropagation();
					onprimaryaction?.('PickedUp');
				}}
				class="w-full rounded-2xl bg-green-400/15 px-3 py-2 text-sm font-semibold text-green-500
					transition-all active:scale-[0.97] active:bg-green-400/25 dark:bg-green-500/20 dark:text-green-300"
			>
				Picked up
			</button>
		</div>
	{:else if allPickedUp}
		<div class="m-1 flex justify-end" transition:slide={{ duration: 150 }}>
			<button
				onclick={(e) => {
					e.stopPropagation();
					onprimaryaction?.('Ready');
				}}
				class="text-main/30 hover:text-main/60 px-3 py-1.5 text-xs transition-all active:scale-95"
			>
				↩ Undo pickup
			</button>
		</div>
	{/if}
</div>
