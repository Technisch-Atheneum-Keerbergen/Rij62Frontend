<script lang="ts">
	import { apiFetch, apiAdd, apiDelete, apiUpload, getImageUrl } from '$lib/api/client';
	import { Language } from '$lib/api/types/multilangstring';
	import type { Category } from '$lib/api/types/category';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import {
		Heading,
		Span,
		Button,
		ButtonGroup,
		Input,
		Label,
		Modal,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		TableSearch,
		ImagePlaceholder
	} from 'flowbite-svelte';
	import { PlusOutline, DeleteRowOutline, ExclamationCircleOutline } from 'flowbite-svelte-icons';

	// --- State ---
	let categories = $state<Category[]>([]);
	let rootCategories = $state<string[]>([]);
	let searchTerm = $state('');

	let filteredCategories = $derived.by(() =>
		categories.filter(
			(c) =>
				!searchTerm ||
				c.name[Language.English].toLowerCase().includes(searchTerm.toLowerCase()) ||
				c.rootCategory.toLowerCase().includes(searchTerm.toLowerCase())
		)
	);

	// --- New category modal ---
	let newModalOpen = $state(false);
	let newCategory = $state<{
		name: { English: string; Dutch: string };
		rootCategory: string;
		imgUrl: string;
	}>({
		name: { English: '', Dutch: '' },
		rootCategory: '',
		imgUrl: ''
	});
	let newImageError = $state(false);

	// --- Delete modal ---
	let deleteModalOpen = $state(false);
	let deletingCategory = $state<Category | null>(null);
	let moveToId = $state<number>(0);

	// --- Load ---
	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		categories = (await apiFetch('/category')) as Category[];
		rootCategories = (await apiFetch('/category/root')) as string[];
	}

	function openNew() {
		newCategory = {
			name: { English: '', Dutch: '' },
			rootCategory: rootCategories[0] ?? '',
			imgUrl: ''
		};
		newImageError = false;
		newModalOpen = true;
	}

	async function handleNewImageUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		const formData = new FormData();
		formData.append('image', file);
		try {
			const imageId = await apiUpload('/image', formData);
			newCategory.imgUrl = getImageUrl(imageId);
			newImageError = false;
		} catch (err) {
			console.error('[Upload] Failed:', err);
			newImageError = true;
		}
	}

	async function handleEditImageUpload(event: Event, cat: Category) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		const formData = new FormData();
		formData.append('image', file);
		try {
			const imageId = await apiUpload('/image', formData);
			cat.imgUrl = getImageUrl(imageId);
			await apiAdd(
				`/category/${cat.id}`,
				{
					name: cat.name,
					rootCategory: cat.rootCategory,
					imgUrl: cat.imgUrl
				},
				'PUT'
			);
			categories = categories;
		} catch (err) {
			console.error('[Upload] Failed:', err);
		}
	}

	async function createCategory() {
		try {
			await apiAdd(
				'/category',
				{
					name: newCategory.name,
					rootCategory: newCategory.rootCategory,
					imgUrl: newCategory.imgUrl
				},
				'POST'
			);
			newModalOpen = false;
			await loadData();
		} catch (err: any) {
			console.error('[Rij62] Failed to create category:', err.message);
		}
	}

	function openDelete(cat: Category) {
		deletingCategory = cat;
		moveToId = categories.find((c) => c.id !== cat.id)?.id ?? 0;
		deleteModalOpen = true;
	}

	async function deleteCategory() {
		if (!deletingCategory) return;
		try {
			await apiDelete(`/category/${deletingCategory.id}?moveProducts=${moveToId}`);
			deleteModalOpen = false;
			await loadData();
		} catch (err: any) {
			console.error('[Rij62] Failed to delete category:', err.message);
		}
	}
</script>

