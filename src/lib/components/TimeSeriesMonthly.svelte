<!-- BarChart.svelte -->
<script>
    import * as d3 from "d3";
    import {p} from '$lib/props.svelte';
  
    const {
      data_total,
      color,
      height = 130,
      marginTop = 10,
      marginRight = 30,
      marginBottom = 30,
      marginLeft = 80,
      type = 'counter'
    } = $props();



    function fillMissingMonths(data) {
    if (!data || data.length === 0) return [];
    
    // Get start and end dates
    const dates = data.map(d => new Date(d.timestamp));
    const startDate = new Date(Math.min(...dates));
    const endDate = new Date(Math.max(...dates));
    
    // Generate array of all months
    const allData = [];
    const currentDate = new Date(startDate);
    
    // Reset to first of the month
    currentDate.setDate(1);
    currentDate.setHours(0, 0, 0, 0);
    
    while (currentDate <= endDate) {
        // Check if we have data for this month
        const existingData = data.find(d => {
            const dDate = new Date(d.timestamp);
            return dDate.getFullYear() === currentDate.getFullYear() && 
                   dDate.getMonth() === currentDate.getMonth();
        });
        
        // Add existing data or create zero entry
        allData.push({
            timestamp: new Date(currentDate).toISOString(),
            counts: existingData ? existingData.counts : 0
        });
        
        // Move to next month
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return allData;

    
}

let data_cleaned = $derived.by(()=>{
  if(type === 'cordon') return data_total
  return fillMissingMonths(data_total)
});


    let containerWidth = $state(0);
    let container = $state(null);

    const f = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value > 999) {
      return `${Math.round(value / 1000)}K`;
    } else {
      return d3.format(",.0f")(value);
    }
  };


    const timeFormat = type === 'cordon'?d3.timeFormat("%Y"):d3.timeFormat("%b '%y");
    
    let width = $derived(containerWidth || 0);
    
    // Convert to band scale for bars
    let xScale = $derived.by(() => {
      const dates = data_cleaned ? data_cleaned.map(d => new Date(d.timestamp)) : [new Date()];
      return d3.scaleBand()
        .domain(dates)
        .range([marginLeft, width - marginRight])
        .padding(0.3);
    });
      
    let yScale = $derived(
      d3.scaleLinear()
        .domain([0, data_cleaned ? d3.max(data_cleaned, d => d.counts) : 1])
        .range([height - marginBottom, marginTop])
    );
  
    const xTicks = $derived.by(() => {
  if (!data_cleaned) return [];
  const [start, end] = d3.extent(data_cleaned, d => new Date(d.timestamp));
  return type==='cordon'?(containerWidth < 500 
    ? d3.timeYear.range(start, d3.timeYear.ceil(end),8)
    : d3.timeYear.range(start, d3.timeYear.ceil(end),5)):
   containerWidth < 500 
    ? d3.timeYear.range(start, d3.timeYear.ceil(end))
    : d3.timeMonths(start, d3.timeMonth.ceil(end), 6);
});
  
  
  </script>
  
  <div bind:clientWidth={containerWidth} bind:this={container}>
    <svg {width} {height}>
      <!-- X-Axis -->
      <g transform="translate(0,{height - marginBottom})">
        <line 
          stroke="currentColor" 
          x1={marginLeft - 6} 
          x2={width - marginRight} 
        />
        {#each xTicks as tick}
          <!-- X-Axis Ticks -->
          <line
            stroke="currentColor"
            x1={xScale(tick)}
            x2={xScale(tick)}
            y1={0}
            y2={6}
          />
          <!-- X-Axis Tick Labels -->
          <text 
            fill="currentColor" 
            text-anchor="middle" 
            x={xScale(tick)} 
            y={22}
            font-size="14"
          >
            {timeFormat(tick)}
          </text>
        {/each}
      </g>
  
      <!-- Y-Axis and Grid Lines -->
      <g transform="translate({marginLeft},0)">
        {#each d3.ticks(0, yScale.domain()[1], 3) as tick}
          {#if tick !== 0}
            <!-- Grid Lines -->
            <line
              stroke="currentColor"
              stroke-opacity="0.1"
              x1={0}
              x2={width - marginLeft - marginRight}
              y1={yScale(tick)}
              y2={yScale(tick)}
            />
            <!-- Y-Axis Ticks -->
            <line
              stroke="currentColor"
              x1={0}
              x2={-6}
              y1={yScale(tick)}
              y2={yScale(tick)}
            />
          {/if}
          <!-- Y-Axis Tick Labels -->
          <text
            fill="currentColor"
            text-anchor="end"
            dominant-baseline="middle"
            x={-9}
            y={yScale(tick)}
            font-size="14"
          >
            {f(tick)}
          </text>
        {/each}
      </g>
  
      {#if data_cleaned}
        <!-- The Bars -->
        {#each data_cleaned as d}
          <rect
            x={xScale(new Date(d.timestamp))}
            y={yScale(d.counts)}
            width={xScale.bandwidth()}
            height={height - marginBottom - yScale(d.counts)}
            fill={color}
          />
        {/each}
      {/if}
    </svg>
  </div>
  
  <style>
    div {
      width: 100%;
      min-width: 0;
      overflow: hidden;
    }
    
    svg {
      width: 100%;
      height: 100%;
    }
  </style>