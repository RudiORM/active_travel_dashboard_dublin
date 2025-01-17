<script>
	import img from "$lib/images/db3.png";
	import { p } from '$lib/props.svelte';
	import { mapUtils } from '$lib/mapUtils.svelte';

  function handleReset() {
  mapUtils.resetTrigger = true;
}

	let expanded = $state(false);
	let expandedHierarchy1 = $state(true);

	const setMode = function (d) {
		handleReset()
		p.dynamic.visMode = d.value;
	};

	const toggleExpanded = (_) => (expanded = !expanded);
	const toggleHierarchy1 = (_) => (expandedHierarchy1 = !expandedHierarchy1);


	setTimeout(() => {
		expanded = true;
	}, 1000);
</script>

<nav class:expanded>
	<!-- Toggle navigation -->
	<button 
		onclick={toggleExpanded} 
		onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleExpanded()} 
		aria-expanded={expanded}

		aria-label="Toggle navigation"
	>
		{@html expanded ? "&#9204;" : "&#8801;"}
	</button>

	<section class="non-essential">
		<img class="img" src={img} alt="" />

		<!-- Hierarchy 1 -->
		<button 
			onclick={toggleHierarchy1} 
			onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleHierarchy1()} 
			class="hierarchy-toggle"
			aria-expanded={expandedHierarchy1}
			aria-label="Toggle Boundary"
		>
			<span>{expandedHierarchy1 ? "▼" : ""} Boundary</span>
		</button>

		{#if expandedHierarchy1}
			<ul class="nested-list">
				{#each p.constant.visModeOptions.slice(0, 3) as d}
					<li>
						<button
							onclick={() => setMode(d)}
							onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && setMode(d)}
							class="item-button"
							aria-pressed={p.dynamic.visMode === d.value}
						>
							{d.label}
						</button>
					</li>
				{/each}
			</ul>
		{/if}



	


		<!-- Hierarchy 2 -->
		<ul>
			{#each p.constant.visModeOptions.slice(3,5) as d}
				<li>
					<button
						onclick={() => setMode(d)}
						onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && setMode(d)}
						class="item-button"
						aria-pressed={p.dynamic.visMode === d.value}
					>
						{d.label}
					</button>
				</li>
			{/each}
		</ul>
	</section>
</nav>

<style>
nav {
	grid-area: nav;
	height: 100%;
	background-color: #324754;
	color: #a2b7c4;
	transition: ease-out 500ms;
	width: 60px;
	overflow: hidden;
}

.expanded {
	transition: ease-out 500ms;
	width: 200px;
}


ul {
	list-style: none;
	padding: 0;
	margin: 0;
}

/* Indent for nested lists under expanded hierarchy */
.nested-list {
	margin-left: 20px; /* Indents nested items */
}

li {
	width: 100%;
	padding: 0px;
	margin: 0px;
	padding-top: 15px;
}

.item-button {
	width: 100%;
	background: none;
	border: none;
	color: inherit;
	text-align: left;
	font: inherit;
	cursor: pointer;
	padding: 0;
	margin: 0;
	padding-left: 20px;
	transition: color 200ms ease;
}

.item-button:hover,
.item-button:focus {
	color: white;
}

.hierarchy-toggle {
	background: none;
	border: none;
	color: inherit;
	text-align: left;
	width: 100%;
	cursor: pointer;
	font: inherit;
	padding: 15px 0 0;
	padding-left: 20px;
	margin: 0;
}

button {
	border: none;
	background: none;
	color: #a2b7c4;
	font-size: 2rem;
	text-align: center;
	width: 100%;
	cursor: pointer;
	padding: 0;
	margin: 0;
}

.img {
	position: relative;
	margin-top: 5px;
	margin-bottom: 10px;
	width: 150px;
	display: block;
	margin-left: auto;
	margin-right: auto;
}

/** Fading for expanded content **/

.non-essential {
	transition: opacity 200ms ease-out, visibility 0ms 200ms;
	opacity: 0;
	visibility: hidden;
}

.expanded .non-essential {
	transition: opacity 200ms ease-out 100ms;
	opacity: 1;
	visibility: visible;
}

</style>
