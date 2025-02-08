<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { curveLinear, curveLinearClosed } from 'd3-shape';
	import { flatGroup } from 'd3-array';
	import { Axis, Chart, Points, Spline, Svg } from 'layerchart';

	type Props = {
		reviewMode: boolean;
		data: { skill: string; participant: number; rating: number | undefined }[];
	};

	const { data, reviewMode }: Props = $props();

	const averageValues = flatGroup(data, (d) => d.skill)
		.map(([skill, ratings]) => {
			const actualRatings = ratings.filter((r) => r.rating !== undefined);
			const avg = actualRatings.reduce((a, b) => a + (b.rating ?? 0), 0) / actualRatings.length;
			return { skill, rating: avg };
		})
		// .filter((d) => !isNaN(d.rating));
		.map((d) => ({
			...d,
			rating: isNaN(d.rating) ? undefined : d.rating
		}));

	const colors = [
		{ stroke: 'stroke-slate-300', fill: 'fill-slate-400' },
		{ stroke: 'stroke-violet-300', fill: 'fill-violet-400' },
		{ stroke: 'stroke-red-300', fill: 'fill-red-400' },
		{ stroke: 'stroke-lime-300', fill: 'fill-lime-400' },
		{ stroke: 'stroke-blue-300', fill: 'fill-blue-400' },
		{ stroke: 'stroke-amber-300', fill: 'fill-amber-400' },
		{ stroke: 'stroke-stone-300', fill: 'fill-stone-400' },
		{ stroke: 'stroke-emerald-300', fill: 'fill-emerald-400' },
		{ stroke: 'stroke-cyan-300', fill: 'fill-cyan-400' },
		{ stroke: 'stroke-pink-300', fill: 'fill-pink-400' }
	];

	const anonymousColor = { stroke: 'stroke-slate-300', fill: 'fill-slate-400' };

	function getColor(idx: number) {
		if (reviewMode) {
			return anonymousColor;
		}
		return colors[idx % colors.length];
	}
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
					data={[...ratings, ratings[0]]}
					curve={curveLinear}
					class="{getColor(idx).stroke} stroke-[2px]"
				/>
				<Points data={ratings} class="{getColor(idx).stroke} {getColor(idx).fill} stroke-[2px]" />
			{/each}
			<Spline
				data={[...averageValues, averageValues[0]]}
				curve={curveLinear}
				class="stroke-lime-600 stroke-[4px]"
			/>
			<Points data={averageValues} class="fill-lime-500 stroke-lime-600 stroke-[2px]" />
		</Svg>
	</Chart>
</div>

<style>
	.chart-container {
		width: 30rem;
		height: 30rem;
	}
</style>
