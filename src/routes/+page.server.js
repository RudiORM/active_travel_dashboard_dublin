//import { ECO_COUNTER_API } from "$env/static/private";

export async function load({ params }) {
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json', 
      'X-API-KEY': process.env.ECO_COUNTER_API  // Use the imported variable
    }
  };

  try {
    const [dailyTraffic, fetchSites] = await Promise.all([
      fetch('https://api.eco-counter.com/api/v2/statistical/adt/by/site?dateRange=lastMonth&groupBy=siteAndTravelMode&travelModes=pedestrian&travelModes=bike', options)
        .then(response => {
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          return response.json();
        }),
      fetch('https://api.eco-counter.com/api/v2/sites?page=1&pageSize=100&sortBy=id&orderBy=asc', options)
        .then(response => {
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          return response.json();
        })
    ]);

    return {
      sites: fetchSites,
      traffic: dailyTraffic
    };
    
  } catch (error) {
    console.error('Error fetching data:', error);
    // You might want to handle the error appropriately here
    throw error; // This will trigger the nearest error boundary
  }
}
