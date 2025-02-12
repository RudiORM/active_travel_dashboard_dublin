<script>
  // Component and asset imports
  import Sidebar from "./Sidebar.svelte";
  import MapComponent from "./MapComponent.svelte";
  import Menu from "./Menu.svelte";
  import img from '$lib/images/Smart-Dublin-Large.png';

  // State variables and stores
  let width = $state(0);

  let props = $props();

  
</script>

<main>
  <Menu />
  <div class="container" bind:clientWidth={width}>
    <div class="dashboard-title">{"Dublin Region Active Travel Dashboard"}</div>
    <a href="https://smartdublin.ie/" target="_blank">
      <img class="img" src={img} alt="Smart Dublin Logo" />
    </a>
 <div class="map-element">
      <MapComponent data={props.data} />
       <Sidebar {width} /> 
    </div> 
  </div>
</main>

<style>

/* Reset base styles */
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden; /* Prevent scrolling if not needed */
}

/* Main grid container */
main {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-areas: "nav content";
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

/* Navigation */
nav {
  grid-area: nav;
  background-color: #324754;
  color: #a2b7c4;
  transition: ease-out 500ms;
  width: 60px;
  overflow: hidden;
  height: 100vh; /* Full viewport height */
}

/* Content container */
.container {
  width: 100%;
  height: 100vh;
  position: relative;
  grid-area: content;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Title and logo area */
.dashboard-title {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-3xl);
  font-style: normal;
  color: #324754;
  font-weight: 300;
  line-height: 125%;
  padding: 10px 0 0 20px;
  width: calc(100% - 160px);
  flex-shrink: 0; /* Prevent title from shrinking */
}

/* Map container */
.map-element {
  width: calc(100% - 40px);
  display: flex;
  gap: 20px;
  padding: 20px;
  flex: 1; /* Take up remaining space */
  overflow: auto; /* Allow scrolling if content is too tall */
}

/* Logo image */
.img {
  position: absolute;
  width: 150px;
  top: 7px;
  right: 0;
}

@media screen and (max-width: 768px) {
  .map-element {
    flex-direction: column;
  }
  .img {
    width: 110px;
  }
  .dashboard-title {
    font-size: var(--font-size-2xl);
  }
}
</style>
