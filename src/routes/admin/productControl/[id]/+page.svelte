<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import {
		Tabs,
		TabItem,
		Label,
		Button,
		Input,
		Toggle,
		Heading,
		Span,
		ImagePlaceholder
	} from 'flowbite-svelte';
	import { ArrowLeftOutline } from 'flowbite-svelte-icons';
	import type { Product } from '$lib/api/types/product';
	import type { Category } from '$lib/api/types/category';
	import { Language } from '$lib/api/types/multilangstring';

	import { onMount } from 'svelte';
	import { apiFetch, apiAdd, apiUpload, getImageUrl } from '$lib/api/client';

	// --- State ---
	let product: Product | null = null;
	let isNew = false;
	let imageError = false;

	let categories: Category[] = [];

	// --- Upload handler ---
	async function handleUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const formData = new FormData();
		formData.append('image', file);

		try {
			const imageId = await apiUpload('/image', formData);

			if (product) {
				product.imgURL = getImageUrl(imageId);
			}
			imageError = false;
		} catch (err) {
			console.error('[Upload] Failed:', err);
			imageError = true;
		}
	}

	const ApplyChanges = async () => {
		if (!product) return;

		try {
			if (isNew) {
				await apiAdd('/product', product, 'POST');
			} else {
				await apiAdd(`/product/${product.id}`, product, 'PUT');
			}

			console.log('[Rij62] Product saved successfully!');
			goto('/admin/productControl');
		} catch (err: any) {
			console.log(`[Rij62] Failed to save product: ${err.message}`);
		}
	};

	onMount(async () => {
		// Load categories first
		categories = (await apiFetch('/category')) as Category[];

		// Check route
		if ($page.params.id === 'new') {
			product = {
				id: 0,
				title: { English: '', Dutch: '' },
				price: 0,
				stock: 0,
				isAvailable: false,
				description: { English: '', Dutch: '' },
				imgURL: '/images/blueberries.jpg',
				btw: 21,
				categoryId: 0
			};
			isNew = true;
		} else {
			const products = (await apiFetch('/product')) as Product[];
			product = products.find((p) => p.id.toString() === $page.params.id) ?? null;
		}
	});
</script>

<div class="mx-auto max-w-7xl space-y-8 p-8">
	<div class="mb-12 text-center">
		<Heading tag="h1" class="mb-4 text-3xl font-extrabold md:text-5xl lg:text-6xl">
			Take
			<Span gradient="tealToLime">Control</Span>
			of Your Products
		</Heading>
	</div>

	<div class="grid grid-cols-1 gap-10 lg:grid-cols-2">
		<form class="space-y-6 rounded-xl border bg-white p-8 shadow-2xl">
			<Tabs tabStyle="pill">
				<!-- Back button -->
				<Button
					type="button"
					onclick={() => goto('/admin/productControl')}
					class="bg-primary-500 p-2 text-white hover:bg-primary-600"
				>
					<ArrowLeftOutline class="h-6 w-6" />
				</Button>

				<TabItem open title="Product Profile">
					{#if product}
						<div class="space-y-5">
							{#each Object.keys(product.title) as lang (lang)}
								<div>
									<Label for="Title_{lang}">Title {lang}</Label>
									<Input
										id="Title_{lang}"
										bind:value={product.title[lang as keyof typeof product.title]}
										type="text"
									/>
								</div>
							{/each}

							{#each Object.keys(product.description) as lang (lang)}
								<div>
									<Label for="Description_{lang}">Description {lang}</Label>
									<Input
										id="Description_{lang}"
										bind:value={product.description[lang as keyof typeof product.description]}
										type="text"
									/>
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

							<div>
								<Label for="Btw">Btw</Label>
								<Input id="Btw" bind:value={product.btw} type="number" />
							</div>
							<div>
								<Label for="Category">Category</Label>

								<select
									id="Category"
									bind:value={product.categoryId}
									class="w-full rounded-lg border p-2"
								>
									<option value={0} disabled>Select a category</option>

									{#each categories as category}
										<option value={category.id}>
											{category.name[Language.English]}
										</option>
									{/each}
								</select>
							</div>
							<div class="flex items-center justify-between rounded-lg border p-4">
								<div>
									<Label for="IsAvailable">Product Available</Label>
									<p class="text-sm text-gray-500">Toggle product visibility</p>
								</div>

								<Toggle id="IsAvailable" bind:checked={product.isAvailable} />
							</div>
						</div>

						<div class="mt-8 flex justify-end">
							<Button
								type="button"
								onclick={ApplyChanges}
								class="bg-primary-500 text-white hover:bg-primary-600"
							>
								Apply Changes
							</Button>
						</div>
					{/if}
				</TabItem>

				<TabItem title="History">
					<div class="p-4 text-gray-500">No history APIs available yet. Will be added later.</div>
				</TabItem>
			</Tabs>
		</form>

		<div class="rounded-xl border bg-white p-6 shadow-2xl">
			<h2 class="mb-4 text-lg font-semibold">Product Preview</h2>

			{#if product?.imgURL && !imageError}
				<!-- svelte-ignore a11y_missing_attribute -->
				<img
					src={product.imgURL}
					class="w-full rounded-lg object-cover"
					on:error={() => (imageError = true)}
				/>
			{:else}
				<ImagePlaceholder />
			{/if}

			<!-- Upload input -->
			<div class="mt-4">
				<input type="file" accept="image/*" on:change={handleUpload} class="block w-full text-sm" />
			</div>
		</div>
	</div>
</div>
