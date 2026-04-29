<script lang="ts">
	import type { RootCategory } from '$lib/api/types/rootCategory';
	import SvgChevronRight from './../lib/components/SVG/SvgChevronRight.svelte';
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
	import { fade, fly, slide } from 'svelte/transition';
	import { mockProducts } from './mockProducts.ts';
	import StepGroup from '$lib/components/Misc/StepGroup.svelte';
	import { createStepStates } from '$lib/stores/stepState.svelte';
	import SvgChevronLeft from '$lib/components/SVG/SvgChevronLeft.svelte';
	import NavCard from '$lib/components/Cards/NavCard.svelte';
	import SvgBasket from '$lib/components/SVG/SvgBasket.svelte';

	/* ---------------- CONFIG ---------------- */

	const isServerRunning = import.meta.env.VITE_SERVER_RUNNING === 'true';
	const currentLanguage = import.meta.env.VITE_CURRENT_LANGUAGE as 'English' | 'Dutch';

	/* ---------------- MOCK DATA ---------------- */

	const mockCategories: Category[] = [
		{
			id: 0,
			name: { English: 'Food', Dutch: 'Eten' },
			rootCategory: 'Food',
			imgUrl: '/images/wrap.jpg'
		},
		{
			id: 1,
			name: { English: 'Snacks', Dutch: 'Snacks' },
			rootCategory: 'Food',
			imgUrl: '/images/muffin.jpg'
		},
		{
			id: 2,
			name: { English: 'Coffee', Dutch: 'Koffie' },
			rootCategory: 'Drinks',
			imgUrl: '/images/latte.jpg'
		}
	];

	const mockRootCategories: RootCategory[] = ['Food', 'Drinks', 'Shop'];

	/* ---------------- FETCHING ---------------- */

	async function fetchProducts(): Promise<Product[]> {
		return isServerRunning ? apiFetch('/product') : mockProducts;
	}

	async function fetchCategories(): Promise<Category[]> {
		return isServerRunning ? apiFetch('/category') : mockCategories;
	}

	async function fetchRootCategories(): Promise<RootCategory[]> {
		return isServerRunning ? apiFetch('/category/root') : mockRootCategories;
	}

	/* ---------------- STATE ---------------- */

	let productsPromise = $state<Promise<Product[]>>(new Promise(() => {}));
	let categoriesPromise = $state<Promise<Category[]>>(new Promise(() => {}));
	let rootCategoriesPromise = $state<Promise<RootCategory[]>>(new Promise(() => {}));

	let allProducts = $state<Product[]>([]);
	let allCategories = $state<Category[]>([]);

	let selectedRootCategory: RootCategory = $state('Food');
	let selectedCategoryId = $state<number | null>(null);

	let selectedProduct = $state<Product | null>(null);
	let isSheetOpen = $state(false);
	let itemIsInBasket = $state(false);

	let stepStates = $state<ReturnType<typeof createStepStates>>([]);

	/* ---------------- DERIVED ---------------- */

	// Sub-categories belonging to the selected root category
	const visibleCategories = $derived(
		selectedRootCategory ? allCategories.filter((c) => c.rootCategory === selectedRootCategory) : []
	);

	// Products belonging to the selected sub-category
	const filteredProducts = $derived(
		selectedCategoryId !== null
			? allProducts.filter((p) => p.isAvailable && p.categoryId === selectedCategoryId)
			: []
	);

	/* ---------------- METHODS ---------------- */

	function selectRootCategory(rootCategory: RootCategory) {
		selectedRootCategory = rootCategory;
		selectedCategoryId = null; // reset sub-category when switching root
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	}

	function selectCategory(id: number) {
		selectedCategoryId = id;
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
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

		const choices = stepStates.flatMap((stepState, i) => {
			const step = selectedProduct!.steps[i];
			return stepState.options
				.filter((o) => o.selected)
				.map((o) => {
					const raw = step.options.find((opt) => opt.id === o.id)!;
					return {
						id: o.id,
						title: raw.title[currentLanguage],
						price: raw.price,
						amount: o.amount || 1
					};
				});
		});

		basket.add(selectedProduct, choices);
		itemIsInBasket = true;
	}

	/* ---------------- LIFECYCLE ---------------- */

	onMount(() => {
		productsPromise = fetchProducts();
		categoriesPromise = fetchCategories();
		rootCategoriesPromise = fetchRootCategories();

		productsPromise.then((p) => (allProducts = p));
		categoriesPromise.then((c) => (allCategories = c));
	});
</script>

