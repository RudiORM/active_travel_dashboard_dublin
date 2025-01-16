<script>
  import Fa from "svelte-fa";
  import { faBicycle, faPersonWalking } from "@fortawesome/free-solid-svg-icons";

let { label, cycleValue, walkValue } = $props();

</script>

<div class="text">
  <p class="label">{label}</p>
  <p class="number-green">{cycleValue} <span style='font-size:1.2rem'><Fa icon={faBicycle} /></span></p>
  <p class="number">{walkValue} <span style='font-size:1.2rem'><Fa icon={faPersonWalking} /></span></p>
</div>

<style>
  .text {
    flex: 0 1 auto;
    text-transform: uppercase;
    padding: 10px 15px;
    margin-bottom: 0;
  }

  .number-green, .number {
    font-size: 1.5rem;
    font-weight: 400;
    line-height: 137.5%;
    margin-bottom: 0;
    text-transform: none;
  }

  .number-green { color: #955196; }
  .number { color: #374c80; }

  .label {
    font-size: .9rem;
    color: #6d8495;
    text-transform: uppercase;

    font-weight: 700;
    line-height: 130%;
    margin: 2px 0 6px;
  }
</style>
