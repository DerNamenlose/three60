<script lang="ts">
	import { SvelteToast } from '@zerodevx/svelte-toast';

	import '../app.css';
	let { children } = $props();

	const options = {};
</script>

<SvelteToast {options} />
{@render children()}
