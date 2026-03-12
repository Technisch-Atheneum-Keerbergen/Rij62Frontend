<script lang="ts">
	import {
		Button,
		Img,
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

	let currentLanguage: string = 'EN';
	let serverDomain = 'http://localhost:5148';

	// Using Tabler (TableRij62) makes it different from just normal tables because this might get confusing otherwise

	class Tabler {
		id: Number;
		number: Number;
		removeModalIsOpen: boolean = $state(false);
		QRCodeModalIsOpen: boolean = $state(false);
		isRemoving: boolean = $state(false);
		toastActive: boolean = $state(false);

		constructor(id: Number, tableNumber: Number) {
			this.id = id;
			this.number = tableNumber;
		}
		getQRCodeURL(): string {
			return `https://public-api.qr-code-generator.com/v1/create/extended?image_format=PNG&qr_code_text=http%3A%2F%2Flocalhost%3A5173%2F%3Ftable%3D${this.number}`;
		}

		async remove() {
			this.isRemoving = true;
			try {
				const response = await fetch(serverDomain + '/api/table/' + this.id, {
					method: 'DELETE'
				});
				if (response.ok) {
					tablers = tablers.filter((tabler) => {
						return tabler.id != this.id;
					});
				} else {
					this.toastActive = true;
				}
			} catch (error) {
				this.toastActive = true;
			}
			this.isRemoving = false;
		}
	}
	let tablers: Tabler[] = $state(getTablers());
	function getTablers(): Tabler[] {
		// Must fetch if future
		let tablers: Tabler[] = [new Tabler(1, 1), new Tabler(2, 2), new Tabler(4, 3)];
		return tablers;
	}

	let addTableModalIsOpen = $state(false);
	async function addTable(tableNumber: Number) {
		tablers.push(new Tabler(4, tableNumber));
		try {
			const response = await fetch(serverDomain + '/api/tables', {
				method: 'POST'
			});
			if (response.ok) {
			}
			await response.json();
		} catch (error) {}
	}
</script>

<div>
	<Button></Button>
	<Modal
		title="Add new table"
		onaction={async ({ action }) => {
			if (action == 'success') {
				await addTable;
			}
		}}
		form
		bind:open={addTableModalIsOpen}
	>
		{#snippet footer()}
			<Button type="submit" value="success" color="primary">Remove</Button>
			<Button type="submit" value="decline" color="alternative">Close</Button>
		{/snippet}
	</Modal>
</div>
<div class="overflow-hidden rounded-xl">
	<Table class="w-full">
		<TableHead>
			<TableHeadCell>TableNumber</TableHeadCell>
			<TableHeadCell>QR code</TableHeadCell>
			<TableHeadCell>Remove</TableHeadCell>
		</TableHead>

		<TableBody>
			{#each tablers as tabler}
				<TableBodyRow>
					<TableBodyCell class="font-semibold">{tabler.number}</TableBodyCell>
					<TableBodyCell>
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
								<Img src={tabler.getQRCodeURL()}></Img>
								{#snippet footer()}
									<Button type="submit" value="decline" color="alternative">Close</Button>
								{/snippet}
							</Modal>
						</Button>
					</TableBodyCell>
					<TableBodyCell>
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
