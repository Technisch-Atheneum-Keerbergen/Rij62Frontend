<script lang="ts">
	import { apiFetch, apiAdd, apiDelete } from '$lib/api/client';
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
		Badge,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		TableSearch
	} from 'flowbite-svelte';
	import {
		PlusOutline,
		DeleteRowOutline,
		EditOutline,
		ExclamationCircleOutline
	} from 'flowbite-svelte-icons';

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

	// --- Edit modal ---
	let editModalOpen = $state(false);
	let editingCategory = $state<Category | null>(null);
	let isNew = $state(false);

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
		editingCategory = {
			id: 0,
			name: { English: '', Dutch: '' },
			rootCategory: rootCategories[0] ?? ''
		};
		isNew = true;
		editModalOpen = true;
	}

	function openEdit(cat: Category) {
		editingCategory = structuredClone(cat);
		isNew = false;
		editModalOpen = true;
	}

	async function saveCategory() {
		if (!editingCategory) return;
		try {
			if (isNew) {
				await apiAdd('/category', editingCategory, 'POST');
			} else {
				await apiAdd(
					`/category/${editingCategory.id}`,
					{ name: editingCategory.name, rootCategory: editingCategory.rootCategory },
					'PUT'
				);
			}
			editModalOpen = false;
			await loadData();
		} catch (err: any) {
			console.error('[Rij62] Failed to save category:', err.message);
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
	<!-- Heading -->
	<div class="mb-12 text-center">
		<Heading tag="h1" class="mb-4 text-3xl font-extrabold md:text-5xl lg:text-6xl">
			Take
			<Span class="text-highlight">Control</Span>
			of Your Categories
		</Heading>
	</div>

	<!-- Actions -->
	<div class="flex justify-center p-3">
		<ButtonGroup>
			<Button color="primary" onclick={openNew}>
				<PlusOutline class="me-2 h-4 w-4" />
				Add Category
			</Button>
		</ButtonGroup>
	</div>

	<!-- Table -->
	<div class="border-main overflow-hidden rounded-xl border shadow-lg select-none">
		<Table striped class="w-full">
			<TableSearch placeholder="Search by name" bind:inputValue={searchTerm}>
				<TableHead>
					<TableHeadCell class="text-left">Name</TableHeadCell>
					<TableHeadCell class="text-right">Actions</TableHeadCell>
				</TableHead>

				<TableBody>
					{#each filteredCategories as cat (cat.id)}
						<TableBodyRow class="cursor-pointer transition hover:bg-400">
							<TableBodyCell class="font-semibold">
								<div class="flex items-center gap-2">
									<Input
										class="border-main w-40 bg-50"
										value={cat.name[Language.English]}
										onblur={async (e) => {
											cat.name[Language.English] = e.currentTarget.value;
											await apiAdd(
												`/category/${cat.id}`,
												{
													name: cat.name,
													rootCategory: cat.rootCategory
												},
												'PUT'
											);
										}}
									/>
									<span class="text-muted text-sm">/</span>
									<Input
										class="border-main w-40 bg-50"
										value={cat.name[Language.Dutch]}
										onblur={async (e) => {
											cat.name[Language.Dutch] = e.currentTarget.value;
											await apiAdd(
												`/category/${cat.id}`,
												{
													name: cat.name,
													rootCategory: cat.rootCategory
												},
												'PUT'
											);
										}}
									/>
								</div>
							</TableBodyCell>

							<TableBodyCell class="text-right">
								<div class="flex justify-end gap-2">
									<Button size="xs" color="primary" onclick={() => openEdit(cat)}>
										<EditOutline class="h-4 w-4" />
									</Button>
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

<!-- Edit / Create Modal -->
<Modal form bind:open={editModalOpen} size="sm" transition={slide} permanent>
	{#if editingCategory}
		<div class="space-y-5">
			<h3 class="text-main text-lg font-semibold">
				{isNew ? 'New Category' : 'Edit Category'}
			</h3>

			<div class="grid gap-4 md:grid-cols-2">
				<div>
					<Label>Name (English)</Label>
					<Input class="border-main bg-50" bind:value={editingCategory.name.English} />
				</div>
				<div>
					<Label>Name (Dutch)</Label>
					<Input class="border-main bg-50" bind:value={editingCategory.name.Dutch} />
				</div>
			</div>

			<div>
				<Label>Root Category</Label>
				<select
					class="border-main text-main w-full rounded-lg border bg-50 p-2"
					bind:value={editingCategory.rootCategory}
				>
					{#each rootCategories as root}
						<option value={root}>{root}</option>
					{/each}
				</select>
			</div>

			<div class="flex justify-end gap-3">
				<Button type="button" color="primary" onclick={saveCategory}>Save</Button>
				<Button type="button" variant="ghost" onclick={() => (editModalOpen = false)}>Cancel</Button
				>
			</div>
		</div>
	{/if}
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
