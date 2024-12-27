<script lang="ts">
	import Link from '$lib/components/Link.svelte';
	import Navbar from '$lib/components/Navbar.svelte';

	const { data } = $props();
</script>

<Navbar title="Verification successful" />
<div>
	Congratulations! You've successfully verified your account. <Link href="../../login"
		>Click here</Link
	> to log in.
</div>
