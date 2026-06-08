<script lang="ts">
	import { apiFetch, apiFetchJson } from '$lib/api/client';
	import { goto } from '$app/navigation';
	import { type Order, type OrderId, type OrderItem } from '$lib/api/types/order';
	import StatusBadge from '$lib/components/Badges/StatusBadge.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { pendingOrderStore } from '$lib/stores/pendingOrders';
	import { groupDuplicateOrderItemChoices } from '$lib/api/types/order';
	import SvgChevronRight from '$lib/components/SVG/SvgChevronRight.svelte';
	import { onDestroy } from 'svelte';

	const currentLanguage = import.meta.env.VITE_CURRENT_LANGUAGE as 'English' | 'Dutch';

	type PaymentStatus = 'NotPaid' | 'Success' | 'Failed';

	let pendingOrders: Order[] = [];

	async function getOrder(id: OrderId): Promise<Order | null> {
		try {
			const result = await apiFetchJson(`/order/${id}`);
			if (!result) return null;
			return result as Order;
		} catch (error) {
			return null;
		}
	}

	async function updatePendingOrders() {
		const results = await Promise.all($pendingOrderStore.map(getOrder));
		pendingOrders = results
			.filter((order): order is Order => order !== null)
			.sort((a, b) => b.createdTime - a.createdTime);
	}

	let updatePendingOrdersInterval = setInterval(updatePendingOrders, 5000);
	onDestroy(() => {
		clearInterval(updatePendingOrdersInterval);
	});

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
		NotPaid: 'Pay now',
		Success: '', // unused
		Failed: 'Retry payment'
	};

	const paymentGlow: Record<PaymentStatus, string> = {
		NotPaid: 'border-2 border-yellow-400/60 shadow-[0_0_18px_2px_rgba(250,204,21,0.25)]',
		Success: '',
		Failed: 'border-2 border-red-400/60 shadow-[0_0_18px_2px_rgba(248,113,113,0.25)]'
	};

	const paymentBannerStyle: Record<PaymentStatus, string> = {
		NotPaid:
			'bg-yellow-400/10 text-yellow-500 dark:bg-yellow-500/15 dark:text-yellow-300 stroke-yellow-500 dark:stroke-yellow-300',
		Success: '',
		Failed:
			'bg-red-400/10 text-red-500 dark:bg-red-500/15 dark:text-red-300 stroke-red-500 dark:stroke-red-300'
	};

	// Derive the aggregate status for a group of identical items
	function groupStatus(items: OrderItem[]) {
		if (items.every((i) => i.status === 'PickedUp')) return 'PickedUp';
		if (items.every((i) => i.status === 'Ready' || i.status === 'PickedUp')) return 'Ready';
		if (items.some((i) => i.status === 'InProgress')) return 'InProgress';
		return items[0].status;
	}
</script>

<section class="mx-auto max-w-2xl px-1 py-2">
	{#await updatePendingOrders()}
		<div class="flex flex-col items-center gap-4 text-center">
			<Spinner size="lg" />
			<p class="text-surface-500 text-sm">Loading orders...</p>
		</div>
	{:then}
		<h1 class="mb-2 text-center text-2xl font-semibold">
			{pendingOrders.length > 0 ? 'Your orders' : 'No orders made'}
		</h1>

		{#if pendingOrders.length === 0}
			<p class="text-center">
				Make an order <a class="font-bold text-primary-500 underline" href="/">here</a>
			</p>
		{/if}

		<div class="flex flex-col gap-4">
			{#each pendingOrders as order}
				{@const groups = groupItems(order.items)}
				{@const paymentStatus = (order.paymentStatus ?? 'NotPaid') as PaymentStatus}

				<div
					class="flex flex-col gap-3 overflow-hidden rounded-3xl border-300 bg-100 p-3 shadow-sm transition-shadow
            {paymentGlow[paymentStatus]}"
				>
					<!-- Order header -->
					<div class="flex items-center justify-between gap-3 px-1">
						<div class="flex flex-col gap-0.5">
							{#if order.pickupTime}
								<div class="flex items-center gap-1.5">
									<span class="text-main text-lg font-bold">
										Pickup {formatTime(order.pickupTime)}
									</span>
								</div>
							{/if}
							<span class="text-main/40 text-xs">
								Placed {formatTime(order.createdTime)} · {formatDate(order.createdTime)}
							</span>
						</div>

						<div class="flex flex-row items-center gap-1.5">
							<span
								class="h-7 w-fit min-w-7 rounded-full border border-300 bg-200 px-1.5 text-center text-lg font-semibold"
							>
								#{order.orderNumber}
							</span>
						</div>
					</div>
					{#if order.comment != null && order.comment.trim() != ''}
						<span
							class="w-full truncate overflow-hidden rounded-2xl border border-200 bg-50 px-2 py-1 text-sm text-wrap wrap-anywhere opacity-70"
						>
							{order.comment}
						</span>
					{/if}
					<!-- Payment problem banner — only shown when action needed -->
					{#if paymentStatus !== 'Success'}
						<button
							onclick={() => goto(`/orders/${order.id}`)}
							class="flex w-full cursor-pointer items-center justify-between
                   rounded-2xl py-2 pr-1 pl-3 font-semibold transition-all active:scale-[0.98]
                   {paymentBannerStyle[paymentStatus]}"
						>
							<span>
								{paymentStatus === 'Failed' ? 'Payment failed' : 'Payment pending'}
							</span>
							<span class="flex items-center gap-1 underline">
								{paymentLabel[paymentStatus]}
								<span class="aspect-square h-6">
									<SvgChevronRight />
								</span>
							</span>
						</button>
					{/if}

					<!-- Divider -->
					<div class="mx-1 h-px bg-300"></div>

					<!-- Items ... (unchanged) -->
					<ul class="flex flex-col gap-2">
						{#each groups as group}
							{@const representative = group[0]}
							{@const count = group.length}
							{@const status = groupStatus(group)}

							<li class="flex items-center gap-3 rounded-[1.25rem] border border-300 bg-200 p-2">
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
										<p class="text-main/40 text-xs">
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
