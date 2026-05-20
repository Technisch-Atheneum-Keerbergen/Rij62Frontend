<script lang="ts">
	import OrderCard from './../../../lib/components/Admin/OrderCard.svelte';
	import { apiFetch } from '$lib/api/client';
	import type { Order, OrderStatus } from '$lib/api/types/order';
	import { slide } from 'svelte/transition';
	import FilterItem from '$lib/components/Badges/FilterItem.svelte';
	import type { ChefDish, UrgencyLevel } from '$lib/api/types/dish';
	import ChefCard from '$lib/components/Admin/ChefCard.svelte';
	import ReadyChefCard from '$lib/components/Admin/ReadyChefCard.svelte';

	const currentLanguage = import.meta.env.VITE_CURRENT_LANGUAGE as 'English' | 'Dutch';

	let activeView = $state<'orders' | 'chef' | 'both'>('both');
	let chefCategory = $state<'all' | 'Food' | 'Drinks'>('all');

	let orders = $state<Order[]>([]);

	async function loadOrders() {
		orders = (await apiFetch('/order')) as Order[];
		for (const order of orders) {
			for (const item of order.items) {
				if (item.status === 'Ready' || item.status === 'PickedUp') {
					preparedCounts[item.id] = item.quantity;
				}
			}
		}
	}

	let ordersPromise = $state(loadOrders());

	let preparedCounts = $state<Record<number, number>>({});

	function getPrepared(itemId: number): number {
		return preparedCounts[itemId] ?? 0;
	}

	let now = $state(Date.now());
	$effect(() => {
		const id = setInterval(() => (now = Date.now()), 30_000);
		return () => clearInterval(id);
	});

	function urgencyFor(pickupUnix: number, nowMs: number): UrgencyLevel {
		const diffMin = (pickupUnix * 1000 - nowMs) / 60_000;
		if (diffMin <= 30) return 'red';
		if (diffMin <= 90) return 'yellow';
		return 'green';
	}

	function itemKey(item: {
		product: { title: Record<string, string> };
		choices?: { product: { title: Record<string, string> } }[];
	}): string {
		const base = item.product.title[currentLanguage];
		const extras = (item.choices ?? [])
			.map((c) => c.product.title[currentLanguage])
			.sort()
			.join('+');
		return extras ? `${base}||${extras}` : base;
	}

	function aggregateForChef(orders: Order[], nowMs: number): ChefDish[] {
		const map = new Map<string, ChefDish>();

		for (const order of orders) {
			const pickupUnix = order.pickupTime ?? order.createdTime;
			const urgency = urgencyFor(pickupUnix, nowMs);
			const timeLabel = formatTime(pickupUnix);

			for (const item of order.items) {
				if (item.status === 'PickedUp') continue;

				const dKey = itemKey(item);
				const bucketKey = `${dKey}::${urgency}`;
				const title = item.product.title[currentLanguage];
				const choicesLabel = (item.choices ?? [])
					.map((c) => c.product.title[currentLanguage])
					.join(', ');
				const rootCategory: string = (item.product as any).rootCategory ?? 'Food';

				if (!map.has(bucketKey)) {
					map.set(bucketKey, {
						key: bucketKey,
						dishKey: dKey,
						title,
						choicesLabel,
						totalQuantity: 0,
						prepared: 0,
						sourceOrders: [],
						earliestPickup: pickupUnix,
						urgency,
						rootCategory
					});
				}

				const dish = map.get(bucketKey)!;
				dish.totalQuantity += item.quantity;
				dish.prepared += getPrepared(item.id);
				dish.sourceOrders.push({ label: timeLabel, pickupTime: pickupUnix });

				if (pickupUnix < dish.earliestPickup) dish.earliestPickup = pickupUnix;
			}
		}

		const urgencyOrder: Record<UrgencyLevel, number> = { red: 0, yellow: 1, green: 2 };
		return [...map.values()].sort(
			(a, b) =>
				urgencyOrder[a.urgency] - urgencyOrder[b.urgency] || a.earliestPickup - b.earliestPickup
		);
	}

	function itemsForKey(dishKey: string, urgency: UrgencyLevel) {
		const result: { orderId: string; item: Order['items'][number] }[] = [];
		const nowMs = Date.now();

		for (const order of orders) {
			const pickupUnix = order.pickupTime ?? order.createdTime;
			if (urgencyFor(pickupUnix, nowMs) !== urgency) continue;
			for (const item of order.items) {
				if (item.status === 'PickedUp') continue;
				if (itemKey(item) === dishKey) result.push({ orderId: order.id, item });
			}
		}

		return result.sort((a, b) => {
			const tA = orders.find((o) => o.id === a.orderId)?.pickupTime ?? 0;
			const tB = orders.find((o) => o.id === b.orderId)?.pickupTime ?? 0;
			return tA - tB;
		});
	}

	async function applyPreparedDelta(
		orderId: string,
		itemId: number,
		quantity: number,
		delta: 1 | -1
	) {
		const current = getPrepared(itemId);
		const next = Math.max(0, Math.min(quantity, current + delta));
		if (next === current) return;

		preparedCounts[itemId] = next;

		const nextStatus: OrderStatus = next === quantity ? 'Ready' : 'InProgress';

		try {
			await apiFetch(`/order/${orderId}/status/${itemId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(nextStatus)
			});
			orders = orders.map((order) => {
				if (order.id !== orderId) return order;
				return {
					...order,
					items: order.items.map((item) => {
						if (item.id !== itemId) return item;
						return { ...item, status: nextStatus };
					})
				};
			});
		} catch {
			preparedCounts[itemId] = current;
		}
	}

	async function handleChefAdjust(dishKey: string, urgency: UrgencyLevel, delta: 1 | -1) {
		const candidates = itemsForKey(dishKey, urgency);
		const target =
			delta === 1
				? candidates.find((c) => getPrepared(c.item.id) < c.item.quantity)
				: [...candidates].reverse().find((c) => getPrepared(c.item.id) > 0);
		if (target)
			await applyPreparedDelta(target.orderId, target.item.id, target.item.quantity, delta);
	}

	async function handleOrderItemDelta(
		orderId: string,
		itemId: number,
		quantity: number,
		delta: 1 | -1
	) {
		await applyPreparedDelta(orderId, itemId, quantity, delta);
	}

	async function handleOrderPrimaryAction(orderId: string, action: OrderStatus) {
		const order = orders.find((o) => o.id === orderId);
		if (!order) return;

		const statusMap: Partial<Record<OrderStatus, OrderStatus>> = {
			Pending: 'InProgress',
			InProgress: 'Pending',
			Ready: 'PickedUp',
			PickedUp: 'Ready'
		};

		const nextStatus = statusMap[action];
		if (!nextStatus) return;

		const itemsToUpdate =
			action === 'PickedUp' ? order.items : order.items.filter((item) => item.status === action);

		await Promise.all(
			itemsToUpdate.map((item) =>
				apiFetch(`/order/${orderId}/status/${item.id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(nextStatus)
				}).catch(() => {})
			)
		);
		orders = orders.map((order) => {
			if (order.id !== orderId) return order;
			return {
				...order,
				items: order.items.map((item) => {
					const shouldUpdate = itemsToUpdate.some((updated) => updated.id === item.id);
					if (!shouldUpdate) return item;
					return { ...item, status: nextStatus };
				})
			};
		});
	}

	const allChefDishes = $derived(aggregateForChef(orders, now));

	const inCategory = (d: ChefDish) => chefCategory === 'all' || d.rootCategory === chefCategory;

	const urgentDishes = $derived(
		allChefDishes.filter(
			(d) =>
				d.prepared < d.totalQuantity &&
				(d.urgency === 'red' || d.urgency === 'yellow') &&
				inCategory(d)
		)
	);

	const laterDishes = $derived(
		allChefDishes.filter(
			(d) => d.prepared < d.totalQuantity && d.urgency === 'green' && inCategory(d)
		)
	);

	const readyDishes = $derived(
		allChefDishes.filter((d) => d.prepared >= d.totalQuantity && inCategory(d))
	);

	function formatTime(unix: number) {
		return new Date(unix * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}
</script>

<div class="flex h-screen flex-col gap-3 overflow-hidden p-4">
	<div class="flex shrink-0 items-center justify-between gap-2">
		<div class="flex items-center gap-1">
			<FilterItem
				group="kitchen-view"
				label="Both"
				value="both"
				checked={activeView === 'both'}
				onclick={() => (activeView = 'both')}
			/>
			<FilterItem
				group="kitchen-view"
				label="Orders"
				value="orders"
				checked={activeView === 'orders'}
				onclick={() => (activeView = 'orders')}
			/>
			<FilterItem
				group="kitchen-view"
				label="Chef"
				value="chef"
				checked={activeView === 'chef'}
				onclick={() => (activeView = 'chef')}
			/>
		</div>

		{#if activeView === 'chef' || activeView === 'both'}
			<div class="flex items-center gap-1" transition:slide={{ axis: 'x', duration: 150 }}>
				<FilterItem
					group="chef-category"
					label="All"
					value="all"
					checked={chefCategory === 'all'}
					onclick={() => (chefCategory = 'all')}
				/>
				<FilterItem
					group="chef-category"
					label="🍽️ Food"
					value="Food"
					checked={chefCategory === 'Food'}
					onclick={() => (chefCategory = 'Food')}
				/>
				<FilterItem
					group="chef-category"
					label="🥤 Drinks"
					value="Drinks"
					checked={chefCategory === 'Drinks'}
					onclick={() => (chefCategory = 'Drinks')}
				/>
			</div>
		{/if}
	</div>

	{#await ordersPromise}
		<p class="text-main/40 text-sm">Loading orders…</p>
	{:then}
		<div
			class="grid min-h-0 flex-1 gap-4 transition-all"
			class:grid-cols-2={activeView === 'both'}
			class:grid-cols-1={activeView !== 'both'}
		>
			{#if activeView === 'both' || activeView === 'orders'}
				<section
					class="flex min-h-0 flex-col gap-2"
					transition:slide={{ axis: 'x', duration: 200 }}
				>
					<h2 class="text-main/50 px-1 text-xs font-semibold tracking-widest uppercase">
						Order view
					</h2>
					<div class="flex min-h-0 flex-1 flex-row gap-4 overflow-x-auto overflow-y-hidden pb-2">
						{#each orders as order (order.id)}
							<OrderCard
								{order}
								{preparedCounts}
								class="shrink-0"
								onitemdelta={(itemId, quantity, delta) =>
									handleOrderItemDelta(order.id, itemId, quantity, delta)}
								onprimaryaction={(action) => handleOrderPrimaryAction(order.id, action)}
							/>
						{/each}
					</div>
				</section>
			{/if}

			{#if activeView === 'both' || activeView === 'chef'}
				<section
					class="flex min-h-0 flex-col gap-3"
					transition:slide={{ axis: 'x', duration: 200 }}
				>
					<h2 class="text-main/50 px-1 text-xs font-semibold tracking-widest uppercase">
						Chef view
					</h2>

					<div class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
						{#if readyDishes.length > 0}
							<div class="flex shrink-0 flex-col gap-1.5">
								<div class="flex items-center gap-2 px-1">
									<span class="h-2 w-2 rounded-full bg-green-500"></span>
									<span class="text-sm font-semibold tracking-widest text-green-500/80 uppercase">
										Ready
									</span>
									<div class="h-px flex-1 bg-green-400/20"></div>
								</div>
								<div class="m-2 flex flex-row gap-3 overflow-x-auto p-2">
									{#each readyDishes as dish (dish.key)}
										<ReadyChefCard
											{dish}
											onAdjust={(delta) => handleChefAdjust(dish.dishKey, dish.urgency, delta)}
										/>
									{/each}
								</div>
							</div>
						{/if}

						{#if urgentDishes.length > 0}
							<div class="flex shrink-0 flex-col gap-1.5">
								<div class="flex items-center gap-2 px-1">
									<span class="h-2 w-2 animate-pulse rounded-full bg-red-500"></span>
									<span class="text-sm font-semibold tracking-widest text-red-500/80 uppercase">
										Urgent
									</span>
									<div class="h-px flex-1 bg-red-400/20"></div>
								</div>
								<div class="m-2 flex flex-row gap-3 overflow-x-auto p-2">
									{#each urgentDishes as dish (dish.key)}
										<ChefCard
											{dish}
											{now}
											onAdjust={(delta) => handleChefAdjust(dish.dishKey, dish.urgency, delta)}
										/>
									{/each}
								</div>
							</div>
						{/if}

						{#if laterDishes.length > 0}
							<div class="flex shrink-0 flex-col gap-1.5">
								<div class="flex items-center gap-2 px-1">
									<span class="h-2 w-2 rounded-full bg-green-500"></span>
									<span class="text-sm font-semibold tracking-widest text-green-500/80 uppercase">
										Later
									</span>
									<div class="h-px flex-1 bg-green-400/20"></div>
								</div>
								<div class="flex flex-row gap-3 overflow-x-auto p-2">
									{#each laterDishes as dish (dish.key)}
										<ChefCard
											{dish}
											{now}
											onAdjust={(delta) => handleChefAdjust(dish.dishKey, dish.urgency, delta)}
										/>
									{/each}
								</div>
							</div>
						{/if}

						{#if urgentDishes.length === 0 && laterDishes.length === 0 && readyDishes.length === 0}
							<p class="text-main/30 px-1 text-sm">No active dishes.</p>
						{/if}
					</div>
				</section>
			{/if}
		</div>
	{:catch err}
		<p class="text-sm text-red-500">Failed to load orders: {err.message}</p>
	{/await}
</div>
