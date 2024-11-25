<script lang="ts">
	import SkillInput, { type SkillProps } from './SkillInput.svelte';

	type Props = { skills: SkillProps[] };

	let { skills = $bindable() }: Props = $props();
</script>

<div class="mt-4 grid grid-cols-2 gap-2">
	{#each skills as _, index}
		<SkillInput bind:skill={skills[index]} />
	{/each}
</div>
