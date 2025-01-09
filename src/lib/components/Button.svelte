<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Props = {
		kind: 'primary' | 'secondary' | 'tertiary' | 'ghost';
	} & HTMLButtonAttributes;

	const { kind, children, class: cls, ...rest }: Props = $props();

	const styles = {
		primary: 'bg-sky-200 hover:bg-sky-300 text-black border border-black rounded',
		secondary: 'bg-slate-200 hover:bg-slate-300 text-black border border-black rounded',
		tertiary: 'bg-white hover:bg-slate-100 text-black border border-slate-500 rounded',
		ghost: 'bg-white hover:bg-slate-100 text-sky-600'
	};
</script>

<button
	class="{styles[
		kind
	]} disabled:cursor-not-allowed disabled:border-slate-400 disabled:bg-slate-100 disabled:text-slate-400 {cls}"
	{...rest}>{@render children?.()}</button
>
