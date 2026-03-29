<script lang="ts">
	import OrderStatus from './../../lib/components/Misc/OrderStatus.svelte';
	import { apiFetch } from '$lib/api/client';
	import { pendingOrderStore, type Order, type OrderItemStatus } from '$lib/stores/pendingOrders';

	import { get } from 'svelte/store';

	const orders = get(pendingOrderStore);

	let orderStatuses: OrderItemStatus[][] = $state([]);

	async function getOrderStatuses(id: Order['id']) {
		let response = (await apiFetch(`/order/${id}/status`)) as OrderItemStatus[];

		return response;
	}

	async function updateOrderStatuses() {
		orderStatuses = await Promise.all(
			orders.map(async (order) => {
				let orderStatus = await getOrderStatuses(order.id);
				return orderStatus;
			})
		);
		console.log(orderStatuses);
	}
	updateOrderStatuses();
	setTimeout(updateOrderStatuses, 2000);
</script>

{#each orderStatuses as orderItemStatuses}
	{#each orderItemStatuses as orderItemStatus}
		<h1>{orderItemStatus.orderItemId}</h1>
		<h2>{orderItemStatus.status}</h2>
	{/each}
	<hr />
{/each}
