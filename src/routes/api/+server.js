import { json } from '@sveltejs/kit';

// Handle POST requests to fetch traffic data from Eco Counter API
export async function POST({ request }) {
  
  // Extract the 'a' parameter from the request body, representing the site ID
  const { a } = await request.json();

  // Define request options with headers including the API key and expected response type
  const options = {
    method: 'GET',
    headers: { 
      accept: 'application/json', 
      'X-API-KEY': process.env.ECO_COUNTER_API
    }
  };

  // Helper function to format date as YYYY-MM-DD
  function formatDate(t) {
    const date = ('0' + t.getDate()).slice(-2);
    const month = ('0' + (t.getMonth() + 1)).slice(-2);
    const year = t.getFullYear();
    return `${year}-${month}-${date}`;
  }

  // Get today's date formatted as YYYY-MM-DD for end date
  let t = new Date();
  const dd = formatDate(t);

  // Calculate date 30 days ago for one-month look-back period
  var delta = t.getTime() - (30 * 24 * 60 * 60 * 1000);
  t.setTime(delta);
  const dd2 = formatDate(t);

  // Calculate date 90 days ago for three-month look-back period
  t = new Date();
  delta = t.getTime() - (90 * 24 * 60 * 60 * 1000);
  t.setTime(delta);
  const dd3 = formatDate(t);

  // Calculate date 1 year ago for one-year look-back period
  t = new Date();
  delta = t.getTime() - (364 * 24 * 60 * 60 * 1000);
  t.setTime(delta);
  const dd4 = formatDate(t);

  // Calculate date 3 years ago for three-year look-back period
  t = new Date();
  delta = t.getTime() - (364 * 3 * 24 * 60 * 60 * 1000);
  t.setTime(delta);
  const dd5 = formatDate(t);

  // Define URLs for each API request with various time ranges and aggregation
  const url = `https://api.eco-counter.com/api/v2/history/traffic/raw?siteId=${a}&include=&startDate=${dd2}&endDate=${dd}&startTime=00%3A00&endTime=00%3A00&granularity=P1D&gapFilling=false&travelModes=bike&travelModes=pedestrian`;
  const url2 = `https://api.eco-counter.com/api/v2/history/traffic/aggregated?siteId=${a}&include=&startDate=${dd3}&endDate=${dd}&startTime=00%3A00&endTime=00%3A00&granularity=P1W&groupBy=travelMode&gapFilling=false&travelModes=pedestrian&travelModes=bike`;
  const url3 = `https://api.eco-counter.com/api/v2/history/traffic/aggregated?siteId=${a}&include=&startDate=${dd4}&endDate=${dd}&startTime=00%3A00&endTime=00%3A00&granularity=P1W&groupBy=travelMode&gapFilling=false&travelModes=pedestrian&travelModes=bike`;
  const url4 = `https://api.eco-counter.com/api/v2/history/traffic/aggregated?siteId=${a}&include=&startDate=${dd5}&endDate=${dd}&startTime=00%3A00&endTime=00%3A00&granularity=P1M&groupBy=travelMode&gapFilling=false&travelModes=pedestrian&travelModes=bike`;

  // Fetch data from Eco Counter API for each defined period and format as JSON
  const hourly_30days = await fetch(url, options).then(response => response.json());
  // const weekly_3months = await fetch(url2, options).then(response => response.json());
  const weekly_year = await fetch(url3, options).then(response => response.json());
  const monthly_3years = await fetch(url4, options).then(response => response.json());

  // Combine responses for each period into a single JSON response
  const resp = { 
    "hourly_30days": hourly_30days, 
    // "weekly_3months": sixMonths,
    "weekly_year": weekly_year, 
    "monthly_3years": monthly_3years 
  };

  // Return the compiled JSON response
  return json(resp);
}
