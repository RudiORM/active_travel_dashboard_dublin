<script>
  import { scaleSqrt } from "d3";
  import {p} from '$lib/props.svelte';

  let props = $props();

  const rScale = scaleSqrt()
    .domain([0, 50000])
    .range([10,40]);

    const rScaleBike = scaleSqrt()
    .domain([0, 3000])
    .range([10,40]);


  const isPedestrianMode = $derived.by(() => {
        return props.markerData.mode === "pedestrian" && p.deriveds.metricToggle === "walk_counter";
    });

    const isBikeMode = $derived.by(() => {
        return props.markerData.mode === "bike" && p.deriveds.metricToggle === "cycle_counter";
    });

    const isActiveCounterMode = $derived.by(() => {
        return p.deriveds.metricToggle === "active_counter";
    });

    // Derived state for `h`
    let h = $derived.by(() => {
        return isBikeMode
            ? rScaleBike(props.markerData.value)
            : isPedestrianMode || isActiveCounterMode
            ? rScale(props.markerData.value) : 0
    });


  // Define marker background color based on mode
  let backgroundColor = $state(props.markerData.mode === "pedestrian" ? "#374c80" : "#955196")

  // Handle marker click to update selected counter and name
  function handleMarkerClick() {
    p.dynamic.selected_counter = props.markerData.id;
    p.dynamic.counter_name = props.markerData.name;
    p.dynamic.counter_type = props.markerData.mode;

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
