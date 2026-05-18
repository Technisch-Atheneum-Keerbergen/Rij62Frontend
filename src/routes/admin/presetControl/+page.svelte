<script lang="ts">
	import { apiFetch, apiAdd, apiDelete } from '$lib/api/client';
	import { Language } from '$lib/api/types/multilangstring';
	import type { Product } from '$lib/api/types/product';
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
		Toggle,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		TableSearch,
		Badge
	} from 'flowbite-svelte';
	import { PlusOutline, DeleteRowOutline, ExclamationCircleOutline } from 'flowbite-svelte-icons';

	type MenuPreset = {
		id: number;
		name: string;
		repeat: string[];
		enabled: boolean;
	};

	const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

	let presets = $state<MenuPreset[]>([]);
	let products = $state<Product[]>([]);
	let searchTerm = $state('');
	let expandedId = $state<number | null>(null);

	let filteredPresets = $derived.by(() =>
		presets.filter((p) => !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()))
	);

	let newModalOpen = $state(false);
	let newPreset = $state<{ name: string; repeat: string[]; enabled: boolean }>({
		name: '',
		repeat: [],
		enabled: true
	});

	let deleteModalOpen = $state(false);
	let deletingPreset = $state<MenuPreset | null>(null);

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		[presets, products] = await Promise.all([
			apiFetch('/menuPreset') as Promise<MenuPreset[]>,
			apiFetch('/product') as Promise<Product[]>
		]);
		console.log('[Rij62] products[0]:', products[0]); // check what fields come back
	}

	function openNew() {
		newPreset = { name: '', repeat: [], enabled: true };
		newModalOpen = true;
	}

	async function createPreset() {
		try {
			await apiAdd(
				'/menuPreset',
				{ Name: newPreset.name, Repeat: newPreset.repeat, Enabled: newPreset.enabled },
				'POST'
			);
			newModalOpen = false;
			await loadData();
		} catch (err: any) {
			console.error('[Rij62] Failed to create preset:', err.message);
		}
	}

	async function savePreset(preset: MenuPreset) {
		try {
			await apiAdd(
				`/menuPreset/${preset.id}`,
				{ Name: preset.name, Repeat: preset.repeat, Enabled: preset.enabled },
				'PUT'
			);
		} catch (err: any) {
			console.error('[Rij62] Failed to save preset:', err.message);
		}
	}

	function toggleDay(repeat: string[], day: string): string[] {
		return repeat.includes(day) ? repeat.filter((d) => d !== day) : [...repeat, day];
	}

	function openDelete(preset: MenuPreset) {
		deletingPreset = preset;
		deleteModalOpen = true;
	}

	async function deletePreset() {
		if (!deletingPreset) return;
		try {
			for (const p of products.filter((p) => p.menuPresetId === deletingPreset!.id)) {
				await apiAdd(
					`/product/${p.id}`,
					{
						title: p.title,
						description: p.description,
						price: p.price,
						btw: p.btw,
						stock: p.stock,
						isAvailable: p.isAvailable,
						imgURL: p.imgURL,
						categoryId: p.categoryId,
						MenuPresetId: null
					},
					'PUT'
				);
			}
			await apiDelete(`/menuPreset/${deletingPreset.id}`);
			deleteModalOpen = false;
			await loadData();
		} catch (err: any) {
			console.error('[Rij62] Failed to delete preset:', err.message);
		}
	}

	async function toggleProductInPreset(product: Product, presetId: number) {
		const newPresetId = product.menuPresetId === presetId ? null : presetId;
		try {
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
					categoryId: product.categoryId,
					MenuPresetId: newPresetId
				},
				'PUT'
			);
			product.menuPresetId = newPresetId;
			products = products;
		} catch (err: any) {
			console.error('[Rij62] Failed to update product preset:', err.message);
		}
	}
</script>

