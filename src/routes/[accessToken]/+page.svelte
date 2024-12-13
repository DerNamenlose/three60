<script lang="ts">
	import Skills from '$lib/Skills.svelte';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let skills = $state(
		data.skills.map((skill) => ({
			id: skill.id.toString(),
			title: skill.title,
			description: skill.description,
			value: 0,
			noAnswer: false
		}))
	);
</script>

<nav class="grid grid-cols-2 bg-indigo-800 p-3 text-white">
	<h1 class="justify-self-start text-3xl">{data.title}</h1>
</nav>
{#if data.description}
	<div class="ml-4 text-sm text-slate-500">{data.description}</div>
{/if}
<form method="POST" class="text-center">
	<Skills bind:skills />

	<button type="submit" class="mt-5 w-40 bg-slate-200">Submit</button>
</form>

<dl class="ml-8 mt-5 grid grid-cols-[7rem_1fr] text-sm">
	<dt class="text-center font-semibold">(No answer)</dt>
	<dd>I don't know and can't give useful answer.</dd>
	<dt class="text-center font-semibold">0</dt>
	<dd>The person does not have this skill.</dd>
	<dt class="text-center font-semibold">1</dt>
	<dd>The person can use this skill with guidance by more experienced people.</dd>
	<dt class="text-center font-semibold">2</dt>
	<dd>The person is able to use this skill by themselves.</dd>
	<dt class="text-center font-semibold">3</dt>
	<dd>The person is able to guide others to use this skill.</dd>
</dl>
