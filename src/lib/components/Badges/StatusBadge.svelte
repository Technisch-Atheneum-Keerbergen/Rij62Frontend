<script lang="ts">
	import type { OrderStatus } from '$lib/api/types/order';

	type Size = 'sm' | 'md' | 'lg';

	const statusNames: Record<OrderStatus, string> = {
		Pending: 'Pending...',
		InProgress: 'Being made...',
		Ready: 'Ready',
		PickedUp: 'Picked up'
	};

	const statusColors: Record<OrderStatus, string> = {
		Pending: 'bg-yellow-400/15 text-yellow-600 dark:text-yellow-400',
		InProgress: 'bg-primary-400/15 text-primary-600 dark:text-primary-400',
		Ready: 'bg-green-400/15 text-green-600 dark:text-green-400',
		PickedUp: 'bg-gray-400/15 text-gray-400 dark:text-gray-200'
	};

	const sizeStyle: Record<Size, string> = {
		sm: 'text-xs px-1.5 py-0.5',
		md: 'text-sm px-3 py-0.5',
		lg: 'text-lg px-3.5 py-1'
	};

	let {
		status,
		size = 'sm'
	}: {
		status: OrderStatus;
		size?: Size;
	} = $props();

	const classes = $derived(
		`pointer-events-none shrink-0 rounded-full font-medium ${statusColors[status]} ${sizeStyle[size]}`
	);
</script>

<span class={classes}>
	{statusNames[status]}
</span>
