<script lang="ts" generics="T">
	import { createCombobox, melt } from '@melt-ui/svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = {
		options?: T[];
		getOptions?: (searchTerm: string) => Promise<T[]>;
		itemToString?: (item: T) => string;
		selectedItem: T | undefined;
		error?: string;
	} & HTMLInputAttributes;

	let {
		getOptions,
		itemToString,
		selectedItem = $bindable(),
		error,
		class: cls,
		...rest
	}: Props = $props();

	const {
		elements: { menu, input, option },
		states: { open, inputValue, touchedInput, selected },
		helpers: { isSelected }
	} = createCombobox<T>({
		forceVisible: false
	});

	let options = $derived.by(() => {
		if ($touchedInput) {
			return getOptions?.($inputValue);
		}
		if (selectedItem) {
			return Promise.resolve([selectedItem]);
		}
		return Promise.resolve([]);
	});

	// initialize the input field if we're loading an already existing value
	if (selectedItem) {
		selected.set({
			value: selectedItem
		});
	}

	$effect(() => {
		selectedItem = $selected?.value;
		if (!$open) {
			if ($selected) {
				$inputValue = itemToString?.($selected?.value) ?? String($selected.value);
			} else {
				$inputValue = '';
			}
		}
	});

	$inspect(selectedItem, $selected?.value);
</script>

<div>
	<input
		type="text"
		class="w-full {error ? 'border-red-500' : ''} {cls}"
		{...rest}
		placeholder="Search for user's email address"
		use:melt={$input}
	/>
	{#if error}
		<p class="text-sm text-red-500">{error}</p>
	{/if}
</div>
{#if open}
	<ul
		use:melt={$menu}
		class="z-10 flex max-h-[300px] flex-col overflow-hidden border border-gray-300 bg-white"
	>
		{#await options}
			<p>Loading...</p>
		{:then options}
			{#each options ?? [] as entry}
				<li
					class="data-[highlighted]:bg-gray-200"
					use:melt={$option({
						value: entry
					})}
				>
					{itemToString?.(entry) ?? String(entry)}
				</li>
			{/each}
		{/await}
	</ul>
{/if}
