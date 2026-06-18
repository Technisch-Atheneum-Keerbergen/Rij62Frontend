<script lang="ts">
	import { onMount } from 'svelte';
	import { apiFetch, apiToggle } from '$lib/api/client';
	import { Language } from '$lib/api/types/multilangstring';

	import type { Product } from '$lib/api/types/product';
	import type { Category } from '$lib/api/types/category';

	import { Heading, Span, Badge, P } from 'flowbite-svelte';

	let products: Product[] = [];
	let categories: Category[] = [];
	let search = '';
	const currentLanguage = Language.English;

	$: filteredProducts = products.filter(
		(p) =>
			p.title[currentLanguage].toLowerCase().includes(search.toLowerCase()) ||
			(categories.find((c) => c.id === p.categoryId)?.name[currentLanguage] ?? '')
				.toLowerCase()
				.includes(search.toLowerCase())
	);

	async function toggleProduct(id: number) {
		try {
			await apiToggle(id);
			products = (await apiFetch('/product')) as Product[];
		} catch {
			console.log(`[Rij62] Failed to toggle availability of product with id ${id}`);
		}
	}

	async function loadData() {
		products = (await apiFetch('/product')) as Product[];
		categories = (await apiFetch('/category')) as Category[];
	}

	onMount(loadData);
</script>

<div class="mx-auto max-w-7xl p-8">
	<!-- Heading Section -->
	<div class="mb-12 text-center">
		<Heading tag="h1" class="mb-4 text-3xl font-extrabold md:text-5xl lg:text-6xl">
			Take
			<Span class="text-highlight">Control</Span>
			of Your Products
		</Heading>
		<P>Toggle product availability instantly. Green means on sale — red means off the menu.</P>
	</div>

	<!-- Search + Legend -->
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
				bind:value={search}
				type="text"
				placeholder="Search products or categories…"
				class="w-full rounded-lg border border-gray-200 bg-white py-2 pr-4 pl-9 text-sm shadow-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
			/>
		</div>
		<div class="flex items-center gap-4 text-sm text-gray-500">
			<span class="flex items-center gap-2">
				<span class="inline-block h-3 w-3 rounded-full bg-green-400"></span> Available
			</span>
			<span class="flex items-center gap-2">
				<span class="inline-block h-3 w-3 rounded-full bg-red-400"></span> Unavailable
			</span>
			<span class="text-gray-400">Click to toggle</span>
		</div>
	</div>

	<!-- Table -->
	<div class="overflow-hidden rounded-xl border border-gray-200 shadow-sm dark:border-gray-700">
		<!-- Header -->
		<div
			class="grid grid-cols-[1fr_max-content] border-b border-gray-200 bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-gray-800"
		>
			<span class="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400"
				>Product</span
			>
			<span class="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400"
				>Category</span
			>
		</div>

		<!-- Rows -->
		<div class="divide-y divide-gray-100 dark:divide-gray-700">
			{#each filteredProducts as product (product.id)}
				<button
					type="button"
					onclick={() => toggleProduct(product.id)}
					class="grid w-full grid-cols-[1fr_max-content] items-center px-6 py-4 text-left transition-colors duration-150
						{product.isAvailable
						? 'bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30'
						: 'bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30'}"
				>
					<div class="flex items-center gap-3">
						<span
							class="h-2.5 w-2.5 flex-shrink-0 rounded-full {product.isAvailable
								? 'bg-green-500'
								: 'bg-red-400'}"
						></span>
						<span class="font-semibold text-gray-800 dark:text-gray-100">
							{product.title[currentLanguage]}
						</span>
					</div>
					<Badge color="blue" class="text-center">
						{categories.find((c) => c.id === product.categoryId)?.name[currentLanguage] ??
							'No category'}
					</Badge>
				</button>
			{/each}

			{#if filteredProducts.length === 0}
				<div class="px-6 py-12 text-center text-gray-400">
					{search ? `No products matching "${search}".` : 'No products found.'}
				</div>
			{/if}
		</div>
	</div>

	<!-- Summary -->
	{#if products.length > 0}
		<div class="mt-4 flex justify-end gap-6 text-sm text-gray-500">
			{#if search}
				<span>{filteredProducts.length} result{filteredProducts.length === 1 ? '' : 's'}</span>
				<span class="text-gray-300">·</span>
			{/if}
			<span>{products.filter((p) => p.isAvailable).length} available</span>
			<span>{products.filter((p) => !p.isAvailable).length} unavailable</span>
			<span class="font-medium text-gray-700 dark:text-gray-300">{products.length} total</span>
		</div>
	{/if}
</div>
