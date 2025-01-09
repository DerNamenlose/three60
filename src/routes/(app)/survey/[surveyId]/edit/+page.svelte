<script lang="ts">
	import InlineWarning from '$lib/components/InlineWarning.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import SurveyEditForm from '$lib/components/SurveyEditForm.svelte';
	import type { PageData } from '../$types';

	let { data }: { data: PageData } = $props();
</script>

<Navbar title="Edit survey" />
{#if data.participants.some((participant) => participant.answers.length > 0)}
	<InlineWarning>
		<p>There are participants who have already submitted ratings.</p>
		<p>
			Changing the structure of this survey (i.e. changing any of the skills) will potentially
			invalidate their answers. Consider either deleting their answers before changing the skills or
			leave the skills as is (e.g. only add/remove participants).
		</p>
	</InlineWarning>
{/if}
<SurveyEditForm {...data} submitButtonTitle="Save" />
