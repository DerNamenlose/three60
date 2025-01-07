<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import PasswordSetterFormPart from '$lib/components/PasswordSetterFormPart.svelte';

	let password = $state();
	let password_repeat = $state();

	const { data } = $props();
</script>

<Navbar title="Register a new Account" />
<div>
	<form class="grid grid-cols-2 gap-1" method="POST">
		<label for="name" class="justify-self-end"
			><div>Email address</div>
			{#if data.allowableDomains}
				<div class="text-xs text-slate-500">
					Allowed domains: {data.allowableDomains}
				</div>
			{/if}
		</label>
		<input type="email" name="email" id="email" class="justify-self-start" required />
		<PasswordSetterFormPart bind:password bind:password_repeat />
		<button
			type="submit"
			class="col-span-2 w-40 justify-self-center bg-slate-200"
			disabled={password !== password_repeat || password === ''}
		>
			{#if password !== password_repeat}
				Passwords don't match
			{:else}
				Register
			{/if}
		</button>
	</form>
</div>
