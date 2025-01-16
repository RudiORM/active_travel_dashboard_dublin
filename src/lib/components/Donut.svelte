<script>
  import * as d3 from "d3";

  let { data } = $props();
  
  const width = 250;
  const height = 250;
  const margin = 0;
  const radius = (Math.min(width, height) / 2 - margin);

  const color = d3
    .scaleOrdinal()
    .domain([
      "AUTOMOBILE_trips",
      "PUBLIC_trips",
      "CYCLING_trips",
      "ON FOOT_trips",
    ])
    .range(["#e9547a", "#ff912b", "#955196", "#374c80"]);

  const labs = ["Car", "", "Bike", "Walk", "", ""];

  const pie = d3
    .pie()
    .sort(null)
    .value((d) => d[1]);

  const arc = d3
    .arc()
    .cornerRadius(4)
    .innerRadius(radius * 0.6)
    .outerRadius(radius * 0.9);

  const outerArc = d3
    .arc()
    .innerRadius(radius * 0.75)
    .outerRadius(radius * 0.75);

  // Make these derived values
  let processedData = $derived.by(() => {
    const final_data = {};
    let summ = 0;
    
    // Process the data
    Object.keys(data).forEach(key => {
      if (key.includes("trips") && !key.includes("TOTAL")) {
        final_data[key] = data[key];
        summ += data[key];
      }
    });

    // Sort the data
    const dataArray = Object.entries(final_data);
    const sortedDataArray = dataArray.sort((a, b) => b[1] - a[1]);
    const sortedDataObject = Object.fromEntries(sortedDataArray);

    // Create the pie data
    const data_ready = pie(Object.entries(sortedDataObject));

    return {
      data_ready,
      summ
    };
  });

  function calculatePercentage(slice) {
    let dd = (slice.data[1] / processedData.summ) * 100;
    return dd > 4 ? dd.toFixed(0) + "%" : "";
  }

  function midAngle(d) {
    return d.startAngle + (d.endAngle - d.startAngle) / 2;
  }
</script>

<svg
  width={width}
  height={height}
  viewBox="{-width / 2}, {-height / 2}, {width}, {height}"
  style:max-width="100%"
  style:height="auto"
>
  <g class="chart-inner">
    {#each processedData.data_ready as slice}
      <path d={arc(slice)} fill={color(slice.data[0])} stroke="white" />
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

<style>
  :global(body) {
    margin: 0;
  }

  .chart-inner {
    display: flex;
  }
</style>