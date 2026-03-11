<script lang="ts">
	import {
		Button,
		Img,
		Modal,
		P,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import { QrCodeOutline, TrashBinSolid } from 'flowbite-svelte-icons';

	let currentLanguage: string = 'EN';

	// Using Tabler (TableRij62) makes it different from just normal tables because this might get confusing otherwise

	class Tabler {
		id: Number; // Isn't used for now, could be useful when renaming tableNumbers in future
		number: Number;
		removeModalIsOpen: boolean = $state(false);
		QRCodeModalIsOpen: boolean = $state(false);

		constructor(id: Number, tableNumber: Number) {
			this.id = id;
			this.number = tableNumber;
		}
		getQRCodeURL(): string {
			return `https://public-api.qr-code-generator.com/v1/create/extended?image_format=PNG&qr_code_text=http%3A%2F%2Flocalhost%3A5173%2F%3Ftable%3D${this.number}`;
		}
		remove() {
			alert('removing table...');
			// Use the id to remove table on the table endpoint
		}
	}

	function getTablers(): Tabler[] {
		// Must fetch if future
		let tablers: Tabler[] = [new Tabler(1, 1), new Tabler(2, 2), new Tabler(4, 3)];
		return tablers;
	}

	let tablers: Tabler[] = getTablers();
</script>

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
							<TrashBinSolid></TrashBinSolid>
							<Modal
								title="Remove table {tabler.number}"
								form
								bind:open={tabler.removeModalIsOpen}
								onaction={({ action }) => {
									if (action == 'success') {
										tabler.remove();
									}
								}}
							>
								<P>Are you sure you want to remove table {tabler.number}?</P>
								{#snippet footer()}
									<Button type="submit" value="decline" color="alternative">Cancel</Button>

									<Button type="submit" value="success" color="red">Remove</Button>
								{/snippet}
							</Modal>
						</Button>
					</TableBodyCell>
				</TableBodyRow>
			{/each}
		</TableBody>
	</Table>
</div>
