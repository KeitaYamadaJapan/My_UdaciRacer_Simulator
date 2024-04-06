// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
let store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
}


// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	try {
		getTracks()
			.then(tracks => {
				const html = renderTrackCards(tracks)
				renderAt('#tracks', html)
			})
		getRacers()
			.then((racers) => {
				const html = renderRacerCars(racers)
				renderAt('#racers', html)
			})
	} catch(error) {
		console.log("Problem getting tracks and racers ::", error.message)
		console.error(error)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', function(event) {
		let { target } = event
		// Race track form field
		if (target.matches('.card.track') || target.parentNode.matches('.card.track')) {
			if (target.parentNode.matches('.card.track')) { 
				target = target.parentNode;
			}
			handleSelectTrack(target)
		}
	  	// Podracer form field
		if (target.matches('.card.podracer') || target.parentNode.matches('.card.podracer')) {
			if (target.parentNode.matches('.card.podracer')) { 
				target = target.parentNode;
			}
			handleSelectPodRacer(target)
		}
				
		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()	
			// start race
			handleCreateRace()
		}
		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate(target)
		}
	}, false)
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch(error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
	console.log("in create race")


	// TODO - Get player_id and track_id from the store
	const player_id = store.player_id;
	const track_id = store.track_id;

	if (!player_id || !track_id) {
		alert("Please select racer and track to start the race!");
		return
	} 

	// render starting UI
	renderAt('#race', renderRaceStartView(track_id))

	// const race = TODO - call the asynchronous method createRace, passing the correct parameters
	try{
		const race = await createRace(player_id, track_id);
	// TODO - update the store with the race id in the response
		store.race_id = parseInt(race.ID) - 1;

	
	// TIP - console logging API responses can be really helpful to know what data shape you received
		console.log("RACE: ", race)
	// store.race_id = 
	
	// The race has been created, now start the countdown
	// TODO - call the async function runCountdown
		await runCountdown();
	// TODO - call the async function startRace
	// TIP - remember to always check if a function takes parameters before calling it!
		await startRace(store.race_id);
	// TODO - call the async function runRace
		await runRace(store.race_id);
	}catch(error){
		/*
		If there is no appropriate response from the server,
		Handles the display of game execution.
		*/
		console.log("handleCreateRace error: ", error.message)
		renderAt('#race', abortView())
	}
}

function runRace(raceID) {
	return new Promise(resolve => {
		// Javascript's built in setInterval method to get race info every 500ms
		const raceInterval = setInterval(async () => {
			/* 
				If the race info status property is "in-progress", update the leaderboard by calling:
				renderAt('#leaderBoard', raceProgress(res.positions))
				If the race info status property is "finished", run the following:
				clearInterval(raceInterval) // to stop the interval from repeating
				renderAt('#race', resultsView(res.positions)) // to render the results view
				reslove(res) // resolve the promise
			*/
			try {
				const res = await getRace(raceID)
				if (res.status === "in-progress") {
					renderAt('#leaderBoard', raceProgress(res.positions))
				} else if (res.status === "finished") {
					clearInterval(raceInterval) // to stop the interval from repeating
					renderAt('#race', resultsView(res.positions)) // to render the results view
					resolve(res) // resolve the promise
				} else {
					clearInterval(raceInterval)
					resolve(res)
				}
			} catch (error) {
				/**
				  If there is no appropriate response from the server,
				　Sends the caught error to the parent module.
				　Game progress has already been stopped.				 
				 */
				console.log("handling getRace error: ", error)
				throw error
			}
		}, 500)
	})
}

async function runCountdown() {
	try {
		// wait for the DOM to load
		await delay(1000)
		let timer = 3

		return new Promise(resolve => {
			// TODO - use Javascript's built in setInterval method to count down once per second
			const interval = setInterval(() => {
			// run this DOM manipulation inside the set interval to decrement the countdown for the user
				document.getElementById('big-numbers').innerHTML = --timer
			// TODO - when the setInterval timer hits 0, clear the interval, resolve the promise, and return
			if (timer === 0) {
				clearInterval(interval);
				resolve();
				return;
			  }
			},1000);
		})
	} catch(error) {
		console.log(error);
	}
}

function handleSelectPodRacer(target) {
	console.log("selected a pod", target.id)
	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected')
	if(selected) {
		selected.classList.remove('selected')
	}
	// add class selected to current target
	target.classList.add('selected')
	// save the selected racer to the store
	store.player_id = parseInt(target.id)
}

function handleSelectTrack(target) {
	console.log("selected a track", target.id)
	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if(selected) {
		selected.classList.remove('selected')
	}
	// add class selected to current target
	target.classList.add('selected')
	// save the selected track id to the store
	store.track_id = parseInt(target.id)
}

