<script>
	import Link from '$lib/components/Link.svelte';
	import Navbar from '$lib/components/Navbar.svelte';

	const { data } = $props();
</script>

<Navbar title="Login" />

<div class="flex h-screen items-center justify-center">
	<form class="grid grid-cols-2 gap-1" method="POST">
		<label for="name" class="justify-self-end">Email address</label>
		<input type="email" name="email" id="email" class="justify-self-start" required />
		<label for="password" class="justify-self-end">Password</label>
		<input type="password" name="password" id="password" class="justify-self-start" required />
		<button type="submit" class="col-span-2 mt-5 w-40 justify-self-center bg-slate-200 p-2"
			>Log In</button
		>
		{#if data.enableRegister}
			<span class="col-span-2 mt-3 justify-self-center text-xs">
				<Link href="/register">Click here to register</Link>, if you do not have an account yet</span
			>
		{/if}
	</form>
</div>
