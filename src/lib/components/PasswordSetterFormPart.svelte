<script lang="ts">
	type Props = {
		password: string;
		password_repeat: string;
	};

	let { password = $bindable(), password_repeat = $bindable() } = $props();
</script>

<label for="password" class="justify-self-end">Password</label>
<input
	type="password"
	name="password"
	id="password"
	class="justify-self-start"
	required
	bind:value={password}
/>
<label for="password_repeat" class="justify-self-end">Password (repeat)</label>
<input
	type="password"
	name="password_repeat"
	id="password_repeat"
	class="justify-self-start"
	required
	bind:value={password_repeat}
/>
