<script lang="ts">
	import { apiDelete, apiFetch, apiToggle } from '$lib/api/client';
	import { Language } from '$lib/api/types/multilangstring';
	import type { Category } from '$lib/api/types/category';
	import type { Product } from '$lib/api/types/product';

	import { slide } from 'svelte/transition';
	import { onMount } from 'svelte';
	import {
		DeleteRowOutline,
		RefreshOutline,
		PlusOutline,
		ExclamationCircleOutline
	} from 'flowbite-svelte-icons';
	import {
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Badge,
		Checkbox,
		ButtonGroup,
		Button,
		Heading,
		Span,
		Modal,
		P
	} from 'flowbite-svelte';
	import { goto } from '$app/navigation';

	const currentLanguage = Language.English;

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Delete' && selectedIds.size > 0) {
			popupModal = true;
		}
		if (e.key === 'Escape') {
			popupModal = false;
		}
		if (e.key == 'Enter') {
			toggleSelected();
		}
	}

	const deleteSelected = async () => {
		if (!selectedIds) return;

		try {
			for (const id of selectedIds) {
				await apiDelete(`/product/${id}`);
			}
			products = products.filter((p) => !selectedIds.has(p.id));
			selectedIds = new Set();
			console.log('[Rij62] Products removed successfully!');
		} catch (err: any) {
			console.log(`[Rij62] Failed to delete product: ${err.message}`);
		}
	};

	async function toggleSelected() {
		if (!selectedIds || selectedIds.size === 0) return;

		const presetLocked = [...selectedIds].filter(
			(id) => !products.find((p) => p.id === id)?.enabledByPreset
		);

		if (presetLocked.length > 0) {
			lockedModal = true;
			return;
		}

		try {
			for (const id of selectedIds) {
				const updated = await apiToggle(id);
				if (!updated) continue;
				products = products.map((p) => (p.id === id ? updated : p)).filter(Boolean);
			}
			products = (await apiFetch('/product')) as Product[];
		} catch (err: any) {
			console.log(`[Rij62] Failed to toggle availability: ${err.message}`);
		}
	}

	let searchTerm = $state('');
	let filteredProducts = $derived.by(() =>
		products.filter(
			(product) =>
				!searchTerm ||
				product.title[currentLanguage].toLowerCase().includes(searchTerm.toLowerCase())
		)
	);

	let popupModal = $state(false);
	let lockedModal = $state(false);

	let selectedIds = $state(new Set<number>());
	let lastClickedId: number | null = $state(null);

	function handleCheckboxClick(e: MouseEvent, productId: number) {
		e.stopPropagation();

		let newSet = new Set(selectedIds);

		if (e.shiftKey && lastClickedId !== null) {
			const start = products.findIndex((p) => p.id === lastClickedId);
			const end = products.findIndex((p) => p.id === productId);
			const [from, to] = [Math.min(start, end), Math.max(start, end)];
			for (let i = from; i <= to; i++) {
				newSet.add(products[i].id);
			}
		} else {
			if (newSet.has(productId)) {
				newSet.delete(productId);
			} else {
				newSet.add(productId);
			}
		}

		selectedIds = newSet;
		lastClickedId = productId;
	}

	function handleRowClick(e: MouseEvent, productId: number) {
		e.stopPropagation();

		let newSet = new Set(selectedIds);

		if (e.shiftKey && lastClickedId !== null) {
			const start = products.findIndex((p) => p.id === lastClickedId);
			const end = products.findIndex((p) => p.id === productId);
			const [from, to] = [Math.min(start, end), Math.max(start, end)];
			for (let i = from; i <= to; i++) {
				newSet.add(products[i].id);
			}
		} else if (e.ctrlKey) {
			if (newSet.has(productId)) {
				newSet.delete(productId);
			} else {
				newSet.add(productId);
			}
		} else {
			goto(`/admin/productControl/${productId}`);
		}

		selectedIds = newSet;
		lastClickedId = productId;
	}

	let products: Product[] = $state([]);
	let categories: Category[] = $state([]);

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		loadData();
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});

	async function loadData() {
		products = (await apiFetch('/product')) as Product[];
		categories = (await apiFetch('/category')) as Category[];
	}
</script>

