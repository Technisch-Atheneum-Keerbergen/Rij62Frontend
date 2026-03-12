<script>
	import { preloadData } from '$app/navigation';
	import { Button, Heading, Span, ButtonGroup } from 'flowbite-svelte';
	import {
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Badge,
		Checkbox
	} from 'flowbite-svelte';
	import { DeleteRowOutline, RefreshOutline } from 'flowbite-svelte-icons';

	// Fetching data
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
			}
		];
	}

	function fetchCategories() {
		return [
			{ Id: 0, Name: { EN: 'Beverages', NL: 'Dranken' }, Color: 'blue' },
			{ Id: 1, Name: { EN: 'Pastries', NL: 'Gebak' }, Color: 'pink' }
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
			const start = products.findIndex((p) => p.Id === lastClickedId);
			const end = products.findIndex((p) => p.Id === productId);
			const [from, to] = [Math.min(start, end), Math.max(start, end)];

			for (let i = from; i <= to; i++) {
				newSet.add(products[i].Id);
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

	// API logic

	//Setting constants
	const products = fetchProducts();
	const categories = fetchCategories();

	const currentLanguage = 'EN';
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
			<Button color="rose"><RefreshOutline class="me-2 h-4 w-4" />Settings</Button>
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
						onclick={() => (window.location.href = `/admin/productControl/${product.Id}`)}
					>
						<!-- Checkbox -->
						<TableBodyCell class="p-4!">
							<Checkbox
								checked={selectedIds.has(product.Id)}
								onclick={(e) => handleCheckboxClick(e, product.Id)}
							/>
						</TableBodyCell>
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
