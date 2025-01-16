<script>
	import { format } from 'd3';
	import { p } from '$lib/props.svelte';
	import TimeSeriesMonthly from './TimeSeriesMonthly.svelte';

	// State variables using $state


	let routeName = $derived.by(() => {
		if (p.dynamic.strava_track == 'Dodder') {
			return 'Dodder Greenway';
		}

		if (p.dynamic.strava_track == 'DLR') {
			return 'Dun Laoghaire Coastal';
		}

		if (p.dynamic.strava_track == 'K2TS') {
			return 'Kilmainham to Thomas Street';
		}

		if (p.dynamic.strava_track == 'C2CC') {
			return 'Clontarf to City Center';
		}

		if (p.dynamic.strava_track == 'Portmarnock') {
			return 'Portmarnock Greenway';
		}

		return '';
	});

	const f = format(',.0f');

	// Get raw time series data
	let timeSeriesData = $derived.by(() =>
		p.dynamic.strava_data.map((d) => [d['date'], d[routeName]])
	);

	// Transform time series data to match the desired format
	let processedTimeSeriesData = $derived.by(() => {
		if (!timeSeriesData) return [];
		
		return timeSeriesData.map(([timestamp, count]) => ({
			timestamp: timestamp instanceof Date ? timestamp.toISOString() : new Date(timestamp).toISOString(),
			counts: count
		})).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
	});

	// Filter data by year
	let data_2022 = $derived.by(() => 
		processedTimeSeriesData.filter((record) => {
			const year = new Date(record.timestamp).getFullYear();
			return year === 2022;
		})
	);

	let data_2023 = $derived.by(() => 
		processedTimeSeriesData.filter((record) => {
			const year = new Date(record.timestamp).getFullYear();
			return year === 2023;
		})
	);

	// Calculate totals and averages
	let monthlyTotals = $derived.by(() => {
		const total_2022 = data_2022.reduce((sum, record) => sum + record.counts, 0);
		const total_2023 = data_2023.reduce((sum, record) => sum + record.counts, 0);

        
		return { total_2022, total_2023 };
	});



	// Calculate percentage change
	let percentageChange = $derived.by(() => {
		if (monthlyTotals.total_2022 === 0) return '';
		
		const change = (((monthlyTotals.total_2023 - monthlyTotals.total_2022) / monthlyTotals.total_2022) * 100).toFixed(1);
		return ` (${change > 0 ? '+' : ''}${change}%)`;
	});

	// Calculate daily average
	let averageCount = $derived.by(() => {
		if (monthlyTotals.total_2023 === 0) return '';
		return monthlyTotals.total_2023 / 365;
	});

	$effect(() => {
		console.log('Time series:', processedTimeSeriesData);
		console.log('Data 2022:', data_2022);
		console.log('Monthly averages:', monthlyTotals);
		console.log('Average count:', averageCount);
	});
</script>

