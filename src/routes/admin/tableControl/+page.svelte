<script lang="ts">
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
	import { onMount } from 'svelte';

	const isServerRunning = import.meta.env.VITE_SERVER_RUNNING === 'true';
	// Using Tabler (TableRij62) makes it different from just normal tables because this might get confusing otherwise

	class Tabler {
		id: number;
		number: number;
		removeModalIsOpen: boolean = $state(false);
		QRCodeModalIsOpen: boolean = $state(false);
		isRemoving: boolean = $state(false);
		toastActive: boolean = $state(false);

		constructor(id: number, tablenumber: number) {
			this.id = id;
			this.number = tablenumber;
		}
		getQRCodeURL(): string {
			return `https://public-api.qr-code-generator.com/v1/create/extended?image_format=PNG&qr_code_text=http%3A%2F%2Flocalhost%3A5173%2F%3Ftable%3D${this.number}`;
		}

		async remove() {
			if (!isServerRunning) {
				tablers = tablers.filter((tabler) => {
					return tabler.id != this.id;
				});
				console.log(tablers);
				return;
			}

			this.isRemoving = true;
			try {
				const response = await apiFetch('/tables/' + this.id, {
					method: 'DELETE'
				});
				if (response.ok) {
					tablers = tablers.filter((tabler) => {
						return tabler.id != this.id;
					});
				} else {
					this.toastActive = true;
					alert('Something went wrong: ' + response.status);
				}
			} catch (error) {
				this.toastActive = true;
				alert('Something went wrong: ' + error);
			}
			this.isRemoving = false;
		}
	}
	let tablers: Tabler[] = $state([]);

	onMount(() => {
		loadData();
	});

	async function loadData() {
		tablers = await getTablers();
	}

	async function getTablers(): Promise<Tabler[]> {
		if (!isServerRunning) {
			let tablers: Tabler[] = [new Tabler(1, 1), new Tabler(2, 2), new Tabler(4, 3)];
			return tablers;
		}

		try {
			const response = await apiFetch('/tables');
			if (!response.ok) return [];

			interface TablerData {
				id: number;
				number: number;
			}

			let json = (await response.json()) as TablerData[];

			return Object.values(json).map((tablerData: TablerData) => {
				return new Tabler(tablerData.id, tablerData.number);
			});
		} catch (error) {
			return [];
		}
	}

	let addTableModalIsOpen = $state(false);
	async function addTable(tableNumber: number) {
		if (!isServerRunning) {
			tablers.push(new Tabler(4, tableNumber));
			return true;
		}

		try {
			const response = await apiFetch('/tables', {
				method: 'POST',
				body: JSON.stringify({
					tableNumber: tableNumber
				})
			});

			if (!response.ok) return false;

			let json = await response.json();
			if (!json.tableId) return false;

			tablers.push(new Tabler(json.tableID, tableNumber));
		} catch (error) {
			return false;
		}
		return true;
	}

	let tableNumber: number = $state(0);
</script>

<div class="flex">
	<Button class="mr-0 mb-2  ml-auto justify-self-end" onclick={() => (addTableModalIsOpen = true)}
		>Add table</Button
	>

	<Modal
		title="Add new table"
		onaction={async ({ action }) => {
			if (action === 'success') {
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
			{#each tablers as tabler (tabler)}
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
		</TableBody>
	</Table>
</div>
