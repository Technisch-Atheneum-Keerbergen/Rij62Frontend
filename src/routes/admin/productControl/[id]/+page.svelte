<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { slide } from 'svelte/transition';
	import {
		Tabs,
		TabItem,
		Label,
		Button,
		Input,
		Toggle,
		Heading,
		Span,
		ImagePlaceholder,
		Modal
	} from 'flowbite-svelte';
	import { ArrowLeftOutline, ExclamationCircleOutline } from 'flowbite-svelte-icons';
	import type { Product } from '$lib/api/types/product';
	import type { Category } from '$lib/api/types/category';
	import { Language } from '$lib/api/types/multilangstring';

	import { onMount } from 'svelte';
	import { apiFetch, apiAdd, apiUpload, getImageUrl } from '$lib/api/client';

	// --- State ---
	let product = $state<Product | null>(null);
	let isNew = $state(false);
	let imageError = $state(false);
	let categories = $state<Category[]>([]);
	let SavedProduct = $state(false);
	let allProducts = $state<Product[]>([]);

	let formError = $state<string | null>(null);
	let popupOpen = $state(false);

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

	async function handleOptionUpload(event: Event, stepIndex: number, optionIndex: number) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const formData = new FormData();
		formData.append('image', file);

		try {
			const imageId = await apiUpload('/image', formData);
			product!.steps[stepIndex].options[optionIndex].imgURL = getImageUrl(imageId);
			product = product;
		} catch (err) {
			console.error('[Upload] Option image failed:', err);
		}
	}

	function ValidateProduct(product: Product) {
		if (!product) {
			return { valid: false, error: 'Product is not loaded' };
		}

		if (product.price < 0) {
			return {
				valid: false,
				error: 'Price cannot be negative'
			};
		}

		if (product.stock < 0) {
			return {
				valid: false,
				error: 'Stock cannot be negative'
			};
		}

		if (product.btw < 0) {
			return {
				valid: false,
				error: 'Btw cannot be negative'
			};
		}

		if (product.btw > 100) {
			return {
				valid: false,
				error: 'Btw cannot be more than 100'
			};
		}

		return { valid: true };
	}

	const ApplyChanges = async () => {
		if (!product) return;

		const validation = ValidateProduct(product);

		if (!validation.valid) {
			formError = validation.error ?? null;
			popupOpen = true;
			return;
		}

		try {
			if (isNew) {
				await apiAdd('/product', product, 'POST');
			} else {
				await apiAdd(`/product/${product.id}`, product, 'PUT');
			}

			console.log('[Rij62] Product saved successfully!');
			SavedProduct = true;
		} catch (err: any) {
			console.log(`[Rij62] Failed to save product: ${err.message}`);
		}
	};

	const ApplyChangesForStep = async () => {
		if (!product) return;

		try {
			// 1. Save option titles via PUT /product/{id} for each option
			for (const step of product.steps) {
				for (const option of step.options) {
					if (option.id) {
						await apiAdd(
							`/product/${option.id}`,
							{
								title: option.title,
								description: option.description,
								price: option.price,
								btw: option.btw,
								stock: option.stock,
								isAvailable: option.isAvailable,
								imgURL: option.imgURL,
								categoryId: option.categoryId
							},
							'PUT'
						);
					}
				}
			}

			// 2. Update base product
			await apiAdd(
				`/product/${product.id}`,
				{
					title: product.title,
					description: product.description,
					price: product.price,
					btw: product.btw,
					stock: product.stock,
					isAvailable: product.isAvailable,
					imgURL: product.imgURL,
					categoryId: product.categoryId
				},
				'PUT'
			);

			// 3. Delete all old steps
			for (const step of product.steps) {
				await apiAdd(`/product/${product.id}/step/${step.id}`, null, 'DELETE');
			}

			// 4. Recreate all steps
			for (const step of product.steps) {
				await apiAdd(
					`/product/${product.id}/step`,
					{
						title: step.title,
						defaultOptionId: step.defaultOptionId ?? 0,
						multipleChoice: step.multipleChoice,
						options: step.options.map((o) => o.id).filter(Boolean)
					},
					'POST'
				);
			}

			SavedProduct = true;
		} catch (err: any) {
			console.error('[Rij62] Failed to update steps:', err.message);
		}
	};
	onMount(async () => {
		// Load categories first
		categories = (await apiFetch('/category')) as Category[];
		allProducts = (await apiFetch('/product')) as Product[];

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
				categoryId: 0,
				steps: []
			};
			isNew = true;
		} else {
			try {
				product = (await apiFetch(`/product/${$page.params.id}`)) as Product;
			} catch (err) {
				console.error('[Product Fetch] Failed:', err);
				product = null;
			}
		}
	});
</script>

