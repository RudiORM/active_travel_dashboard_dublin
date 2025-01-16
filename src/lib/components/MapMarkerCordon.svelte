<script>
  import { scaleSqrt } from "d3";
  import {p} from '$lib/props.svelte';

  let props = $props();

  const rScale = scaleSqrt()
    .domain([0, 1000])
    .range([10,40]);

    const rScaleBike = scaleSqrt()
    .domain([0, 1000])
    .range([10,40]);


 
const loc = props.markerData.Location

const sz_walk = p.dynamic.cordon_data[0][loc]

const sz_bike = p.dynamic.cordon_data[1][loc]


    // Derived state for mode

  const isPedestrianMode = $derived.by(() => {
        return (p.dynamic.modeToggle === "Walking" && p.deriveds.metricToggle === "cordon_counter");
    });

    const isBikeMode = $derived.by(() => {
        return (p.dynamic.modeToggle === "Cycling" && p.deriveds.metricToggle === "cordon_counter");
    });

    const isActiveCounterMode = $derived.by(() => {
        return (p.dynamic.modeToggle === "Walking and Cycling" && p.deriveds.metricToggle === "cordon_counter");
    });

    // Derived state for `h`
    let h = $derived.by(() => {
        return isBikeMode
            ? rScaleBike(sz_bike)
            : isPedestrianMode || isActiveCounterMode
            ? rScale(sz_walk) : 0
    });


  // Define marker background color based on mode
  let backgroundColor = $derived(isBikeMode? "#955196" : "#374c80")
  // Handle marker click to update selected counter and name
  function handleMarkerClick() {
    p.dynamic.selected_cordon = loc
 

  }
</script>

<div
  class="marker"
  style="
    opacity: 0.7;
    background-color: {backgroundColor};
    background-size: {h}px {h}px;
    height: {h}px;
    width: {h}px;
    cursor: crosshair;
  "
  on:click={handleMarkerClick}

/>



<style>
  .marker {
    z-index: 4;
    transition: ease-in-out 250ms;
    border-radius: 40px;
    background-position: top;
    background-repeat: no-repeat;
    opacity: 0.7;
  }
</style>
