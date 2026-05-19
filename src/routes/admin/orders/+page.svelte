<script lang="ts">
	import OrderCard from './../../../lib/components/Admin/OrderCard.svelte';
	import { apiFetch } from '$lib/api/client';
	import type { Order, OrderStatus } from '$lib/api/types/order';
	import { slide } from 'svelte/transition';
	import FilterItem from '$lib/components/Badges/FilterItem.svelte';
	import type { ChefDish } from '$lib/api/types/dish';
	import ChefCard from '$lib/components/Admin/ChefCard.svelte';

	const currentLanguage = import.meta.env.VITE_CURRENT_LANGUAGE as 'English' | 'Dutch';

	// View toggle
	let activeView = $state<'orders' | 'chef' | 'both'>('both');

	// Orders state — kept mutable so optimistic updates reflect immediately
	let orders = $state<Order[]>([]);

	async function loadOrders() {
		orders = (await apiFetch('/order')) as Order[];
	}

	let ordersPromise = $state(loadOrders());

	// Item key — identifies a dish+choices combination across orders
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

	// Chef view aggregation
	function aggregateForChef(orders: Order[]): ChefDish[] {
		const map = new Map<string, ChefDish>();

		for (const order of orders) {
			const label = formatTime(order.pickupTime ?? order.createdTime);

			for (const item of order.items) {
				if (item.status === 'PickedUp') continue;

				const key = itemKey(item);
				const title = item.product.title[currentLanguage];
				const choicesLabel = (item.choices ?? [])
					.map((c) => c.product.title[currentLanguage])
					.join(', ');

				if (!map.has(key)) {
					map.set(key, {
						key,
						title,
						choicesLabel,
						totalQuantity: 0,
						prepared: 0,
						sourceOrders: [],
						earliestPickup: order.pickupTime ?? order.createdTime
					});
				}

				const dish = map.get(key)!;
				dish.totalQuantity += item.quantity;

				if (item.status === 'Ready') {
					dish.prepared += item.quantity;
				}

				dish.sourceOrders.push({ label, pickupTime: order.pickupTime ?? order.createdTime });

				if ((order.pickupTime ?? order.createdTime) < dish.earliestPickup) {
					dish.earliestPickup = order.pickupTime ?? order.createdTime;
				}
			}
		}

		return [...map.values()].sort((a, b) => a.earliestPickup - b.earliestPickup);
	}

	// Returns all items matching a dish key, sorted by urgency (earliest pickup first),
	// with each item annotated with its parent order id.
	function itemsForKey(key: string): { orderId: string; item: Order['items'][number] }[] {
		const result: { orderId: string; item: Order['items'][number] }[] = [];

		for (const order of orders) {
			for (const item of order.items) {
				if (item.status === 'PickedUp') continue;
				if (itemKey(item) === key) {
					result.push({ orderId: order.id, item });
				}
			}
		}

		result.sort((a, b) => {
			const tA = orders.find((o) => o.id === a.orderId)?.pickupTime ?? 0;
			const tB = orders.find((o) => o.id === b.orderId)?.pickupTime ?? 0;
			return tA - tB;
		});

		return result;
	}

	// Called by ChefCard when the chef increments or decrements prepared count.
	// delta +1 → mark the most urgent pending item as Ready (optimistic).
	// delta -1 → roll back the most recently readied item to Pending (optimistic).
	async function handleChefAdjust(key: string, delta: 1 | -1) {
		const candidates = itemsForKey(key);
		console.log(key);
		let target: { orderId: string; item: Order['items'][number] } | undefined;
		let nextStatus: OrderStatus;

		if (delta === 1) {
			// Find the first item not yet marked Ready/InProgress
			target = candidates.find(
				(c) => c.item.status === 'Pending' || c.item.status === 'InProgress'
			);
			nextStatus = 'Ready';
		} else {
			// Find the last item that was marked Ready, rolling back the most urgent first
			target = [...candidates].reverse().find((c) => c.item.status === 'Ready');
			nextStatus = 'InProgress';
		}

		if (!target) return;

		const previous = target.item.status;

		// Optimistic update
		target.item.status = nextStatus;
		orders = [...orders]; // trigger reactivity

		try {
			await apiFetch(`/order/${target.orderId}/status/${target.item.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(nextStatus)
			});
		} catch {
			// Rollback
			target.item.status = previous;
			orders = [...orders];
		}
	}

	function formatTime(unix: number) {
		return new Date(unix * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}
</script>

<div class="flex h-screen flex-col gap-3 overflow-hidden p-4">
	<!-- View switcher -->
	<div class="flex shrink-0 items-center gap-1">
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

	{#await ordersPromise}
		<p class="text-main/40 text-sm">Loading orders…</p>
	{:then}
		<!-- Workflow views -->
		<div
			class="grid min-h-0 flex-1 gap-4 transition-all"
			class:grid-cols-2={activeView === 'both'}
			class:grid-cols-1={activeView !== 'both'}
		>
			<!-- Order view -->
			{#if activeView === 'both' || activeView === 'orders'}
				<section
					class="flex min-h-0 flex-col gap-2"
					transition:slide={{ axis: 'x', duration: 200 }}
				>
					<h2 class="text-main/50 px-1 text-xs font-semibold tracking-widest uppercase">
						Order view
					</h2>
					<div class="flex min-h-0 flex-1 flex-row gap-4 overflow-x-auto overflow-y-hidden pb-2">
						{#each orders.filter( (o) => o.items.some((i) => i.status !== 'PickedUp') ) as order (order.id)}
							<OrderCard {order} class="shrink-0" />
						{/each}
					</div>
				</section>
			{/if}

			<!-- Chef view -->
			{#if activeView === 'both' || activeView === 'chef'}
				<section
					class="flex min-h-0 flex-col gap-2"
					transition:slide={{ axis: 'x', duration: 200 }}
				>
					<h2 class="text-main/50 px-1 text-xs font-semibold tracking-widest uppercase">
						Chef view
					</h2>
					<div class="flex min-h-0 flex-1 flex-row gap-3 overflow-x-auto overflow-y-hidden pb-2">
						{#each aggregateForChef(orders) as dish (dish.key)}
							<ChefCard {dish} onAdjust={(delta) => handleChefAdjust(dish.key, delta)} />
						{/each}
					</div>
				</section>
			{/if}
		</div>
	{:catch err}
		<p class="text-sm text-red-500">Failed to load orders: {err.message}</p>
	{/await}
</div>
