<script>
	import { Heading, Span } from 'flowbite-svelte';
	import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Badge } from 'flowbite-svelte';

	const currentLanguage = 'EN';

	function fetchProducts() {
		// Just a placeholder, replace with actual API call
		return [
			{
				Id: 0,
				Title: { EN: 'Cappuccino', NL: 'Cappuccino' },
				Price: 4,
				Stock: 50,
				IsAvailable: true,
				ImgURL: 'https://rij62.be/assets/products/cappuccino.png',
				CategoryId: 0
			},
			{
				Id: 1,
				Title: { EN: 'Latte Macchiato', NL: 'Latte Macchiato' },
				Price: 4.5,
				Stock: 40,
				IsAvailable: true,
				ImgURL: 'https://rij62.be/assets/products/latte.png',
				CategoryId: 0
			},
			{
				Id: 2,
				Title: { EN: 'Espresso', NL: 'Espresso' },
				Price: 3,
				Stock: 60,
				IsAvailable: true,
				ImgURL: 'https://rij62.be/assets/products/espresso.png',
				CategoryId: 0
			},
			{
				Id: 3,
				Title: { EN: 'Chocolate Chip Cookie', NL: 'Chocolate Chip Koekje' },
				Price: 2.5,
				Stock: 30,
				IsAvailable: true,
				ImgURL: 'https://rij62.be/assets/products/cookie.png',
				CategoryId: 1
			},
			{
				Id: 4,
				Title: { EN: 'Blueberry Muffin', NL: 'Blauwe Bes Muffin' },
				Price: 3,
				Stock: 25,
				IsAvailable: true,
				ImgURL: 'https://rij62.be/assets/products/muffin.png',
				CategoryId: 1
			},
			{
				Id: 5,
				Title: { EN: 'Croissant', NL: 'Croissant' },
				Price: 2.5,
				Stock: 35,
				IsAvailable: true,
				ImgURL: 'https://rij62.be/assets/products/croissant.png',
				CategoryId: 1
			},
			{
				Id: 6,
				Title: { EN: 'Mocha', NL: 'Mocha' },
				Price: 5,
				Stock: 40,
				IsAvailable: true,
				ImgURL: 'https://rij62.be/assets/products/mocha.png',
				CategoryId: 0
			},
			{
				Id: 7,
				Title: { EN: 'Caramel Latte', NL: 'Caramel Latte' },
				Price: 5,
				Stock: 35,
				IsAvailable: true,
				ImgURL: 'https://rij62.be/assets/products/caramel-latte.png',
				CategoryId: 0
			},
			{
				Id: 8,
				Title: { EN: 'Chocolate Cake Slice', NL: 'Chocolade Cake' },
				Price: 4,
				Stock: 20,
				IsAvailable: true,
				ImgURL: 'https://rij62.be/assets/products/chocolate-cake.png',
				CategoryId: 1
			},
			{
				Id: 9,
				Title: { EN: 'Iced Coffee', NL: 'Iced Coffee' },
				Price: 4,
				Stock: 30,
				IsAvailable: true,
				ImgURL: 'https://rij62.be/assets/products/iced-coffee.png',
				CategoryId: 0
			}
		];
	}
	function fetchCategories() {
		return [
			{ Id: 0, Name: { EN: 'Beverages', NL: 'Dranken' }, Color: 'blue' },
			{ Id: 1, Name: { EN: 'Pastries', NL: 'Gebak' }, Color: 'pink' }
		];
	}

	const products = fetchProducts();
	const categories = fetchCategories();
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
						onclick={() => (window.location.href = `/admin/productControl/${product.Id}`)}
					>
						<!-- Name -->
						<TableBodyCell class="font-semibold">
							{#if currentLanguage === 'EN'}
								{product.Title.EN}
							{:else}
								{product.Title.NL}
							{/if}
						</TableBodyCell>

						<!-- Category -->
						<TableBodyCell>
							{#if categories[product.CategoryId]}
								<Badge color={categories[product.CategoryId].Color}>
									{#if currentLanguage === 'EN'}
										{categories[product.CategoryId].Name.EN}
									{:else}
										{categories[product.CategoryId].Name.NL}
									{/if}
								</Badge>
							{/if}
						</TableBodyCell>

						<!-- Availability -->
						<TableBodyCell>
							{#if product.IsAvailable}
								<Badge color="green">Available</Badge>
							{:else}
								<Badge color="red">Unavailable</Badge>
							{/if}
						</TableBodyCell>

						<!-- Price -->
						<TableBodyCell class="text-right font-medium">
							€{product.Price.toFixed(2)}
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
	</div>
</div>
