<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = {
		title: string;
	} & HTMLAttributes<HTMLElement>;

	const { title, children }: Props = $props();
</script>

<nav class="mb-2 grid grid-cols-2 bg-indigo-800 p-3 text-white">
	<h1 class="justify-self-start text-3xl">{title}</h1>
	{@render children?.()}
</nav>
