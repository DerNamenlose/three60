<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import SurveyEditForm from '$lib/components/SurveyEditForm.svelte';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();
</script>

<Navbar title="Create a new survey" />
<SurveyEditForm {...data} submitButtonTitle="Create" />
