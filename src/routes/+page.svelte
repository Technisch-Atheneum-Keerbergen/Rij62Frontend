<script lang="ts">
	import { apiFetch } from '$lib/api/client';
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Cards/Card.svelte';
	import FilterItem from '$lib/components/Badges/FilterItem.svelte';
	import { onMount } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';

	/* ---------------- CONFIG ---------------- */

	const isServerRunning = import.meta.env.VITE_SERVER_RUNNING === 'true';
	const currentLanguage = import.meta.env.VITE_CURRENT_LANGUAGE as 'English' | 'Dutch';

	/* ---------------- TYPES ---------------- */

	type Product = {
		id: number;
		title: { English: string; Dutch: string };
		description: { English: string; Dutch: string };
		price: number;
		btw?: number;
		stock: number;
		isAvailible: boolean;
		imgURL: string;
		categoryId: number;
	};

	type Category = {
		id: number;
		name: { English: string; Dutch: string };
		screenId: number;
	};

	/* ---------------- MOCK DATA ---------------- */

	const mockCategories: Category[] = [
		{ id: 0, name: { English: 'Food', Dutch: 'Eten' }, screenId: 1 },
		{ id: 1, name: { English: 'Snacks', Dutch: 'Snacks' }, screenId: 1 },
		{ id: 2, name: { English: 'Drinks', Dutch: 'Dranken' }, screenId: 1 }
	];

	const mockProducts: Product[] = [
		{
			id: 1,
			title: { English: 'Cappuccino', Dutch: 'Cappuccino' },
			description: {
				English: 'Fresh espresso with steamed milk and foam.',
				Dutch: 'Verse espresso met gestoomde melk en schuim.'
			},
			price: 3.2,
			btw: 6,
			stock: 25,
			isAvailible: true,
			imgURL: '/images/cappuccino.jpg',
			categoryId: 2
		},
		{
			id: 2,
			title: { English: 'Latte', Dutch: 'Latte' },
			description: {
				English: 'Smooth coffee with lots of steamed milk.',
				Dutch: 'Zachte koffie met veel gestoomde melk.'
			},
			price: 3.5,
			btw: 6,
			stock: 20,
			isAvailible: true,
			imgURL: '/images/latte.jpg',
			categoryId: 2
		},
		{
			id: 3,
			title: { English: 'Cheese Sandwich', Dutch: 'Kaasbroodje' },
			description: {
				English: 'Crispy bread with melted cheese.',
				Dutch: 'Knapperig broodje met gesmolten kaas.'
			},
			price: 4.5,
			btw: 6,
			stock: 12,
			isAvailible: true,
			imgURL: '/images/sandwich.jpg',
			categoryId: 0
		},
		{
			id: 4,
			title: { English: 'Chicken Wrap', Dutch: 'Kip Wrap' },
			description: {
				English: 'Grilled chicken with fresh vegetables.',
				Dutch: 'Gegrilde kip met verse groenten.'
			},
			price: 6.8,
			btw: 6,
			stock: 10,
			isAvailible: true,
			imgURL: '/images/wrap.jpg',
			categoryId: 0
		},
		{
			id: 5,
			title: { English: 'Chocolate Muffin', Dutch: 'Chocolade Muffin' },
			description: {
				English: 'Soft muffin with rich chocolate.',
				Dutch: 'Zachte muffin met rijke chocolade.'
			},
			price: 2.8,
			btw: 6,
			stock: 15,
			isAvailible: true,
			imgURL: '/images/muffin.jpg',
			categoryId: 1
		}
	];

	/* ---------------- FETCHING ---------------- */

	async function fetchProducts(): Promise<Product[]> {
		return isServerRunning ? apiFetch('/product') : mockProducts;
	}

	async function fetchCategories(): Promise<Category[]> {
		return isServerRunning ? apiFetch('/category') : mockCategories;
	}

	/* ---------------- STATE ---------------- */

	let productsPromise: Promise<Product[]>;
	let categoriesPromise: Promise<Category[]>;

	let allProducts: Product[] = [];
	let selectedCategories: Set<number> = new Set();

	let selectedProduct: Product | null = null;
	let isSheetOpen = false;
	let step = 0;

	/* ---------------- DERIVED ---------------- */

	$: filteredProducts =
		selectedCategories.size === 0
			? allProducts
			: allProducts.filter((p) => selectedCategories.has(p.categoryId));

	/* ---------------- METHODS ---------------- */

	function toggleCategory(id: number) {
		const next = new Set(selectedCategories);
		next.has(id) ? next.delete(id) : next.add(id);
		selectedCategories = next;
	}

	async function openProduct(id: number) {
		const products = await productsPromise;
		selectedProduct = products.find((p) => p.id === id) ?? null;
		isSheetOpen = true;
		step = 2;
	}

	function getContinueText() {
		if (!selectedProduct) return 'Continue';
		if (step === 0) return 'Customize';
		if (step === 1) return 'Review';
		return 'Add to basket';
	}

	function handleContinue() {
		step++;
	}

	/* ---------------- LIFECYCLE ---------------- */

	onMount(() => {
		productsPromise = fetchProducts();
		categoriesPromise = fetchCategories();

		productsPromise.then((p) => (allProducts = p));
	});
</script>

<!-- ---------------- UI ---------------- -->

<div class="text-main text-center">
	<h1 class="text-2xl">
		Welcome to <span class="font-bold text-primary-500 dark:text-primary-300">Rij62</span>
	</h1>

	<!-- Categories -->
	<div class="mt-3 flex flex-wrap justify-center gap-1">
		{#await categoriesPromise}
			<span class="text-xs opacity-50">Loading categories...</span>
		{:then categories}
			{#each categories as category (category.id)}
				<FilterItem
					group="category"
					value={String(category.id)}
					checked={selectedCategories.has(category.id)}
					size="lg"
					on:change={() => toggleCategory(category.id)}
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
						price={`${product.price.toFixed(2)}`}
						on:select={() => openProduct(product.id)}
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
			on:click={() => (isSheetOpen = false)}
			on:keydown={(e) => e.key === 'Escape' && (isSheetOpen = false)}
		></div>

		<!-- sheet -->
		<div
			class="relative w-full max-w-md rounded-t-3xl bg-100 p-4 shadow-xl"
			transition:fly={{ y: 200, duration: 150, easing: cubicInOut }}
		>
			<img
				src={selectedProduct.imgURL}
				alt={selectedProduct.title[currentLanguage]}
				class="mb-3 h-40 w-full rounded-2xl object-cover"
			/>

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

			<Button class="w-full" size="lg" on:click={handleContinue}>
				{getContinueText()}
			</Button>
		</div>
	</div>
{/if}
