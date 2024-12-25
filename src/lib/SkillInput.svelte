<script lang="ts">
	import InfoIcon from './components/icons/InfoIcon.svelte';
	import MarkdownBlock from './components/MarkdownBlock.svelte';

	export type SkillProps = {
		id: string;
		title: string;
		description: string | null;
		value: number;
		noAnswer: boolean;
	};
	type Props = { skill: SkillProps };

	let { skill = $bindable() }: Props = $props();
</script>

<label for={skill.id} class="justify-self-end"
	>{skill.title}
	<button popovertarget="description-{skill.id}" type="button" title="Show skill description"
		><InfoIcon class="size-4 fill-lime-600" /></button
	></label
>
<div class="justify-self-start">
	<input
		type="range"
		id={skill.id}
		name={skill.id}
		min="0"
		max="3"
		step="0.5"
		bind:value={skill.value}
		class="w-80 justify-self-start"
		list="values"
		disabled={skill.noAnswer}
	/>
	<label class="ml-2 text-xs">
		<input
			type="checkbox"
			name="disable-{skill.id}"
			bind:checked={skill.noAnswer}
			class="text-xs"
		/> No answer</label
	>
	{#if !skill.noAnswer}
		<span class="ml-2">{skill.value}</span>
	{/if}
</div>
<datalist id="values">
	<option value="0" label="0"></option>
	<option value="1" label="1"></option>
	<option value="2" label="2"></option>
	<option value="3" label="3"></option>
</datalist>

<div
	id="description-{skill.id}"
	popover="auto"
	class="border border-slate-400 p-4 backdrop:bg-black/30 backdrop:backdrop-blur-sm"
>
	<h2 class="mb-2 text-2xl">{skill.title}</h2>
	<MarkdownBlock value={skill.description ?? ''} />
</div>
