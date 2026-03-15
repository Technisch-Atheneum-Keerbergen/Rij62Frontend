<script lang="ts">
	import { apiFetch } from '$lib/api/client';
	import { Language } from '$lib/api/types/multilangstring';
	import type { Category } from '$lib/api/types/category';
	import type { Product } from '$lib/api/types/product';
	import { Heading, Span } from 'flowbite-svelte';
	import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Badge } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	const currentLanguage = Language.English;


	//TODO: fetch real api once done
	function fetchCategories() : any {
		return [
			{ id: 0, screenId: 0, name: { English: 'Beverages', Dutch: 'Dranken' } },
			{ id: 1, screenId: 0, name: { English: 'Pastries', Dutch: 'Gebak' } }
		];
	}


	let products : Product[];
	let categories : Category[];
	onMount(async () => {
		products = await apiFetch("/product") as Product[];
		categories = fetchCategories()  as Category[];
	})
	
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

	<!-- Table Card -->
	<div class="overflow-hidden rounded-xl border bg-white shadow-lg">
		<Table hoverable striped class="w-full">
			<TableHead>
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
