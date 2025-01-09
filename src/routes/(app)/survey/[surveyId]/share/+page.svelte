<script lang="ts">
	import { browser } from '$app/environment';
	import Autocomplete from '$lib/components/Autocomplete.svelte';
	import Button from '$lib/components/Button.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import { AccessLevel, AnyoneMarker } from '$lib/types';
	import type { UserId, Email } from '$lib/types';
	import type { PageData } from './$types';
	import InlineWarning from '$lib/components/InlineWarning.svelte';
	import TrashIcon from '$lib/components/icons/TrashIcon.svelte';
	import UserSelector from '$lib/components/UserSelector.svelte';

	let { data }: { data: PageData } = $props();

	let permissions = $state(data.permissions);

	const hasOwner = $derived(permissions.some((p) => p.access === AccessLevel.Owner));
	const isDuplicated = $derived(
		permissions.map((p, idx) =>
			permissions.some((candidate, cidx) => idx !== cidx && p.user?.id === candidate.user?.id)
		)
	);
	const hasErrors = $derived(!hasOwner || isDuplicated.some((b) => b));
</script>

<Navbar title="Permissions for: {data.survey?.title}" />

{#if !hasOwner}
	<InlineWarning class="mb-5">
		<p>A survey MUST have at least one owner.</p>
	</InlineWarning>
{/if}

<form method="POST" class="mx-4 grid grid-cols-[1fr_1fr_max-content] gap-2">
	{#each permissions as permission, idx}
		<UserSelector
			bind:user={permission.user}
			error={isDuplicated[idx] ? 'Cannot add user twice' : undefined}
		/>
		<select name="permissions" bind:value={permission.access}>
			<option value={AccessLevel.Clone}>Clone</option>
			<option value={AccessLevel.ReadResult}>Read results</option>
			<option value={AccessLevel.Edit}>Edit</option>
			<option value={AccessLevel.Owner}>Owner</option>
		</select>
		<div>
			<Button kind="ghost" onclick={() => permissions.splice(idx, 1)} title="Remove entry"
				><TrashIcon /></Button
			>
		</div>
	{/each}
	<Button
		class="col-[2] w-40 justify-self-center"
		kind="secondary"
		onclick={(ev) => {
			ev.preventDefault();
			permissions.push({
				user: {
					email: '' as Email,
					id: 0 as UserId
				},
				access: AccessLevel.ReadResult
			});
		}}>Add user</Button
	>

	<Button
		type="submit"
		kind="primary"
		class="col-span-2 w-40 justify-self-center p-3"
		disabled={hasErrors}>Update permissions</Button
	>
</form>
