<script lang="ts">
	type Props = {
		title: string;
		description: string | null;
		participants: { email: string }[];
		skills: { title: string; description: string | null }[];
		submitButtonTitle: string;
	};

	const { title, description, participants, skills, submitButtonTitle }: Props = $props();

	let numParticipants = $state(participants?.length ?? 1);
	let numSkills = $state(skills?.length ?? 1);
</script>

<form class="grid grid-cols-2 gap-2 p-4" method="post">
	<label for="title" class="justify-self-end">Survey Title</label>
	<input type="text" name="title" id="title" class="min-w-80 justify-self-start" value={title} />
	<label for="description" class="justify-self-end">Survey Description</label>
	<textarea name="description" id="description" class="min-w-80 justify-self-start"
		>{description}</textarea
	>

	<h2 class="col-span-2 text-2xl">Participants</h2>
	{#each Array(numParticipants) as _, idx}
		<label for="participants" class="justify-self-end">Email</label>
		<input
			type="email"
			name="participants"
			id="participants"
			class="min-w-80 justify-self-start"
			value={participants?.[idx]?.email}
		/>
	{/each}
	<button
		type="button"
		class="col-span-2 w-40 justify-self-center bg-blue-200"
		onclick={() => (numParticipants += 1)}>Add participant</button
	>

	<h2 class="col-span-2 text-2xl">Skills</h2>
	{#each Array(numSkills) as _, idx}
		<div class="col-span-2 ml-4 grid grid-cols-2 gap-4">
			<div class="flex w-full flex-col justify-self-end">
				<label for="skill" class="text-xs">Skill title</label>
				<input name="skill" id="skill" class="w-full" value={skills?.[idx]?.title} />
			</div>
			<div class="flex w-full flex-col justify-self-start">
				<label for="skill-description" class="text-xs">Skill description</label>
				<textarea name="skill-description" id="skill-description" class="min-h-36 w-full"
					>{skills?.[idx]?.description}</textarea
				>
			</div>
		</div>
	{/each}
	<button
		type="button"
		class="col-span-2 w-40 justify-self-center bg-blue-200"
		onclick={() => (numSkills += 1)}>Add skill</button
	>

	<button type="submit" class="col-span-2 w-40 justify-self-center bg-slate-200"
		>{submitButtonTitle}</button
	>
</form>
