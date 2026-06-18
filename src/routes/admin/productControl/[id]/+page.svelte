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
		Modal,
		P
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
	let stepDefaults = $state<Record<number, number[]>>({});

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
			return { valid: false, error: 'Price cannot be negative' };
		}
		if (product.stock < 0) {
			return { valid: false, error: 'Stock cannot be negative' };
		}
		if (product.btw < 0) {
			return { valid: false, error: 'Btw cannot be negative' };
		}
		if (product.btw > 100) {
			return { valid: false, error: 'Btw cannot be more than 100' };
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

		const TEMP_ID_THRESHOLD = 1_000_000_000_000;

		try {
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

			for (const step of product.steps) {
				if (step.id < TEMP_ID_THRESHOLD) {
					await apiAdd(`/product/${product.id}/step/${step.id}`, null, 'DELETE');
				}
			}

			for (const step of product.steps) {
				await apiAdd(
					`/product/${product.id}/step`,
					{
						title: step.title,
						defaultOptionId: stepDefaults[step.id]?.[0] ?? null,
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
		categories = (await apiFetch('/category')) as Category[];
		allProducts = (await apiFetch('/product')) as Product[];

		if ($page.params.id === 'new') {
			product = {
				id: 0,
				title: { English: '', Dutch: '' },
				price: 0,
				stock: 0,
				isAvailable: false,
				enabledByPreset: true,
				description: { English: '', Dutch: '' },
				imgURL: '/images/blueberries.jpg',
				btw: 21,
				categoryId: null,
				steps: []
			};
			isNew = true;
		} else {
			try {
				product = (await apiFetch(`/product/${$page.params.id}`)) as Product;
				if (product?.steps) {
					for (const step of product.steps) {
						stepDefaults[step.id] = step.defaultOptionId != null ? [step.defaultOptionId] : [];
					}
				}
			} catch (err) {
				console.error('[Product Fetch] Failed:', err);
				product = null;
			}
		}
	});
</script>

<div class="mx-auto max-w-7xl p-8">
	<!-- Heading -->
	<div class="mb-12 text-center">
		<Heading tag="h1" class="mb-4 text-3xl font-extrabold md:text-5xl lg:text-6xl">
			Take
			<Span class="text-highlight">Control</Span>
			of Your Products
		</Heading>
	</div>

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
		<!-- Left: Form -->
		<div class="border-main overflow-hidden rounded-xl border shadow-lg">
			<Tabs tabStyle="pill" class="bg-100 p-4">
				<Button
					type="button"
					onclick={() => goto('/admin/productControl')}
					class="bg-primary-500 p-2 text-white hover:bg-primary-600"
				>
					<ArrowLeftOutline class="h-5 w-5" />
				</Button>

				<!-- Product Profile Tab -->
				<TabItem open title="Product Profile">
					{#if product}
						<div class="space-y-6 p-2">
							<div class="border-main space-y-4 rounded-xl border bg-100 p-5">
								<h3 class="text-main text-sm font-semibold tracking-wider text-gray-500 uppercase">
									General Information
								</h3>

								<div class="space-y-4">
									{#each Object.keys(product.title) as lang (lang)}
										<div>
											<Label for="Title_{lang}">Title {lang}</Label>
											<Input
												id="Title_{lang}"
												bind:value={product.title[lang as keyof typeof product.title]}
												type="text"
												class="border-main mt-1 bg-50"
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
												class="border-main mt-1 bg-50"
											/>
										</div>
									{/each}

									<div class="grid grid-cols-3 gap-4">
										<div>
											<Label for="Price">Price (€)</Label>
											<Input
												id="Price"
												bind:value={product.price}
												type="number"
												min="0"
												class="border-main mt-1 bg-50"
											/>
										</div>
										<div>
											<Label for="Stock">Stock</Label>
											<Input
												id="Stock"
												bind:value={product.stock}
												type="number"
												min="0"
												class="border-main mt-1 bg-50"
											/>
										</div>
										<div>
											<Label for="Btw">BTW (%)</Label>
											<Input
												id="Btw"
												bind:value={product.btw}
												type="number"
												min="0"
												max="100"
												class="border-main mt-1 bg-50"
											/>
										</div>
									</div>

									<div>
										<Label for="Category">Category</Label>
										<select
											id="Category"
											bind:value={product.categoryId}
											class="border-main text-main mt-1 w-full rounded-lg border bg-50 p-2 text-sm"
										>
											<option value={null}>No category</option>
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
											<p class="text-main text-sm font-medium">Product Available</p>
											<p class="text-muted text-xs">Toggle product visibility</p>
										</div>
										<Toggle bind:checked={product.isAvailable} color="blue" />
									</div>
								</div>
							</div>

							<div class="flex justify-end pt-2">
								<Button
									type="button"
									onclick={ApplyChanges}
									class="bg-primary-500 text-white hover:bg-primary-600"
								>
									Apply Changes
								</Button>
							</div>
						</div>
					{/if}
				</TabItem>

				<!-- Product Steps Tab -->
				<TabItem title="Product Steps">
					{#if product}
						<div class="space-y-4 p-2">
							{#each product.steps as step, i (step.id)}
								<div class="border-main space-y-4 rounded-xl border bg-100 p-5">
									<div class="flex items-center justify-between">
										<span
											class="text-main text-sm font-semibold tracking-wider text-gray-500 uppercase"
										>
											Step {i + 1}
										</span>
										<div class="flex items-center gap-3">
											<Toggle bind:checked={step.multipleChoice} />
											<span class="text-muted text-xs">Multiple choice</span>
											<Button
												type="button"
												variant="ghost"
												size="xs"
												onclick={() => {
													delete stepDefaults[step.id];
													product!.steps.splice(i, 1);
													product = product;
												}}
											>
												Remove
											</Button>
										</div>
									</div>

									<div class="grid gap-3 md:grid-cols-2">
										{#each Object.keys(step.title) as lang (lang)}
											<div>
												<Label>Title {lang}</Label>
												<Input
													class="border-main mt-1 bg-50"
													bind:value={step.title[lang as keyof typeof step.title]}
												/>
											</div>
										{/each}
									</div>

									<!-- Options -->
									<div class="border-main space-y-3 rounded-lg border bg-50 p-3">
										<div class="flex items-center justify-between">
											<span class="text-xs font-semibold tracking-wider text-gray-500 uppercase"
												>Options</span
											>
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
															enabledByPreset: true,
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

										<p class="text-muted text-xs">☑ = default selected</p>

										{#each step.options as option, j (option.id)}
											<div class="border-main space-y-3 rounded-lg border bg-100 p-3">
												<div class="flex items-center gap-3">
													<button
														type="button"
														title="Set as default"
														onclick={() => {
															const current = stepDefaults[step.id] ?? [];
															if (current.includes(option.id)) {
																stepDefaults[step.id] = current.filter((id) => id !== option.id);
															}
															stepDefaults[step.id] = [...current, option.id];
														}}
														class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all
															{(stepDefaults[step.id] ?? []).includes(option.id)
															? 'border-primary-500 bg-primary-500 text-white'
															: 'border-main bg-50 text-transparent hover:border-primary-400'}"
													>
														<svg
															xmlns="http://www.w3.org/2000/svg"
															class="h-3.5 w-3.5"
															viewBox="0 0 20 20"
															fill="currentColor"
														>
															<path
																fill-rule="evenodd"
																d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
																clip-rule="evenodd"
															/>
														</svg>
													</button>

													<div class="flex-1">
														<Label>Option Product</Label>
														<select
															class="border-main text-main mt-1 w-full rounded-lg border bg-50 p-2 text-sm"
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
														variant="ghost"
														size="xs"
														onclick={() => {
															const current = stepDefaults[step.id] ?? [];
															stepDefaults[step.id] = current.filter((id) => id !== option.id);
															if (step.defaultOptionId === option.id) step.defaultOptionId = null;
															step.options.splice(j, 1);
															product = product;
														}}
													>
														✕
													</Button>
												</div>

												<div class="grid gap-3 md:grid-cols-2">
													{#each Object.keys(option.title) as lang (lang)}
														<div>
															<Label>Title {lang}</Label>
															<Input
																class="border-main mt-1 bg-50"
																bind:value={option.title[lang as keyof typeof option.title]}
															/>
														</div>
													{/each}
												</div>
											</div>
										{/each}

										{#if step.options.length === 0}
											<p class="text-muted py-2 text-center text-sm">No options yet</p>
										{/if}
									</div>
								</div>
							{/each}

							<button
								type="button"
								onclick={() => {
									const newId = Date.now();
									stepDefaults[newId] = [];
									product!.steps = [
										...product!.steps,
										{
											id: newId,
											title: { English: '', Dutch: '' },
											multipleChoice: false,
											defaultOptionId: null,
											options: []
										}
									];
								}}
								class="border-main text-muted w-full rounded-xl border-2 border-dashed bg-100 p-4 text-sm transition-colors hover:border-primary-500 hover:text-primary-500"
							>
								+ Add Step
							</button>

							<div class="flex justify-end pt-2">
								<Button
									type="button"
									onclick={ApplyChangesForStep}
									class="bg-primary-500 text-white hover:bg-primary-600"
								>
									Apply Changes
								</Button>
							</div>
						</div>
					{/if}
				</TabItem>

				<TabItem title="History">
					<div class="text-muted p-4 text-sm">No history available yet.</div>
				</TabItem>
			</Tabs>
		</div>

		<!-- Right: Preview -->
		<div class="border-main flex flex-col gap-6 rounded-xl border bg-50 p-6 shadow-lg">
			<div>
				<span class="text-xs font-semibold tracking-wider text-gray-500 uppercase"
					>Product Preview</span
				>
			</div>

			{#if product?.imgURL && !imageError}
				<img
					src={product.imgURL}
					alt="product preview"
					class="border-main w-full rounded-lg border object-cover"
					onerror={() => (imageError = true)}
				/>
			{:else}
				<ImagePlaceholder />
			{/if}

			<div>
				<Label>Replace Image</Label>
				<input
					type="file"
					accept="image/*"
					onchange={handleUpload}
					class="text-muted mt-1 block w-full text-sm"
				/>
			</div>

			{#if product}
				<div class="border-main space-y-2 rounded-lg border bg-100 p-4 text-sm">
					<p class="text-main font-semibold">{product.title[Language.English] || 'Untitled'}</p>
					<p class="text-muted">{product.description[Language.English] || 'No description'}</p>
					<div class="flex items-center justify-between pt-1">
						<span class="text-main font-medium">€{product.price.toFixed(2)}</span>
						<span class="text-xs {product.isAvailable ? 'text-green-500' : 'text-red-400'}">
							{product.isAvailable ? 'Available' : 'Unavailable'}
						</span>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Error modal -->
<Modal bind:open={popupOpen} size="xs" transition={slide}>
	<div class="text-center">
		<ExclamationCircleOutline class="text-muted mx-auto mb-4 h-12 w-12" />
		<h3 class="text-main mb-5 text-lg font-normal">{formError}</h3>
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

<!-- Saved modal -->
<Modal bind:open={SavedProduct} size="xs" transition={slide}>
	<div class="text-center">
		<ExclamationCircleOutline class="text-muted mx-auto mb-4 h-12 w-12" />
		<h3 class="text-main mb-5 text-lg font-normal">Saved Product Successfully</h3>
		<div class="flex justify-center gap-3">
			<Button type="button" color="primary" onclick={() => goto('/admin/productControl')}>
				Okay
			</Button>
		</div>
	</div>
</Modal>

<style>
	/* Flowbite structural overrides */
	:global([role='tabpanel']) {
		background: var(--bg-100) !important;
	}

	:global([role='tablist']) {
		background: transparent !important;
	}

	:global([data-testid]) {
		border-color: var(--color-border) !important;
	}
</style>