<div class="mx-auto max-w-7xl space-y-8 p-8">
	<div class="mb-12 text-center">
		<Heading tag="h1" class="mb-4 text-3xl font-extrabold md:text-5xl lg:text-6xl">
			Take
			<Span class="text-highlight">Control</Span>
			of Your Products
		</Heading>
	</div>

	<div class="grid grid-cols-1 gap-10 lg:grid-cols-2">
		<form class="border-main space-y-6 rounded-xl border bg-50 p-8 shadow-2xl">
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
						<div class="border-main space-y-6 rounded-xl border bg-100 p-6 shadow-lg">
							<!-- Title Section -->
							<div>
								<h3 class="text-main text-lg font-semibold">General Information</h3>
							</div>

							<div class="space-y-5">
								{#each Object.keys(product.title) as lang (lang)}
									<div>
										<Label for="Title_{lang}">Title {lang}</Label>
										<Input
											id="Title_{lang}"
											bind:value={product.title[lang as keyof typeof product.title]}
											type="text"
											class="border-main bg-50"
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
											class="border-main bg-50"
										/>
									</div>
								{/each}

								<div>
									<Label for="Price">Price (€)</Label>
									<Input
										id="Price"
										bind:value={product.price}
										type="number"
										min="0"
										class="border-main bg-50"
									/>
								</div>

								<div>
									<Label for="Stock">Stock</Label>
									<Input
										id="Stock"
										bind:value={product.stock}
										type="number"
										min="0"
										class="border-main bg-50"
									/>
								</div>

								<div>
									<Label for="Btw">Btw</Label>
									<Input
										id="Btw"
										bind:value={product.btw}
										type="number"
										min="0"
										max="100"
										class="border-main bg-50"
									/>
								</div>

								<div>
									<Label for="Category">Category</Label>
									<select
										id="Category"
										bind:value={product.categoryId}
										class="border-main text-main w-full rounded-lg border bg-50 p-2"
									>
										<option value={0} disabled>Select a category</option>

										{#each categories as category}
											<option value={category.id}>
												{category.name[Language.English]}
											</option>
										{/each}
									</select>
								</div>

								<div
									class="border-main flex items-center justify-between rounded-lg border bg-100 p-4"
								>
									<div>
										<Label for="IsAvailable">Product Available</Label>
										<p class="text-muted text-sm">Toggle product visibility</p>
									</div>

									<Toggle id="IsAvailable" bind:checked={product.isAvailable} />
								</div>
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
				<TabItem title="Product Steps">
					{#if product}
						<div class="space-y-6">
							{#each product.steps as step, i (step.id)}
								<div class="border-main space-y-5 rounded-xl border bg-100 p-6 shadow-lg">
									<!-- Step header -->
									<div class="flex items-center justify-between">
										<h3 class="text-main text-lg font-semibold">Step {i + 1}</h3>
										<div class="flex items-center gap-3">
											<Toggle bind:checked={step.multipleChoice} />
											<span class="text-muted text-sm">Multiple choice</span>
											<Button
												type="button"
												color="red"
												size="xs"
												onclick={() => {
													product!.steps.splice(i, 1);
													product = product;
												}}
											>
												Remove Step
											</Button>
										</div>
									</div>

									<!-- Step titles -->
									<div class="grid gap-4 md:grid-cols-2">
										{#each Object.keys(step.title) as lang (lang)}
											<div>
												<Label>Title {lang}</Label>
												<Input
													class="border-main bg-50"
													bind:value={step.title[lang as keyof typeof step.title]}
												/>
											</div>
										{/each}
									</div>

									<!-- Options -->
									<div class="border-main space-y-3 rounded-lg border bg-50 p-4">
										<div class="flex items-center justify-between">
											<h4 class="text-main text-sm font-semibold">Options</h4>
											<Button
												type="button"
												size="xs"
												onclick={() => {
													step.options = [
														...step.options,
														{
															id: 0,
															title: { English: '', Dutch: '' },
															description: { English: '', Dutch: '' },
															price: 0,
															stock: 0,
															isAvailable: false,
															btw: 0,
															imgURL: '',
															categoryId: 0,
															steps: []
														}
													];
												}}
											>
												+ Add Option
											</Button>
										</div>

										<p class="text-muted text-xs">● = default selected option</p>

										{#each step.options as option, j (option.id)}
											<div class="border-main space-y-3 rounded-lg border bg-100 p-4">
												<div class="flex items-center gap-3">
													<!-- Default radio -->
													<input
														type="radio"
														name="default_{step.id}"
														checked={step.defaultOptionId === option.id}
														onchange={() => (step.defaultOptionId = option.id)}
														class="accent-blue-500"
														title="Set as default"
													/>

													<!-- Product picker dropdown -->
													<div class="flex-1">
														<Label>Option Product</Label>
														<select
															class="border-main text-main w-full rounded-lg border bg-50 p-2"
															value={option.id}
															onchange={(e) => {
																const selected = allProducts.find(
																	(p) => p.id === Number(e.currentTarget.value)
																);
																if (selected) {
																	option.id = selected.id;
																	option.title = selected.title;
																	option.description = selected.description;
																	option.price = selected.price;
																	option.btw = selected.btw;
																	option.stock = selected.stock;
																	option.isAvailable = selected.isAvailable;
																	option.imgURL = selected.imgURL;
																	option.categoryId = selected.categoryId;
																	product = product;
																}
															}}
														>
															<option value={0} disabled>Select a product…</option>
															{#each allProducts as p}
																<option value={p.id}>{p.title[Language.English]}</option>
															{/each}
														</select>
													</div>

													<Button
														type="button"
														color="red"
														size="xs"
														onclick={() => {
															if (step.defaultOptionId === option.id) step.defaultOptionId = null;
															step.options.splice(j, 1);
															product = product;
														}}
													>
														✕
													</Button>
												</div>

												<!-- Editable titles -->
												<div class="grid gap-3 md:grid-cols-2">
													{#each Object.keys(option.title) as lang (lang)}
														<div>
															<Label>Title {lang}</Label>
															<Input
																class="border-main bg-50"
																bind:value={option.title[lang as keyof typeof option.title]}
															/>
														</div>
													{/each}
												</div>
												<!-- Option image upload -->
												<div class="flex items-center gap-4">
													{#if option.imgURL}
														<img
															src={option.imgURL}
															alt="option"
															class="border-main h-16 w-16 rounded-lg border object-cover"
															onerror={(e) => (e.currentTarget.style.display = 'none')}
														/>
													{/if}
													<div class="flex-1">
														<Label>Image</Label>
														<input
															type="file"
															accept="image/*"
															onchange={(e) => handleOptionUpload(e, i, j)}
															class="text-muted block w-full text-sm"
														/>
													</div>
												</div>
											</div>
										{/each}

										{#if step.options.length === 0}
											<p class="text-muted py-2 text-center text-sm">No options yet</p>
										{/if}
									</div>
								</div>
							{/each}

							<!-- Add Step -->
							<button
								type="button"
								onclick={() => {
									product!.steps = [
										...product!.steps,
										{
											id: Date.now(),
											title: { English: '', Dutch: '' },
											multipleChoice: false,
											defaultOptionId: null,
											options: []
										}
									];
								}}
								class="border-main text-muted w-full rounded-xl border-2 border-dashed bg-100 p-4 transition-colors hover:border-blue-500 hover:text-blue-500"
							>
								+ Add Step
							</button>
						</div>

						<div class="mt-8 flex justify-end">
							<Button
								type="button"
								onclick={ApplyChangesForStep}
								class="bg-primary-500 text-white hover:bg-primary-600"
							>
								Apply Changes
							</Button>
						</div>
					{/if}
				</TabItem>
				<TabItem title="History">
					<div class="text-muted p-4">No history APIs available yet. Will be added later.</div>
				</TabItem>
			</Tabs>
		</form>

		<div class="border-main rounded-xl border bg-50 p-6 shadow-2xl">
			<h2 class="text-main mb-4 text-lg font-semibold">Product Preview</h2>

			{#if product?.imgURL && !imageError}
				<!-- svelte-ignore a11y_missing_attribute -->
				<img
					src={product.imgURL}
					class="border-main w-full rounded-lg border object-cover"
					onerror={() => (imageError = true)}
				/>
			{:else}
				<ImagePlaceholder />
			{/if}

			<!-- Upload input -->
			<div class="mt-4">
				<input type="file" accept="image/*" onchange={handleUpload} class="block w-full text-sm" />
			</div>
		</div>
	</div>
	{#if popupOpen}
		<Modal bind:open={popupOpen} size="xs" transition={slide}>
			<div class="text-center">
				<ExclamationCircleOutline class="text-muted mx-auto mb-4 h-12 w-12" />

				<h3 class="text-main mb-5 text-lg font-normal">
					{formError}
				</h3>

				<div class="flex justify-center gap-3">
					<Button
						type="button"
						color="primary"
						onclick={() => {
							popupOpen = false;
							formError = null;
						}}
					>
						Okay
					</Button>
				</div>
			</div>
		</Modal>
	{/if}
	{#if SavedProduct}
		<Modal bind:open={SavedProduct} size="xs" transition={slide}>
			<div class="text-center">
				<ExclamationCircleOutline class="text-muted mx-auto mb-4 h-12 w-12" />

				<h3 class="text-main mb-5 text-lg font-normal">Saved Product Successfully</h3>

				<div class="flex justify-center gap-3">
					<Button
						type="button"
						color="primary"
						onclick={() => {
							goto('/admin/productControl');
						}}
					>
						Okay
					</Button>
				</div>
			</div>
		</Modal>
	{/if}
</div>
