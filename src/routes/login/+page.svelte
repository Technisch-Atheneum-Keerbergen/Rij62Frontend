<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth';
	import { apiFetch, apiFetchJson } from '$lib/api/client';
	import Button from '$lib/components/Button.svelte';
	import { page } from '$app/state';
	import type { GoogleLoginResponse } from '$lib/api/types/auth';
	import Spinner from '$lib/components/Spinner.svelte';
	import SvgLock from '$lib/components/SVG/SvgLock.svelte';

	const VITE_ALLOW_LOGIN_WITH_DEBUG = import.meta.env.VITE_ALLOW_LOGIN_WITH_DEBUG == 'true';
	const linkKey = page.url.searchParams.get('linkKey');

	let loading = $state(false);

	async function handleCredentialResponse(response: any) {
		loading = true;
		try {
			const res = await apiFetchJson<GoogleLoginResponse>('/auth/google', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token: response.credential, linkKey: linkKey })
			});
			auth.login(res.token);
			goto('/admin/overview');
		} catch (err) {
			alert('Login failed: ' + err);
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
				width: '250'
			});
		}
	});
</script>

<div class="flex min-h-[85vh] items-center justify-center bg-transparent px-4">
	<div
		class="relative w-full max-w-md rounded-3xl border-none bg-100 p-10 shadow-2xl ring-1 ring-black/5"
	>
		<!-- Loading Overlay -->
		{#if loading}
			<div
				class="absolute inset-0 z-50 flex items-center justify-center rounded-3xl bg-black/20 backdrop-blur-sm"
			>
				<Spinner />
			</div>
		{/if}

		<div class="flex flex-col items-center gap-5">
			<!-- Visual Header -->
			<div
				class="flex h-20 w-20 items-center justify-center rounded-2xl bg-200 stroke-primary-500 p-3 shadow-sm dark:stroke-primary-400"
			>
				<SvgLock />
			</div>
			<div class="flex flex-col items-center">
				<h1 class="text-3xl font-semibold tracking-tight">Admin Portal</h1>
				<p class="text-muted mt-3 text-center">
					Sign in with your Google account to manage your dashboard.
				</p>
			</div>

			<!-- Action Area -->
			<div class="">
				<div
					id="googleButton"
					class="flex justify-center transition-transform hover:scale-[1.02]"
				></div>

				{#if VITE_ALLOW_LOGIN_WITH_DEBUG}
					<div class="m-2 flex flex-row justify-center">
						<input
							class="mx-1.5 w-16 justify-center rounded-lg border-2 bg-200"
							type="number"
							value="1"
							id="debugLoginId"
						/>
						<Button
							title="login met debug mode"
							onclick={handleDebugLoginResponse}
							id="debugButton"
							class="justify-center transition-transform">login met debug!</Button
						>
					</div>
				{/if}
			</div>

			<!-- Footer Info -->
			<div class=" flex w-full items-center gap-3">
				<div class="h-px flex-1 bg-300"></div>
				<span class="text-muted text-xs font-medium tracking-widest uppercase">Secure Access</span>
				<div class="h-px flex-1 bg-300"></div>
			</div>

			<p class="text-muted text-xs">Protected by Rij 62 Security Protocols</p>
		</div>
	</div>
</div>

<style>
	:global(#googleButton iframe) {
		margin: 0 auto !important;
		border-radius: 12px !important;
	}
</style>
