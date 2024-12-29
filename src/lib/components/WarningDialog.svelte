<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLDialogAttributes } from 'svelte/elements';

	type Props = {
		title: string;
		dialogRef: HTMLDialogElement | null;
		onAccept: () => void;
		buttons?: Snippet<[]>;
	} & HTMLDialogAttributes;

	let { title, dialogRef = $bindable(), onAccept, children, buttons }: Props = $props();
</script>

<dialog
	bind:this={dialogRef}
	class="border-2 border-red-300 p-4 backdrop:bg-black/40 backdrop:backdrop-blur-sm"
>
	<h2 class="mb-4 text-2xl">{title}</h2>
	<div>
		{@render children?.()}
	</div>
	{#if buttons}
		{@render buttons()}
	{:else}
		<div class="mt-4 grid grid-cols-2 gap-2">
			<button onclick={() => dialogRef?.close()} class="w-40 justify-self-end bg-slate-400"
				>Cancel</button
			>
			<button class="w-40 bg-red-500" onclick={onAccept}>Delete</button>
		</div>
	{/if}
</dialog>
