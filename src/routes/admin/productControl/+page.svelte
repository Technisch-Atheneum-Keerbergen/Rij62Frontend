<script>
	import { Button, Heading, Span } from 'flowbite-svelte';
	import {
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Badge
	} from 'flowbite-svelte';

	function fetchProducts() {
		return [
			{
				Id: 0,
				Title: { EN: 'Cappuccino', NL: 'Cappuccino' },
				Price: 4,
				Stock: 50,
				IsAvailible: true,
				ImgURL: 'https://rij62.be/assets/products/cappuccino.png',
				CategoryId: 0
			},
			{
				Id: 1,
				Title: { EN: 'Latte Macchiato', NL: 'Latte Macchiato' },
				Price: 4.5,
				Stock: 40,
				IsAvailible: true,
				ImgURL: 'https://rij62.be/assets/products/latte.png',
				CategoryId: 0
			},
			{
				Id: 2,
				Title: { EN: 'Espresso', NL: 'Espresso' },
				Price: 3,
				Stock: 60,
				IsAvailible: true,
				ImgURL: 'https://rij62.be/assets/products/espresso.png',
				CategoryId: 0
			},
			{
				Id: 3,
				Title: { EN: 'Chocolate Chip Cookie', NL: 'Chocolate Chip Koekje' },
				Price: 2.5,
				Stock: 30,
				IsAvailible: true,
				ImgURL: 'https://rij62.be/assets/products/cookie.png',
				CategoryId: 1
			},
			{
				Id: 4,
				Title: { EN: 'Blueberry Muffin', NL: 'Blauwe Bes Muffin' },
				Price: 3,
				Stock: 25,
				IsAvailible: true,
				ImgURL: 'https://rij62.be/assets/products/muffin.png',
				CategoryId: 1
			},
			{
				Id: 5,
				Title: { EN: 'Croissant', NL: 'Croissant' },
				Price: 2.5,
				Stock: 35,
				IsAvailible: true,
				ImgURL: 'https://rij62.be/assets/products/croissant.png',
				CategoryId: 1
			},
			{
				Id: 6,
				Title: { EN: 'Mocha', NL: 'Mocha' },
				Price: 5,
				Stock: 40,
				IsAvailible: true,
				ImgURL: 'https://rij62.be/assets/products/mocha.png',
				CategoryId: 0
			},
			{
				Id: 7,
				Title: { EN: 'Caramel Latte', NL: 'Caramel Latte' },
				Price: 5,
				Stock: 35,
				IsAvailible: true,
				ImgURL: 'https://rij62.be/assets/products/caramel-latte.png',
				CategoryId: 0
			},
			{
				Id: 8,
				Title: { EN: 'Chocolate Cake Slice', NL: 'Chocolade Cake' },
				Price: 4,
				Stock: 20,
				IsAvailible: true,
				ImgURL: 'https://rij62.be/assets/products/chocolate-cake.png',
				CategoryId: 1
			},
			{
				Id: 9,
				Title: { EN: 'Iced Coffee', NL: 'Iced Coffee' },
				Price: 4,
				Stock: 30,
				IsAvailible: true,
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
    
	const currentLanguage = 'EN';
	const products = fetchProducts();
	const categories = fetchCategories();
</script>

<div class="mx-auto max-w-7xl p-8">
	<!-- Heading Section -->
	<div class="mb-12 text-center">
		<Heading tag="h1" class="mb-4 text-3xl font-extrabold  md:text-5xl lg:text-6xl">
			Take
			<Span gradient="tealToLime">Control</Span>
			of Your Products
		</Heading>
	</div>
    <div>
        <Table hoverable={true} shadow>
            <TableHead>
                <TableHeadCell>Name</TableHeadCell>
                <TableHeadCell>Category</TableHeadCell>
                <TableHeadCell>Availability</TableHeadCell>
                <TableHeadCell>Price</TableHeadCell>
            </TableHead>

            <TableBody>
                {#each products as product}
                    <TableBodyRow onclick={() => open(`/admin/productControl/${product.Id}`)}>
                        <TableBodyCell>
                            {#if currentLanguage === 'EN'}
                                {product.Title.EN}
                            {:else if currentLanguage === 'NL'}
                                {product.Title.NL}
                            {/if}
                        </TableBodyCell>
                        <TableBodyCell>
                            {#if categories[product.CategoryId]}
                                {#if currentLanguage === 'EN'}
                                    <Badge color={categories[product.CategoryId].Color}>
                                        {categories[product.CategoryId].Name.EN}
                                    </Badge>
                                {:else if currentLanguage === 'NL'}
                                    <Badge color={categories[product.CategoryId].Color}>
                                        {categories[product.CategoryId].Name.NL}
                                    </Badge>
                                {/if}
                            {/if}
                        </TableBodyCell>
                        <TableBodyCell>
                            {#if product.IsAvailible}
                                <Badge color="green">Available</Badge>
                            {:else}
                                <Badge color="red">Unavailable</Badge>
                            {/if}
                        </TableBodyCell>
                        <TableBodyCell>€{product.Price.toFixed(2)}</TableBodyCell>
                    </TableBodyRow>
                {/each}
            </TableBody>
        </Table>
    </div>
</div>
