<script lang="ts">
	import { page } from '$app/state';
	import WarningIcon from '$lib/components/icons/WarningIcon.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
</script>

<Navbar title="Error" />

<div class="flex h-screen items-center justify-center">
	<p class="mw-10"><WarningIcon /> {page.error?.message}</p>
</div>
