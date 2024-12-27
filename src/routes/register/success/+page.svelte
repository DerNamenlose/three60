<script>
	import Link from '$lib/components/Link.svelte';
	import Navbar from '$lib/components/Navbar.svelte';

	const { data } = $props();
</script>

<Navbar title="Registration successful" />
<p class="mx-10">
	Your account has been registered successfully.
	{#if data.showEmailNotice}
		An email has been sent to your email address to activate the account. Please follow the
		instructions in the email to be able to log in.
	{:else}
		Click <Link href="../../login">here</Link> to log in.
	{/if}
</p>
