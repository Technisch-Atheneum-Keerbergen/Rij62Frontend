// $lib/stores/tableNumber.svelte.ts

function createTableNumberStore() {
	let tableNumber = $state<number | null>(null);
	let initialized = $state(false);

	function init(urlParam?: string | null) {
		if (initialized) return;
		initialized = true;

		// URL param takes priority over localStorage
		if (urlParam !== undefined && urlParam !== null) {
			const parsed = parseInt(urlParam, 10);
			if (!isNaN(parsed)) {
				tableNumber = parsed;
				localStorage.setItem('tableNumber', String(parsed));
				return;
			}
		}

		// Fall back to localStorage
		const stored = localStorage.getItem('tableNumber');
		if (stored !== null) {
			const parsed = parseInt(stored, 10);
			tableNumber = isNaN(parsed) ? null : parsed;
		}
	}

	function set(value: number | null) {
		tableNumber = value;
		if (value === null) {
			localStorage.removeItem('tableNumber');
		} else {
			localStorage.setItem('tableNumber', String(value));
		}
	}

	return {
		get value() {
			return tableNumber;
		},
		get initialized() {
			return initialized;
		},
		init,
		set
	};
}

export const tableNumberStore = createTableNumberStore();
