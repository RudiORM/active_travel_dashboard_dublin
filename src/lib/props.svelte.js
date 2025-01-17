// props.svelte.js
import { format } from "d3";


export function createProps() {
    // Constants
    const constant = $state({
        metricToggleOptions: [
            { label: "Walking to school, college or work: 2022", value: "On foot - Total_pct", group: 'census' },
            { label: "Cycling to school, college or work: 2022", value: "Bicycle - Total_pct", group: 'census' },
            { label: "Walking/cycling to school, college or work: 2022", value: "Active travel - Total_pct", group: 'census' },
            { label: "Walking to school, college or work: 2016", value: "On foot - Total_pct_16", group: 'census' },
            { label: "Cycling to school, college or work: 2016", value: "Bicycle - Total_pct_16", group: 'census' },
            { label: "Walking/cycling to school, college or work: 2016", value: "Active travel - Total_pct_16", group: 'census' },
            { label: "Change in walking to school, college or work, 2016-2022", value: "delta_On foot - Total_pct", group: 'census' },
            { label: "Change in cycling to school, college or work, 2016-2022", value: "delta_Bicycle - Total_pct", group: 'census' },
            { label: "Change in walking/cycling to school, college or work, 2016-2022", value: 'delta_Active travel - Total_pct', group: 'census' },
            { label: "Walking to work: 2022", value: "On foot - Work_pct", group: 'census' },
            { label: "Cycling to work: 2022", value: "Bicycle - Work_pct", group: 'census' },
            { label: "Walking/cycling to work: 2022", value: "Active travel - Work_pct", group: 'census' },
            { label: "Walking to work: 2016", value: "On foot - Work_pct_16", group: 'census' },
            { label: "Cycling to work: 2016", value: "Bicycle - Work_pct_16", group: 'census' },
            { label: "Walking/cycling to work: 2016", value: "Active travel - Work_pct_16", group: 'census' },
            { label: "Change in walking to work, 2016-2022", value: "delta_On foot - Work_pct", group: 'census' },
            { label: "Change in cycling to work, 2016-2022", value: "delta_Bicycle - Work_pct", group: 'census' },
            { label: "Change in walking/cycling to work, 2016-2022", value: 'delta_Active travel - Work_pct', group: 'census' },
            { label: "Walking to school or college: 2022", value: "On foot - School, college or childcare_pct", group: 'census' },
            { label: "Cycling to school or college: 2022", value: "Bicycle - School, college or childcare_pct", group: 'census' },
            { label: "Walking/cycling to school or college: 2022", value: "Active travel - School, college or childcare_pct", group: 'census' },
            { label: "Walking to school or college: 2016", value: "On foot - School, college or childcare_pct_16", group: 'census' },
            { label: "Cycling to school or college: 2016", value: "Bicycle - School, college or childcare_pct_16", group: 'census' },
            { label: "Walking/cycling to school or college: 2016", value: "Active travel - School, college or childcare_pct_16", group: 'census' },
            { label: "Change in walking to school or college, 2016-2022", value: "delta_On foot - School, college or childcare_pct", group: 'census' },
            { label: "Change in cycling to school or college, 2016-2022", value: "delta_Bicycle - School, college or childcare_pct", group: 'census' },
            { label: "Change in walking/cycling to school or college, 2016-2022", value: 'delta_Active travel - School, college or childcare_pct', group: 'census' },
            { label: "Walking trips, Google modal split 2023", value: "walk_pct", group: 'google' },
            { label: "Cycling trips, Google modal split 2023", value: "cycle_pct", group: 'google' },
            { label: "Walking/cycling trips, Google modal split 2023", value: "active_pct", group: 'google' },
            { label: "Live: pedestrian counters", value: "walk_counter", group: 'temp' },
            { label: "Live: cycle counters", value: "cycle_counter", group: 'temp' },
            { label: "Live: Pedestrian and cycle counters", value: "active_counter", group: 'temp' },
            { label: "Cycle routes", value: "strava_counter", group: 'strava' },
            { label: "Cordon counters", value: "cordon_counter", group: 'cordon' }
        ],
        modeToggleOptions: ['Walking', 'Cycling', 'Walking and Cycling'],
        visModeOptions: [
            { label: "Census", value: "census" },
            { label: "Google Trips", value: "google" },
            { label: "Canal Cordon Counts", value: 'cordon'},
            { label: "Location", value: "temp" },
            { label: "Route", value: "strava" },

        ],
        censusOptions: ['2022', '2016', "Change"],
        dataOptions: ['Total', 'Work', "School or College"],
        sources: [
            { id: "electoral-boundary-source", url: "./census_data_total.geojson" },
            { id: "division-boundary-source", url: "./divisions.geojson" },
            { id: "LineString", url: "./segregated_lanes.geojson" },
            { id: "C2CC", url: "./strava/C2CC.geojson" },
            { id: "DLR", url: "./strava/DLR.geojson" },
            { id: "Dodder", url: "./strava/Dodder River.geojson" },
            { id: "Portmarnock", url: "./strava/Portmarnock.geojson" },
        ]
    });

    // Dynamic state
    let dynamic = $state({
        visMode: "census",
        modeToggle: "Walking",
        censusMode: "2022",
        dataMode: 'Total',
        RegionID: "999999",
        fillLayer: "",
        which_data: "census",
        stepcounters: 'asdf',
        selected_counter: "100007794",
        counter_type: "pedestrian",
        counter_data: '',
        counter_name:'College Green/Bank Of Ireland',
        cordons:'',
        cordon_data:'',
        selected_cordon: '2023',
        showLanes: false,
        selected: 'Census',
        jsonData: '',
        sums: '',
        sumsGoogle: '',
        strava_track: 'DLR',
        strava_data: '',
        currentTimeMode: 'lastMonth',
    });



    let deriveds = $derived.by(() => {
        // Helper function to calculate metric toggle
        const calculateMetricToggle = () => {
            let val = '';
            let this_st = 'Total';

            if (dynamic.dataMode === 'School or College') {
                this_st = 'School, college or childcare';
            }
            if (dynamic.dataMode === 'Work') {
                this_st = 'Work';
            }

            if (dynamic.visMode === "census") {
                if (dynamic.modeToggle === "Walking") {
                    val = "On foot - " + this_st + "_pct";
                }
                if (dynamic.modeToggle === "Cycling") {
                    val = "Bicycle - " + this_st + "_pct";
                }
                if (dynamic.modeToggle === "Walking and Cycling") {
                    val = "Active travel - " + this_st + "_pct";
                }

                if (dynamic.censusMode === "Change") {
                    if (dynamic.modeToggle === "Walking") {
                        val = "delta_On foot - " + this_st + "_pct";
                    }
                    if (dynamic.modeToggle === "Cycling") {
                        val = "delta_Bicycle - " + this_st + "_pct";
                    }
                    if (dynamic.modeToggle === "Walking and Cycling") {
                        val = "delta_Active travel - " + this_st + "_pct";
                    }
                }

                if (dynamic.censusMode === "2016") {
                    val = val + "_16";
                }
            }

            if (dynamic.visMode === "google") {
                if (dynamic.modeToggle === "Walking") {
                    val = "walk_pct";
                }
                if (dynamic.modeToggle === "Cycling") {
                    val = "cycle_pct";
                }
                if (dynamic.modeToggle === "Walking and Cycling") {
                    val = "active_pct";
                }
            }

            if (dynamic.visMode === "temp") {
                if (dynamic.modeToggle === "Walking") {
                    val = "walk_counter";
                }
                if (dynamic.modeToggle === "Cycling") {
                    val = "cycle_counter";
                }
                if (dynamic.modeToggle === "Walking and Cycling") {
                    val = "active_counter";
                }
            }

            if (dynamic.visMode === "strava") {
                val = 'strava_counter';
            }

            if (dynamic.visMode === "cordon") {
                val = 'cordon_counter';
            }
            

            return val;
        };

        const metricToggle = calculateMetricToggle();


        const censusLayers = (() => {
            return constant.metricToggleOptions
                .filter(option => option.group === "census") // Only options with group 'census'
                .map(option => option.value);               // Extract the 'value'
        })();

        // Derived state for google layers
        const googleLayers = (() => {
            return constant.metricToggleOptions
                .filter(option => option.group === "google") // Only options with group 'google'
                .map(option => option.value);                // Extract the 'value'
        })();


        // Calculate color divisions

        // Calculate color breaks
        const colorBreaks2 = (() => {
            if (metricToggle.includes('delta')) {
                if (metricToggle.includes('Bicycle')) {
                    return [-0.14, -0.12, -0.1, -0.08, -0.06, -0.04, -0.02, 0.0, 0.02, 0.04, 0.06, 0.08, 0.1, 0.12, 0.14];
                }
                return [-0.21, -0.18, -0.15, -0.12, -0.09, -0.06, -0.03, 0.0, 0.03, 0.06, 0.09, 0.12, 0.15, 0.18, 0.21];
            }
            if (metricToggle.includes('Bicycle')) {
                return [0., 0.015, 0.03, 0.045, 0.06, 0.075, 0.09, 0.105, 0.12, 0.135, 0.15, 0.165, 0.18, 0.195, 0.21];
            }
            if (metricToggle.includes('cycle_')) {
                return [0, 0.005, 0.01, 0.015, 0.02, 0.025, 0.03, 0.035, 0.04, 0.045, 0.05, 0.055, 0.06, 0.065, 0.07];
            }
            return [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7];
        })();

        // Calculate cols2
        const cols2 = metricToggle.includes('delta')
            ? ['#003f5c', '#1a476f', '#384c80', '#58508d', '#8178a9', '#aaa3c5', '#d4d0e2', '#ffffff', '#ffdad5', '#ffb5ad', '#ff8e86', '#ff6361', '#ff764a', '#ff8d2f', '#ffa600']
            : ['#003f5c', '#16466d', '#2f4b7c', '#4a4f88', '#675191', '#845195', '#a15195', '#bc5090', '#d45187', '#e9547a', '#f95d6a', '#ff6b58', '#ff7c43', '#ff912b', '#ffa600'];

        const range = (() => {
            return dynamic.visMode !== 'temp'
                ? colorBreaks2[colorBreaks2.length - 1] - colorBreaks2[0]
                : 99;
        })();

        const metricLabel = constant.metricToggleOptions.filter((d) => d.value === metricToggle)[0].label;
        const metricFormat = new Intl.NumberFormat('en-UK', { style: "percent" });

        return {
            metricToggle,
            colorBreaks2,
            cols2,
            metricLabel,
            metricFormat,
            censusLayers,
            googleLayers,
            range
        };
    });

    let calcs_census = $derived.by(() => {

        const f = format(",.0f");

        const string_16 = (() => {
            return dynamic.censusMode === "2016" ? '_16' : '';
        })();

        const string_delta = (() => {
            return dynamic.censusMode === "Change" ? 'delta_' : '';
        })();

        const mode = (() => {
            return dynamic.dataMode === 'School or College' ? 'School, college or childcare' : dynamic.dataMode;
        })();

        const location = (() => {
            return dynamic.RegionID === "999999" ? "Dublin" : dynamic.RegionID.ED_ENGLISH;
        })();

        const walk = (() => {

            return dynamic.RegionID === "999999"
                ? `${f(100 * dynamic.sums[string_delta + "On foot - " + mode + "_pct" + string_16])}%`
                : `${f(100 * dynamic.RegionID[string_delta + "On foot - " + mode + "_pct" + string_16])}%`;
        })();

        const cycle = (() => {
            return dynamic.RegionID === "999999"
                ? `${f(100 * dynamic.sums[string_delta + "Bicycle - " + mode + "_pct" + string_16])}%`
                : `${f(100 * dynamic.RegionID[string_delta + "Bicycle - " + mode + "_pct" + string_16])}%`;
        })();location

        const prem_deaths_cycle = (() => {
            return dynamic.RegionID === "999999"
                ? f(0.001025 * dynamic.sums[string_delta + "Bicycle - " + mode + string_16])
                : f(0.001025 * dynamic.RegionID[string_delta + "Bicycle - " + mode + string_16]);
        })();

        const prem_deaths_walk = (() => {
            return dynamic.RegionID === "999999"
                ? f(0.001025 * dynamic.sums[string_delta + "On foot - " + mode + string_16])
                : f(0.001025 * dynamic.RegionID[string_delta + "On foot - " + mode + string_16]);
        })();

        const cycle_eur_saved = (() => {
            return dynamic.RegionID === "999999"
                ? `€${f(401.45 * dynamic.sums[string_delta + "Bicycle - " + mode + string_16] / 1e6)}m`
                : `€${f(401.45 * dynamic.RegionID[string_delta + "Bicycle - " + mode + string_16])}`;
        })();

        const walk_eur_saved = (() => {
            return dynamic.RegionID === "999999"
                ? `€${f(401.45 * dynamic.sums[string_delta + "On foot - " + mode + string_16] / 1e6)}m`
                : `€${f(401.45 * dynamic.RegionID[string_delta + "On foot - " + mode + string_16])}`;
        })();

        const co2_saved_year = (() => {
            return dynamic.RegionID === "999999"
                ? f(0.3372 * dynamic.sums[string_delta + "On foot - " + mode + string_16])
                : f(0.3372 * dynamic.RegionID[string_delta + "On foot - " + mode + string_16]);
        })();

        const co2_saved_year_bike = (() => {
            return dynamic.RegionID === "999999"
                ? f(0.3372 * dynamic.sums[string_delta + "Bicycle - " + mode + string_16])
                : f(0.3372 * dynamic.RegionID[string_delta + "Bicycle - " + mode + string_16]);
        })();

        const traffic_year_foot = (() => {
            return dynamic.RegionID === "999999"
                ? f(0.00990867579908675 * dynamic.sums[string_delta + "On foot - " + mode + string_16])
                : f(0.00990867579908675 * dynamic.RegionID[string_delta + "On foot - " + mode + string_16]);
        })();

        const traffic_year_cycle = (() => {
            return dynamic.RegionID === "999999"
                ? f(0.00990867579908675 * dynamic.sums[string_delta + "Bicycle - " + mode + string_16])
                : f(0.00990867579908675 * dynamic.RegionID[string_delta + "Bicycle - " + mode + string_16]);
        })();


        const content = {

            'home':{
                 text:'The Census Boundary view shows the <a href="https://www.cso.ie/en/releasesandpublications/ep/p-cpp7/census2022profile7-employmentoccupationsandcommuting/commutingtowork/" > Means of Travel data from the 2022 and 2016 Census</a>, aggregated by local electoral area. The Census asked people how they travelled to work, school or college. Note: the 2022 Census also included a value called "Work mostly from home", which may skew the results. Click on a <a style="font-weight:bold;color:#6d8495">statistic</a> for information on how it was calculated.',
                 title:"this view"
                },
            'prem_deaths': {
                text: "The total number of potential premature deaths averted by walking or cycling. For cycling, <a href='https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10546027/#:~:text=Compared%20with%20non%2Dactive%20commuting,41%25%20lower%20risk%20of%20mortality.' target='_blank'>biking to work reduces the risk of premature death by 41% </a>. Walking 150 mins a week reduces this by <a href='https://bjsm.bmj.com/content/57/15/979' target='_blank'> 16%</a>. The risk of premature death between 30-70 years was estimated at 10%.",
                title: "premature deaths avoided"
            },
            'health_exp': {
                text: "Total money saved this year by not commuting by car. Assumes each person cycling or walking would otherwise have a 10km commute 3.5 days a week. We use the <a href='https://www.tomtom.com/traffic-index/dublin-traffic/' target = '_blank'> calculator by TomTom</a> to estimate this cost at €401.50 per person.",
                title: "fuel savings"
            },
            'co2': {
                text :"Annual CO2 saved this year by not commuting by car. Assumes each person cycling or walking would otherwise have a 10km commute 3.5 days a week and a <a href='https://climate.ec.europa.eu/eu-action/transport/road-transport-reducing-co2-emissions-vehicles/co2-emission-performance-standards-cars-and-vans_en' target = '_blank'> carbon footprint for a car as 95g CO2/km</a>",
                title :"CO2 saved"
            },
            'cong': {
                text: "Total time (in years) saved by Dubliners this year by not sitting in traffic. Assumes a 10km commute 3.5 days a week. A study by Tomtom found that a daily 10km commute in Dublin resulted in <a href='https://www.tomtom.com/traffic-index/dublin-traffic/' target='_blank'> 158 hours lost to congestion.</a>",
                title: "time in traffic avoided"
            }
        };


        return {
            location,
            walk,
            cycle,
            prem_deaths_cycle,
            prem_deaths_walk,
            cycle_eur_saved,
            walk_eur_saved,
            co2_saved_year,
            co2_saved_year_bike,
            traffic_year_foot,
            traffic_year_cycle,
            content
        };

    })

    let calcs_google = $derived.by(() => {
        const f = format(",.0f");
        
        // Constants
        const nams = {
            "dublin-bay-north": "Dublin Bay North",
            "dublin-bay-south": "Dublin Bay South",
            "dublin-central": "Dublin Central",
            "dublin-fingal-east": "Dublin Fingal East",
            "dublin-fingal-west": "Dublin Fingal West",
            "dublin-mid-west": "Dublin Mid West",
            "dublin-north-west": "Dublin North West",
            "dublin-rathdown": "Dublin Rathdown",
            "dublin-south-central": "Dublin South Central",
            "dublin-south-west": "Dublin South West",
            "dublin-west": "Dublin West",
            "dún-laoghaire": "Dún Laoghaire",
        };
          
            const content = {
                'home':{
                     text: 'The Google Boundary View shows active travel data based on Google\'s modal split data of Dublin for 2023, aggregated at electoral district level. This modal split data counts all trips within the Dublin boundary, in addition to those leaving and entering the Dublin boundary. Click on a <a style="font-weight:bold;color:#6d8495">statistic</a> for information on how it was calculated.',
                    title: 'this view'
                },

                'co2': {
                    text: "Annual CO2 saved in a year by not taking a car. Assumes each person cycling or walking would otherwise have used a car. The equivalent automotive emissions per journey in Dublin has been calculated by Google.",
                    title: "CO2 saved"
                },
                'cong': {
                    text: "The annual CO2 emissions in each region by public transport (bus) and car has been calculated by Google. Note this takes into account all trips within and across all boundaries.",
                    title: "CO2 emissions"
                }
            };
    
        const location = (() => {
            return dynamic.RegionID === "999999" ? "Dublin" : nams[dynamic.RegionID["ENG_NAME_VALUE"]];
        })();
    
        const walk = (() => {
            return dynamic.RegionID === "999999"
                ? `${f((100 * dynamic.sumsGoogle["ON FOOT_trips"]) / dynamic.sumsGoogle["TOTAL_trips"])}%`
                : `${f(100 * dynamic.RegionID["walk_pct"])}%`;
        })();
    
        const cycle = (() => {
            return dynamic.RegionID === "999999"
                ? `${f((100 * dynamic.sumsGoogle["CYCLING_trips"]) / dynamic.sumsGoogle["TOTAL_trips"])}%`
                : `${f(100 * dynamic.RegionID["cycle_pct"])}%`;
        })();
    
        const drive = (() => {
            return dynamic.RegionID === "999999"
                ? `${f((100 * dynamic.sumsGoogle["AUTOMOBILE_trips"]) / dynamic.sumsGoogle["TOTAL_trips"])}%`
                : `${f((100 * dynamic.RegionID["AUTOMOBILE_trips"]) / dynamic.RegionID["TOTAL_trips"])}%`;
        })();
    
        const pubs = (() => {
            return dynamic.RegionID === "999999"
                ? `${f((100 * dynamic.sumsGoogle["PUBLIC_trips"]) / dynamic.sumsGoogle["TOTAL_trips"])}%`
                : `${f((100 * dynamic.RegionID["PUBLIC_trips"]) / dynamic.RegionID["TOTAL_trips"])}%`;
        })();
    
        const co2_saved_year = (() => {
            return dynamic.RegionID === "999999"
                ? f(0.00141941108770439 * dynamic.sumsGoogle["ON FOOT_trips"])
                : f(0.00141941108770439 * dynamic.RegionID["ON FOOT_trips"]);
        })();
    
        const co2_saved_year_bike = (() => {
            return dynamic.RegionID === "999999"
                ? f(0.00141941108770439 * dynamic.sumsGoogle["CYCLING_trips"])
                : f(0.00141941108770439 * dynamic.RegionID["CYCLING_trips"]);
        })();
    
        const co2_em_year_car = (() => {
            return dynamic.RegionID === "999999"
                ? f(dynamic.sumsGoogle["AUTOMOBILE_gpc_co2e_tons"])
                : f(dynamic.RegionID["AUTOMOBILE_gpc_co2e_tons"]);
        })();
    
        const co2_em_year_public = (() => {
            return dynamic.RegionID === "999999"
                ? f(dynamic.sumsGoogle["PUBLIC_gpc_co2e_tons"])
                : f(dynamic.RegionID["PUBLIC_gpc_co2e_tons"]);
        })();
    
    
        return {
            location,
            walk,
            cycle,
            drive,
            pubs,
            co2_saved_year,
            co2_saved_year_bike,
            co2_em_year_car,
            co2_em_year_public,
            content
        };
    });

    return {
        get constant() { return constant },
        get dynamic() { return dynamic },
        get deriveds() { return deriveds },
        get calcs_census() { return calcs_census },
        get calcs_google() { return calcs_google }
    };
}

export let p = createProps();
