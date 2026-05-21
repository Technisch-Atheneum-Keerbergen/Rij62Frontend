<script lang="ts">
	import { slide } from 'svelte/transition';
	import type { OrderStatus } from '$lib/api/types/order';

	let {
		allPending,
		allInProgress,
		allReady,
		allPickedUp,
		onprimaryaction
	}: {
		allPending: boolean;
		allInProgress: boolean;
		allReady: boolean;
		allPickedUp: boolean;
		onprimaryaction?: (nextStatus: OrderStatus) => void;
	} = $props();

	type ActionConfig = {
		label: string;
		nextStatus: OrderStatus;
		style: string;
	};

	const ACTION: Record<OrderStatus, ActionConfig> = {
		Pending: {
			label: 'Accept order',
			nextStatus: 'InProgress',
			style:
				'rounded-2xl bg-amber-400/15 px-3 py-2 text-sm font-semibold text-amber-500 active:bg-amber-400/25 dark:bg-amber-500/20 dark:text-amber-300'
		},
		InProgress: {
			label: '↩ Reset to pending',
			nextStatus: 'Pending',
			style: 'px-3 py-1.5 text-right text-xs text-main/30 hover:text-main/60'
		},
		Ready: {
			label: 'Picked up',
			nextStatus: 'PickedUp',
			style:
				'rounded-2xl bg-green-400/15 px-3 py-2 text-sm font-semibold text-green-500 active:bg-green-400/25 dark:bg-green-500/20 dark:text-green-300'
		},
		PickedUp: {
			label: '↩ Undo pickup',
			nextStatus: 'Ready',
			style: 'px-3 py-1.5 text-right text-xs text-main/30 hover:text-main/60'
		}
	};

	function currentStatus(): OrderStatus | null {
		if (allPending) return 'Pending';
		if (allInProgress) return 'InProgress';
		if (allReady) return 'Ready';
		if (allPickedUp) return 'PickedUp';
		return null;
	}

	const active = $derived(currentStatus() ? ACTION[currentStatus()!] : null);
</script>

{#if active}
	<div transition:slide={{ duration: 150 }}>
		<button
			onclick={(e) => {
				e.stopPropagation();
				onprimaryaction?.(active.nextStatus);
			}}
			class="w-full transition-all active:scale-[0.97] {active.style}"
		>
			{active.label}
		</button>
	</div>
{/if}
