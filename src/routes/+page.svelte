<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Cards/Card.svelte';
	import CheckCard from '$lib/components/Cards/CheckCard.svelte';

	type Product = {
		id: number;
		title: { English: string; Dutch: string };
		price: number;
		btw?: number;
		stock: number;
		isAvailible: boolean;
		imgURL: string;
		categoryId: number;
	};

	async function fetchProducts(): Promise<Product[]> {
		// simulate network delay
		await new Promise((r) => setTimeout(r, 500));

		return [
			{
				id: 0,
				title: { English: 'Thing', Dutch: 'Ding' },
				price: 20,
				btw: 5,
				stock: 5,
				isAvailible: true,
				imgURL: '/images/coffee.jpg',
				categoryId: 2
			},
			{
				id: 2,
				title: { English: 'Salmon toast', Dutch: 'Zalm toast' },
				price: 1,
				stock: 1,
				isAvailible: true,
				imgURL: '/images/zalmpje.jpg',
				categoryId: 0
			}
		];
	}

	const productsPromise = fetchProducts();
</script>

<div class="text-main block text-center">
	<Button type="button" size="md" variant="primary">Help first</Button>
	<Button type="button" variant="secondary">Help Second</Button>
	<Button type="button" variant="ghost">Weird button</Button>

	<div class="mt-4 flex flex-wrap justify-center gap-2">
		{#await productsPromise}
			<p class="opacity-70">Loading products...</p>
		{:then products}
			{#each products as product (product.id)}
				<Card title={product.title.English} imageSrc={product.imgURL} price={String(product.price)}
				></Card>
			{/each}
		{:catch error}
			<p class="text-red-500">Failed to load products: {error}</p>
		{/await}
	</div>
</div>