<div class="mx-auto max-w-7xl p-8">
	<div class="mb-12 text-center">
		<Heading tag="h1" class="mb-4 text-3xl font-extrabold md:text-5xl lg:text-6xl">
			Take
			<Span class="text-highlight">Control</Span>
			of Your Menu Presets
		</Heading>
	</div>

	<div class="flex justify-center p-3">
		<ButtonGroup>
			<Button color="primary" onclick={openNew}>
				<PlusOutline class="me-2 h-4 w-4" />
				Add Preset
			</Button>
		</ButtonGroup>
	</div>

	<div class="border-main overflow-hidden rounded-xl border shadow-lg select-none">
		<Table striped class="w-full">
			<TableSearch placeholder="Search by name" bind:inputValue={searchTerm}>
				<TableHead>
					<TableHeadCell class="text-left">Name</TableHeadCell>
					<TableHeadCell>Active Days</TableHeadCell>
					<TableHeadCell>Enabled</TableHeadCell>
					<TableHeadCell class="text-right">Actions</TableHeadCell>
				</TableHead>

				<TableBody>
					{#each filteredPresets as preset (preset.id)}
						<TableBodyRow
							class="cursor-pointer transition hover:bg-400"
							onclick={() => (expandedId = expandedId === preset.id ? null : preset.id)}
						>
							<TableBodyCell>
								<Input
									class="border-main w-48 bg-50"
									value={preset.name}
									onclick={(e) => e.stopPropagation()}
									onblur={async (e) => {
										preset.name = e.currentTarget.value;
										await savePreset(preset);
									}}
								/>
							</TableBodyCell>

							<TableBodyCell>
								<div class="flex flex-wrap gap-1">
									{#each DAYS as day}
										<button
											type="button"
											onclick={async (e) => {
												e.stopPropagation();
												preset.repeat = toggleDay(preset.repeat, day);
												await savePreset(preset);
											}}
											class="rounded-full px-2 py-0.5 text-xs font-semibold transition
												{preset.repeat.includes(day) ? 'bg-primary-500 text-white' : 'border-main text-muted border bg-50'}"
										>
											{day.slice(0, 3)}
										</button>
									{/each}
								</div>
							</TableBodyCell>

							<TableBodyCell>
								<Toggle
									checked={preset.enabled}
									onclick={(e) => e.stopPropagation()}
									onchange={async () => {
										preset.enabled = !preset.enabled;
										await savePreset(preset);
									}}
								/>
							</TableBodyCell>

							<TableBodyCell class="text-right">
								<div class="flex justify-end gap-2">
									<Button
										size="xs"
										variant="ghost"
										onclick={(e) => {
											e.stopPropagation();
											openDelete(preset);
										}}
									>
										<DeleteRowOutline class="h-4 w-4" />
									</Button>
								</div>
							</TableBodyCell>
						</TableBodyRow>

						{#if expandedId === preset.id}
							<TableBodyRow>
								<TableBodyCell colspan={4} class="bg-100 p-0">
									<div transition:slide class="space-y-3 p-6">
										<h4 class="text-main text-sm font-semibold">Products in this preset</h4>
										<p class="text-muted text-xs">
											Toggled products will only show when this preset is active.
										</p>

										<div class="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
											{#each products as product (product.id)}
												<button
													type="button"
													onclick={() => toggleProductInPreset(product, preset.id)}
													class="border-main flex items-center justify-between rounded-lg border p-3 text-left transition
														{product.menuPresetId === preset.id
														? 'border-primary-500 bg-primary-500/10'
														: 'bg-50 hover:bg-100'}"
												>
													<div>
														<p class="text-main text-sm font-semibold">
															{product.title[Language.English]}
														</p>
														{#if product.menuPresetId !== null && product.menuPresetId !== undefined && product.menuPresetId !== preset.id}
															<p class="text-muted text-xs">In another preset</p>
														{/if}
													</div>
													<Badge color={product.menuPresetId === preset.id ? 'green' : 'dark'}>
														{product.menuPresetId === preset.id ? 'In preset' : 'Not in preset'}
													</Badge>
												</button>
											{/each}
										</div>
									</div>
								</TableBodyCell>
							</TableBodyRow>
						{/if}
					{/each}
				</TableBody>
			</TableSearch>
		</Table>
	</div>
</div>

<!-- New Preset Modal -->
<Modal form bind:open={newModalOpen} size="sm" transition={slide} permanent>
	<div class="space-y-5">
		<h3 class="text-main text-lg font-semibold">New Menu Preset</h3>

		<div>
			<Label>Name</Label>
			<Input class="border-main bg-50" bind:value={newPreset.name} />
		</div>

		<div>
			<Label>Active Days</Label>
			<div class="mt-2 flex flex-wrap gap-2">
				{#each DAYS as day}
					<button
						type="button"
						onclick={() => (newPreset.repeat = toggleDay(newPreset.repeat, day))}
						class="rounded-full px-3 py-1 text-sm font-semibold transition
							{newPreset.repeat.includes(day)
							? 'bg-primary-500 text-white'
							: 'border-main text-muted border bg-50'}"
					>
						{day}
					</button>
				{/each}
			</div>
		</div>

		<div class="flex items-center gap-3">
			<Toggle bind:checked={newPreset.enabled} />
			<Label>Enabled</Label>
		</div>

		<div class="flex justify-end gap-3">
			<Button type="button" color="primary" onclick={createPreset}>Create</Button>
			<Button type="button" variant="ghost" onclick={() => (newModalOpen = false)}>Cancel</Button>
		</div>
	</div>
</Modal>

<!-- Delete Modal -->
<Modal form bind:open={deleteModalOpen} size="xs" transition={slide} permanent>
	{#if deletingPreset}
		<div class="text-center">
			<ExclamationCircleOutline class="text-muted mx-auto mb-4 h-12 w-12" />
			<h3 class="text-main mb-5 text-lg font-normal">
				Are you sure you want to delete <strong>{deletingPreset.name}</strong>?
			</h3>
			<p class="text-muted mb-5 text-sm">Products in this preset will be unlinked.</p>
			<div class="flex justify-center gap-3">
				<Button
					type="button"
					color="primary"
					onclick={() => {
						deletePreset();
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
