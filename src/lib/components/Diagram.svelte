<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { curveLinearClosed } from 'd3-shape';
	import { flatGroup } from 'd3-array';
	import { Axis, Chart, Points, Spline, Svg } from 'layerchart';

	const {
		data
	}: {
		data: { skill: string; participant: number; rating: number | undefined }[];
	} = $props();

	const averageValues = flatGroup(data, (d) => d.skill).map(([skill, ratings]) => {
		const actualRatings = ratings.filter((r) => r.rating !== undefined);
		const avg = actualRatings.reduce((a, b) => a + (b.rating ?? 0), 0) / actualRatings.length;
		return { skill, rating: avg };
	});

	const colors = [
		'stroke-slate-300',
		'stroke-violet-300',
		'stroke-red-300',
		'stroke-lime-300',
		'stroke-blue-300',
		'stroke-amber-300',
		'stroke-stone-300',
		'stroke-emerald-300',
		'stroke-cyan-300',
		'stroke-pink-300'
	];
</script>

<div class="chart-container">
	<Chart
		{data}
		x="skill"
		xScale={scaleBand()}
		y="rating"
		yDomain={[0, 3]}
		yPadding={[0, 10]}
		padding={{ top: 32, bottom: 8 }}
		radial
	>
		<Svg center>
			<Axis
				placement="radius"
				grid={{ class: 'stroke-slate-950' }}
				ticks={[0, 1, 2, 3]}
				format={(d) => ''}
			/>
			<Axis placement="angle" grid={{ class: 'stroke-slate-950' }} />
			{#each flatGroup(data, (d) => d.participant) as [participant, ratings], idx}
				<Spline
					data={ratings}
					curve={curveLinearClosed}
					class="{colors[idx % colors.length]} stroke-[2px]"
				/>
			{/each}
			<Spline data={averageValues} curve={curveLinearClosed} class="stroke-lime-600 stroke-[4px]" />
			<!-- <Points class="fill-red-900 stroke-slate-950" /> -->
		</Svg>
	</Chart>
</div>

<style>
	.chart-container {
		width: 30rem;
		height: 30rem;
	}
</style>