<section class="text-main mx-auto max-w-2xl text-center">
	<!-- Root Categories (top bar) -->
	<div
		class="fixed top-17 left-0 z-10 mt-3 flex w-screen flex-wrap items-center justify-center gap-1"
	>
		<div class="flex flex-wrap items-center justify-center gap-1">
			<div
				class="transition-width duration-200"
				style="width: {selectedCategoryId !== null
					? '2.5rem'
					: '0'}; margin-right: {selectedCategoryId !== null ? '0.5rem' : '0'};
					overflow-x: {selectedCategoryId !== null ? 'visible' : 'hidden'}"
			>
				<button
					class="flex aspect-square h-9 cursor-pointer items-center justify-center gap-1 rounded-full border-2 border-300 bg-200 stroke-current p-1 shadow-lg hover:opacity-100 active:scale-95"
					onclick={() => {
						selectedCategoryId = null;
						window.scrollTo({
							top: 0,
							behavior: 'smooth'
						});
					}}
					transition:fade={{ duration: 200 }}
				>
					<SvgChevronLeft />
				</button>
			</div>

			{#await rootCategoriesPromise}
				<span class="text-xs opacity-50">Loading categories...</span>
			{:then rootCategories}
				{#each rootCategories as rootCategory}
					<FilterItem
						group="rootCategory"
						value={String(rootCategory)}
						checked={selectedRootCategory === rootCategory}
						size="lg"
						onchange={() => selectRootCategory(rootCategory)}
					>
						{rootCategory}
					</FilterItem>
				{/each}
			{/await}
		</div>
	</div>

	<!-- Sub-categories OR products -->
	<div class="z-0 mt-14">
		{#if selectedCategoryId === null}
			<!-- Show sub-categories -->
			{#if visibleCategories.length === 0}
				<p class="text-sm opacity-50">No subcategories found.</p>
			{:else}
				<div class="grid grid-cols-[repeat(auto-fit,160px)] justify-center gap-4">
					{#each visibleCategories as category (category.id)}
						<NavCard
							title={category.name[currentLanguage]}
							imageSrc={category.imgUrl}
							onclick={() => selectCategory(category.id)}
						/>
					{/each}
				</div>
			{/if}
		{:else}
			<!-- Show products -->
			{#await productsPromise}
				<p class="opacity-70">Loading products...</p>
			{:then}
				{#if filteredProducts.length > 0}
					<div class="grid grid-cols-[repeat(auto-fit,160px)] justify-center gap-4">
						{#each filteredProducts as product (product.id)}
							<Card
								title={product.title[currentLanguage]}
								imageSrc={product.imgURL}
								price={product.price}
								onclick={() => openProduct(product.id)}
							/>
						{/each}
					</div>
				{:else}
					<p class="text-sm opacity-50">No products in this category.</p>
				{/if}
			{:catch error}
				<p class="text-red-500">Failed to load products: {error}</p>
			{/await}
		{/if}
	</div>
</section>

<!-- ---------------- SHEET ---------------- -->

{#if isSheetOpen && selectedProduct}
	<div class="fixed inset-0 z-50 flex items-end justify-center">
		<div
			role="button"
			tabindex="0"
			class="absolute inset-0 bg-darken"
			transition:fade={{ duration: 100 }}
			onclick={() => (isSheetOpen = false)}
			onkeydown={(e) => e.key === 'Escape' && (isSheetOpen = false)}
		></div>

		<div
			class="relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-t-3xl bg-100 p-4 shadow-xl"
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
					<div class="flex flex-row gap-2">
						<Button class="w-full" size="lg" disabled variant="ghost">Added to basket</Button>
						<Button
							class="relative h-10 w-16 stroke-secondary-900"
							size="lg"
							onclick={() => {
								window.location.href = '/basket';
							}}
							variant="secondary"
							><p class="absolute top-1 left-3 aspect-square h-7"><SvgBasket /></p></Button
						>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<!-- ---------------- BASKET ICON ---------------- -->
{#if $basketCount > 0}
	<div class="fixed bottom-0 left-0 flex w-screen justify-center">
		<a
			href="/basket"
			class="relative m-5 flex h-15 w-full max-w-2xl items-center justify-between rounded-full border-2 border-secondary-500 bg-secondary-400 stroke-secondary-900 p-2 text-2xl font-extrabold text-secondary-900 shadow-sm transition-all active:scale-95 active:bg-secondary-500 dark:border-secondary-600 dark:bg-secondary-500 dark:stroke-secondary-50 dark:text-secondary-50 active:dark:bg-secondary-600"
		>
			<div
				class="flex aspect-square h-full items-center justify-center rounded-full bg-secondary-500 dark:bg-secondary-600"
			>
				<span class="text-center text-secondary-50 dark:text-secondary-50">
					{$basketCount}
				</span>
			</div>

			<span>Basket</span>

			<span class="aspect-square h-full stroke-3"><SvgChevronRight /></span>
		</a>
	</div>
{/if}
