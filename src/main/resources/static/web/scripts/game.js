let playersId = document.getElementById("players");
let gameJson;
const urlParams = new URLSearchParams(location.search);
const gamePlayerParam = urlParams.get('gp');
const yGridLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

// Defino header
var url = '/api/game_view/' + gamePlayerParam;
var init = {
	headers: {
		'Content-Type': 'application/json',
	}
};

// Traigo los datos
fetch(url, init).then(function (response) {
	if (response.ok) {
		return response.json();
	}
	// signal a server error to the chain
	throw new Error(response.statusText);
}).then(function (myJson) {
	// do something with the JSON
	gameJson = myJson;
	printPlayers();
}).catch(function (error) {
	// called when an error occurs anywhere in the chain
	console.log("Request failed: " + error.message);
});

// Imprime los jugadores de la partida
function printPlayers() {
	let player1 = "";
	let opponent1 = "(Waiting for your opponent)";

	// Asigno quien es el jugador y quien el oponente
	gameJson.gamePlayers.map(gp => {
		if (gp.gamePlayerId == gamePlayerParam) {
			player1 = gp.player.email;
		} else {
			opponent1 = gp.player.email;
		}
	});

	// escribo en el dom
	playersId.innerHTML += player1 + " (you) vs ";
	playersId.innerHTML += opponent1;
}

// muestra los barcos en la grilla
function printShips(){
	ship1 = gameJson.ships.map(function (ship) {
			ship.type;
			yGridLetters.indexOf(gameJson.ships[0].locations[0][0])
	});
}


// Grid --------------------------------------------------------------------------------------------------------


$(() => loadGrid())

//main function that shoots the gridstack.js framework and load the grid with the ships
const loadGrid = function () {
	var options = {
		//10 x 10 grid
		width: 10,
		height: 10,
		//space between elements (widgets)
		verticalMargin: 0,
		//height of cells
		cellHeight: 45,
		//disables resizing of widgets
		disableResize: true,
		//floating widgets
		float: true,
		//removeTimeout: 100,
		//allows the widget to occupy more than one column
		disableOneColumnMode: true,
		//false allows widget dragging, true denies it
		staticGrid: false,
		//activates animations
		animate: true
	}
	//grid initialization
	$('.grid-stack').gridstack(options);

	grid = $('#grid').data('gridstack');

	//adding widgets to the grid
	grid.addWidget($('<div id="carrier"><div class="grid-stack-item-content carrierHorizontal"></div><div/>'),
		1, 5, 5, 1);

	grid.addWidget($('<div id="battleship"><div class="grid-stack-item-content battleshipHorizontal"></div><div/>'),
		3, 1, 4, 1);

	grid.addWidget($('<div id="submarine"><div class="grid-stack-item-content submarineVertical"></div><div/>'),
		8, 2, 1, 3);

	grid.addWidget($('<div id="destroyer"><div class="grid-stack-item-content destroyerHorizontal"></div><div/>'),
		7, 8, 3, 1);

	grid.addWidget($('<div id="patrol_boat"><div class="grid-stack-item-content patrol_boatHorizontal"></div><div/>'),
		0, 0, 2, 1);

	createGrid(11, $(".grid-ships"))


	rotateShips("carrier", 5)
	rotateShips("battleship", 4)
	rotateShips("submarine", 3)
	rotateShips("destroyer", 3)
	rotateShips("patrol_boat", 2)

	listenBusyCells()
	$('.grid-stack').on('change', listenBusyCells)


	//all the functionalities are explained in the gridstack github
	//https://github.com/gridstack/gridstack.js/tree/develop/doc

}


//creates the grid structure
const createGrid = function (size, element) {

	let wrapper = document.createElement('DIV')
	wrapper.classList.add('grid-wrapper')

	for (let i = 0; i < size; i++) {
		let row = document.createElement('DIV')
		row.classList.add('grid-row')
		row.id = `grid-row${i}`
		wrapper.appendChild(row)

		for (let j = 0; j < size; j++) {
			let cell = document.createElement('DIV')
			cell.classList.add('grid-cell')
			if (i > 0 && j > 0)
				cell.id = `${i - 1}${ j - 1}`

			if (j === 0 && i > 0) {
				let textNode = document.createElement('SPAN')
				textNode.innerText = String.fromCharCode(i + 64)
				cell.appendChild(textNode)
			}
			if (i === 0 && j > 0) {
				let textNode = document.createElement('SPAN')
				textNode.innerText = j
				cell.appendChild(textNode)
			}
			row.appendChild(cell)
		}
	}

	element.append(wrapper)
}

//adds a listener to the ships, wich shoots its rotation when clicked
const rotateShips = function (shipType, cells) {

	$(`#${shipType}`).click(function () {
		let x = +($(this).attr('data-gs-x'))
		let y = +($(this).attr('data-gs-y'))
		if ($(this).children().hasClass(`${shipType}Horizontal`)) {
			if (y + cells - 1 < 10) {
				grid.resize($(this), 1, cells);
				$(this).children().removeClass(`${shipType}Horizontal`);
				$(this).children().addClass(`${shipType}Vertical`);
			} else {
				grid.update($(this), null, 10 - cells)
				grid.resize($(this), 1, cells);
				$(this).children().removeClass(`${shipType}Horizontal`);
				$(this).children().addClass(`${shipType}Vertical`);

			}

		} else {
			if (x + cells - 1 < 10) {
				grid.resize($(this), cells, 1);
				$(this).children().addClass(`${shipType}Horizontal`);
				$(this).children().removeClass(`${shipType}Vertical`);
			} else {
				grid.update($(this), 10 - cells)
				grid.resize($(this), cells, 1);
				$(this).children().addClass(`${shipType}Horizontal`);
				$(this).children().removeClass(`${shipType}Vertical`);
			}

		}
	});

}

//loops over all the grid cells, verifying if they are empty or busy
const listenBusyCells = function () {
	for (let i = 0; i < 10; i++) {
		for (let j = 0; j < 10; j++) {
			if (!grid.isAreaEmpty(i, j)) {
				$(`#${j}${i}`).addClass('busy-cell').removeClass('empty-cell')
			} else {
				$(`#${j}${i}`).removeClass('busy-cell').addClass('empty-cell')
			}
		}
	}
}