<div class="mx-auto max-w-7xl p-8">
	<div class="mb-12 text-center">
		<Heading tag="h1" class="mb-4 text-3xl font-extrabold md:text-5xl lg:text-6xl">
			Take
			<Span class="text-highlight">Control</Span>
			of Your Categories
		</Heading>
	</div>

	<div class="flex justify-center p-3">
		<ButtonGroup>
			<Button color="primary" onclick={openNew}>
				<PlusOutline class="me-2 h-4 w-4" />
				Add Category
			</Button>
		</ButtonGroup>
	</div>

	<div class="border-main overflow-hidden rounded-xl border shadow-lg select-none">
		<Table striped class="w-full">
			<TableSearch placeholder="Search by name" bind:inputValue={searchTerm}>
				<TableHead>
					<TableHeadCell>Image</TableHeadCell>
					<TableHeadCell class="text-left">Name (EN)</TableHeadCell>
					<TableHeadCell>Name (NL)</TableHeadCell>
					<TableHeadCell>Root Category</TableHeadCell>
					<TableHeadCell class="text-right">Actions</TableHeadCell>
				</TableHead>

				<TableBody>
					{#each filteredCategories as cat (cat.id)}
						<TableBodyRow class="transition hover:bg-400">
							<!-- Image -->
							<TableBodyCell class="w-16">
								{#if cat.imgUrl}
									<img
										src={cat.imgUrl}
										alt={cat.name[Language.English]}
										class="border-main h-10 w-10 rounded-lg border object-cover"
										onerror={(e) => (e.currentTarget.style.display = 'none')}
									/>
								{:else}
									<div class="border-main h-10 w-10 rounded-lg border bg-100"></div>
								{/if}
							</TableBodyCell>

							<!-- English name -->
							<TableBodyCell>
								<Input
									class="border-main w-44 bg-50"
									value={cat.name[Language.English]}
									onblur={async (e) => {
										cat.name[Language.English] = e.currentTarget.value;
										await apiAdd(
											`/category/${cat.id}`,
											{
												name: cat.name,
												rootCategory: cat.rootCategory,
												imgUrl: cat.imgUrl ?? ''
											},
											'PUT'
										);
									}}
								/>
							</TableBodyCell>

							<!-- Dutch name -->
							<TableBodyCell>
								<Input
									class="border-main w-44 bg-50"
									value={cat.name[Language.Dutch]}
									onblur={async (e) => {
										cat.name[Language.Dutch] = e.currentTarget.value;
										await apiAdd(
											`/category/${cat.id}`,
											{
												name: cat.name,
												rootCategory: cat.rootCategory,
												imgUrl: cat.imgUrl ?? ''
											},
											'PUT'
										);
									}}
								/>
							</TableBodyCell>

							<!-- Root category -->
							<TableBodyCell>
								<select
									class="border-main text-main rounded-lg border bg-50 p-2 text-sm"
									value={cat.rootCategory}
									onchange={async (e) => {
										cat.rootCategory = e.currentTarget.value;
										await apiAdd(
											`/category/${cat.id}`,
											{
												name: cat.name,
												rootCategory: cat.rootCategory,
												imgUrl: cat.imgUrl ?? ''
											},
											'PUT'
										);
									}}
								>
									{#each rootCategories as root}
										<option value={root}>{root}</option>
									{/each}
								</select>
							</TableBodyCell>

							<!-- Actions -->
							<TableBodyCell class="text-right">
								<div class="flex items-center justify-end gap-2">
									<label
										class="border-main text-muted cursor-pointer rounded-lg border bg-50 px-2 py-1 text-xs transition hover:bg-100"
									>
										Upload image
										<input
											type="file"
											accept="image/*"
											class="hidden"
											onchange={(e) => handleEditImageUpload(e, cat)}
										/>
									</label>
									<Button size="xs" variant="ghost" onclick={() => openDelete(cat)}>
										<DeleteRowOutline class="h-4 w-4" />
									</Button>
								</div>
							</TableBodyCell>
						</TableBodyRow>
					{/each}
				</TableBody>
			</TableSearch>
		</Table>
	</div>
</div>

<!-- New Category Modal -->
<Modal form bind:open={newModalOpen} size="sm" transition={slide} permanent>
	<div class="space-y-5">
		<h3 class="text-main text-lg font-semibold">New Category</h3>

		<div class="grid gap-4 md:grid-cols-2">
			<div>
				<Label>Name (English)</Label>
				<Input class="border-main bg-50" bind:value={newCategory.name.English} />
			</div>
			<div>
				<Label>Name (Dutch)</Label>
				<Input class="border-main bg-50" bind:value={newCategory.name.Dutch} />
			</div>
		</div>

		<div>
			<Label>Root Category</Label>
			<select
				class="border-main text-main w-full rounded-lg border bg-50 p-2"
				bind:value={newCategory.rootCategory}
			>
				{#each rootCategories as root}
					<option value={root}>{root}</option>
				{/each}
			</select>
		</div>

		<div>
			<Label>Image</Label>
			<div class="mt-2 flex items-center gap-4">
				{#if newCategory.imgUrl && !newImageError}
					<img
						src={newCategory.imgUrl}
						alt="preview"
						class="border-main h-16 w-16 rounded-lg border object-cover"
						onerror={() => (newImageError = true)}
					/>
				{:else}
					<div
						class="border-main flex h-16 w-16 items-center justify-center rounded-lg border bg-100"
					>
						<span class="text-muted text-xs">No img</span>
					</div>
				{/if}
				<input
					type="file"
					accept="image/*"
					onchange={handleNewImageUpload}
					class="text-muted block text-sm"
				/>
			</div>
		</div>

		<div class="flex justify-end gap-3">
			<Button type="button" color="primary" onclick={createCategory}>Create</Button>
			<Button type="button" variant="ghost" onclick={() => (newModalOpen = false)}>Cancel</Button>
		</div>
	</div>
</Modal>

<!-- Delete Modal -->
<Modal form bind:open={deleteModalOpen} size="xs" transition={slide} permanent>
	{#if deletingCategory}
		<div class="text-center">
			<ExclamationCircleOutline class="text-muted mx-auto mb-4 h-12 w-12" />
			<h3 class="text-main mb-5 text-lg font-normal">
				Are you sure you want to delete <strong>{deletingCategory.name[Language.English]}</strong>?
			</h3>
			<div class="mb-5">
				<Label>Move products to</Label>
				<select
					class="border-main text-main w-full rounded-lg border bg-50 p-2"
					bind:value={moveToId}
				>
					{#each categories.filter((c) => c.id !== deletingCategory!.id) as cat}
						<option value={cat.id}>{cat.name[Language.English]}</option>
					{/each}
				</select>
			</div>
			<div class="flex justify-center gap-3">
				<Button
					type="button"
					color="primary"
					onclick={() => {
						deleteCategory();
						deleteModalOpen = false;
					}}
				>
					Yes, delete
				</Button>
				<Button type="button" variant="ghost" onclick={() => (deleteModalOpen = false)}
					>Cancel</Button
				>
			</div>
		</div>
	{/if}
</Modal>
