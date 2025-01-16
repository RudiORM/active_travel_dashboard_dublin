<script>
  // import { resetMap } from "../../stores/map";
  import Donut from "./Donut.svelte";
  import StatBox from "./StatBox.svelte";
  import Fa from "svelte-fa";
  import {
    faBicycle, faPersonWalking, faBus,
    faSmog, faCarSide,
  } from "@fortawesome/free-solid-svg-icons";
  import { mapUtils } from '$lib/mapUtils.svelte';
  import {p} from '$lib/props.svelte';

  let sel = $state("home");

  let content = p.calcs_google.content

  function handleReset() {
  sel = 'home'
  mapUtils.resetTrigger = true;
}

console.log('google')
console.log(p.dynamic.sumsGoogle)


</script>

<div class="container">
  <div class="overall2" style="min-width:300px;" on:click={() => { sel = "home"; handleReset() }}>
    <h2 class="dublin-header">Boundary Statistics by Region</h2>
    
    <div class="flex-items3">
      <div class="a1">
        <div class="text">
          <p class="label">Google Modal Split 2023</p>
          <p class="loc">{p.calcs_google.location}</p>
          <p class="label">{@html p.calcs_google.location === "Dublin" ? '\xa0' : '&#9204;'}</p>
          <br />
          <p class="number" style="color:#955196">
            {p.calcs_google.cycle} <span style="font-size:1.2rem"><Fa icon={faBicycle} /></span>
          </p>
          <p class="number" style="color:#374c80">
            {p.calcs_google.walk} <span style="font-size:1.2rem"><Fa icon={faPersonWalking} /></span>
          </p>
          <p class="number" style="color:#e9547a">
            {p.calcs_google.drive} <span style="font-size:1.2rem"><Fa icon={faCarSide} /></span>
          </p>
          <p class="number" style="color:#ff912b">
            {p.calcs_google.pubs} <span style="font-size:1.2rem"><Fa icon={faBus} /></span>
          </p>
        </div>
      </div>

      <div class="a2">
        <div class="text" style="padding-left:0px">
          <Donut data={p.calcs_google.location === "Dublin" ? p.dynamic.sumsGoogle:p.dynamic.RegionID} />
        </div>
      </div>
    </div>
  </div>

  <div class="flex-items2">
    <div class="overall2" 
      style="background-color:{sel == 'co2' ? '#a7c9de44' : 'white'}"
      on:click={() => { sel = "co2";  }}
    >
      <h2 class="dublin-header"><Fa icon={faSmog} /> CO2</h2>
      <StatBox
        label="Annual CO2 saved (Tonnes)"
        cycleValue={p.calcs_google.co2_saved_year_bike}
        walkValue={p.calcs_google.co2_saved_year}
      />
    </div>
   
    <div class="overall2" 
      style="background-color:{sel == 'cong' ? '#a7c9de44' : 'white'}"
      on:click={() => { sel = "cong";  }}
    >
      <h2 class="dublin-header"><Fa icon={faSmog} /> Emissions</h2>
      <div class="text">
        <p class="label">Annual emissions (Tonnes)</p>
        <p class="number" style="color:#e9547a">
          {p.calcs_google.co2_em_year_car} <span style="font-size:1.2rem"><Fa icon={faCarSide} /></span>
        </p>
        <p class="number" style="color:#ff912b">
          {p.calcs_google.co2_em_year_public} <span style="font-size:1.2rem"><Fa icon={faBus} /></span>
        </p>
      </div>
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
    min-width: 300px;
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


	.flex-items3 {
    display: flex;
	gap: 5px;
    align-items: center; /* This will center a2 relative to a1's height */
  }

  .overall2 {
    background: white;
    width: 100%;
    border-radius: 15px;
    box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1);
    padding-bottom: 2px;
    margin-bottom: 20px;
    cursor: pointer;
  }

  .a1 { flex: 1; }
  .a2 {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .text {
    flex: 0 1 auto;
    text-transform: uppercase;
    padding: 10px 15px;
    margin-bottom: 0;
  }

  .text2 { flex: 0 1 auto; }

  .number {
    font-size: 1.5rem;
    font-weight: 400;
    line-height: 137.5%;
    margin-bottom: 0;
    text-transform: none;
  }

  .loc {
    font-size: 1.2rem;
    color: #374c80;
    font-weight: normal;
    line-height: 120%;
    margin-bottom: 5px;
  }

  .label {
    font-size: .9rem;
    color: #6d8495;
    font-weight: 700;
    line-height: 130%;
    margin: 2px 0 6px;
  }

  .number2 {
    font-size: 1rem;
    font-weight: 300;
    line-height: 137.5%;
    padding: 15px;
  }

  @media screen and (max-width: 450px) {
    .dublin-header {
      font-size: 24px;
      line-height: 137.5%;
    }

    .flex-items2, .flex-items3 {
      flex-direction: column;
      gap: 9px;
    }
  }
</style>