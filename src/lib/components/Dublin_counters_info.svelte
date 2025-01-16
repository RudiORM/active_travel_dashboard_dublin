<script>
	import { format } from 'd3';
	import { p } from '$lib/props.svelte';
    import TimeSeriesHourly from './TimeSeriesHourly.svelte';
	import TimeSeriesMonthly from './TimeSeriesMonthly.svelte';

	// Constants
	const DEFAULT_COUNTER_ID = '100043587';

	// State variables using $state
	let timeSeriesData = $state([]);
	let travelModeType = $state('pedestrian');
	let averageCount = $state('');
	let data_2023 = $state(0);
	let data_2024 = $state(0);

	let total_2023 = $state(0);
	let total_2024 = $state(0);

    let busiestWeeks = $state('');

	let percentageChange = $state('');

    let hourlyData = $state('');

	const f = format(',.0f');

	// Simple data processing functions
	function calculateTotal(data) {
		return data.reduce((acc, obj) => acc + obj.counts, 0);
	}

	function filterByTravelMode(data, mode) {
		const modeMap = {
			walk_counter: 'pedestrian',
			cycle_counter: 'bike'
		};

		return data.filter((d) => mode === 'active_counter' || d.travelMode === modeMap[mode]);
	}

    function getBusiestWeeks(timeSeriesData, numWeeks = 3) {
  // Sort the data by counts in descending order
  const sortedByTraffic = [...timeSeriesData]
    .sort((a, b) => b.traffic.counts - a.traffic.counts)
    .slice(0, numWeeks);

  // Format the results with date and traffic info
  return sortedByTraffic.map((week, index) => {
    const date = new Date(week.timestamp);
    return {
      rank: index + 1,
      weekStarting: date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      traffic: week.traffic.counts,
    };
  });
}
function processHourlyData(pedestrianData) {
    // First combine all IN flows by timestamp
    const inFlows = pedestrianData.filter(flow => 
        flow.data && flow.data.length > 0
    );

    // First combine all counts by exact timestamp
    const timestampCombined = new Map();
    
    // Process each inbound flow and combine counts for same timestamps
    inFlows.forEach(flow => {
        flow.data.forEach(record => {
            const timestamp = record.timestamp;
            const currentCount = timestampCombined.get(timestamp) || 0;
            timestampCombined.set(timestamp, currentCount + record.counts);
        });
    });


    // Now process the combined data by hour
    const hourlyData = new Map();
    const dayCountsByHour = new Array(24).fill(0);
    const processedDates = new Map(); // Track processed dates by hour to avoid counting same day twice

    // Process the combined timestamp data
    for (const [timestamp, count] of timestampCombined) {
        const date = new Date(timestamp);
        const hour = date.getUTCHours();
        const dateKey = date.toISOString().split('T')[0]; // Get date part only (YYYY-MM-DD)

        // Track unique days for each hour
        if (!processedDates.has(`${hour}-${dateKey}`)) {
            dayCountsByHour[hour]++;
            processedDates.set(`${hour}-${dateKey}`, true);
        }

        // Add to hourly totals
        const current = hourlyData.get(hour) || 0;
        hourlyData.set(hour, current + count);
    }

    // Create the final 24-hour average array
    const hourlyAverages = Array.from({length: 24}, (_, hour) => {
        const totalCount = hourlyData.get(hour) || 0;
        const numberOfDays = dayCountsByHour[hour];
        
        return {
            hour,
            timeSlot: `${String(hour).padStart(2, '0')}:00`,
            averageCount: numberOfDays > 0 
                ? Math.round(totalCount / numberOfDays)
                : 0,
            daysWithData: numberOfDays,
            totalCount: totalCount // Added for verification
        };
    });

    return hourlyAverages;
}

	function processTimeSeriesData(data) {

        // step 1: get the busiest weeks

        const weekly = filterByTravelMode(data.weekly_year, p.deriveds.metricToggle);
        busiestWeeks = getBusiestWeeks(weekly[0].data);

		// step 2: get the 2023 and 2024 data for time series

		const filteredData = filterByTravelMode(data.monthly_3years, p.deriveds.metricToggle);

		if (filteredData.length > 0) {
			// Access the data array from the first object
			timeSeriesData = filteredData[0].data
				.map((record) => ({
					timestamp: record.timestamp,
					counts: record.traffic.counts
				}))
				.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

	

			data_2023 = timeSeriesData.filter((record) => {
				const year = new Date(record.timestamp).getFullYear();
				return year === 2023;
			});



			data_2024 = timeSeriesData.filter((record) => {
				const year = new Date(record.timestamp).getFullYear();
				return year === 2024;
			});

			// Calculate totals
			total_2023 = data_2023.reduce((sum, record) => sum + record.counts, 0);
			total_2024 = data_2024.reduce((sum, record) => sum + record.counts, 0);

			if (total_2023 === 0) {
				percentageChange = '';
			} else {
				//monthly average
				total_2023 = total_2023 / data_2023.length;
				total_2024 = total_2024 / data_2024.length;

				percentageChange = (((total_2024 - total_2023) / total_2023) * 100).toFixed(1);
				percentageChange = percentageChange > 0 ? '+' + percentageChange : percentageChange;
				percentageChange = ' (' + percentageChange + '%)';
			}

			travelModeType = filteredData[0].travelMode;
			//convert to days
			averageCount = total_2024 / 30.3; // 3 months
		} else {
			averageCount = '';
		}

 


        // step 3: hourly data

        const hourly = filterByTravelMode(data.hourly_30days, p.deriveds.metricToggle);

        hourlyData = processHourlyData(hourly);
   
	}

	// Fetch data function
	async function fetchCounterData(counterId) {
		console.log('sending request to api');
		const response = await fetch('api/', {
			method: 'POST',
			body: JSON.stringify({ a: counterId }),
			headers: {
				'content-type': 'application/json'
			}
		});
		const data = await response.json();
		processTimeSeriesData(data);
	}

	// Effect to fetch data when counter changes
	$effect(() => {
		fetchCounterData(p.dynamic.selected_counter || DEFAULT_COUNTER_ID);
	});
