<script lang="ts">
	import { apiFetch } from '$lib/api/client';
	import { type Order, type OrderId } from '$lib/api/types/order';
	import StatusBadge from '$lib/components/Badges/StatusBadge.svelte';
	import { pendingOrderStore } from '$lib/stores/pendingOrders';

	const currentLanguage = import.meta.env.VITE_CURRENT_LANGUAGE as 'English' | 'Dutch';

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
</script>

<section class="mx-auto max-w-2xl">
	{#await updatePendingOrders()}
		<p class="text-center">Loading...</p>
	{:then}
		<h1 class="m-2 text-center text-2xl font-semibold">
			{#if pendingOrders.length > 0}
				Your orders
			{:else}
				No orders made
			{/if}
		</h1>

		{#if pendingOrders.length === 0}
			<p class="text-center">
				Make a new order <a class="font-bold text-primary-500 underline" href="/">here</a>
			</p>
		{/if}

		{#each pendingOrders as order}
			{@const date = new Date(order.createdTime * 1000)}
			<div class="mb-1 p-2">
				<h2 class="mb-1 flex items-baseline justify-end text-lg font-bold">
					Order {date.getHours()}:{String(date.getMinutes()).padStart(2, '0')}
					<span class="ml-auto h-fit text-sm font-light opacity-100">
						{date.getDate()}/{date.getMonth() + 1}
					</span>
				</h2>

				<ul class="flex flex-col gap-2">
					{#each order.items as item (item.id)}
						<li
							class="flex items-center justify-between rounded-2xl border-2 border-300 bg-200 p-2 shadow-sm"
						>
							<div class="relative flex grow items-center gap-3">
								<img
									src={item.product.imgUrl}
									alt={item.product.title[currentLanguage]}
									class="h-12 w-12 rounded-lg object-cover"
								/>
								<span
									class="inset-shadow-lg absolute left-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-xl text-light shadow-md backdrop-blur-[1px]"
								>
									{item.quantity}
								</span>
								<div>
									<p class="font-medium">{item.product.title[currentLanguage]}</p>
									{#if item.choices.length > 0}
										<p class="text-muted text-xs opacity-80">
											{item.choices.map((c) => c.product.title[currentLanguage]).join(', ')}
										</p>
									{/if}
								</div>

								<div class="ml-auto">
									<StatusBadge size="md" status={item.status} />
								</div>
							</div>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	{/await}
</section>
