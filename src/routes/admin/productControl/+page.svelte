<script lang="ts">
	import { apiFetch } from '$lib/api/client';
	import { Language } from '$lib/api/types/multilangstring';
	import type { Category } from '$lib/api/types/category';
	import type { Product } from '$lib/api/types/product';

	import { onMount } from 'svelte';
	import { DeleteRowOutline, RefreshOutline } from 'flowbite-svelte-icons';
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
		Span
	} from 'flowbite-svelte';

	const currentLanguage = Language.English;

	//TODO: fetch real api once done
	function fetchCategories(): any {
		return [
			{ id: 0, screenId: 0, name: { English: 'Beverages', Dutch: 'Dranken' } },
			{ id: 1, screenId: 0, name: { English: 'Pastries', Dutch: 'Gebak' } }
		];
	}
	// Checkbox Logic
	let selectedIds = $state(new Set());
	let lastClickedId = $state(null);

	function toggle(id) {
		const newSet = new Set(selectedIds);

		if (newSet.has(id)) {
			newSet.delete(id);
		} else {
			newSet.add(id);
		}

		selectedIds = newSet;
	}

	function handleCheckboxClick(e, productId) {
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

		console.log('End of handleCheckboxClick():');
		console.log('selectedIds: ', selectedIds);
		console.log('lastClickedId: ', lastClickedId);
	}

	let products: Product[];
	let categories: Category[];
	onMount(async () => {
		products = (await apiFetch('/product')) as Product[];
		categories = fetchCategories() as Category[];
	});
</script>

<div class="mx-auto max-w-7xl p-8">
	<!-- Heading -->
	<div class="mb-12 text-center">
		<Heading tag="h1" class="mb-4 text-3xl font-extrabold md:text-5xl lg:text-6xl">
			Take
			<Span gradient="tealToLime">Control</Span>
			of Your Products
		</Heading>
	</div>

	<!-- Product Edit Menu -->
	<div class="flex justify-center p-3">
		<ButtonGroup>
			<Button color="rose"><RefreshOutline class="me-2 h-4 w-4" />Toggle Activation</Button>
			<Button color="rose"><DeleteRowOutline class="me-2 h-4 w-4" />Delete</Button>
		</ButtonGroup>
	</div>

	<!-- Table Card -->
	<div class="overflow-hidden rounded-xl border bg-white shadow-lg">
		<Table hoverable striped class="w-full">
			<TableHead>
				<TableHeadCell class="text-left">Checkbox</TableHeadCell>
				<TableHeadCell class="text-left">Product</TableHeadCell>
				<TableHeadCell>Category</TableHeadCell>
				<TableHeadCell>Status</TableHeadCell>
				<TableHeadCell class="text-right">Price</TableHeadCell>
			</TableHead>

			<TableBody>
				{#each products as product}
					<TableBodyRow
						class="cursor-pointer transition hover:bg-gray-100"
						onclick={() => (window.location.href = `/admin/productControl/${product.id}`)}
					>
						<!-- Checkbox -->
						<TableBodyCell class="p-4!">
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
							{#if categories[product.categoryId]}
								<Badge color="blue">
									{categories[product.categoryId].name[currentLanguage]}
								</Badge>
							{/if}
						</TableBodyCell>

						<!-- Availability -->
						<TableBodyCell>
							{#if product.isAvailible}
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
		</Table>
	</div>
</div>
