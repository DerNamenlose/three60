<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	let participants = $state(data?.participants?.length ?? 1);
	let skills = $state(data?.skills?.length ?? 1);
</script>

<Navbar title="Create a new survey" />
<form class="grid grid-cols-2 gap-2 p-4" method="post">
	<label for="title" class="justify-self-end">Survey Title</label>
	<input type="text" name="title" id="title" class="justify-self-start" value={data?.title} />
	<label for="description" class="justify-self-end">Survey Description</label>
	<textarea name="description" id="description" class="justify-self-start"
		>{data?.description}</textarea
	>

	<h2 class="col-span-2 text-2xl">Participants</h2>
	{#each Array(participants) as _, idx}
		<label for="participants" class="justify-self-end">Email</label>
		<input
			type="email"
			name="participants"
			id="participants"
			class="justify-self-start"
			value={data?.participants?.[idx].email}
		/>
	{/each}
	<button
		type="button"
		class="col-span-2 w-40 justify-self-center bg-blue-200"
		onclick={() => (participants += 1)}>Add participant</button
	>

	<h2 class="col-span-2 text-2xl">Skills</h2>
	{#each Array(skills) as _, idx}
		<div class="col-span-2 ml-4 grid grid-cols-2">
			<div class="justify-self-end">
				<label for="skill">Skill title</label>
				<input name="skill" id="skill" value={data?.skills?.[idx]?.title} />
			</div>
			<div class="justify-self-start">
				<label for="skill-description">Skill description</label>
				<textarea name="skill-description" id="skill-description"
					>{data?.skills?.[idx]?.description}</textarea
				>
			</div>
		</div>
	{/each}
	<button
		type="button"
		class="col-span-2 w-40 justify-self-center bg-blue-200"
		onclick={() => (skills += 1)}>Add skill</button
	>

	<button type="submit" class="col-span-2 w-40 justify-self-center bg-slate-200">Create</button>
</form>
