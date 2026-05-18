<script lang="ts">
	import { apiFetch } from '$lib/api/client';
	import type { Order } from '$lib/api/types/order';
	async function getAllOrders() {
		return (await apiFetch('/orders')) as Order[];
	}
</script>

{#await getAllOrders()}
	Loading...
{:then orders}
	{console.log(orders)}
{/await}
