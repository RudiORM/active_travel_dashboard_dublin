<script>
  import Dublin_info from "./Dublin_info.svelte";
  import Dublin_district_info from "./Dublin_district_info.svelte";
   import Dublin_counters_info from "./Dublin_counters_info.svelte";
   import Dublin_strava_info from "./Dublin_strava_info.svelte";
  import { p } from '$lib/props.svelte';
	import DublinCordonInfo from "./Dublin_cordon_info.svelte";
</script>

<div class="map-info">
  {#if p.dynamic.visMode == "census"}
    <Dublin_info />
{:else if p.dynamic.visMode == "google"}
    <Dublin_district_info />

  {:else if p.dynamic.visMode == "strava"}
    <Dublin_strava_info />

    {:else if p.dynamic.visMode == "temp"}
    <Dublin_counters_info />

  {:else}
       <DublinCordonInfo />
  {/if} 
</div>

<style>
 .map-info {
    flex: 1 1 50%;
    min-width: 0;  /* Add this */
    display: flex; /* Add this */
}
</style>
