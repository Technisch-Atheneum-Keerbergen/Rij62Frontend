<!-- TablePicker.svelte -->
<script lang="ts">
	import { slide } from 'svelte/transition';

	const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

	type TableOption = { id: number; tableNumber: number };

	let { tableNumber = $bindable<number | null>(null) } = $props();

	let open = $state(false);
	let tables = $state<TableOption[]>([]);
	let loading = $state(false);

	let wrapper: HTMLDivElement | undefined;

	async function openPicker() {
		open = !open;

		if (!open || tables.length > 0) return;

		loading = true;

		try {
			const res = await fetch(`${BASE_URL}/tables`);
			tables = await res.json();
		} finally {
			loading = false;
		}
	}

	function select(n: number | null) {
		tableNumber = n;
		open = false;
	}

	function handleClickOutside(event: MouseEvent) {
		if (!open || !wrapper) return;

		if (!wrapper.contains(event.target as Node)) {
			open = false;
		}
	}

	$effect(() => {
		if (!open) return;

		document.addEventListener('click', handleClickOutside);

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<div bind:this={wrapper} class="relative mb-3 flex flex-col items-center">
	<button
		class="flex items-center gap-2 rounded-full border-2 border-300 bg-200 px-4 py-1.5 text-sm font-medium shadow-sm transition-all hover:border-primary-400 active:scale-95"
		onclick={(e) => {
			e.stopPropagation();
			openPicker();
		}}
	>
		{#if tableNumber !== null}
			<span class="text-base">🪑</span>
			<span>Table {tableNumber}</span>
		{:else}
			<span class="text-base">🥡</span>
			<span>Take-away</span>
		{/if}

		<span class="text-xs font-normal opacity-50">· Change</span>
	</button>

	{#if open}
		<div
			class="absolute top-full z-50 mt-3 w-[320px] rounded-2xl border-2 border-300 bg-200 p-4 shadow-xl"
			transition:slide={{ duration: 180 }}
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.key === 'Escape'}
			role="button"
			tabindex="0"
		>
			<p class="mb-3 text-center text-sm font-medium opacity-70">Where are you sitting?</p>

			<div class="flex flex-wrap justify-center gap-2">
				<button
					class="rounded-xl border-2 px-4 py-2 text-sm font-medium transition-all active:scale-95"
					class:border-primary-400={tableNumber === null}
					class:bg-primary-100={tableNumber === null}
					class:border-300={tableNumber !== null}
					onclick={() => select(null)}
				>
					🥡 Take-away
				</button>

				{#if loading}
					<span class="self-center text-sm opacity-50">Loading tables…</span>
				{:else}
					{#each tables as t}
						<button
							class="rounded-xl border-2 px-4 py-2 text-sm font-medium transition-all active:scale-95"
							class:border-primary-400={tableNumber === t.tableNumber}
							class:bg-primary-100={tableNumber === t.tableNumber}
							class:border-300={tableNumber !== t.tableNumber}
							onclick={() => select(t.tableNumber)}
						>
							{t.tableNumber}
						</button>
					{/each}
				{/if}
			</div>
		</div>
	{/if}
</div>
