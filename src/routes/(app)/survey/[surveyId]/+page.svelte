<script lang="ts">
	import CheckIcon from '$lib/components/icons/CheckIcon.svelte';
	import DuplicateIcon from '$lib/components/icons/DuplicateIcon.svelte';
	import HomeIcon from '$lib/components/icons/HomeIcon.svelte';
	import LinkIcon from '$lib/components/icons/LinkIcon.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import Diagram from '$lib/components/Diagram.svelte';

	import type { PageData } from './$types';
	import TrashIcon from '$lib/components/icons/TrashIcon.svelte';
	import { goto } from '$app/navigation';
	import { success } from '$lib/toast';
	import MarkdownBlock from '$lib/components/MarkdownBlock.svelte';

	let { data }: { data: PageData } = $props();

	const diagramData = data.skills.flatMap((skill) =>
		data.participants.map((participant) => ({
			skill: skill.title,
			participant: participant.id,
			rating: participant.answers.find((answer) => answer.skillId === skill.id)?.rating
		}))
	);

	function copyLinkToClipboard(link: string) {
		navigator.clipboard.writeText(link);
	}

	let dialogRef: HTMLDialogElement | null = null;

	async function deleteSurvey() {
		await fetch('', {
			method: 'DELETE'
		});
		goto('..');
	}
</script>

<Navbar title={data.title}>
	<div class="flex w-20 flex-row justify-self-end">
		<a href="/" class="flex items-center" aria-label="Home" title="Home">
			<HomeIcon />
		</a>
		<a
			href="../survey/new?from={data.id}"
			class="ml-2 flex items-center"
			aria-label="Duplicate"
			title="Duplicate"
			><DuplicateIcon />
		</a>
		<button
			onclick={() => {
				dialogRef?.showModal();
			}}
			class="ml-2 inline-block"
			aria-label="Delete"
			title="Delete"
			><TrashIcon />
		</button>
	</div>
</Navbar>
{#if data.description}
	<MarkdownBlock class="ml-4 mt-4 text-xs text-slate-500" value={data.description} />
{/if}

<h2 class="ml-2 mt-4 text-2xl">Participants</h2>
<ul class="disc ml-4">
	{#each data.participants as participant}
		<li>
			<span class="mr-5">
				{participant.email}
				{#if participant.answers.length > 0}
					<CheckIcon />
				{/if}
			</span>
			<button
				aria-label="Copy link to clipboard"
				class="text-sky-700"
				title="Copy link to clipboard"
				onclick={() => {
					copyLinkToClipboard(`${window.location.origin}/${participant.accessToken}`);
					success('Link copied to clipboard');
				}}
			>
				<LinkIcon />
			</button>
		</li>
	{/each}
</ul>

<div class="grid grid-cols-1 justify-items-center">
	<Diagram data={diagramData} />
</div>

<dialog
	bind:this={dialogRef}
	class="border-2 border-red-300 p-4 backdrop:bg-black/40 backdrop:backdrop-blur-sm"
>
	<h2 class="mb-4 text-2xl">Delete survey</h2>
	<p>
		Are you sure you want to delete the survey. <span class="font-bold text-red-400"
			>This action cannot be undone.</span
		>
	</p>
	<div class="mt-4 grid grid-cols-2 gap-2">
		<button onclick={() => dialogRef?.close()} class="w-40 justify-self-end bg-slate-400"
			>Cancel</button
		>
		<button class="w-40 bg-red-500" onclick={deleteSurvey}>Delete</button>
	</div>
</dialog>
