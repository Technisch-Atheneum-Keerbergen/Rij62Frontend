<script lang="ts">
	import { onMount } from 'svelte';
	import { apiCall, apiFetchJson } from '$lib/api/client';
	import {
		Button,
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
	import { TrashBinSolid } from 'flowbite-svelte-icons';
	import type { CreateUserResponse, User } from '$lib/api/types/user';
	import CopyableText from '$lib/components/Misc/CopyableText.svelte';

	/* ================= STATE ================= */

	class RecentlyAddedUserController {
		dialogOpen: boolean;
		linkKeyUrl: string;
		createUserResponse: CreateUserResponse | null;

		constructor() {
			this.dialogOpen = $state(false);
			this.linkKeyUrl = '';
			this.createUserResponse = null;
		}

		onUserAdded(user: CreateUserResponse) {
			this.createUserResponse = user;
			this.linkKeyUrl = getLinkFromLinkKey(user.linkKey);
			this.dialogOpen = true;
		}
	}
	class UserEditController {
		dialogOpen: boolean;
		deleteDialogOpen: boolean;

		displayName: string;
		userId: number;

		constructor() {
			this.dialogOpen = $state(false);
			this.deleteDialogOpen = $state(false);
			this.displayName = $state('');
			this.userId = $state(-1);
		}

		editUser(user: User) {
			this.displayName = user.displayName;
			this.userId = user.id;

			this.dialogOpen = true;
			this.deleteDialogOpen = false;
		}

		deleteUser(user: User) {
			this.editUser(user);
			this.dialogOpen = false;
			this.deleteDialogOpen = true;
		}

		inEditProgress(): boolean {
			return this.userId != -1;
		}

		async applyUserEdit() {
			const result = await updateUser(this.userId, this.displayName);
			if (typeof result == 'string') {
				alert(result);
				return;
			}
			this.endUserEdit();
		}

		endUserEdit() {
			this.dialogOpen = false;
			this.deleteDialogOpen = false;
			this.userId = -1;
		}

		async applyUserDelete() {
			const result = await removeUser(this.userId);
			if (typeof result == 'string') {
				alert(result);
				return;
			}
			this.endUserEdit();
		}
	}

	let recentlyAddedUserController = new RecentlyAddedUserController();
	let userEditController = new UserEditController();

	let users: User[] | null = $state(null);
	let error: string | null = $state(null);

	/* ================= API ================= */

	async function getUsers(): Promise<User[] | string> {
		let users;
		try {
			users = await apiFetchJson<User[]>('/user');
		} catch (e) {
			return (e as Error).toString();
		}
		return users;
	}

	async function addUser(): Promise<CreateUserResponse | string> {
		let response;
		try {
			response = await apiFetchJson<CreateUserResponse>('/user', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ isAdmin: true })
			});
		} catch (e) {
			return (e as Error).toString();
		}
		users?.push(response.user);
		return response;
	}

	async function updateUser(id: number, displayName: string): Promise<null | string> {
		const isAdmin = true; // In the future we may have non admin accounts. So the API already handles that.
		try {
			await apiCall('/user/' + id, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ isAdmin: isAdmin, displayName: displayName })
			});
		} catch (e) {
			return (e as Error).toString();
		}

		if (users) {
			// Update the user in the UI.
			const user = users.find((u) => u.id == id);
			if (user) {
				user.displayName = displayName;
				user.isAdmin = isAdmin;
			}
		}
		return null;
	}

	async function removeUser(id: number): Promise<null | string> {
		try {
			await apiCall('/user/' + id, {
				method: 'DELETE'
			});
		} catch (e) {
			return (e as Error).toString();
		}
		if (users) {
			// Remove the user form the user array so it shows up in the UI.
			users = users.filter((user) => user.id != id);
		}

		return null;
	}

	function getLinkFromLinkKey(linkkey: string): string {
		return `${window.location.origin}/claimKey?key=${linkkey}`;
	}

	onMount(async () => {
		const result = await getUsers();
		if (typeof result == 'string') {
			error = result;
		} else {
			users = result;
		}
	});
