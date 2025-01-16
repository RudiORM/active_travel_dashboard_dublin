<script>
  import Fa from "svelte-fa";
  import {
    faHeartPulse,
    faSmog,
    faCarSide,
    faEuroSign
  } from "@fortawesome/free-solid-svg-icons";
  import {p} from '$lib/props.svelte';
  import StatBox from './StatBox.svelte';
  import { mapUtils } from '$lib/mapUtils.svelte';


  let sel = $state('home');

  let content = p.calcs_census.content

  function handleReset() {
    sel = 'home'
    mapUtils.resetTrigger = true;
}

</script>

<div class='container'>
  <!-- Region Stats -->
  <div class="overall2" on:click={() => {sel = "";handleReset()}}>
    <h2 class="dublin-header">Boundary Statistics by Region</h2>
    <div class="flex-items2" style='gap:0px'>
      <div class="population-box item" style='flex:1 1 50%'>
        <div class="text">
          <p class="label" style="font-size:.9rem">{p.deriveds.metricLabel + ' Census'}</p>
          <p class="loc">{p.calcs_census.location}</p>
          <p class="label">{@html p.calcs_census.location === "Dublin" ? '\xa0' : '&#9204;'}</p>
        </div>
      </div>
      
      <div class="population-box item" style='flex:1 1 50%'>
        <StatBox 
          label="Commuters"
          cycleValue={p.calcs_census.cycle}
          walkValue={p.calcs_census.walk}
        />
      </div>
    </div>
  </div>

  <!-- Health & Financial -->
  <div class="flex-items2">
    <div class="overall2" 
      style="background-color:{sel=='prem_deaths' ? '#a7c9de44' : '#ffffffaa'}" 
      on:click={() => sel = "prem_deaths"}>
      <h2 class="dublin-header"><Fa icon={faHeartPulse} /> Health</h2>
      <StatBox 
        label="Annual premature deaths avoided"
        cycleValue={p.calcs_census.prem_deaths_cycle}
        walkValue={p.calcs_census.prem_deaths_walk}
      />
    </div>

    <div class="overall2" 
      style="background-color:{sel=='health_exp' ? '#a7c9de44' : '#ffffffaa'}" 
      on:click={() => sel = "health_exp"}>
      <h2 class="dublin-header"><Fa icon={faEuroSign} /> Financial</h2>
      <StatBox 
        label="Annual money saved on fuel"
        cycleValue={p.calcs_census.cycle_eur_saved}
        walkValue={p.calcs_census.walk_eur_saved}
      />
    </div>
  </div>

  <!-- CO2 & Congestion -->
  <div class="flex-items2">
    <div class="overall2" 
      style="background-color:{sel=='co2' ? '#a7c9de44' : '#ffffffaa'}" 
      on:click={() => sel = "co2"}>
      <h2 class="dublin-header"><Fa icon={faSmog} /> CO2</h2>
      <StatBox 
        label="Annual CO2 saved (Tonnes)"
        cycleValue={p.calcs_census.co2_saved_year_bike}
        walkValue={p.calcs_census.co2_saved_year}
      />
    </div>

    <div class="overall2" 
      style="background-color:{sel=='cong' ? '#a7c9de44' : '#ffffffaa'}" 
      on:click={() => sel = "cong"}>
      <h2 class="dublin-header"><Fa icon={faCarSide} /> Congestion</h2>
      <StatBox 
        label="Annual time savings (years)"
        cycleValue={p.calcs_census.traffic_year_cycle}
        walkValue={p.calcs_census.traffic_year_foot}
      />
    </div>
  </div>

  <!-- About Section -->
  <div class="overall2">
    <div class="text2">
      <h2 class="dublin-header">About {content[sel].title}</h2>
      <div class="number2">{@html content[sel].text}</div>
    </div>
  </div>
</div>

<style>
  .container {
    height: 100svh;
    min-height: 100svh;
  }
  
  .dublin-header {
    font-size: 1.2rem;
    font-weight: 500;
    background-color: #a7c9de;
    padding: 5px 0 5px 5px;
    border-radius: 15px 15px 0 0;
    text-indent: 10px;
    color: #324754;
  }

  .flex-items2 {
    display: flex;
    gap: 20px;
  }

  .overall2 {
    background: #ffffffaa;
    width: 100%;
    border-radius: 15px;
    box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1);
    padding-bottom: 2px;
    margin-bottom: 20px;
    cursor: pointer;
  }

  .item {
    display: flex;
    flex: 1 1 50%;
    gap: 6px;
  }

  .text {
    flex: 0 1 auto;
    padding: 10px 15px;
    margin-bottom: 0;
  }

  .text2 {
    flex: 0 1 auto;
  }

  .loc {
    font-size: 1.2rem;
    color: #374c80;
    font-weight: normal;
    line-height: 120%;
    margin-bottom: 5px;
  }

  .number2 {
    font-size: 1rem;
    font-weight: 300;
    line-height: 137.5%;
    margin-bottom: 0;
    padding: 15px;
  }

  .label {
    font-size: .9rem;
    color: #6d8495;
    font-weight: 700;
    line-height: 130%;
    margin: 2px 0 6px;
    text-transform: uppercase;
  }

  @media screen and (max-width: 450px) {
    .dublin-header {
      font-size: 24px;
      line-height: 137.5%;
    }

    .flex-items2 {
      flex-direction: column;
      gap: 9px;
    }

    .item:not(:first-of-type) {
      border-top: 1px solid #ececec;
      padding-top: 10px;
    }
  }
</style>