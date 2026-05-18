<script lang="ts">
	import OrderCard from './../../../lib/components/Admin/OrderCard.svelte';
	import { apiFetch } from '$lib/api/client';
	import type { Order, OrderStatus } from '$lib/api/types/order';
	import { slide } from 'svelte/transition';
	import FilterItem from '$lib/components/Badges/FilterItem.svelte';

	const currentLanguage = import.meta.env.VITE_CURRENT_LANGUAGE as 'English' | 'Dutch';

	// ── View toggle ──────────────────────────────────────────────────────────────
	let activeView = $state<'orders' | 'chef' | 'both'>('both');

	// ── Data ─────────────────────────────────────────────────────────────────────
	async function getAllOrders(): Promise<Order[]> {
		return (await apiFetch('/order')) as Order[];
	}

	let ordersPromise = $state(getAllOrders());

	// ── Chef view aggregation ─────────────────────────────────────────────────────
	type ChefDish = {
		key: string;
		title: string;
		totalQuantity: number;
		prepared: number;
		sourceOrders: { label: string; pickupTime: number }[];
		earliestPickup: number;
	};

	function aggregateForChef(orders: Order[]): ChefDish[] {
		const map = new Map<string, ChefDish>();

		for (const order of orders) {
			const label = formatTime(order.pickupTime ?? order.createdTime);

			for (const item of order.items) {
				if (item.status === 'PickedUp') continue;
				const key = item.product.title[currentLanguage];
				if (!map.has(key)) {
					map.set(key, {
						key,
						title: key,
						totalQuantity: 0,
						prepared: 0,
						sourceOrders: [],
						earliestPickup: order.pickupTime ?? order.createdTime
					});
				}
				const dish = map.get(key)!;
				dish.totalQuantity += item.quantity;
				if (item.status === 'Ready' || item.status === 'InProgress') {
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

	// ── Chef dish local state ─────────────────────────────────────────────────────
	let chefState = $state<Record<string, { prepared: number }>>({});

	function getChefPrepared(key: string, fallback: number) {
		return chefState[key]?.prepared ?? fallback;
	}

	function adjustPrepared(key: string, total: number, delta: number) {
		const current = chefState[key]?.prepared ?? 0;
		chefState[key] = { prepared: Math.max(0, Math.min(total, current + delta)) };
	}

	function markAllReady(key: string, total: number) {
		chefState[key] = { prepared: total };
	}

	// ── Helpers ───────────────────────────────────────────────────────────────────
	function formatTime(unix: number) {
		return new Date(unix * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}
</script>

<div class="flex h-screen flex-col gap-3 overflow-hidden p-4">
	<!-- ── View switcher ──────────────────────────────────────────────────────── -->
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
	{:then orders}
		<!-- ── Top: workflow views ────────────────────────────────────────────────── -->
		<div
			class="grid min-h-0 flex-1 gap-4 transition-all"
			class:grid-cols-2={activeView === 'both'}
			class:grid-cols-1={activeView !== 'both'}
		>
			<!-- ── 1. Order-Maker View ──────────────────────────────────────────── -->
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

			<!-- ── 2. Chef View ─────────────────────────────────────────────────── -->
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
							{@const prepared = getChefPrepared(dish.key, dish.prepared)}
							{@const allDone = prepared >= dish.totalQuantity}
							<div
								transition:slide={{ axis: 'x', duration: 200 }}
								class="flex h-fit w-56 shrink-0 flex-col overflow-hidden rounded-3xl border-300 bg-200 p-1 shadow-sm transition-all hover:shadow-md"
							>
								<!-- Header pill -->
								<div
									class="relative m-1 flex flex-col gap-1 rounded-2xl border border-400/50 bg-300 px-3 py-2"
								>
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
									<!-- Source order pickup-time chips -->
									<div class="flex flex-wrap gap-1">
										{#each dish.sourceOrders as src}
											<span
												class="text-main/60 rounded-full bg-400/20 px-1.5 py-0.5 text-[10px] font-medium"
											>
												{src.label}
											</span>
										{/each}
									</div>
								</div>

								<!-- Progress + controls -->
								<div
									class="mx-1 mt-0.5 mb-1 flex flex-col gap-1.5 rounded-2xl border border-400/30 bg-300 px-3 py-2"
								>
									<div class="flex items-center gap-2">
										<div class="h-1.5 flex-1 overflow-hidden rounded-full bg-400/30">
											<div
												class="h-full rounded-full transition-all duration-300 {allDone
													? 'bg-green-500'
													: 'bg-blue-500'}"
												style="width: {(prepared / dish.totalQuantity) * 100}%"
											></div>
										</div>
										<span class="text-main/50 text-xs tabular-nums">
											{prepared}/{dish.totalQuantity}
										</span>
									</div>
									<div class="flex items-center gap-1">
										<button
											onclick={() => adjustPrepared(dish.key, dish.totalQuantity, -1)}
											disabled={prepared === 0}
											class="text-main/60 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-400/50 bg-200 text-sm font-bold transition hover:bg-400/30 active:scale-90 disabled:opacity-30"
											aria-label="Decrease">−</button
										>
										<button
											onclick={() => adjustPrepared(dish.key, dish.totalQuantity, 1)}
											disabled={allDone}
											class="text-main/60 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-400/50 bg-200 text-sm font-bold transition hover:bg-400/30 active:scale-90 disabled:opacity-30"
											aria-label="Increase">+</button
										>
										<button
											onclick={() => markAllReady(dish.key, dish.totalQuantity)}
											class="flex-1 rounded-full px-2 py-1 text-xs font-semibold transition active:scale-95
												{allDone
												? 'bg-green-500/20 text-green-600'
												: 'bg-primary-300/20 text-primary-600 hover:bg-primary-300/40'}"
										>
											{allDone ? '✓ Ready' : 'Mark ready'}
										</button>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/if}
		</div>

		<!-- ── Bottom: completed orders ───────────────────────────────────────────── -->
		<section class="flex shrink-0 flex-col gap-2 border-t border-400/30 pt-3">
			<h2 class="text-main/30 px-1 text-xs font-semibold tracking-widest uppercase">
				Completed orders
			</h2>
			<div class="flex flex-row gap-3 overflow-x-auto pb-1">
				{#each orders.filter( (o) => o.items.every((i) => i.status === 'PickedUp') ) as order (order.id)}
					<OrderCard {order} class="shrink-0 opacity-40" />
				{:else}
					<p class="self-center text-xs italic text-main/30">No completed orders yet.</p>
				{/each}
			</div>
		</section>
	{:catch err}
		<p class="text-sm text-red-500">Failed to load orders: {err.message}</p>
	{/await}
</div>
