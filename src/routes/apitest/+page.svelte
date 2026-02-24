<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import Card from '$lib/components/Card.svelte';

	export let apiBaseUrl = 'http://127.0.0.1:5148';

	let apiResponse: any = null;
	let apiError: string | null = null;
	let isApiLoading = false;

	// GET2 dynamic form state
	let getProductByIdMethod = 'GET';
	let getProductByIdParams = { id: 3 };

	// Mutation dynamic form state
	let mutationMethod = 'POST';
	let mutationId = 1;
	let mutationParams = {
		titleKey: 'Sample Product',
		descriptionKey: 'An example description',
		priceCent: 2000,
		stock: 5,
		isAvailable: true,
		imgUrl: 'sample.jpg',
		categoryId: 2
	};

	async function apiRequest(path: string, method: string = 'GET', payload: any = null) {
		isApiLoading = true;
		apiError = null;

		try {
			const options: RequestInit = {
				method,
				headers: payload ? { 'Content-Type': 'application/json' } : undefined,
				body: payload ? JSON.stringify(payload) : undefined
			};

			const response = await fetch(`${apiBaseUrl}${path}`, options);
			if (!response.ok) throw new Error(`Failed ${method} ${path}`);

			apiResponse = await response.json();
		} catch (err) {
			apiError = err instanceof Error ? err.message : String(err);
			apiResponse = null;
		} finally {
			isApiLoading = false;
		}
	}

	// Form handlers
	async function handleGetProductByIdFormSubmit() {
		if (getProductByIdMethod === 'GET') {
			await apiRequest(`/api/product/${getProductByIdParams.id}`);
		} else {
			await apiRequest(`/api/product`, 'POST', getProductByIdParams);
		}
	}

	async function handleMutationFormSubmit() {
		if (mutationMethod === 'POST') {
			await apiRequest(`/api/product`, 'POST', mutationParams);
		} else if (mutationMethod === 'PUT') {
			await apiRequest(`/api/product/${mutationId}`, 'PUT', mutationParams);
		} else {
			const params = new URLSearchParams(
				Object.fromEntries(Object.entries(mutationParams).map(([k, v]) => [k, String(v)]))
			);
			await apiRequest(`/api/product?${params}`);
		}
	}

	// Simple buttons
	const handleSimpleRequest = (key: string) => {
		switch (key) {
			case 'GET1':
				return apiRequest('/api/product');
			case 'PUT':
				mutationMethod = 'PUT';
				mutationId = 1;
				mutationParams = {
					titleKey: 'Updated Sample',
					descriptionKey: 'Updated Desc',
					priceCent: 1500,
					stock: 8,
					isAvailable: true,
					imgUrl: 'updated_sample.jpg',
					categoryId: 1
				};
				return;
			case 'DELETE':
				return apiRequest('/api/product/1', 'DELETE');
		}
	};
</script>

