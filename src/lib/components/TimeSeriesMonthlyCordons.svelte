<!-- BarChart.svelte -->
<script>
    import * as d3 from "d3";
    import {p} from '$lib/props.svelte';
  
    const {
      data_total,
      height = 130,
      marginTop = 10,
      marginRight = 30,
      marginBottom = 30,
      marginLeft = 80,
      type = 'counter'
    } = $props();

    const colors = ["#374c80", "#955196", "#ff912b", "#e9547a"];
    const keys = ["ON_FOOT_trips", "CYCLING_trips", "PUBLIC_trips", "AUTOMOBILE_trips"];

    let data_cleaned = $derived.by(() => {
      if (!data_total || data_total.length === 0) return [];
      return type === 'cordon' ? data_total : fillMissingMonths(data_total);
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

    const timeFormat = type === 'cordon' ? d3.timeFormat("%Y") : d3.timeFormat("%b '%y");
    
    let width = $derived(containerWidth || 0);
    
    let xScale = $derived.by(() => {
      if (!data_cleaned || !data_cleaned.length) return d3.scaleBand();
      return d3.scaleBand()
        .domain(data_cleaned.map(d => new Date(d.timestamp)))
        .range([marginLeft, width - marginRight])
        .padding(0.2);
    });
      
    let yScale = $derived.by(() => {
      if (!data_cleaned || !data_cleaned.length) return d3.scaleLinear();
      const maxTotal = d3.max(data_cleaned, d => 
        keys.reduce((sum, key) => sum + (d[key] || 0), 0)
      );
      return d3.scaleLinear()
        .domain([0, maxTotal])
        .range([height - marginBottom, marginTop]);
    });

    // Create the stack generator
    const stackGen = d3.stack().keys(keys);
  
    const xTicks = $derived.by(() => {
      if (!data_cleaned || !data_cleaned.length) return [];
      const [start, end] = d3.extent(data_cleaned, d => new Date(d.timestamp));
      return type === 'cordon' ? 
        (containerWidth < 500 
          ? d3.timeYear.range(start, d3.timeYear.ceil(end), 8)
          : d3.timeYear.range(start, d3.timeYear.ceil(end), 5)) :
        (containerWidth < 500 
          ? d3.timeYear.range(start, d3.timeYear.ceil(end))
          : d3.timeMonths(start, d3.timeMonth.ceil(end), 6));
    });

    let stackedData = $derived.by(() => {
      if (!data_cleaned || !data_cleaned.length) return [];
      try {
        return stackGen(data_cleaned);
      } catch (error) {
        console.error('Stacking error:', error);
        return [];
      }
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
        <line
          stroke="currentColor"
          x1={xScale(tick)}
          x2={xScale(tick)}
          y1={0}
          y2={6}
        />
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
      {#each yScale.ticks(5) as tick}
        {#if tick !== 0}
          <line
            stroke="currentColor"
            stroke-opacity="0.1"
            x1={0}
            x2={width - marginLeft - marginRight}
            y1={yScale(tick)}
            y2={yScale(tick)}
          />
          <line
            stroke="currentColor"
            x1={0}
            x2={-6}
            y1={yScale(tick)}
            y2={yScale(tick)}
          />
        {/if}
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

    {#if stackedData.length > 0}
      {#each stackedData as series, i}
        {#each series as d}
          {@const dataPoint = d.data}
          <rect
            x={xScale(new Date(dataPoint.timestamp))}
            y={yScale(d[1])}
            width={xScale.bandwidth()}
            height={yScale(d[0]) - yScale(d[1])}
            fill={colors[i]}
          />
        {/each}
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