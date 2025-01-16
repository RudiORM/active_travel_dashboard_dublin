<script>
  import "../app.css";
  import { onMount } from "svelte";
  import { p } from '$lib/props.svelte';
  import Dashboard from '$lib/components/Dashboard.svelte';

  let { data } = $props();
  let filteredData = [];

  console.log(data)

  const fetchJson = async () => {
    try {
      const [res1, res2, res3,res4,res5] = await Promise.all([
        fetch('/census_data_total.json'),
        fetch('/sums.json'),
        fetch('/strava.json'),
        fetch('/cordons.json'),
        fetch('/zones.json')
      ]);

      if (res1.ok) {
        const censusData = await res1.json();
        p.dynamic.jsonData = censusData['features'];
      } else {
        console.error("Failed to fetch census data JSON file");
      }

     
      if (res2.ok) {
        const sumsData = await res2.json();
        p.dynamic.sums = sumsData['Census'][0];
        p.dynamic.sumsGoogle = sumsData['Google'][0];
      } else {
        console.error("Failed to fetch sums data JSON file");
      }

      if (res3.ok) {
        const stravaData = await res3.json();
        stravaData.forEach(d => {
          const [day, month, year] = d['date'].split('/');
          d.date = new Date(Date.parse(`${year}-${month}-${day}`));
        });
        p.dynamic.strava_data = stravaData;
      } else {
        console.error("Failed to fetch Strava data JSON file");
      }

      if (res4.ok) {
        const cordonData = await res4.json();
        p.dynamic.cordon_data = cordonData;
      } else {
        console.error("Failed to fetch cordon data JSON file");
      }

      if (res5.ok) {
        const cordons = await res5.json();
        p.dynamic.cordons = cordons;
      } else {
        console.error("Failed to fetch cordon data JSON file");
      }

    } catch (error) {
      console.error("An error occurred while fetching JSON data:", error);
    }
  };

  const processTrafficData = () => {

    console.log(data)
    if (!data.traffic || !data.sites) return;

    const siteMap = new Map(data.sites.map(site => [site.id, site]));
    
    const filteredData = data.traffic
      .filter(element => element.value)
      .map(element => {
        const site = siteMap.get(element.siteId);
        if (site && ![100063162, 100063165].includes(site.id)) {
          return {
            mode: element.travelMode,
            value: element.value,
            lat: site.location.lat,
            lon: site.location.lon,
            name: site.name,
            id: site.id,
          };
        }
      })
      .filter(Boolean); // Remove undefined entries
    p.dynamic.stepcounters = filteredData;
  };

  onMount(() => {
    fetchJson();
    processTrafficData();
  });
</script>

<Dashboard data={data} />