<div class="p-8 max-w-6xl mx-auto w-full space-y-10">
  <div class="flex justify-between items-end border-b border-brand-border pb-6">
    <div>
      <h1 class="text-3xl font-bold text-brand-dark">API Explorer</h1>
      <p class="text-gray-500 mt-1">Debug and test the Rij62 platform endpoints</p>
    </div>
    <div class="text-xs font-mono text-gray-400 bg-gray-100 px-3 py-1 rounded">
      Host: {apiBaseUrl}
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div class="space-y-8">
      <!-- Section: Quick Actions -->
      <Card class="bg-white rounded-lg shadow-sm border border-brand-border p-6">
        <div class="flex items-center gap-2 mb-6 text-brand-dark">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
          </svg>
          <h2 class="text-lg font-bold">Quick Actions</h2>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <Button variant="primary" class="w-full text-xs py-2" disabled={isApiLoading} onclick={() => handleSimpleRequest('GET1')}>
            GET All
          </Button>
          <Button class="w-full text-xs py-2 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100" disabled={isApiLoading} onclick={() => handleSimpleRequest('PUT')}>
            PUT Update
          </Button>
          <Button class="w-full text-xs py-2 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100" disabled={isApiLoading} onclick={() => handleSimpleRequest('DELETE')}>
            DELETE
          </Button>
        </div>
      </Card>

      <!-- Section: Parameters -->
      <Card class="bg-white rounded-lg shadow-sm border border-brand-border p-6">
        <div class="flex items-center gap-2 mb-6 text-brand-dark">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
          </svg>
          <h2 class="text-lg font-bold">Parameters</h2>
        </div>
        
        <div class="space-y-6">
          <!-- Fetch by ID Form -->
          <div class="p-4 bg-blue-50/30 rounded-lg border border-brand-border space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Fetch by ID</span>
              <select bind:value={getProductByIdMethod} class="text-xs bg-white border border-brand-border rounded px-2 py-1 outline-none">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </div>
            <form on:submit|preventDefault={handleGetProductByIdFormSubmit} class="flex gap-2">
              <input type="number" bind:value={getProductByIdParams.id} class="flex-grow px-3 py-1.5 bg-white border border-brand-border rounded text-sm outline-none focus:ring-1 focus:ring-brand-primary/20" placeholder="ID" />
              <Button type="submit" variant="primary" class="px-4 py-1.5 text-xs" disabled={isApiLoading}>Go</Button>
            </form>
            <div class="text-[10px] font-mono text-gray-400 mt-2 truncate">
              ID: {getProductByIdParams.id} | Method: {getProductByIdMethod}
            </div>
          </div>

          <!-- Mutation Form -->
          <div class="p-4 bg-gray-50 rounded-lg border border-brand-border space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Mutation</span>
              <select bind:value={mutationMethod} class="text-xs bg-white border border-brand-border rounded px-2 py-1 outline-none">
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="GET">QUERY</option>
              </select>
            </div>
            
            <form on:submit|preventDefault={handleMutationFormSubmit} class="space-y-4">
              {#if mutationMethod === 'PUT'}
                <div class="space-y-1">
                  <label class="text-[10px] font-bold text-gray-400 uppercase ml-1">Update ID</label>
                  <input type="number" bind:value={mutationId} class="w-full px-3 py-1.5 bg-white border border-brand-border rounded text-xs outline-none" placeholder="Target ID" />
                </div>
              {/if}
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="text-[10px] font-bold text-gray-400 uppercase ml-1">Title</label>
                  <input type="text" bind:value={mutationParams.titleKey} class="w-full px-3 py-1.5 bg-white border border-brand-border rounded text-xs outline-none" placeholder="Product Title" />
                </div>
                <div class="space-y-1">
                  <label class="text-[10px] font-bold text-gray-400 uppercase ml-1">Price (Cents)</label>
                  <input type="number" bind:value={mutationParams.priceCent} class="w-full px-3 py-1.5 bg-white border border-brand-border rounded text-xs outline-none" placeholder="2000" />
                </div>
                <div class="space-y-1">
                  <label class="text-[10px] font-bold text-gray-400 uppercase ml-1">Stock</label>
                  <input type="number" bind:value={mutationParams.stock} class="w-full px-3 py-1.5 bg-white border border-brand-border rounded text-xs outline-none" placeholder="10" />
                </div>
                <div class="flex items-center gap-2 pt-5 ml-1">
                  <input type="checkbox" bind:checked={mutationParams.isAvailable} class="rounded text-brand-primary" />
                  <span class="text-xs text-gray-600">Available</span>
                </div>
              </div>

              <div class="space-y-1">
                <label class="text-[10px] font-bold text-gray-400 uppercase ml-1">Description</label>
                <input type="text" bind:value={mutationParams.descriptionKey} class="w-full px-3 py-1.5 bg-white border border-brand-border rounded text-xs outline-none" placeholder="Short description..." />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="text-[10px] font-bold text-gray-400 uppercase ml-1">Image URL</label>
                  <input type="text" bind:value={mutationParams.imgUrl} class="w-full px-3 py-1.5 bg-white border border-brand-border rounded text-xs outline-none" placeholder="image.jpg" />
                </div>
                <div class="space-y-1">
                  <label class="text-[10px] font-bold text-gray-400 uppercase ml-1">Category ID</label>
                  <input type="number" bind:value={mutationParams.categoryId} class="w-full px-3 py-1.5 bg-white border border-brand-border rounded text-xs outline-none" placeholder="1" />
                </div>
              </div>

              <Button type="submit" variant="primary" class="w-full py-2.5 shadow-sm" disabled={isApiLoading}>
                {isApiLoading ? 'Executing...' : `Execute ${mutationMethod}`}
              </Button>
            </form>

            <div class="mt-4 p-3 bg-brand-dark rounded-lg overflow-hidden">
              <div class="text-[9px] font-mono text-gray-500 mb-2 uppercase tracking-widest">Live State Preview</div>
              <pre class="text-[10px] text-emerald-400 font-mono whitespace-pre-wrap">{JSON.stringify({
                method: mutationMethod,
                id: mutationMethod === 'PUT' ? mutationId : undefined,
                params: mutationParams
              }, null, 2)}</pre>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- Response Terminal -->
    <div class="bg-brand-darker rounded-2xl shadow-2xl overflow-hidden border border-gray-800 flex flex-col min-h-[500px] lg:h-[calc(100vh-200px)]">
      <div class="bg-brand-dark px-4 py-3 flex justify-between items-center border-b border-gray-800">
        <div class="flex gap-1.5">
          <div class="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
        </div>
        <span class="text-[10px] font-mono text-gray-500 uppercase tracking-widest">stdout</span>
        <div class="w-10"></div>
      </div>
      <div class="p-6 flex-grow overflow-auto custom-scrollbar font-mono text-sm">
        {#if apiError}
          <div class="text-red-400">
            <span class="text-red-500 font-bold">Error:</span> {apiError}
          </div>
        {:else if apiResponse}
          <div class="text-emerald-500 mb-2 font-bold text-xs">SUCCESS [200 OK]</div>
          <pre class="text-emerald-400">{JSON.stringify(apiResponse, null, 2)}</pre>
        {:else}
          <div class="h-full flex flex-col items-center justify-center text-gray-600 italic">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>Ready for request...</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 6px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: #374151;
		border-radius: 10px;
	}
</style>
