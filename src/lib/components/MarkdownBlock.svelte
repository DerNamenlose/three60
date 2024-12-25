<script lang="ts">
	import type { HTMLHtmlAttributes } from 'svelte/elements';
	import markdownIt from 'markdown-it';

	let { value, class: additionalClass }: { value: string } & HTMLHtmlAttributes = $props();

	const md = markdownIt();

	let htmlContent = $derived.by(() => md.render(value));
</script>

<p class="{additionalClass} markdown text-left">{@html htmlContent}</p>

<style>
	.markdown {
		:global(ul) {
			list-style-type: disc;
			margin-left: 1rem;
		}
		:global(ol) {
			list-style-type: decimal;
			margin-left: 1rem;
		}
		:global(a) {
			color: blue;
		}
	}
</style>
