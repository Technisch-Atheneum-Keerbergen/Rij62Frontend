<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth';
	import { Card, Spinner } from 'flowbite-svelte';
	import { apiFetch } from '$lib/api/client';
	import Button from '$lib/components/Button.svelte';

	let loading = false;

	async function handleCredentialResponse(response: any) {
		loading = true;
		try {
			const res = await apiFetch('/auth/google', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token: response.credential })
			});
			auth.login(res.token);
			goto('/admin/overview');
		} catch (err) {
			console.error('Login failed:', err);
		} finally {
			loading = false;
		}
	}

	async function handleDebugLoginResponse() {
		var id = (document.getElementById('debugLoginId') as HTMLInputElement).value;
		loading = true;
		try {
			const res = await apiFetch('/auth/debug', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id: id })
			});
			auth.login(res.token);
			goto('/admin/overview');
		} catch (err) {
			alert('Failed to login in ' + err);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		if (window.google) {
			window.google.accounts.id.initialize({
				client_id: '272275156561-nqgbjokieb950vf0rm1matru62qi6tn6.apps.googleusercontent.com',
				callback: handleCredentialResponse
			});
			window.google.accounts.id.renderButton(document.getElementById('googleButton'), {
				theme: 'outline',
				size: 'large',
				width: '320'
			});
		}
	});
</script>

<div class="flex min-h-[85vh] items-center justify-center bg-transparent px-4">
	<Card
		class="relative w-full max-w-md border-none p-10 shadow-2xl ring-1 ring-black/5 sm:rounded-3xl"
	>
		<!-- Loading Overlay -->
		{#if loading}
			<div
				class="absolute inset-0 z-50 flex items-center justify-center rounded-3xl bg-white/60 backdrop-blur-sm"
			>
				<Spinner color="primary" size="10" />
			</div>
		{/if}

		<div class="flex flex-col items-center">
			<!-- Visual Header -->
			<div
				class="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 shadow-inner"
			>
				<svg class="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.5"
						d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
					/>
				</svg>
			</div>

			<h1 class="text-3xl font-extrabold tracking-tight text-gray-900">Admin Portal</h1>
			<p class="mt-3 text-center text-base text-gray-500">
				Sign in with your Google account to manage your dashboard.
			</p>

			<!-- Action Area -->
			<div class="mt-10 w-full">
				<div
					id="googleButton"
					class="flex justify-center transition-transform hover:scale-[1.02]"
				></div>

				<div class="m-2 flex flex-row justify-center">
					<input
						class="mx-1.5 w-16 justify-center rounded-lg border-2 bg-200"
						type="number"
						value="0"
						id="debugLoginId"
					/>
					<Button
						title="login met debug mode"
						onclick={handleDebugLoginResponse}
						id="debugButton"
						class="justify-center transition-transform">login met debug!</Button
					>
				</div>
			</div>

			<!-- Footer Info -->
			<div class="mt-10 flex w-full items-center gap-3">
				<div class="h-px flex-1 bg-gray-100"></div>
				<span class="text-[10px] font-medium tracking-widest text-gray-400 uppercase"
					>Secure Access</span
				>
				<div class="h-px flex-1 bg-gray-100"></div>
			</div>

			<p class="mt-6 text-xs text-gray-400">Protected by Rij 62 Security Protocols</p>
		</div>
	</Card>
</div>

<style>
	:global(#googleButton iframe) {
		margin: 0 auto !important;
		border-radius: 12px !important;
	}
</style>
