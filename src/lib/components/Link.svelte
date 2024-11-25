<script lang="ts">
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	const { class: cls, children, ...rest }: HTMLAnchorAttributes = $props();
</script>

<a class="text-sky-700 {cls}" {...rest}>{@render children?.()}</a>
