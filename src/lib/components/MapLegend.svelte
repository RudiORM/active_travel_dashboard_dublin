<script>
import { get } from "svelte/store";
import {p} from '$lib/props.svelte';
const TEMPERATURE_RANGE = 99;
const LABEL_DISPLAY_INTERVAL = 4; // Show every nth label
// // Helper functions
const formatLabel = (value) => p.deriveds.metricFormat.format(value);
const calculatePosition = (value, min, range) => {
    if (value === min) return 0;
    if (value === min + range) return 100;
    return ((value - min) / (range)) * 100;
};
const calculateWidth = (currentValue, previousValue, range) => {
    return ((currentValue - previousValue) / range) * 100;
};
let legendData = $derived.by(() => {
    return p.deriveds.colorBreaks2.map((breakPoint, index) => ({
        color: p.deriveds.cols2[index],
        value: breakPoint,
        position: calculatePosition(breakPoint, p.deriveds.colorBreaks2[0], p.deriveds.range),
        width: calculateWidth(breakPoint, p.deriveds.colorBreaks2[index-1], p.deriveds.range),
        showLabel: index % LABEL_DISPLAY_INTERVAL === 0
    }));
});

let title = $derived.by(() => {
    return `${p.deriveds.metricLabel.split(' ')[0]} %`;
});



</script>

<div class="container open">
    <div class="inside">
        <div class="title">{title}</div>
        
        <div class="legend-colors">
            {#each legendData as item}
                <div class="tick" />
                <div 
                    class="square" 
                    style="background-color: {item.color}; 
                           width: {item.width}%;" 
                />
            {/each}
        </div>
        
        <div class="legend-labels">
            {#each legendData as item}
                {#if item.showLabel}
                    <div 
                        class="label" 
                        style="left: {item.position}%"
                    >
                        {formatLabel(item.value)}
                    </div>
                {/if}
            {/each}
        </div>
    </div>
</div>

<style>
    .container {
        transition: 100ms ease-in-out;
        width: fit-content;
        border-radius: 20px;
        font-family:  Work Sans;
    }
    
    .open {
        bottom: -30px;
        height: 0px;
        width: 100%;
        left: 2%;
    }
    
    .inside {
        flex: 1 0 auto;
        padding: 7px 14px;
    }
    
    .legend-colors {
        display: flex;
        width: 100%;
    }
    
    .title {
        font-size: 1.1rem;
        margin-bottom: 6px;
        text-align: center;
    }
    
    .square {
        flex: 1 0 auto;
        height: 15px;
        border-width: 0;
        border-style: solid;
        opacity: 0.8;
    }
    
    .tick {
        width: 0px;
        height: 0px;
        border-left: 1px solid #696969;
    }
    
    .legend-labels {
        position: relative;
        height: 20px;
        width: 100%;
        font-size: 1rem;
    }
    
    .label {
        position: absolute;
        transform: translate(-50%, 0);
        line-height: 180%;
    }
    
    .label:first-child {
        transform: translate(0, 0);
    }
    
    .label:last-child {
        text-align: right;
    }
    
    
</style>
