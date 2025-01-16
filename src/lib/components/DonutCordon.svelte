<script>
    import * as d3 from "d3";
  
    let { categories, values } = $props();
    
    const width = 250;
    const height = 250;
    const margin = 0;
    const radius = (Math.min(width, height) / 2 - margin);

    const color = d3
      .scaleOrdinal()
      .domain(categories)
      .range(["#374c80", "#955196", "#ff912b", "#e9547a"]);
  
    const pie = d3
      .pie()
      .sort(null)
      .value((d) => d.value);
  
    const arc = d3
      .arc()
      .cornerRadius(4)
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 0.9);
  
    const outerArc = d3
      .arc()
      .innerRadius(radius * 0.75)
      .outerRadius(radius * 0.75);
  
    let processedData = $derived.by(() => {
      const data_ready = pie(categories.map((category, i) => ({ 
        name: category, 
        value: values[i]
      })));
  
      const summ = values.reduce((acc, curr) => acc + curr, 0);
  
      return {
        data_ready,
        summ
      };
    });
    
  
    function calculatePercentage(slice) {
      let dd = (slice.data.value / processedData.summ) * 100;
      return dd > 4 ? dd.toFixed(0) + "%" : "";
    }
  
    function midAngle(d) {
      return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }
  </script>

  
<div class="donut-wrapper">

  <svg
    width={width}
    height={height}
    viewBox="{-width / 2}, {-height / 2}, {width}, {height}"
    style:max-width="100%"
    style:height="auto"
  >
    <g class="chart-inner">
      {#each processedData.data_ready as slice}
        <path d={arc(slice)} fill={color(slice.data.name)} stroke="white" />
      {/each}
  
      {#each processedData.data_ready as slice}
        <text
          transform={`translate(${outerArc.centroid(slice)})`}
          x={0}
          dy="0.35rem"
          text-anchor={midAngle(slice) < Math.PI ? "middle" : "middle"}
          font-size="16px"
          fill="#fff"
        >
          {calculatePercentage(slice)}
        </text>
      {/each}
    </g>
  </svg>

</div>
  
  <style>
    :global(body) {
      margin: 0;
    }
  
    .chart-inner {
      display: flex;
    }

    .donut-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
  }
  </style>