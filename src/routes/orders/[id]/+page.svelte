<script lang="ts">
	import type { OrderId } from '$lib/api/types/order';
	import { page } from '$app/state';

	const orderId: OrderId = page.params.id as OrderId;
	console.log(orderId);
</script>