<div class="mx-auto max-w-7xl p-8">
	<!-- Heading -->
	<div class="mb-12 text-center">
		<Heading tag="h1" class="mb-4 text-3xl font-extrabold md:text-5xl lg:text-6xl">
			Take
			<Span class="text-highlight">Control</Span>
			of Your Products
		</Heading>
	</div>
	<!-- Search + Actions -->
	<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="relative w-full sm:max-w-xs">
			<svg
				class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
				/>
			</svg>
			<input
				bind:value={searchTerm}
				type="text"
				placeholder="Search products…"
				class="w-full rounded-lg border border-gray-200 bg-white py-2 pr-4 pl-9 text-sm shadow-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
			/>
		</div>

		<ButtonGroup>
			<Button color="primary" onclick={() => toggleSelected()}>
				<RefreshOutline class="me-2 h-4 w-4" />
				Toggle Activation
			</Button>
			<Button color="primary" onclick={() => (popupModal = true)}>
				<DeleteRowOutline class="me-2 h-4 w-4" />
				Delete
			</Button>
			<Button color="primary" href="/admin/productControl/new">
				<PlusOutline class="me-2 h-4 w-4" />
				Add Product
			</Button>
		</ButtonGroup>
	</div>

	<!-- Table -->
	<div class="border-main overflow-hidden rounded-xl border shadow-lg select-none">
		<Table striped class="w-full">
			<TableHead>
				<TableHeadCell></TableHeadCell>
				<TableHeadCell class="text-left">Product</TableHeadCell>
				<TableHeadCell>Category</TableHeadCell>
				<TableHeadCell>Status</TableHeadCell>
				<TableHeadCell class="text-right">Price</TableHeadCell>
			</TableHead>

			<TableBody>
				{#each filteredProducts as product}
					<TableBodyRow
						class="cursor-pointer border-0 transition hover:bg-400"
						onclick={(e) => handleRowClick(e, product.id)}
					>
						<TableBodyCell class="w-10 p-2!">
							<Checkbox
								checked={selectedIds.has(product.id)}
								onclick={(e) => handleCheckboxClick(e, product.id)}
							/>
						</TableBodyCell>

						<TableBodyCell class="font-semibold">
							{product.title[currentLanguage]}
						</TableBodyCell>

						<TableBodyCell>
							{#if categories.length}
								{@const category = categories.find((c) => c.id === product.categoryId)}
								{#if category}
									<Badge color="blue">{category.name[currentLanguage]}</Badge>
								{/if}
							{/if}
						</TableBodyCell>

						<TableBodyCell>
							{#if !product.enabledByPreset}
								<Badge color="yellow">In preset</Badge>
							{:else if product.isAvailable}
								<Badge color="green">Available</Badge>
							{:else}
								<Badge color="red">Unavailable</Badge>
							{/if}
						</TableBodyCell>

						<TableBodyCell class="text-right font-medium">
							€{product.price.toFixed(2)}
						</TableBodyCell>
					</TableBodyRow>
				{/each}

				{#if filteredProducts.length === 0}
					<TableBodyRow>
						<TableBodyCell colspan={5} class="py-12 text-center text-gray-400">
							{searchTerm ? `No products matching "${searchTerm}".` : 'No products found.'}
						</TableBodyCell>
					</TableBodyRow>
				{/if}
			</TableBody>
		</Table>
	</div>

	<!-- Summary -->
	{#if products.length > 0}
		<div class="mt-4 flex justify-end gap-6 text-sm text-gray-500">
			{#if searchTerm}
				<span>{filteredProducts.length} result{filteredProducts.length === 1 ? '' : 's'}</span>
				<span class="text-gray-300">·</span>
			{/if}
			{#if selectedIds.size > 0}
				<span class="font-medium text-primary-600">{selectedIds.size} selected</span>
				<span class="text-gray-300">·</span>
			{/if}
			<span>{products.filter((p) => p.isAvailable).length} available</span>
			<span>{products.filter((p) => !p.isAvailable).length} unavailable</span>
			<span class="font-medium text-gray-700 dark:text-gray-300">{products.length} total</span>
		</div>
	{/if}
</div>

<Modal form bind:open={popupModal} size="xs" transition={slide} permanent>
	<div class="text-center">
		<ExclamationCircleOutline class="text-muted mx-auto mb-4 h-12 w-12" />
		<h3 class="text-main mb-5 text-lg font-normal">
			Are you sure you want to delete this product?
		</h3>
		<div class="flex justify-center gap-3">
			<Button
				type="button"
				color="primary"
				onclick={() => {
					deleteSelected();
					popupModal = false;
				}}
			>
				Yes, delete
			</Button>
			<Button type="button" variant="ghost" onclick={() => (popupModal = false)}>Cancel</Button>
		</div>
	</div>
</Modal>

<Modal form bind:open={lockedModal} size="xs" transition={slide} permanent>
	<div class="text-center">
		<ExclamationCircleOutline class="text-muted mx-auto mb-4 h-12 w-12" />
		<h3 class="text-main mb-5 text-lg font-normal">
			This item is currently in a preset. Unable to toggle activation.
		</h3>
		<div class="flex justify-center gap-3">
			<Button type="button" color="primary" onclick={() => (lockedModal = false)}>Okay</Button>
		</div>
	</div>
</Modal>
