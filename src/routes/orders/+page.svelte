<script lang="ts">
	import { apiFetch } from '$lib/api/client';
	import { goto } from '$app/navigation';
	import { type Order, type OrderId, type OrderItem } from '$lib/api/types/order';
	import StatusBadge from '$lib/components/Badges/StatusBadge.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { pendingOrderStore } from '$lib/stores/pendingOrders';
	import { groupDuplicateOrderItemChoices } from '$lib/api/types/order';

	const currentLanguage = import.meta.env.VITE_CURRENT_LANGUAGE as 'English' | 'Dutch';

	type PaymentStatus = 'NotPaid' | 'Success' | 'Failed';

	let pendingOrders: Order[] = [];

	async function getOrder(id: OrderId): Promise<Order | null> {
		const result = await apiFetch(`/order/${id}`);
		if (!result) return null;
		return result as unknown as Order;
	}

	async function updatePendingOrders() {
		const results = await Promise.all($pendingOrderStore.map(getOrder));
		pendingOrders = results
			.filter((order): order is Order => order !== null)
			.sort((a, b) => b.createdTime - a.createdTime);
	}

	setInterval(updatePendingOrders, 5000);

	function formatTime(unix: number) {
		return new Date(unix * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	function formatDate(unix: number) {
		const d = new Date(unix * 1000);
		return `${d.getDate()}/${d.getMonth() + 1}`;
	}

	// Group identical items (same product + same choices) together
	function groupKey(item: OrderItem): string {
		const base = item.product.title[currentLanguage];

		const groupedChoices = groupDuplicateOrderItemChoices(item.choices ?? []);

		const extras = groupedChoices
			.map((choice) => {
				const original = (item.choices ?? []).find((c) => c.product.productId === choice.id);

				if (!original) return '';

				const title = original.product.title[currentLanguage];

				return choice.quantity > 1 ? `${title}x${choice.quantity}` : title;
			})
			.filter(Boolean)
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

	const paymentLabel: Record<PaymentStatus, string> = {
		NotPaid: 'Not paid',
		Success: 'Paid',
		Failed: 'Payment failed'
	};

	const paymentStyle: Record<PaymentStatus, string> = {
		NotPaid: 'bg-amber-400/15 text-amber-500 dark:bg-amber-500/20 dark:text-amber-300',
		Success: 'bg-green-400/15 text-green-600 dark:bg-green-500/20 dark:text-green-300',
		Failed: 'bg-red-400/15 text-red-500 dark:bg-red-500/20 dark:text-red-300'
	};

	// Derive the aggregate status for a group of identical items
	function groupStatus(items: OrderItem[]) {
		if (items.every((i) => i.status === 'PickedUp')) return 'PickedUp';
		if (items.every((i) => i.status === 'Ready' || i.status === 'PickedUp')) return 'Ready';
		if (items.some((i) => i.status === 'InProgress')) return 'InProgress';
		return items[0].status;
	}
</script>

<section class="mx-auto max-w-2xl px-1 py-3">
	{#await updatePendingOrders()}
		<div class="flex flex-col items-center gap-4 text-center">
			<Spinner size="lg" />
			<p class="text-surface-500 text-sm">Loading orders...</p>
		</div>
	{:then}
		<h1 class="mb-6 text-center text-2xl font-semibold">
			{pendingOrders.length > 0 ? 'Your orders' : 'No orders made'}
		</h1>

		{#if pendingOrders.length === 0}
			<p class="text-center">
				Make a new order <a class="font-bold text-primary-500 underline" href="/">here</a>
			</p>
		{/if}

		<div class="flex flex-col gap-4">
			{#each pendingOrders as order}
				{@const groups = groupItems(order.items)}
				{@const paymentStatus = (order.paymentStatus ?? 'NotPaid') as PaymentStatus}

				<div class="overflow-hidden rounded-3xl border-300 bg-200 shadow-sm">
					<!-- Order header -->
					<div class="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
						<div class="flex flex-col gap-0.5">
							<!-- Pickup time prominent -->
							{#if order.pickupTime}
								<div class="flex items-center gap-1.5">
									<span class="text-main text-lg font-bold">
										Pickup {formatTime(order.pickupTime)}
									</span>
								</div>
							{/if}
							<!-- Placed time subtle -->
							<span class="text-main/40 text-xs">
								Placed {formatTime(order.createdTime)} · {formatDate(order.createdTime)}
							</span>
						</div>

						<!-- Payment badge — tappable, goes to payment page -->
						<button
							onclick={() => goto(`/orders/${order.id}`)}
							class="shrink-0 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all active:scale-95 {paymentStyle[
								paymentStatus
							]}"
						>
							{paymentLabel[paymentStatus]}
						</button>
					</div>

					<!-- Divider -->
					<div class="mx-4 h-px bg-300"></div>

					<!-- Items -->
					<ul class="flex flex-col gap-2 p-3">
						{#each groups as group}
							{@const representative = group[0]}
							{@const count = group.length}
							{@const status = groupStatus(group)}

							<li class="flex items-center gap-3 rounded-2xl border border-300 bg-100 p-2">
								<div class="relative flex items-center gap-3">
									<img
										src={representative.product.imgUrl}
										alt={representative.product.title[currentLanguage]}
										class="h-12 w-12 shrink-0 rounded-xl object-cover"
									/>
									<span
										class="inset-shadow-lg absolute left-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-xl text-light shadow-md backdrop-blur-[1px]"
									>
										{count}
									</span>
								</div>

								<div class="min-w-0 flex-1">
									<p class="text-main truncate font-medium">
										{representative.product.title[currentLanguage]}
									</p>
									{#if representative.choices?.length > 0}
										<p class="text-main/40 truncate text-xs">
											{groupDuplicateOrderItemChoices(representative.choices)
												.map((choice) => {
													const original = representative.choices.find(
														(c) => c.product.productId === choice.id
													);

													if (!original) return '';

													const title = original.product.title[currentLanguage];

													return choice.quantity > 1 ? `${title} x${choice.quantity}` : title;
												})
												.filter(Boolean)
												.join(', ')}
										</p>
									{/if}
								</div>

								<StatusBadge size="md" {status} />
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	{/await}
</section>
