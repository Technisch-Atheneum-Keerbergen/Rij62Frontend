<script lang="ts">
	import { apiFetch } from '$lib/api/client';
	import type { Order, OrderId } from '$lib/api/types/order';
	import { pendingOrderStore } from '$lib/stores/pendingOrders';
	const currentLanguage = import.meta.env.VITE_CURRENT_LANGUAGE as 'English' | 'Dutch';

	let pendingOrders: Order[] = [];

	async function initPendingOrders() {
		pendingOrders = await Promise.all(
			$pendingOrderStore.map((orderId: OrderId) => getOrder(orderId))
		);
	}

	initPendingOrders();

	async function getOrder(id: OrderId) {
		return (await apiFetch(`/order/${id}`)) as unknown as Order;
	}

	pendingOrders = pendingOrders.sort((a, b) => {
		return a.createdTime - b.createdTime;
	});
</script>

{#each pendingOrders as order}
	{#each order.items as orderItem}
		<li
			class="flex items-center justify-between rounded-2xl border-2 border-300 bg-200 p-2 shadow-sm"
		>
			<div class="flex items-center gap-3">
				<img
					src={orderItem.imgURL}
					alt={orderItem.title[currentLanguage]}
					class="h-12 w-12 rounded-lg object-cover"
				/>
				<div>
					<p class="font-medium">{orderItem.title[currentLanguage]}</p>
					{#if orderItem.choices.length > 0}
						<p class="text-muted text-xs opacity-80">
							{orderItem.choices
								.map((choice) => {
									return choice;
								})
								.join(', ')}
						</p>
					{/if}
				</div>
			</div>
		</li>
	{/each}
{/each}
