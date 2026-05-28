<script lang="ts">
	import { slide } from 'svelte/transition';
	import type { Order, OrderItem, OrderStatus } from '$lib/api/types/order';
	import type { UrgencyLevel } from '$lib/api/types/dish';
	import OrderItemRow from './OrderItemRow.svelte';
	import OrderFooterAction from './OrderFooterAction.svelte';
	import CategoryReadyButton from './CategoryReadyButton.svelte';

	let {
		order,
		preparedCounts = {},
		onitemdelta,
		onprimaryaction,
		onclick,
		activeCategory = 'all',
		class: className = '',
		...restProps
	}: {
		order: Order;
		preparedCounts?: Record<number, number>;
		onitemdelta?: (itemId: number, delta: 1 | -1) => void;
		onprimaryaction?: (nextStatus: OrderStatus) => void;
		onclick?: () => void;
		activeCategory?: 'all' | 'Food' | 'Drinks';
		class?: string;
	} = $props();

	const currentLanguage = import.meta.env.VITE_CURRENT_LANGUAGE as 'English' | 'Dutch';

	function formatTime(unix: number) {
		return new Date(unix * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	// --- Urgency ---
	function urgencyFor(pickupUnix: number, nowMs: number): UrgencyLevel {
		const diffMin = (pickupUnix * 1000 - nowMs) / 60_000;
		if (diffMin <= 5) return 'red';
		if (diffMin <= 30) return 'yellow';
		return 'green';
	}

	const urgency = $derived(order.pickupTime ? urgencyFor(order.pickupTime, Date.now()) : 'green');

	const urgencyRing: Record<UrgencyLevel, string> = {
		red: 'ring-2 ring-red-400/60',
		yellow: 'ring-2 ring-yellow-400/60',
		green: 'ring-2 ring-green-400/60'
	};
	const urgencyBg: Record<UrgencyLevel, string> = {
		red: 'bg-red-200/20 dark:bg-red-500/5',
		yellow: 'bg-yellow-200/20 dark:bg-yellow-500/5',
		green: 'bg-green-200/20 dark:bg-green-500/5'
	};
	const urgencyDot: Record<UrgencyLevel, string> = {
		red: 'bg-red-500 animate-pulse',
		yellow: 'bg-yellow-400',
		green: 'bg-green-400'
	};

	// --- Totals ---
	const totalItems = $derived(order.items.length);
	const totalPrice = $derived(order.totalPrice);

	// --- Item grouping ---
	// Key: product title + sorted choice titles (same logic as itemKey in the page)
	function groupKey(item: OrderItem): string {
		const base = item.product.title[currentLanguage];
		const extras = (item.choices ?? [])
			.map((c) => c.product.title[currentLanguage])
			.sort()
			.join('+');
		return extras ? `${base}||${extras}` : base;
	}

	function groupItems(items: OrderItem[]): OrderItem[][] {
		const map = new Map<string, OrderItem[]>();
		for (const item of items) {
			const k = groupKey(item);
			if (!map.has(k)) map.set(k, []);
			map.get(k)!.push(item);
		}
		return [...map.values()];
	}

	// --- Item state ---
	const liveItems = $derived(order.items.filter((i) => i.status !== 'PickedUp'));

	const allPending = $derived(
		liveItems.length > 0 && liveItems.every((i) => i.status === 'Pending')
	);
	const allInProgress = $derived(
		liveItems.length > 0 && liveItems.every((i) => i.status === 'InProgress')
	);
	const allReady = $derived(liveItems.length > 0 && liveItems.every((i) => i.status === 'Ready'));
	const allPickedUp = $derived(order.items.every((i) => i.status === 'PickedUp'));

	// --- Category grouping ---
	const foodItems = $derived(
		order.items.filter((i) => (i.product.rootCategory ?? 'Food') !== 'Drinks')
	);
	const drinkItems = $derived(order.items.filter((i) => i.product.rootCategory === 'Drinks'));
	const hasBoth = $derived(foodItems.length > 0 && drinkItems.length > 0);

	const foodGroups = $derived(groupItems(foodItems));
	const drinkGroups = $derived(groupItems(drinkItems));

	const hiddenItemCount = $derived(
		activeCategory === 'all'
			? 0
			: order.items.filter((i) => (i.product.rootCategory ?? 'Food') !== activeCategory).length
	);
	const hiddenCategory = $derived(activeCategory === 'Food' ? 'Drinks' : 'Food');
</script>

<div
	{...restProps}
	role="button"
	transition:slide={{ duration: 200 }}
	tabindex="0"
	{onclick}
	onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && onclick?.()}
	class="flex h-fit w-full min-w-72 cursor-pointer flex-col gap-2 overflow-hidden rounded-3xl border-300 bg-200 p-2 shadow-sm transition-all {urgencyRing[
		urgency
	]} {className}"
>
	<!-- Header -->
	<div
		class="relative flex flex-col justify-between rounded-2xl border border-400/50 px-3 py-2
			text-left transition-all {urgencyBg[urgency]}"
	>
		<span
			class="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full transition-colors {urgencyDot[
				urgency
			]}"
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
	</div>

	<!-- Items -->
	<div class="flex flex-col gap-1">
		{#if foodItems.length > 0 && (activeCategory === 'all' || activeCategory === 'Food')}
			{#if hasBoth && activeCategory === 'all'}
				<div class="flex items-center gap-1.5 px-1">
					<span class="text-[10px] font-semibold tracking-wide text-orange-500/80 uppercase"
						>🍽️ Food</span
					>
					<div class="h-px flex-1 bg-orange-400/20"></div>
				</div>
			{/if}
			{#each foodGroups as group (group[0].id)}
				<OrderItemRow items={group} {preparedCounts} {onitemdelta} />
			{/each}
			{#if hasBoth}
				<CategoryReadyButton items={foodItems} {preparedCounts} {onitemdelta} />
			{/if}
		{/if}

		{#if drinkItems.length > 0 && (activeCategory === 'all' || activeCategory === 'Drinks')}
			{#if hasBoth && activeCategory === 'all'}
				<div class="flex items-center gap-1.5 px-1">
					<span class="text-[10px] font-semibold tracking-wide text-blue-500/80 uppercase"
						>🥤 Drinks</span
					>
					<div class="h-px flex-1 bg-blue-400/20"></div>
				</div>
			{/if}
			{#each drinkGroups as group (group[0].id)}
				<OrderItemRow items={group} {preparedCounts} {onitemdelta} />
			{/each}
			{#if hasBoth}
				<CategoryReadyButton items={drinkItems} {preparedCounts} {onitemdelta} />
			{/if}
		{/if}

		{#if !hasBoth}
			<CategoryReadyButton items={order.items} {preparedCounts} {onitemdelta} />
		{/if}
	</div>

	<!-- Hidden category hint -->
	{#if hiddenItemCount > 0}
		<div class="flex items-center gap-1.5 px-2 py-1">
			<span class="text-main/30 text-xs">{hiddenCategory === 'Drinks' ? '🥤' : '🍽️'}</span>
			<span class="text-main/35 text-xs font-medium">
				+{hiddenItemCount} item{hiddenItemCount !== 1 ? 's' : ''}
			</span>
		</div>
	{/if}

	<OrderFooterAction {allPending} {allInProgress} {allReady} {allPickedUp} {onprimaryaction} />
</div>