</script>

<div class="container">
	<div class="overall2" on:click={() => (selectedLocation = '')}>
		<h2 class="dublin-header">{'Pedestrian & Cycle counter data'}</h2>

		<div class="flex-items3">
			<div class="a1">
				<div class="text">
					<p class="label">Counter name</p>
					<p class="loc">{p.dynamic.counter_name}</p>
				</div>
			</div>
			<div class="a1">
				<div class="text">
					<p class="label">
						{'Daily ' + (travelModeType == 'pedestrian' ? 'Pedestrians' : 'Cyclists') + ' 2024'}
					</p>
					<p class="number" style="color:{travelModeType != 'pedestrian' ? '#955196' : '#374c80'}">
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
							(travelModeType == 'pedestrian' ? 'Pedestrians ' : 'Cyclists ') +
							'by month'}
					</p>
				</div>

			
			</div>
            {#if data_2024.length > 0}
            <TimeSeriesMonthly data_total={timeSeriesData} color={travelModeType != 'pedestrian' ? '#955196' : '#374c80'} /> 
        {:else}
				<div class="text">
					<p class="loc">{'fetching data...'}</p>
				</div>
			{/if}

			<div class="text">
				<div class="a1">
					<p class="label" style="margin-bottom: 0px;">
						{'Average '+(travelModeType == 'pedestrian' ? 'pedestrians ' : 'cyclists ') +
							'by hour in last 30 days'}
					</p>
				</div>

		
			</div>
			{#if hourlyData.length > 0}
				<TimeSeriesHourly data={hourlyData} color={travelModeType != 'pedestrian' ? '#955196' : '#374c80'} /> 
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
			<div class="number2">{@html "The Eco-counters view shows a live feed of pedestrian and cycling counters in Dublin, accessed through the <a href='https://data.smartdublin.ie/dataset/pedestrian-and-cycle-counter-api-for-dublin-region'>Eco-visio API</a>. Click on a counter for pedestrian/cycling footfall. Note: Eco-Visio are investigating issues with some counters."}</div>
		</div>
	</div>
</div>

<style>
	.container {
    height: 100svh;
    min-height: 100svh;
    flex: 1;
    min-width: 0;  /* Add this */
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