<div class="container">
	<div class="overall2" on:click={() => (selectedLocation = '')}>
		<h2 class="dublin-header">{'Route-based estimates'}</h2>

		<div class="flex-items3">
			<div class="a1">
				<div class="text">
					<p class="label">Strava route</p>
					<p class="loc">{routeName}</p>
				</div>
			</div>
			<div class="a1">
				<div class="text">
					<p class="label">
						{'Estimated Daily ' + 'Cyclists' + ' 2023'}
					</p>
					<p class="number" style="color:{'#955196'}">
						{f(averageCount) + percentageChange}
					</p>
				</div>
			</div>
		</div>
	</div>

	<div class="overall2" >
		<div class="text2">
			<h2 class="dublin-header">{'Time Series'}</h2>
			<div class="text">
				<div class="a1">
					<p class="label" style="margin-bottom: 0px;">
						{
							'Estimated Cyclists by month'}
					</p>
				</div>

			
			</div>
            {#if data_2022.length > 0}
            <TimeSeriesMonthly data_total={processedTimeSeriesData} color={'#955196'} /> 
        {:else}
				<div class="text">
					<p class="loc">{'fetching data...'}</p>
				</div>
			{/if}

		</div>
	</div>

	<div class="overall2">
		<div class="text2">
			<h2 class="dublin-header">{'About ' + 'this view'}</h2>
			<div class="number2">{@html "The Route view shows the results of the Dublin Strava Cycling Model, developed by Smart Dublin to estimate the volume of bicycle traffic along key routes in Dublin. <br><br>The model uses Strava Metro data as a basis to extrapolate the total estimated volume of bicycle traffic. Initially, the model has been applied to 4 different routes across the Dublin region for 2021-2023. "}</div>
		</div>
	</div>
</div> 

<style>
	.container {
		height: 100svh;
		min-height: 100svh;
		flex: 1;
		min-width: 0; /* Add this */
		display: flex; /* Add this */
		flex-direction: column; /* Add this */
	}

	.dublin-header {
		font-size: 1.2rem;
		font-style: normal;
		font-weight: 500;
		background-color: #a7c9de;
		padding: 5px 0px 5px 5px;
		-moz-border-radius: 0px;
		-webkit-border-radius: 15px 15px 0px 0px;
		border-radius: 15px 15px 0px 0px;
		text-indent: 10px;
		color: #324754;
	}

	.flex-items {
		display: flex;
		gap: 10px;
	}

	.flex-items2 {
		display: flex;
		gap: 20px;
	}

	.flex-items3 {
		display: flex;
		gap: 5px;
	}

	.overall2 {
		background: white;
		width: 100%;
		border-radius: 15px;
		box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.1);
		padding-bottom: 2px;
		margin-bottom: 20px;
		cursor: pointer;
		min-width: 0; /* Add this */
		flex-shrink: 1; /* Add this */
	}

	.item {
		display: flex;
		flex: 1 1 50%;
		gap: 6px;
	}

	.a1 {
		display: flex;
		flex: 1 1 50%;
	}

	.text {
		flex: 0 1 auto;
		text-transform: uppercase;
		padding: 10px;
		padding-left: 15px;
		padding-right: 15px;
		margin-bottom: 0px;
	}

	.text2 {
		width: 100%; /* Add this */
		min-width: 0; /* Change from min-width: 100px */
	}

	.number {
		font-size: 1.5rem;
		font-style: normal;
		text-transform: none;
		font-weight: 400;
		line-height: 137.5%; /* 41.25px */
		margin-bottom: 0;
		color: #374c80;
	}

	.number2 {
		font-size: 1rem;
		font-style: 300px;
		font-weight: 300;
		line-height: 137.5%; /* 41.25px */
		margin-bottom: 0;
		padding: 15px;
	}

	.loc {
		font-size: 1.1rem;
		font-style: normal;
		color: #374c80;
		font-weight: normal;
		line-height: 120%;
		margin-bottom: 5px;
	}

	.label {
		font-size: 0.9rem;
		font-style: normal;
		color: #6d8495;
		font-weight: 700;
		line-height: 130%; /* 24px */
		margin-bottom: 6px;
		margin-top: 2px;
	}

	.a2 {
		display: flex;
		flex: 0 0 50%;
		align-items: right;
		justify-content: right;
		flex-direction: column;
		padding: 0px;
	}

	.sel {
		font-family: 'Work Sans';
		border-radius: 5px;
		border-color: #aaa;
		border: 2px solid #aaaaaa88;
		background-color: #ffffffdd;
		font-size: 0.9rem;
		margin-top: 10px;
		width: fit-content;
	}

	@media screen and (max-width: 450px) {
		.dublin-header {
			font-size: 24px;
			line-height: 137.5%;
		}

		.number {
			font-size: 24px;
			line-height: 150%; /* 36px */
		}

		.label {
			font-size: 1px;
			line-height: 150%; /* 24px */
		}
		.flex-items {
			flex-direction: column;
			gap: 9px;
		}
		.item:not(:first-of-type) {
			border-top: 1px solid #ececec;
			padding-top: 10px;
		}
	}
</style>
