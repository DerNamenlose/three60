<script lang="ts">
	import { browser } from '$app/environment';
	import { AnyoneMarker, type Email, type User, type UserId } from '$lib/types';
	import Autocomplete from './Autocomplete.svelte';
	import Button from './Button.svelte';
	import ProfileIcon from './icons/ProfileIcon.svelte';
	import XMark from './icons/XMark.svelte';

	type Props = {
		user: User | null;
		error?: string;
	};

	let { error, user = $bindable() }: Props = $props();

	async function getUsers(searchTerm: string) {
		if (browser) {
			try {
				const result = await fetch(`../../users?query=${searchTerm}`);
				return (await result.json()) as User[];
			} catch (e) {
				// ignore the errors because it's most likely a 400
			}
			return [];
		} else {
			// prevent breaking on the server side because we can have relative URLs in fetch
			return [];
		}
	}

	const EMPTY_USER: User = {
		id: 0 as UserId,
		email: '' as Email
	};
</script>

{#if user}
	<div class="relative">
		<Autocomplete
			name="users"
			getOptions={getUsers}
			itemToString={(user) => user.email}
			bind:selectedItem={user}
			{error}
			required
		/>
		<Button
			type="button"
			kind="ghost"
			title="Allow anyone"
			class="absolute right-1 top-2"
			onclick={() => {
				user = null;
			}}><XMark /></Button
		>
	</div>
	<input type="hidden" name="userIds" value={user.id} />
{:else}
	<div class="flex gap-1">
		<div class="flex-grow">
			Anyone<input type="hidden" name="users" value={AnyoneMarker} />
			<input type="hidden" name="userIds" value={AnyoneMarker} />
		</div>
		<Button
			type="button"
			kind="ghost"
			title="Set user"
			onclick={() => {
				user = { ...EMPTY_USER };
			}}><ProfileIcon /></Button
		>
	</div>
{/if}
