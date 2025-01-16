<!-- BarChart.svelte -->
<script>
  import * as d3 from "d3";
  import {p} from '$lib/props.svelte';

  const {
    data,
    color,
    height = 130,
    marginTop = 10,
    marginRight = 30,
    marginBottom = 40,
    marginLeft = 80,
  } = $props();

  let containerWidth = $state(0);
  let container = $state(null);

  const f = d3.format(",.0f");
  
  let width = $derived(containerWidth || 0);
  
  // Adjust x scale for bars - use band scale instead of linear
  let xScale = $derived(
    d3.scaleBand()
      .domain(d3.range(24)) // 0-23 hours
      .range([marginLeft, width - marginRight])
      .padding(0.3) // Add padding between bars
  );
    
  let yScale = $derived(
    d3.scaleLinear()
      .domain([0, data ? d3.max(data, d => d.averageCount) : 1])
      .range([height - marginBottom, marginTop])
  );


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
      {#each d3.ticks(0, 23, containerWidth < 400 ? 3 : containerWidth < 600 ? 4 : 6) as tick}
        <!-- X-Axis Ticks -->
        <line
          stroke="black"
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
          {tick.toString().padStart(2, '0')}:00
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
            stroke-width="1.5px"
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

    {#if data}
      <!-- The Bars -->
      {#each data as d}
        <rect
          x={xScale(d.hour)}
          y={yScale(d.averageCount)}
          width={xScale.bandwidth()}
          height={height - marginBottom - yScale(d.averageCount)}
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