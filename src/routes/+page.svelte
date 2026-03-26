<script lang="ts">
	import { basketCount } from './../lib/stores/basket.ts';
	import { basket } from '$lib/stores/basket';
	import type { Category } from '$lib/api/types/category';
	import type { Product } from '$lib/api/types/product';
	import { apiFetch } from '$lib/api/client';
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Cards/Card.svelte';
	import FilterItem from '$lib/components/Badges/FilterItem.svelte';
	import { onMount } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';
	import SvgBasket from '$lib/components/SVG/SvgBasket.svelte';
	import { mockProducts } from './mockProducts.ts';
	import StepGroup from '$lib/components/Misc/StepGroup.svelte';
	import { createStepStates } from '$lib/stores/stepState.svelte';

	/* ---------------- CONFIG ---------------- */

	const isServerRunning = import.meta.env.VITE_SERVER_RUNNING === 'true';
	const currentLanguage = import.meta.env.VITE_CURRENT_LANGUAGE as 'English' | 'Dutch';

	/* ---------------- MOCK DATA ---------------- */

	const mockCategories: Category[] = [
		{ id: 0, name: { English: 'Food', Dutch: 'Eten' }, screenId: 1 },
		{ id: 1, name: { English: 'Snacks', Dutch: 'Snacks' }, screenId: 1 },
		{ id: 2, name: { English: 'Drinks', Dutch: 'Dranken' }, screenId: 1 }
	];

	/* ---------------- FETCHING ---------------- */

	async function fetchProducts(): Promise<Product[]> {
		return isServerRunning ? apiFetch('/product') : mockProducts;
	}

	async function fetchCategories(): Promise<Category[]> {
		return isServerRunning ? apiFetch('/category') : mockCategories;
	}

	/* ---------------- STATE ---------------- */

	let productsPromise = $state<Promise<Product[]>>(new Promise(() => {}));
	let categoriesPromise = $state<Promise<Category[]>>(new Promise(() => {}));

	let allProducts = $state<Product[]>([]);
	let selectedCategories = $state(new Set<number>());

	let selectedProduct = $state<Product | null>(null);
	let isSheetOpen = $state(false);
	let itemIsInBasket = $state(false);

	let stepStates = $state<ReturnType<typeof createStepStates>>([]);

	/* ---------------- DERIVED ---------------- */

	const filteredProducts = $derived(
		allProducts.filter((p) => {
			if (!p.isAvailable) return false;
			if (selectedCategories.size === 0) return true;
			return selectedCategories.has(p.categoryId);
		})
	);

	/* ---------------- METHODS ---------------- */

	function toggleCategory(id: number) {
		const next = new Set(selectedCategories);
		next.has(id) ? next.delete(id) : next.add(id);
		selectedCategories = next;
	}

	function selectCategory(id: number) {
		const next = new Set<number>();
		next.add(id);
		selectedCategories = next;
	}

	async function openProduct(id: number) {
		const products = await productsPromise;
		selectedProduct = products.find((p) => p.id === id) ?? null;
		stepStates = createStepStates(selectedProduct?.steps ?? []);
		isSheetOpen = true;
		itemIsInBasket = false;
	}

	function addToBasket() {
		if (!selectedProduct) return;
		basket.add(selectedProduct, 1);
		itemIsInBasket = true;
	}

	/* ---------------- LIFECYCLE ---------------- */

	onMount(() => {
		productsPromise = fetchProducts();
		categoriesPromise = fetchCategories();

		productsPromise.then((p) => (allProducts = p));
	});
</script>

<div class="text-main text-center">
	<!-- Categories -->
	<div class="sticky top-17 mt-3 flex flex-wrap justify-center gap-1">
		{#await categoriesPromise}
			<span class="text-xs opacity-50">Loading categories...</span>
		{:then categories}
			{#each categories as category (category.id)}
				<FilterItem
					group="category"
					value={String(category.id)}
					checked={selectedCategories.has(category.id)}
					size="lg"
					onchange={() => selectCategory(category.id)}
				>
					{category.name[currentLanguage]}
				</FilterItem>
			{/each}
		{/await}
	</div>

	<!-- Products -->
	<div class="mt-4 grid grid-cols-[repeat(auto-fit,160px)] justify-center gap-2">
		{#await productsPromise}
			<p class="opacity-70">Loading products...</p>
		{:then}
			{#if filteredProducts.length > 0}
				{#each filteredProducts as product (product.id)}
					<Card
						title={product.title[currentLanguage]}
						imageSrc={product.imgURL}
						price={product.price}
						onclick={() => openProduct(product.id)}
					/>
				{/each}
			{:else}
				<p class="text-sm opacity-50">No products in this category.</p>
			{/if}
		{:catch error}
			<p class="text-red-500">Failed to load products: {error}</p>
		{/await}
	</div>
</div>

<!-- ---------------- SHEET ---------------- -->

{#if isSheetOpen && selectedProduct}
	<div class="fixed inset-0 z-50 flex items-end justify-center">
		<!-- backdrop -->
		<div
			role="button"
			tabindex="0"
			class="absolute inset-0 bg-darken"
			transition:fade={{ duration: 100 }}
			onclick={() => (isSheetOpen = false)}
			onkeydown={(e) => e.key === 'Escape' && (isSheetOpen = false)}
		></div>

		<!-- sheet -->
		<div
			class="relative flex max-h-[90vh] w-full max-w-md flex-col rounded-t-3xl bg-100 p-4 shadow-xl"
			transition:fly={{ y: 200, duration: 150, easing: cubicInOut }}
		>
			<img
				src={selectedProduct.imgURL}
				alt={selectedProduct.title[currentLanguage]}
				class="mb-3 h-40 w-full flex-none rounded-2xl object-cover"
			/>
			<div class="flex flex-1 flex-col overflow-y-auto">
				{#each selectedProduct.steps as step, i}
					<h1 class="mt-1 mb-0 ml-1">{step.title[currentLanguage]}</h1>
					<StepGroup {step} state={stepStates[i]} language={currentLanguage} />
				{/each}
			</div>

			<div class="flex-none">
				<div class="ml-1">
					<h2 class="text-lg font-semibold">
						{selectedProduct.title[currentLanguage]}
					</h2>
					<p class="text-muted mb-2">
						€{selectedProduct.price.toFixed(2)}
					</p>
					<p class="text-muted mb-4">
						{selectedProduct.description[currentLanguage]}
					</p>
				</div>

				{#if !itemIsInBasket}
					<Button class="w-full" size="lg" onclick={addToBasket}>Add to basket</Button>
				{:else}
					<Button class="w-full" size="lg" disabled variant="ghost">Added to basket</Button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<!-- ---------------- BASKET ICON ---------------- -->

<a
	href="/basket"
	class="fixed right-6 bottom-6 flex aspect-square h-15 items-center justify-center rounded-full border-2 border-secondary-500 bg-secondary-400 p-1.5 shadow-sm transition-all active:scale-95 active:bg-secondary-500 dark:border-secondary-600 dark:bg-secondary-500 active:dark:bg-secondary-600"
>
	<span
		class="relative stroke-secondary-700 text-2xl font-extrabold text-secondary-700 dark:stroke-secondary-900 dark:text-secondary-900"
	>
		{#if $basketCount == 0}
			<SvgBasket />
		{:else}
			<span> {$basketCount}</span>
		{/if}
	</span>
</a>
