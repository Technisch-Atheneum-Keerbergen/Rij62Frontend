<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Tabs, TabItem, Label, Button, Input, Toggle, Heading, Span, Img } from 'flowbite-svelte';
	import { ArrowLeftOutline } from 'flowbite-svelte-icons';
	import { Language } from '$lib/api/types/multilangstring';
	import type { Product } from '$lib/api/types/product';
	import { onMount } from 'svelte';
	import { apiFetch } from '$lib/api/client';

	const ApplyChanges = () => {
		alert('clicked');
	};

	let product: Product;
	onMount(async () => {
		var products = (await apiFetch('/product')) as Product[];
		for (const p of products) {
			if (p.id.toString() == $page.params.id) {
				product = p;
				break;
			}
		}
	});
</script>

<div class="mx-auto max-w-7xl space-y-8 p-8">
	<!-- Back button + heading -->
	<div class="mb-12 text-center">
		<Heading tag="h1" class="mb-4 text-3xl font-extrabold md:text-5xl lg:text-6xl">
			Take
			<Span gradient="tealToLime">Control</Span>
			of Your Products
		</Heading>
	</div>

	<!-- Main layout -->
	<div class="grid grid-cols-1 gap-10 lg:grid-cols-2">
		<!-- Product Form -->
		<form class="space-y-6 rounded-xl border bg-white p-8 shadow-2xl">
			<Tabs>
				<Button onclick={() => (window.location.href = '/admin/productControl')} class="p-2">
					<ArrowLeftOutline class="h-6 w-6" />
				</Button>
				{#if product}
					<TabItem open title="Product Profile">
						<div class="space-y-5">
							{#each Object.entries(product.title) as [lang, name]}
								<div>
									<Label for="Title_{lang}">Title {lang}</Label>
									<Input id="Title_{lang}" bind:value={name} type="text" />
								</div>
							{/each}

							<div>
								<Label for="Price">Price (€)</Label>
								<Input id="Price" bind:value={product.price} type="number" />
							</div>

							<div>
								<Label for="Stock">Stock</Label>
								<Input id="Stock" bind:value={product.stock} type="number" />
							</div>

							<div class="flex items-center justify-between rounded-lg border p-4">
								<div>
									<Label for="IsAvailable">Product Available</Label>
									<p class="text-sm text-gray-500">Toggle product visibility</p>
								</div>

								<Toggle id="IsAvailable" bind:checked={product.isAvailible} />
							</div>
						</div>

						<div class="mt-8 flex justify-end">
							<Button type="submit" onclick={ApplyChanges}>Apply Changes</Button>
						</div>
					</TabItem>
				{/if}

				<TabItem title="History">
					<div class="p-4 text-gray-500">No history APIs available yet. Will be added later.</div>
				</TabItem>
			</Tabs>
		</form>

		<!-- Product Image -->
		<div class="rounded-xl border bg-white p-6 shadow-2xl">
			<h2 class="mb-4 text-lg font-semibold">Product Preview</h2>
			{#if product}
				<Img src={product.imgURL} class="w-full rounded-lg object-cover" />
			{/if}
		</div>
	</div>
</div>