function handleAccelerate() {
	// Invoke the API call to accelerate
	accelerate(store.race_id)
		.then(()=> console.log("accelerate button clicked"))
		.catch((error)=>console.log(error))
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`
	}
	const results = racers.map(renderRacerCard).join('')
	return `
		<ul id="racers">
			${results}
		</ul>
	`
}

function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer
	return `
		<li class="card podracer" id="${id}">
			<h3>${driver_name}</h3>
			<p>${`Top Speed: ${top_speed}`}</p>
			<p>${acceleration}</p>
			<p>${handling}</p>
		</li>
	`
}

function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}
	const results = tracks.map(renderTrackCard).join('')
	return `
		<ul id="tracks">
			${results}
		</ul>
	`
}

function renderTrackCard(track) {
	const { id, name } = track
	return `
		<li id="${id}" class="card track">
			<h3>${name}</h3>
		</li>
	`
}

function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track, racers) {
	return `
		<header>
			<h1>Race: Track ${track}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>
			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button class="Accelerate" id="gas-peddle">Click Me Fast!!</button>
				</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)
	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			<div class="rowCenter">
				${raceProgress(positions)}
				<a class="button" href="/home">Start a new race</a>
			</div>	
		</main>
	`
}

function abortView() {
	
	return `
		<header>
			<h1>Sorry. We cannot start next race. </h1>
		</header>
		<main>
			<div class="abort">
				<h2></h2>
				<h2>We fall into Race system trouble.</h2>
				<h2>(There are no responce from server.</h2>
				<h2>I cannot find how to get responce  </h2>
				<h2>at next race, yet.)                </h2>  
				<h2>We cannot start next race, until we solve this problem. </h2>
				<h2>Thank you.</h2>
			</div>
		</main>
	`
}

function raceProgress(positions) {
	let userPlayer = positions.find(e => e.id === store.player_id)
	userPlayer.driver_name += " (you)"
	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1
	const results = positions.map(p => {
		if(p.id === store.player_id){
			return `
			<tr>
				<td>
					<h3>${count++} - <span class="player">${p.driver_name}</span></h3>
				</td>
			</tr>
		`
		}else{
			return `
				<tr>
					<td>
						<h3>${count++} - ${p.driver_name}</h3>
					</td>
				</tr>
			`
		}
	})
	return `
		<main>
			<h3 class="inRace">Leaderboard</h3>
			<section id="leaderBoard">
				${results}
			</section>
		</main>
	`
}

function renderAt(element, html) {
	const node = document.querySelector(element)
	node.innerHTML = html
}

// ^ Provided code ^ do not remove

// API CALLS ------------------------------------------------

//const SERVER = 'http://localhost:3001'
const SERVER = 'http://localhost:8000'

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin' : SERVER,
		},
	}
}

// A fetch call (with error handling!) to each of the following API endpoints 

function getTracks() {
	console.log(`calling server :: ${SERVER}/api/tracks`)
	// GET request to `${SERVER}/api/tracks`

	// TODO: Fetch tracks
	// TIP: Don't forget a catch statement!
	return fetch(`${SERVER}/api/tracks`, {
		method: 'GET',
		...defaultFetchOpts(),
		//dataType: 'jsonp',
		//body: JSON.stringify(body)
	})
	.then(res => res.json())
	.catch(err => {
		console.log("Problem with getRacers request::", err)
		iscont = false;
		console.log(iscont === true)
	})	
}

function getRacers() {
	// GET request to `${SERVER}/api/cars`

	// TODO: Fetch racers
	// TIP: Do a file search for "TODO" to make sure you find all the things you need to do! There are even some vscode plugins that will highlight todos for you
	return fetch(`${SERVER}/api/cars`, {
		method: 'GET',
		...defaultFetchOpts(),
		//dataType: 'jsonp',
		//body: JSON.stringify(body)
	})
	.then(res => res.json())
	.catch(err => {
		console.log("Problem with getRacers request::", err)
		iscont = false
		console.log(iscont === true)
	})	
}

function createRace(player_id, track_id) {
	player_id = parseInt(player_id)
	track_id = parseInt(track_id)
	const body = { player_id, track_id }	
	return fetch(`${SERVER}/api/races`, {
		method: 'POST',
		dataType: 'jsonp',
		body: JSON.stringify(body),
		...defaultFetchOpts()
	})
	.then(res => res.json())
	.catch(err => {
		console.log("Problem with createRace request::", err)
		iscont = false
		console.log(iscont === true)
	})
}

function getRace(id) {
	// GET request to `${SERVER}/api/races/${id}`
	return fetch(`${SERVER}/api/races/${id}`, {
		method: 'GET',
		...defaultFetchOpts(),
	})
	.then(res => res.json())
	.catch(err => {
		console.log("Problem with getRace request::", err)
		iscont = false
		console.log(iscont === true)
	})
}

function startRace(id) {
	return fetch(`${SERVER}/api/races/${id}/start`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
		.catch(error =>{
			console.log("Problem with startRace request::", error)
			iscont = false;
			console.log(iscont === true)
			throw error
		})		 
}


function accelerate(id) {
	// POST request to `${SERVER}/api/races/${id}/accelerate`
	// options parameter provided as defaultFetchOpts
	// no body or datatype needed for this request
	return fetch(`${SERVER}/api/races/${id}/accelerate`, {
		method: "POST",
		...defaultFetchOpts(),
	  }).catch((error) => console.log(error));
}