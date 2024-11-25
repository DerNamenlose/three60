<script lang="ts">
	let password = $state('');
	let password_repeat = $state('');
</script>

<h1 class="text-3xl">Register a new Account</h1>
<div>
	<form class="grid grid-cols-2 gap-1" method="POST">
		<label for="name" class="justify-self-end">Email address</label>
		<input type="email" name="email" id="email" class="justify-self-start" required />
		<label for="password" class="justify-self-end">Password</label>
		<input
			type="password"
			name="password"
			id="password"
			class="justify-self-start"
			required
			bind:value={password}
		/>
		<label for="password_repeat" class="justify-self-end">Password</label>
		<input
			type="password"
			name="password_repeat"
			id="password_repeat"
			class="justify-self-start"
			required
			bind:value={password_repeat}
		/>
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
