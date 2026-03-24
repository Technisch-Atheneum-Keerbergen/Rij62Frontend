<script lang="ts">
	import { apiDelete, apiFetch, apiToggle, apiUpload, getImageUrl } from '$lib/api/client';
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
		TableSearch
	} from 'flowbite-svelte';

	const currentLanguage = Language.English;

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Delete' && selectedIds.size > 0) {
			popupModal = true;
		}
		if (e.key === 'Escape') {
			popupModal = false;
		}
	}

	const deleteSelected = async () => {
		if (!selectedIds) return;

		try {
			for (const id of selectedIds) {
				await apiDelete(`/product/${id}`);
			}
			// remove deleted products from UI
			products = products.filter((p) => !selectedIds.has(p.id));

			// clear selection
			selectedIds = new Set();
			console.log('[Rij62] Products removed successfully!');
		} catch (err: any) {
			console.log(`[Rij62] Failed to delete product: ${err.message}`);
		}
	};

	async function toggleSelected() {
		if (!selectedIds || selectedIds.size === 0) return;

		try {
			for (const id of selectedIds) {
				const updated = await apiToggle(id);
				if (!updated) continue; // skip null updates

				products = products.map((p) => (p.id === id ? updated : p)).filter(Boolean); // removes nulls if any
			}
			try {
				products = (await apiFetch('/product')) as Product[];
				console.log('[Rij62] Products refreshed');
			} catch (err: any) {
				console.error('[Rij62] Failed to refresh products:', err.message);
			}
		} catch (err: any) {
			console.log(`[Rij62] Failed to toggle availability: ${err.message}`);
		}
	}

	//Search in Table
	let searchTerm = $state('');
	let filteredProducts = $derived.by(() =>
		products.filter(
			(product) =>
				!searchTerm ||
				product.title[currentLanguage].toLowerCase().includes(searchTerm.toLowerCase())
		)
	);

	//for popup
	let popupModal = $state(false);

	//Checkbox Logic
	let selectedIds = $state(new Set<number>());
	let lastClickedId: number | null = $state(null);

	function toggle(id: number) {
		const newSet = new Set(selectedIds);

		if (newSet.has(id)) {
			newSet.delete(id);
		} else {
			newSet.add(id);
		}

		selectedIds = newSet;
	}

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

		console.log('[Rij62] End of handleCheckboxClick():');
		console.log('[Rij62] selectedIds: ', selectedIds);
		console.log('[Rij62] lastClickedId: ', lastClickedId);
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
			window.location.href = `/admin/productControl/${productId}`;
		}

		selectedIds = newSet;
		lastClickedId = productId;

		console.log('[Rij62] End of handleCheckboxClick():');
		console.log('[Rij62] selectedIds: ', selectedIds);
		console.log('[Rij62] lastClickedId: ', lastClickedId);
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

	<!-- Product Edit Menu -->
	<div class="flex justify-center p-3">
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
				<PlusOutline class="h-6 w-6 shrink-0" />
				Add Product
			</Button>
		</ButtonGroup>
	</div>

	<!-- Table Card -->
	<div class="border-main overflow-hidden rounded-xl border shadow-lg select-none">
		<Table striped class="w-full">
			<TableSearch placeholder="Search by title" bind:inputValue={searchTerm}>
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
							class="cursor-pointer transition hover:bg-400"
							onclick={(e) => handleRowClick(e, product.id)}
						>
							<!-- Checkbox -->
							<TableBodyCell class="w-10 p-2!">
								<Checkbox
									checked={selectedIds.has(product.id)}
									onclick={(e) => handleCheckboxClick(e, product.id)}
								/>
							</TableBodyCell>

							<!-- Name -->
							<TableBodyCell class="font-semibold">
								{product.title[currentLanguage]}
							</TableBodyCell>

							<!-- Category -->
							<TableBodyCell>
								{#if categories.length}
									{@const category = categories.find((c) => c.id === product.categoryId)}
									{#if category}
										<Badge color="blue">
											{category.name[currentLanguage]}
										</Badge>
									{/if}
								{/if}
							</TableBodyCell>

							<!-- Availability (unchanged colors as requested) -->
							<TableBodyCell>
								{#if product.isAvailable}
									<Badge color="green">Available</Badge>
								{:else}
									<Badge color="red">Unavailable</Badge>
								{/if}
							</TableBodyCell>

							<!-- Price -->
							<TableBodyCell class="text-right font-medium">
								€{product.price.toFixed(2)}
							</TableBodyCell>
						</TableBodyRow>
					{/each}
				</TableBody>
			</TableSearch>
		</Table>
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

				<Button type="button" color="ghost" onclick={() => (popupModal = false)}>Cancel</Button>
			</div>
		</div>
	</Modal>
</div>
