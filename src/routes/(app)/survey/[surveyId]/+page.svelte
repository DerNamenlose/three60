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
	import DeleteIcon from '$lib/components/icons/DeleteIcon.svelte';
	import WarningDialog from '$lib/components/WarningDialog.svelte';
	import EditIcon from '$lib/components/icons/EditIcon.svelte';
	import ShareIcon from '$lib/components/icons/ShareIcon.svelte';
	import { checkAccess } from '$lib/helpers/shared/permissions';
	import { AccessLevel, type ParticipantId } from '$lib/types';
	import Button from '$lib/components/Button.svelte';
	import EyeSlash from '$lib/components/icons/EyeSlash.svelte';
	import Eye from '$lib/components/icons/Eye.svelte';

	let { data }: { data: PageData } = $props();

	const diagramData = data.skills.flatMap((skill) => {
		if (data.participants.length > 0) {
			return data.participants.map((participant) => ({
				skill: skill.title,
				participant: participant.id as ParticipantId,
				rating: participant.answers.find((answer) => answer.skillId === skill.id)?.rating
			}));
		} else {
			// fallback pseudo participant because empty diagram data will break the diagram and make the survey page unaccessible
			return {
				skill: skill.title,
				participant: -1 as ParticipantId,
				rating: undefined
			};
		}
	});

	function copyLinkToClipboard(link: string) {
		navigator.clipboard.writeText(link);
	}

	let deleteSurveyDialogRef: HTMLDialogElement | null = $state(null);
	let deleteAnswersDialogRef: HTMLDialogElement | null = $state(null);

	let participantAnswersDeletionCandidateId = $state<number | null>(null);
	let reviewMode = $state(false);

	async function deleteSurvey() {
		await fetch('', {
			method: 'DELETE'
		});
		goto('..');
	}
</script>

<Navbar title={data.title}>
	<div class="w-30 flex flex-row justify-self-end">
		<a href="/" class="flex items-center" aria-label="Home" title="Home">
			<HomeIcon />
		</a>
		<Button
			kind="ghost"
			class="text-white hover:bg-indigo-900"
			onclick={() => (reviewMode = !reviewMode)}
			title={reviewMode ? 'Show details' : 'Hide details'}
		>
			{#if reviewMode}
				<Eye />
			{:else}
				<EyeSlash />
			{/if}
		</Button>
		{#if checkAccess(data, AccessLevel.Clone)}
			<a
				href="../survey/new?from={data.id}"
				class="ml-2 flex items-center"
				aria-label="Duplicate"
				title="Duplicate"
				><DuplicateIcon />
			</a>
		{/if}
		{#if checkAccess(data, AccessLevel.Edit)}
			<a
				href="{data.id.toString()}/edit"
				class="ml-2 flex items-center"
				aria-label="Edit survey"
				title="Edit survey"
				><EditIcon />
			</a>
		{/if}
		{#if checkAccess(data, AccessLevel.Owner)}
			<a
				href="{data.id.toString()}/share"
				class="ml-2 flex items-center"
				aria-label="Share"
				title="Share survey with other users"
			>
				<ShareIcon />
			</a>
			<button
				onclick={() => {
					deleteSurveyDialogRef?.showModal();
				}}
				class="ml-2 inline-block"
				aria-label="Delete"
				title="Delete"
				><TrashIcon />
			</button>
		{/if}
	</div>
</Navbar>
{#if data.description}
	<MarkdownBlock class="ml-4 mt-4 text-xs text-slate-500" value={data.description} />
{/if}

{#if !reviewMode}
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
				{#if participant.accessToken}
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
				{/if}
				{#if participant.answers.length > 0}
					<button
						aria-label="Reset ratings"
						title="Clear answers"
						class="text-red-500 hover:bg-slate-200"
						onclick={() => {
							participantAnswersDeletionCandidateId = participant.id;
							deleteAnswersDialogRef?.showModal();
						}}
					>
						<DeleteIcon />
					</button>
				{/if}
			</li>
		{/each}
	</ul>
{/if}

{#if checkAccess(data, AccessLevel.ReadResult)}
	<div class="grid grid-cols-1 justify-items-center">
		<Diagram data={diagramData} {reviewMode}/>
	</div>
{:else}
	<div class="text-center">You do not have permission to see the survey results</div>
{/if}

<WarningDialog title="Delete survey" bind:dialogRef={deleteSurveyDialogRef} onAccept={deleteSurvey}>
	<p>Are you sure you want to delete the survey.</p>
	<p class="font-bold text-red-400">This action cannot be undone.</p>
</WarningDialog>

<WarningDialog title="Delete answers" onAccept={() => {}} bind:dialogRef={deleteAnswersDialogRef}>
	<form id="delete-answers" method="POST" action="?/deleteAnswers">
		<input type="hidden" name="participantId" value={participantAnswersDeletionCandidateId} />
		<p>
			Are you sure you want to remove this user's ratings? This will delete whatever answers the
			user has given and allow them to submit new ratings instead.
		</p>
		<p class="font-bold text-red-400">This action cannot be undone.</p>
	</form>
	{#snippet buttons()}
		<div class="mt-4 grid grid-cols-2 gap-2">
			<button
				onclick={() => deleteAnswersDialogRef?.close()}
				class="w-40 justify-self-end bg-slate-400">Cancel</button
			>
			<button class="w-40 bg-red-500" form="delete-answers">Delete</button>
		</div>
	{/snippet}
</WarningDialog>
