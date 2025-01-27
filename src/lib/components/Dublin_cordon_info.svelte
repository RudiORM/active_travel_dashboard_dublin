<script>
	import { format } from 'd3';
	import { p } from '$lib/props.svelte';
	import TimeSeriesMonthlyCordons from './TimeSeriesMonthlyCordons.svelte';
	import DonutCordon from './DonutCordon.svelte';
	import Fa from "svelte-fa";
  import {
    faBicycle, faPersonWalking, faBus,
    faSmog, faCarSide,
  } from "@fortawesome/free-solid-svg-icons";

	const f = format(',.0f');

	const categories = ['ON FOOT_trips', 'CYCLING_trips', 'PUBLIC_trips', 'AUTOMOBILE_trips'];


	function pct(l,i) {
    const sum = l.reduce((acc, curr) => acc + curr, 0);
    return Math.round((l[i] / sum) * 100);
  }


	let modalSplit = $derived.by(() => {

	const originalValues = p.dynamic.cordon_data.map(entry => entry[p.dynamic.selected_cordon])
	const originalNames = p.dynamic.cordon_data.map(entry => entry['Mode']);
    const values = new Array(4).fill(0);
    
    originalNames.forEach((category, index) => {
      switch(category) {
        case 'Bus':
          values[2] += originalValues[index]; // PUBLIC_trips
          break;
        case 'Pedestrians':
          values[0] += originalValues[index]; // ON FOOT_trips
          break;
        case 'Cyclists':
          values[1] += originalValues[index]; // CYCLING_trips
          break;
        default:
          values[3] += originalValues[index]; // AUTOMOBILE_trips
          break;
      }
    });

    return values;
  });


  const processedTimeSeriesData = $derived.by(() => {
  // First, flatten all the year data
  const flattenedData = p.dynamic.cordon_data.flatMap((item) => {
    return Object.keys(item)
      .filter((key) => !isNaN(key)) // Only keep numeric year keys
      .map((year) => ({
        timestamp: new Date(`${year}-01-01`).toISOString(),
        counts: item[year],
        mode: item['Mode']
      }));
  }).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Group by timestamp first
  const groupedByTimestamp = {};
  
  flattenedData.forEach(entry => {
    const timestamp = entry.timestamp;
    if (!groupedByTimestamp[timestamp]) {
      groupedByTimestamp[timestamp] = {
        timestamp,
        ON_FOOT_trips: 0,
        CYCLING_trips: 0,
        PUBLIC_trips: 0,
        AUTOMOBILE_trips: 0
      };
    }

    // Add to the appropriate category
    switch(entry.mode) {
      case 'Bus':
        groupedByTimestamp[timestamp].PUBLIC_trips += entry.counts;
        break;
      case 'Pedestrians':
        groupedByTimestamp[timestamp].ON_FOOT_trips += entry.counts;
        break;
      case 'Cyclists':
        groupedByTimestamp[timestamp].CYCLING_trips += entry.counts;
        break;
      default:
        groupedByTimestamp[timestamp].AUTOMOBILE_trips += entry.counts;
        break;
    }
  });

  // Convert back to array and sort by timestamp
  return Object.values(groupedByTimestamp)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
});


$effect(() => {
  console.log('processedTimeSeriesData:', processedTimeSeriesData);

  
});

</script>



<div class="container">
	<div class="overall2" on:click={() => (p.dynamic.selected_cordon='2023')}>
		<h2 class="dublin-header">{p.dynamic.selected_cordon=='2023'?'All Dublin passengers':'Vehicles by Cordon Counter'}</h2>

		<div class="flex-items3">
			<div class="a1">
			  <div class="text">
				<p class="label">Cordon Name</p>
					<p class="loc">{p.dynamic.selected_cordon=='2023'?"Dublin":p.dynamic.selected_cordon}</p>
					<p class="label">{@html p.dynamic.selected_cordon=='2023'? '\xa0' : '&#9204;'}</p>

				<p class="number" style="color:#955196">
				  {pct(modalSplit,1)+'%'} <span style="font-size:1.2rem"><Fa icon={faBicycle} /></span>
				</p>
				<p class="number" style="color:#374c80">
				  {pct(modalSplit,0)+'%'} <span style="font-size:1.2rem"><Fa icon={faPersonWalking} /></span>
				</p>
				<p class="number" style="color:#e9547a">
				  {pct(modalSplit,3)+'%'} <span style="font-size:1.2rem"><Fa icon={faCarSide} /></span>
				</p>
				<p class="number" style="color:#ff912b">
				  {pct(modalSplit,2)+'%'} <span style="font-size:1.2rem"><Fa icon={faBus} /></span>
				</p>

				
			  </div>
			</div>
	  
			<div class="a2">
				<div class="text" style="padding-left:0px; height: 100%; display: flex; align-items: center;">
					<DonutCordon categories={categories} values={modalSplit} />
			</div>
			</div>
		  </div>
		  
		</div>


	<div class="overall2" >
		<div class="text2">
			<h2 class="dublin-header">{'Yearly trends: all passengers'}</h2>
			<div class="text">
				<div class="a1">
					<p class="label" style="margin-bottom: 0px;">
						{
							'Yearly traffic trends '}
					</p>
				</div>

			
			</div>
            <TimeSeriesMonthlyCordons data_total={processedTimeSeriesData} 
			type={'cordon'} /> 
    
		</div>
	</div>

	<div class="overall2">
		<div class="text2">
			<h2 class="dublin-header">{'About ' + 'this view'}</h2>
			<div class="number2">{@html "The Cordons view shows the <a href='https://www.nationaltransport.ie/wp-content/uploads/2024/06/NTA-Canal-Cordon-Report-2023.pdf'> Dublin City Council cordon counts traffic survey</a>, measured at 33 locations around the Royal and Grand Canals each November. The figures represent traffic measured on one November day between 7am and 10am.</a>"}</div>
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
    align-items: center; /* This will center a2 relative to a1's height */
  }

  .a2 {
    display: flex;
    flex: 0 0 50%;
    align-items: center; /* Center the text div vertically */
    justify-content: right;
    padding: 0px;
  }

  .text {
    flex: 0 1 auto;
    text-transform: uppercase;
    padding: 10px;
    padding-left: 15px;
    padding-right: 15px;
    margin-bottom: 0px;
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
