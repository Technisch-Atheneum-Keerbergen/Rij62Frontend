<script lang="ts">
	import { onMount } from 'svelte';
	import { apiFetch } from '$lib/api/client';
	import {
		Button,
		Img,
		Input,
		Label,
		Modal,
		P,
		Spinner,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import { QrCodeOutline, TrashBinSolid } from 'flowbite-svelte-icons';

	const isServerRunning = import.meta.env.VITE_SERVER_RUNNING === 'true';

	/* ================= STATE ================= */

	let tablers: Tabler[] = $state([]);
	let loading = $state(true);

	let addTableModalIsOpen = $state(false);
	let tableNumber: number = $state(1);

	let sortedTables = $derived.by(() => [...tablers].sort((a, b) => a.number - b.number));

	/* ================= CLASS ================= */

	class Tabler {
		id: number;
		number: number;

		removeModalIsOpen = $state(false);
		QRCodeModalIsOpen = $state(false);
		isRemoving = $state(false);

		constructor(id: number, number: number) {
			this.id = id;
			this.number = number;
		}

		getQRCodeURL(): string {
			return `https://public-api.qr-code-generator.com/v1/create/extended?image_format=PNG&qr_code_text=http://localhost:5173/?table=${this.number}`;
		}

		async remove() {
			if (!isServerRunning) {
				tablers = tablers.filter((t) => t.id !== this.id);
				return;
			}

			this.isRemoving = true;

			try {
				await apiFetch(`/tables/${this.id}`, { method: 'DELETE' });
				tablers = tablers.filter((t) => t.id !== this.id);
			} catch (err) {
				alert('Failed to delete table');
			}

			this.isRemoving = false;
		}
	}

	/* ================= API ================= */

	async function getTablers(): Promise<Tabler[]> {
		if (!isServerRunning) {
			return [new Tabler(1, 1), new Tabler(2, 2), new Tabler(3, 3)];
		}

		try {
			const response = await apiFetch('/tables');

			return response.map(
				(t: { id: number; tableNumber: number }) => new Tabler(t.id, t.tableNumber)
			);
		} catch {
			return [];
		}
	}

	async function loadData() {
		loading = true;
		tablers = await getTablers();
		loading = false;
	}

	async function addTable(number: number) {
		if (!isServerRunning) {
			tablers = [...tablers, new Tabler(Date.now(), number)];
			return true;
		}

		try {
			const response = await apiFetch('/tables', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ tableNumber: number })
			});

			if (!response.id) return false;

			tablers = [...tablers, new Tabler(response.id, number)];
			return true;
		} catch {
			return false;
		}
	}

	/* ================= LIFECYCLE ================= */

	onMount(loadData);
</script>

<div class="flex">
	<Button class="mr-0 mb-2  ml-auto justify-self-end" onclick={() => (addTableModalIsOpen = true)}
		>Add table</Button
	>

	<Modal
		title="Add new table"
		onaction={async ({ action }) => {
			if (action === 'success') {
				tableNumber++;
				if (!(await addTable(tableNumber))) {
					alert('Failed to create table');
				}
			}
		}}
		form
		bind:open={addTableModalIsOpen}
	>
		<div class="space-y-2">
			<Label for="tablenumber">Table number</Label>
			<Input
				id="tablenumber"
				type="number"
				bind:value={tableNumber}
				placeholder="Enter table number"
			/>
		</div>

		{#snippet footer()}
			<Button type="submit" value="success" color="primary">Add</Button>
			<Button type="submit" value="decline" color="alternative">Close</Button>
		{/snippet}
	</Modal>
</div>
<div class="overflow-hidden rounded-xl">
	<Table class="w-full">
		<TableHead class="bg-200">
			<TableHeadCell class="text-main bg-300">Tablenumber</TableHeadCell>
			<TableHeadCell class="text-main bg-300">QR code</TableHeadCell>
			<TableHeadCell class="text-main bg-300">Remove</TableHeadCell>
		</TableHead>
		<TableBody>
			{#if loading}
				<TableBodyRow>
					<TableBodyCell colspan={3} class="text-muted bg-200 py-6 text-center">
						<Spinner class="mx-auto mb-2" />
						Loading tables...
					</TableBodyCell>
				</TableBodyRow>
			{:else if sortedTables.length === 0}
				<TableBodyRow>
					<TableBodyCell colspan={3} class="text-muted bg-200 py-6 text-center"
						>No tables found</TableBodyCell
					>
				</TableBodyRow>
			{:else}
				{#each sortedTables as tabler (tabler.id)}
					<TableBodyRow class="bg-200">
						<TableBodyCell class="text-muted bg-200 font-semibold">{tabler.number}</TableBodyCell>
						<TableBodyCell class="bg-200">
							<Button
								class="cursor-pointer"
								onclick={() => {
									tabler.QRCodeModalIsOpen = true;
								}}
							>
								<QrCodeOutline></QrCodeOutline>
								<Modal
									title="QR Code for table {tabler.number}"
									form
									bind:open={tabler.QRCodeModalIsOpen}
								>
									<Img class="rounded-2xl" src={tabler.getQRCodeURL()}></Img>
									{#snippet footer()}
										<Button type="submit" value="decline" color="alternative">Close</Button>
									{/snippet}
								</Modal>
							</Button>
						</TableBodyCell>
						<TableBodyCell class="bg-200">
							<Button
								class="cursor-pointer"
								onclick={() => {
									tabler.removeModalIsOpen = true;
								}}
							>
								<div class="h-4 max-h-4">
									{#if tabler.isRemoving}
										<Spinner class="h-full w-4 max-w-4"></Spinner>
									{:else}
										<TrashBinSolid class="h-full max-h-full w-4 max-w-4"></TrashBinSolid>
									{/if}
								</div>
							</Button>
							<Modal
								title="Remove table {tabler.number}"
								form
								bind:open={tabler.removeModalIsOpen}
								onaction={async ({ action }) => {
									if (action == 'success') {
										await tabler.remove();
									}
								}}
							>
								<P>Are you sure you want to remove table {tabler.number}?</P>
								{#snippet footer()}
									<Button type="submit" value="decline" color="alternative">Cancel</Button>

									<Button type="submit" value="success" color="red">Remove</Button>
								{/snippet}
							</Modal>
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			{/if}
		</TableBody>
	</Table>
</div>
