<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	const { children, class: cls, ...rest }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div
	class="bold mx-auto max-w-xl border-2 border-red-700 bg-red-100 text-center text-red-500 {cls}"
	{...rest}
>
	{@render children?.()}
</div>
