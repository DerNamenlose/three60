<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	import Link from '$lib/components/Link.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import CheckIcon from '$lib/components/icons/CheckIcon.svelte';
	import DuplicateIcon from '$lib/components/icons/DuplicateIcon.svelte';
</script>

<Navbar title="Dashboard" />

<div class="p-4">
	<h2 class="text-2xl">Surveys you own</h2>
	<ul class="ml-8 list-disc">
		{#each data.surveys as survey}
			<li class="grid grid-cols-2">
				<div>
					<Link href="survey/{survey.id}">{survey.title}</Link>
					<span class="mr-5 inline-block">
						({survey.fillRate.filled}/{survey.fillRate.expected})
						{#if survey.fillRate.filled === survey.fillRate.expected}
							<CheckIcon />
						{/if}
					</span>
				</div>
				<div>
					<Link
						href="survey/new?from={survey.id}"
						class="ml-2 inline-block hover:bg-slate-200"
						title="Duplicate survey"
						aria-label="Duplicate survey"
						><DuplicateIcon />
					</Link>
				</div>
			</li>
		{/each}
	</ul>

	<Link href="survey/new">Create a new Survey</Link>
</div>