</script>

<div class="flex">
	<Button
		class="mr-0 mb-2  ml-auto justify-self-end"
		onclick={async () => {
			const result = await addUser();
			if (typeof result == 'string') {
				alert(result);
			} else {
				recentlyAddedUserController.onUserAdded(result);
			}
		}}>Add new user</Button
	>

	<Modal title="Added user" form bind:open={recentlyAddedUserController.dialogOpen}>
		<p>The folowing link can be clicked by the owner of the new account to activate it.</p>

		<CopyableText value={recentlyAddedUserController.linkKeyUrl}></CopyableText>

		{#snippet footer()}
			<Button type="submit" value="decline" color="alternative">Close</Button>
		{/snippet}
	</Modal>

	<Modal
		title="Edit user"
		form
		bind:open={userEditController.dialogOpen}
		onaction={async ({ action }) => {
			if (action == 'success') {
				await userEditController.applyUserEdit();
			}
			userEditController.endUserEdit();
		}}
	>
		<Label for="DisplayName">Display Name</Label>
		<Input
			id="DisplayName"
			bind:value={userEditController.displayName}
			type="text"
			class="border-main bg-50"
		/>
		{#snippet footer()}
			<Button type="submit" value="decline" color="alternative">Cancel</Button>
			<Button type="submit" value="success" color="primary">Save</Button>
		{/snippet}
	</Modal>

	<Modal
		title="Remove user {userEditController.displayName}"
		form
		bind:open={userEditController.deleteDialogOpen}
		onaction={async ({ action }) => {
			if (action == 'success') {
				await userEditController.applyUserDelete();
			}
			userEditController.endUserEdit();
		}}
	>
		<P>Are you sure you want to remove the user?</P>
		{#snippet footer()}
			<Button type="submit" value="decline" color="alternative">Cancel</Button>
			<Button type="submit" value="success" color="red">Remove</Button>
		{/snippet}
	</Modal>
</div>
<div class="overflow-hidden rounded-xl">
	<Table class="w-full">
		<TableHead class="bg-200">
			<TableHeadCell class="text-main bg-300">Name</TableHeadCell>
			<TableHeadCell class="text-main bg-300">Email</TableHeadCell>
			<TableHeadCell class="text-main bg-300">Manage</TableHeadCell>
		</TableHead>
		<TableBody>
			{#if error != null}
				<TableBodyRow>
					<TableBodyCell
						colspan={3}
						class="text-muted bg-200 py-6 text-center text-red-800 dark:text-red-400"
						>{error}</TableBodyCell
					>
				</TableBodyRow>
			{:else if users === null}
				<TableBodyRow>
					<TableBodyCell colspan={3} class="text-muted bg-200 py-6 text-center">
						<Spinner class="mx-auto mb-2" />
						Loading users...
					</TableBodyCell>
				</TableBodyRow>
			{:else if users.length === 0}
				<TableBodyRow>
					<TableBodyCell colspan={3} class="text-muted bg-200 py-6 text-center"
						>No tables found</TableBodyCell
					>
				</TableBodyRow>
			{:else}
				{#each users as user}
					<TableBodyRow class="bg-200">
						<TableBodyCell class="text-muted bg-200 font-semibold">{user.displayName}</TableBodyCell
						>
						<TableBodyCell class="text-muted bg-200 font-semibold">{user.email}</TableBodyCell>
						<TableBodyCell class="text-muted bg-200 font-semibold">
							<Button
								class="cursor-pointer"
								onclick={() => {
									userEditController.deleteUser(user);
								}}
							>
								<div class="h-4 max-h-4">
									{#if userEditController.userId == user.id}
										<Spinner class="h-full w-4 max-w-4"></Spinner>
									{:else}
										<TrashBinSolid class="h-full max-h-full w-4 max-w-4"></TrashBinSolid>
									{/if}
								</div>
							</Button>
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			{/if}
		</TableBody>
	</Table>
</div>
