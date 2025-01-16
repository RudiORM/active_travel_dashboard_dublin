<script>
	import { onMount, mount } from 'svelte';
  import mapboxgl from 'mapbox-gl';
	import '../../../node_modules/mapbox-gl/dist/mapbox-gl.css';

  import { PUBLIC_MAPBOX_TOKEN } from '$env/static/public';
	import { p } from '$lib/props.svelte';
	import MapMarker from '$lib/components/MapMarker.svelte';
	import MapMarkerCordon from '$lib/components/MapMarkerCordon.svelte';

  import MapLegend from './MapLegend.svelte';
  import { mapUtils } from '$lib/mapUtils.svelte';

	let props = $props();

	let geoCenter = $state([-6.266155, 53.4014]);  
	let geoZoom = $state(6);
	let geoBbox = $state([
		geoCenter[0] - 0.2,
		geoCenter[1] - 0.2,
		geoCenter[0] + 0.2,
		geoCenter[1] + 0.2
	]);
	let map = $state(null);
	let mapIsLoaded = $state(false);
	let mapEl = $state(null);
	let mountedMap = $state(null);

	const overLayer = 'bridge-rail';

	function translateBounds(bbox) {
		let box = bbox.split(',');
		return [
			[parseFloat(box[0]), parseFloat(box[1])],
			[parseFloat(box[2]), parseFloat(box[3])]
		];
	}

	function setupMap() {
		map.on('load', () => {
			addSources();
			addLayers();
			placeMarkers();
			setMapEvents();
			mapIsLoaded = true;
		});
	}

	function addSources() {
		p.constant.sources.forEach(({ id, url }) => {
			map.addSource(id, { type: 'geojson', data: url });
		});
	}

	function addLayers() {
    
		p.deriveds.censusLayers.forEach((layer) => addLayer(layer, 'electoral-boundary-source'));
		p.deriveds.googleLayers.forEach((layer) => addLayer(layer, 'division-boundary-source'));
		addLineLayers();
	}

	function addLineLayers() {
		const lineLayers = ['LineString', 'C2CC', 'DLR', 'Dodder', 'Portmarnock'];
		lineLayers.forEach((layer) => {
			map.addLayer({
				id: layer,
				type: 'line',
				source: layer,
				layout: { 'line-join': 'round', 'line-cap': 'round' },
				paint: { 'line-color': '#955196', 'line-width': 0 }
			});
		});
	}

	function buildColorSteps(layer) {
		// Create an array that starts with the first color (the initial fill color)
		// and pairs each division threshold with a corresponding color

    const colorDivs = (() => {
            if (layer.includes('delta')) {
                return layer.includes('cycle')
                    ? [-0.14, -0.12, -0.1, -0.08, -0.06, -0.04, -0.02, 0, 0.02, 0.04, 0.06, 0.08, 0.1, 0.12, 0.14]
                    : [-0.21, -0.18, -0.15, -0.12, -0.09, -0.06, -0.03, 0, 0.03, 0.06, 0.09, 0.12, 0.15, 0.18, 0.21];
            }
            if (layer.includes('Bicycle')) {
                return [0, 0.015, 0.03, 0.045, 0.06, 0.075, 0.09, 0.105, 0.12, 0.135, 0.15, 0.165, 0.18, 0.195, 0.21];
            }
            if (layer.includes('cycle')) {
                return [0, 0.005, 0.01, 0.015, 0.02, 0.025, 0.03, 0.035, 0.04, 0.045, 0.05, 0.055, 0.06, 0.065, 0.07];
            }
            return [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7];
        })();
    
        // Calculate colors
        const colors = layer.includes('delta')
            ? ['#003f5c', '#1a476f', '#384c80', '#58508d', '#8178a9', '#aaa3c5', '#d4d0e2', '#ffffff', '#ffdad5', '#ffb5ad', '#ff8e86', '#ff6361', '#ff764a', '#ff8d2f', '#ffa600']
            : ['#003f5c', '#16466d', '#2f4b7c', '#4a4f88', '#675191', '#845195', '#a15195', '#bc5090', '#d45187', '#e9547a', '#f95d6a', '#ff6b58', '#ff7c43', '#ff912b', '#ffa600'];

		const colorSteps = [colors[0]]; // Base color
		for (let i = 1; i < colorDivs.length; i++) {
			colorSteps.push(colorDivs[i], colors[i]);
		}
		return colorSteps;
	}

	function addLayer(layer, source) {
		const opacity = layer === p.deriveds.metricToggle ? 0.8 : 0;

  		map.addLayer(
			{
				id: 'map-layer-' + layer,
				type: 'fill',
				source,
				paint: {
					'fill-outline-color': 'black',
					'fill-opacity': opacity,
					'fill-color': [
						'case',
						['==', ['get', layer], null],
						'white',
						['step', ['get', layer], ...buildColorSteps(layer)]
					]
				}
			},
			overLayer
		);
	}

	function placeMarkers() {
		p.dynamic.stepcounters.forEach((markerData) => {
			const markerElement = document.createElement('div');

			markerData.type = 'counter';

			// Mount the Svelte component to the markerElement
			mount(MapMarker, { target: markerElement, props: { markerData } });

			// Attach the Svelte marker to the Mapbox map
			new mapboxgl.Marker({ element: markerElement })
				.setLngLat([markerData.lon, markerData.lat])
				.addTo(map);
		});

		p.dynamic.cordons.forEach((markerData) => {
			const markerElement = document.createElement('div');
			markerData.type = 'cordon';

			// Mount the Svelte component to the markerElement
			mount(MapMarkerCordon, { target: markerElement, props: { markerData } });

			// Attach the Svelte marker to the Mapbox map
			new mapboxgl.Marker({ element: markerElement })
				.setLngLat([markerData.Latitude, markerData.Longitude])
				.addTo(map);
		});



		//  toggleMarkersVisibility('hidden');
	}

	

	function newMapStore(el) {
		p.dynamic.fillLayer = 'map-layer-' + p.deriveds.metricToggle;

		map = new mapboxgl.Map({
			accessToken: PUBLIC_MAPBOX_TOKEN,
			container: el,
			style: 'mapbox://styles/mapbox/streets-v12',
			bounds: geoBbox,
			minZoom: geoZoom,
			maxZoom: 13,
			antialias: true,
			dragPan: true,
			dragRotate: false,
			fitBoundsOptions: { padding: 120 }
		}).addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

		$effect(() => {
        if (mapUtils.resetTrigger) {
            resetMap();
            // Reset the trigger after handling
            mapUtils.resetTrigger = false;
        }
    });

		return {
			getMap: () => map,
			onLoad: () => setupMap(),
			isMapLoaded: () => mapIsLoaded,
			resetMap,
			changeLayer
		};
	}

	function resetMap() {
		p.dynamic.RegionID = '999999';
		map.fitBounds(geoBbox, { padding: 35 });
	}

	function plotLanes() {
		if (!mapIsLoaded) return;
		const laneWidth = p.dynamic.showLanes ? 2 : 0;
		const laneColor =
			p.deriveds.metricToggle.includes('counter') || p.deriveds.metricToggle.includes('delta') ? '#324754' : 'white';
		map.setPaintProperty('LineString', 'line-width', laneWidth);
		map.setPaintProperty('LineString', 'line-color', laneColor);
	}

	function setMapEvents() {
		map.on('click', handleClick);
	}

	function handleClick(e) {
		if (!p.deriveds.metricToggle.includes('counter')) {
			const features = map
				.queryRenderedFeatures(e.point)
				.filter((d) => d.layer.id === p.dynamic.fillLayer);
			if (features.length) {
				p.dynamic.RegionID = features[0].properties;
				map.fitBounds(translateBounds(features[0].properties.bbox), { padding: 50 });
			}
		}
		['DLR', 'C2CC', 'Dodder', 'Portmarnock'].forEach((layer) => {
			map.on('click', layer, () => (p.dynamic.strava_track = layer));
		});
	}

	function changeLayer(toggle, options) {
		if (!mapIsLoaded) return;

		// Show or hide markers based on the presence of 'counter' in toggle
	
		// Adjust the fill opacity for the relevant map layers
		options.forEach(({ _, value }) => {
			if (!value.includes('counter')) {
				map.setPaintProperty('map-layer-' + value, 'fill-opacity', value === toggle ? 0.8 : 0);
				if (value === toggle) p.dynamic.fillLayer = 'map-layer-' + value;
			}
		});

		// Set line width for specific layers if 'strava' is present in metricToggle
		const stravaLayers = ['C2CC', 'DLR', 'Dodder', 'Portmarnock'];
		const lineWidth = p.deriveds.metricToggle.includes('strava') ? 10 : 0;

		stravaLayers.forEach((layer) => {
			map.setPaintProperty(layer, 'line-width', lineWidth);
		});
	}

	// // on mount, initialize and load map
	onMount(() => {
		mountedMap = newMapStore(mapEl);
		mountedMap.onLoad();

		$effect(() => {
			plotLanes();
		});

		$effect(() => {
			mountedMap.changeLayer(p.deriveds.metricToggle, p.constant.metricToggleOptions);
		});
	});
