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
		products: number[];
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
		const data = await apiFetch('/menuPreset');

		presets = data.map((p: any) => ({
			...p,
			// convert product objects → id array
			products: (p.products ?? []).map((prod: any) => prod.id)
		}));

		products = await apiFetch('/product');
	}

	function openNew() {
		newPreset = { name: '', repeat: [], enabled: true };
		newModalOpen = true;
	}

	async function createPreset() {
		try {
			await apiAdd(
				'/menuPreset',
				{
					name: newPreset.name,
					repeat: newPreset.repeat,
					enabled: newPreset.enabled,
					products: []
				},
				'POST'
			);

			newModalOpen = false;
			await loadData();
		} catch (err: any) {
			console.error('Failed to create preset:', err.message);
		}
	}

	async function savePreset(preset: MenuPreset) {
		try {
			await apiAdd(
				`/menuPreset/${preset.id}`,
				{
					name: preset.name,
					repeat: preset.repeat,
					enabled: preset.enabled
				},
				'PUT'
			);
		} catch (err: any) {
			console.error('Failed to save preset:', err.message);
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
			await apiDelete(`/menuPreset/${deletingPreset.id}`);

			deleteModalOpen = false;
			await loadData();
		} catch (err) {
			console.error('Failed to delete preset:', err);
		}
	}
	async function toggleProductInPreset(product: Product, presetId: number) {
		const preset = presets.find((p) => p.id === presetId);
		if (!preset) return;

		const isInPreset = preset.products.includes(product.id);

		const updatedProducts = isInPreset
			? preset.products.filter((id) => id !== product.id)
			: [...preset.products, product.id];

		// optimistic update
		preset.products = updatedProducts;
		presets = [...presets];

		try {
			await apiAdd(
				`/menuPreset/${presetId}`,
				{
					name: preset.name,
					repeat: preset.repeat,
					enabled: preset.enabled,
					products: updatedProducts
				},
				'PUT'
			);
		} catch (err) {
			console.error(err);
			await loadData();
		}
	}

	function productInPreset(preset: MenuPreset, product: Product): boolean {
		return preset.products.includes(product.id);
	}
</script>

<div class="mx-auto max-w-7xl p-8">
	<div class="mb-12 text-center">
		<Heading tag="h1" class="mb-4 text-3xl font-extrabold md:text-5xl lg:text-6xl">
			Take <Span class="text-highlight">Control</Span> of Your Menu Presets
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
					<TableHeadCell>Name</TableHeadCell>
					<TableHeadCell>Active Days</TableHeadCell>
					<TableHeadCell>Enabled</TableHeadCell>
					<TableHeadCell class="text-right">Actions</TableHeadCell>
				</TableHead>

				<TableBody>
					{#each filteredPresets as preset (preset.id)}
						<TableBodyRow
							class="cursor-pointer"
							onclick={() => (expandedId = expandedId === preset.id ? null : preset.id)}
						>
							<TableBodyCell>
								<Input
									class="w-48"
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
											class={preset.repeat.includes(day)
												? 'rounded-full bg-primary-500 px-2 text-xs text-white'
												: 'rounded-full border px-2 text-xs'}
										>
											{day.slice(0, 3)}
										</button>
									{/each}
								</div>
							</TableBodyCell>

							<TableBodyCell>
								<Toggle
									checked={preset.enabled}
									onchange={async () => {
										preset.enabled = !preset.enabled;
										await savePreset(preset);
									}}
								/>
							</TableBodyCell>

							<TableBodyCell class="text-right">
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
							</TableBodyCell>
						</TableBodyRow>

						{#if expandedId === preset.id}
							<TableBodyRow>
								<TableBodyCell colspan={4}>
									<div transition:slide class="space-y-3 p-6">
										<h4 class="font-semibold">Products</h4>

										<div class="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
											{#each products as product (product.id)}
												<button
													type="button"
													onclick={() => toggleProductInPreset(product, preset.id)}
													class={productInPreset(preset, product)
														? 'w-full rounded-lg border bg-green-100 p-3 transition hover:bg-green-200'
														: 'w-full rounded-lg border p-3 transition hover:bg-gray-100'}
												>
													<div class="flex items-center justify-between">
														<div class="text-left font-semibold">
															{product.title[Language.English]}
														</div>

														<Badge color={productInPreset(preset, product) ? 'green' : 'dark'}>
															{productInPreset(preset, product) ? 'In preset' : 'Not in preset'}
														</Badge>
													</div>
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
<Modal bind:open={newModalOpen} size="sm" transition={slide}>
	<div class="space-y-4">
		<h3 class="text-lg font-semibold">New Menu Preset</h3>

		<div>
			<Label>Name</Label>
			<Input bind:value={newPreset.name} />
		</div>

		<div>
			<Label>Days</Label>
			<div class="flex flex-wrap gap-2">
				{#each DAYS as day}
					<button
						type="button"
						onclick={() => (newPreset.repeat = toggleDay(newPreset.repeat, day))}
						class={newPreset.repeat.includes(day)
							? 'rounded-full bg-primary-500 px-3 text-white'
							: 'rounded-full border px-3'}
					>
						{day}
					</button>
				{/each}
			</div>
		</div>

		<div class="flex items-center gap-2">
			<Toggle bind:checked={newPreset.enabled} />
			<Label>Enabled</Label>
		</div>

		<div class="flex justify-end gap-2">
			<Button onclick={createPreset}>Create</Button>
			<Button variant="ghost" onclick={() => (newModalOpen = false)}>Cancel</Button>
		</div>
	</div>
</Modal>

<!-- Delete Modal -->
<Modal bind:open={deleteModalOpen} size="xs" transition={slide}>
	{#if deletingPreset}
		<div class="space-y-4 text-center">
			<ExclamationCircleOutline class="mx-auto h-10 w-10" />
			<p>Delete <b>{deletingPreset.name}</b>?</p>

			<div class="flex justify-center gap-2">
				<Button
					onclick={() => {
						deletePreset();
						deleteModalOpen = false;
					}}
				>
					Delete
				</Button>
				<Button variant="ghost" onclick={() => (deleteModalOpen = false)}>Cancel</Button>
			</div>
		</div>
	{/if}
</Modal>
