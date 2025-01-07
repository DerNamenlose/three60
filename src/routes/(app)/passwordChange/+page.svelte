<script>
	import Navbar from '$lib/components/Navbar.svelte';
	import PasswordSetterFormPart from '$lib/components/PasswordSetterFormPart.svelte';

	let password = $state();
	let password_repeat = $state();
</script>

<Navbar title="Update password" />

<p class="m-4 text-center">
	Please provide your old password and the new password twice to update your password.
</p>
<form method="post" class="grid grid-cols-2 gap-1">
	<label for="old_password" class="justify-self-end">Old password</label>
	<input
		type="password"
		name="old_password"
		id="old_password"
		class="justify-self-start"
		required
	/>

	<PasswordSetterFormPart bind:password bind:password_repeat />
	<button
		type="submit"
		class="col-span-2 w-40 justify-self-center bg-slate-200"
		disabled={password !== password_repeat || password === ''}
	>
		{#if password !== password_repeat}
			New passwords don't match
		{:else}
			Update password
		{/if}
	</button>
</form>