</script>

	<div class="im-the-map-box">
		<div id="mapbox-map" bind:this={mapEl}>
		  <!-- Move the toggle box inside here -->
		  {#if p.dynamic.visMode != "temp" && p.dynamic.visMode != "strava"&& p.dynamic.visMode != "cordon"}
			<div class="toggle-box">
			  <div class="legend-box">
				<MapLegend />
			  </div> 
			</div>
		  {/if} 
		</div>
	  
		<div class="top-banner">
		  <h2 class="dublin-header">{p.deriveds.metricLabel}</h2>
		</div>
	  

	<div class="toggles">
		{#if p.dynamic.visMode != 'strava' & p.dynamic.visMode != 'cordon'}
			<select class="sel" bind:value={p.dynamic.modeToggle}>
				{#each p.constant.modeToggleOptions as question}
					<option value={question}>
						{question}
					</option>
				{/each}
			</select>
			<br />
		{/if}

		{#if p.dynamic.visMode == 'cordon' }
			<select class="sel" bind:value={p.dynamic.modeToggle}>
				{#each p.constant.modeToggleOptions.slice(0,2) as question}
					<option value={question}>
						{question}
					</option>
				{/each}
			</select>
			<br />
		{/if}

		{#if p.dynamic.visMode == 'census'}
			<select class="sel" bind:value={p.dynamic.censusMode}>
				{#each p.constant.censusOptions as question}
					<option value={question}>
						{question}
					</option>
				{/each}
			</select>
			<br />
			<select class="sel" bind:value={p.dynamic.dataMode}>
				{#each p.constant.dataOptions as question}
					<option value={question}>
						{question}
					</option>
				{/each}
			</select>
			<br />
		{/if}

		<label class="check" for="show-bike-lanes"> {'Show bike lanes '} </label>
		<input type="checkbox" id="show-bike-lanes" class="box" bind:checked={p.dynamic.showLanes} />
	</div>


</div>

<style>
	input[type='checkbox'] {
		transform: scale(1.2);
	}

	.dublin-header {
		font-size: 1.2rem;
		font-style: normal;
		font-weight: 500;
		color: #324754;
	}

	.sel {
		font-family: 'Work Sans';
		border-radius: 5px;
		border-color: #aaa;
		border: 2px solid #aaaaaa88;
		background-color: #ffffffdd;
		font-size: 0.9rem;
		margin-bottom: 6px;
		color: #324754;
	}

	.check {
		font-family: 'Work Sans';
		font-size: 0.9rem;
	}

	.im-the-map-box {
		flex: 1 1 50% !important;
		display: flex;
		position: relative;
	}

	#mapbox-map {
    position: relative;  /* Add this */
    height: calc(100svh - 90px);
    max-height: calc(100svh - 90px);
    width: 100%;
    flex: 0 1 100%;
    border-radius: 15px;
    box-sizing: border-box;
    border: 0px solid #ffffff;
    min-height: 450px;
    box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.1);
  }

  .toggle-box {
    position: absolute;
    width: 80%;
    margin-left: 5%;
    margin-right: 5%;
    height: 90px;
    background: #ffffffbb;
    bottom: 30px;
    border-radius: 15px;
	z-index: 99;
  }



	:global(.mapboxgl-canvas-container) {
		width: 100% !important;
	}

	.legend-box {
		width: 96%;
		bottom: 0px;
	}

	@media screen and (max-width: 768px) {
    #mapbox-map {
      min-height: 550px;
      max-height: 625px;
    }

    .toggle-box {
      bottom: 30px !important;  /* Keep consistent with desktop */
      width: 75% !important;
    }
  }

	.top-banner {
		position: absolute;
		left: 0px;
		top: 0px;
		width: calc(100% - 20px);
		background-color: #a7c9de;
		min-height: 16px;
		height: fit-content;
		padding-left: 10px;
		padding-right: 10px;
		padding-top: 5px;
		padding-bottom: 5px;

		-moz-border-radius: 0px;
		-webkit-border-radius: 15px 15px 0px 0px;
		border-radius: 15px 15px 0px 0px;
		font-size: 1rem;

		/* padding: 16px 25px 25px 25px; */
	}

	.toggles {
		position: absolute;
		left: 20px;
		top: 70px;
		background-color: #ffffffaa;
		padding: 10px;
		border-radius: 15px;
		margin: 5px;
		font-size: 1rem;
		/* padding: 16px 25px 25px 25px; */
	}

	
 
</style>
