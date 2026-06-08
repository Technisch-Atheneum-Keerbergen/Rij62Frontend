<script lang="ts">
	import type { RootCategory } from '$lib/api/types/rootCategory';
	import type { Category } from '$lib/api/types/category';
	import { productIsAvailable, type Product } from '$lib/api/types/product';
	import { apiFetch } from '$lib/api/client';
	import { onMount, onDestroy, tick } from 'svelte';
	import { browser } from '$app/environment';

	import { pushState } from '$app/navigation';
	import { basket, basketCount } from '$lib/stores/basket.svelte';
	import { createStepStates } from '$lib/stores/stepState.svelte';
	import { mockProducts } from './mockProducts.ts';

	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Cards/Card.svelte';
	import NavCard from '$lib/components/Cards/NavCard.svelte';
	import FilterItem from '$lib/components/Badges/FilterItem.svelte';
	import StepGroup from '$lib/components/Misc/StepGroup.svelte';
	import SvgChevronLeft from '$lib/components/SVG/SvgChevronLeft.svelte';
	import SvgChevronRight from '$lib/components/SVG/SvgChevronRight.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { Drawer, DrawerOverlay, DrawerContent, DrawerHandle } from '@abhivarde/svelte-drawer';

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

	let selectedRootCategory = $state<RootCategory>('Food');
	let selectedCategoryId = $state<number | null>(null);

	let selectedProduct = $state<Product | null>(null);
	// isDrawerOpen is the single source of truth — bound to Drawer.Root
	let isDrawerOpen = $state(false);
	let itemIsInBasket = $state(false);

	let stepStates = $state<ReturnType<typeof createStepStates>>([]);

	let categoriesLoading = $state(true);
	let productsLoading = $state(true);

	/* ---------------- DERIVED ---------------- */

	const visibleCategories = $derived(
		allCategories.filter((c) => c.rootCategory === selectedRootCategory)
	);

	const filteredProducts = $derived(
		selectedCategoryId !== null
			? [...allProducts.filter((p) => p.categoryId === selectedCategoryId)].sort(
					(a, b) => (productIsAvailable(a) ? 0 : 1) - (productIsAvailable(b) ? 0 : 1)
				)
			: []
	);

	/* ---------------- HISTORY (back gesture) ---------------- */

	function pushCategoryState(id: number) {
		pushState('', { categoryId: id });
	}

	function handlePopState(e: PopStateEvent) {
		if (selectedCategoryId !== null) {
			selectedCategoryId = null;
			document.getElementById('drawerCloser')?.click();
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	/* ---------------- METHODS ---------------- */

	function selectRootCategory(rootCategory: RootCategory) {
		if (selectedCategoryId !== null) {
			history.back();
			setTimeout(() => {
				selectedRootCategory = rootCategory;
				window.scrollTo({ top: 0, behavior: 'smooth' });
			}, 0);
			return;
		}
		selectedRootCategory = rootCategory;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function selectCategory(id: number) {
		selectedCategoryId = id;
		pushCategoryState(id);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function goBackToCategories() {
		if (selectedCategoryId !== null) {
			history.back();
		}
	}

	async function openProduct(id: number) {
		selectedProduct = allProducts.find((p) => p.id === id) ?? null;
		stepStates = createStepStates(selectedProduct?.steps ?? []);
		itemIsInBasket = false;

		await tick();

		isDrawerOpen = true;
	}

	function addToBasket() {
		if (!selectedProduct) return;

		const choices = stepStates.flatMap((stepState) =>
			stepState.options
				.filter((o) => o.selected)
				.map((o) => ({
					id: o.id,
					quantity: o.quantity || 1
				}))
		);

		basket.add(selectedProduct, choices);
		itemIsInBasket = true;
		setTimeout(() => {
			isDrawerOpen = false;
		}, 250);
	}

	/* ---------------- LIFECYCLE ---------------- */

	onMount(() => {
		window.addEventListener('popstate', handlePopState);

		productsPromise = fetchProducts();
		categoriesPromise = fetchCategories();
		rootCategoriesPromise = fetchRootCategories();

		productsPromise.then((p) => {
			allProducts = p;
			productsLoading = false;
		});
		categoriesPromise.then((c) => {
			allCategories = c;
			categoriesLoading = false;
		});
	});

	onDestroy(() => {
		if (browser) window.removeEventListener('popstate', handlePopState);
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
					onclick={goBackToCategories}
				>
					<SvgChevronLeft />
				</button>
			</div>

			{#await rootCategoriesPromise then rootCategories}
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
			{:catch error}
				<p class="text-red-500">Failed to load root categories: {error}</p>
			{/await}
		</div>
	</div>

	<!-- Sub-categories OR products -->
	<div class="z-0 mt-14">
		{#if selectedCategoryId === null}
			{#if categoriesLoading}
				<div class="flex flex-col items-center gap-4 text-center">
					<Spinner size="lg" />
				</div>
			{:else if visibleCategories.length === 0}
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
		{:else if productsLoading}
			<div class="flex flex-col items-center gap-4 text-center">
				<Spinner size="lg" />
				<p class="text-surface-500 text-sm">Loading products...</p>
			</div>
		{:else if filteredProducts.length > 0}
			<div class="grid grid-cols-[repeat(auto-fit,160px)] justify-center gap-4">
				{#each filteredProducts as product (product.id)}
					<Card
						onclick={() => openProduct(product.id)}
						title={product.title[currentLanguage]}
						imageSrc={product.imgURL}
						price={product.price}
						disabled={!product.isAvailable || !product.enabledByPreset}
					/>
				{/each}
			</div>
		{:else}
			<p class="text-sm opacity-50">No products in this category.</p>
		{/if}
	</div>
</section>

<!-- ---------------- DRAWER ---------------- -->

<Drawer bind:open={isDrawerOpen} closeThreshold={0.1}>
	<DrawerOverlay class="fixed inset-0 z-40 bg-black/40" />
	<DrawerContent
		class="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[90vh] w-full max-w-xl flex-col rounded-t-3xl bg-100 p-4 pt-2 shadow-xl"
	>
		<DrawerHandle class="mx-auto mb-2 h-1 w-18 shrink-0 rounded-full bg-500" />
		{#if selectedProduct}
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
					<p class="text-muted mb-2">€{selectedProduct.price.toFixed(2)}</p>
					<p class="text-muted mb-4">{selectedProduct.description[currentLanguage]}</p>
				</div>

				{#if !itemIsInBasket}
					<Button class="w-full" size="lg" onclick={addToBasket}>Add to basket</Button>
				{:else}
					<div class="flex flex-row gap-2">
						<Button class="w-full" size="lg" disabled variant="ghost">Added to basket</Button>
					</div>
				{/if}
			</div>
		{/if}
	</DrawerContent>
</Drawer>

<!-- ---------------- BASKET BAR ---------------- -->

{#if basketCount() > 0}
	<div class="fixed bottom-0 left-0 flex w-screen justify-center">
		<a
			href="/basket"
			class="relative m-5 flex h-15 w-full max-w-2xl items-center justify-between rounded-full border-2 border-secondary-500 bg-secondary-400 stroke-secondary-900 p-2 text-2xl font-extrabold text-secondary-900 shadow-sm transition-all active:scale-95 active:bg-secondary-500 dark:border-secondary-600 dark:bg-secondary-500 dark:stroke-secondary-50 dark:text-secondary-50 active:dark:bg-secondary-600"
		>
			<div
				class="flex aspect-square h-full items-center justify-center rounded-full bg-secondary-500 dark:bg-secondary-600"
			>
				<span class="text-center text-secondary-50 dark:text-secondary-50">{basketCount()}</span>
			</div>
			<span>Basket</span>
			<span class="aspect-square h-full stroke-3"><SvgChevronRight /></span>
		</a>
	</div>
{/if}
