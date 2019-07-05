// Definición de variables
let gameJson;
let player1 = {};
let opponent1 = {};
let cellsSelectedForFired = [];
let NumberOfSalvoesToFire = 5;
let NumberOfTurn;
var backendTimerId;
var generalTimerId;
var gamePlayerState = "";
const urlParams = new URLSearchParams(location.search);
const gamePlayerParam = urlParams.get('gp');
const gameTeamsEnum = {
	USA: "USA",
	URRS: "URRS",
	GERMANY: "GERMANY",
	FRANCE: "FRANCE"
};
const typesOfShip = {
	carrier: {
		name: "Carrier",
		size: 5,
		id: "carrier"
	},
	battleship: {
		name: "Battleship",
		size: 4,
		id: "battleship"
	},
	submarine: {
		name: "Submarine",
		size: 3,
		id: "submarine"
	},
	destroyer: {
		name: "Destroyer",
		size: 3,
		id: "destroyer"
	},
	patrolBoat: {
		name: "Patrol Boat",
		size: 2,
		id: "patrol_boat"
	}
};
const yGridLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const cellSize = {
	width: 10,
	height: 10
};
const gameStateEnum = {
	waitOpponentJoin: "WAIT_OPPONENT_JOIN",
	placeShips: "PLACE_SHIPS",
	waitOpponentShips: "WAIT_OPPONENT_SHIPS",
	enterSalvo: "ENTER_SALVO",
	waitOpponentSalvo: "WAIT_OPPONENT_SALVO",
	gameOverWon: "GAME_OVER_WON",
	gameOverLost: "GAME_OVER_LOST",
	gamOverTied: "GAME_OVER_TIED",
	unknown: "UNKNOWN"
};
// Defino header
var url = '/api/game_view/' + gamePlayerParam;
var init = {
	headers: {
		'Content-Type': 'application/json',
	}
};

var playersId = document.getElementById("players");
var gameStateHTML = document.getElementById("game-state");
var gameTurnHTML = document.getElementById("game-turn");
var gameIdHTML = document.getElementById("game-id");
var logOutPanelHTML = document.getElementById("logout-panel");
var finishPlacingButtonHTML = document.getElementById("finish-placing-button");
var finishSalvoesButtonHTML = document.getElementById("finish-salvoes-button");
var gridShipsOpponent = document.getElementById("grid-ships-opponent");
var salvoCells = gridShipsOpponent.getElementsByClassName("salvo-cell");
var salvoesText = document.getElementById("salvoes-text");
var salvoHistory = document.getElementById("salvo-history");
var salvoCounterHTML = document.getElementById("salvo-counter");
var shipCounterHTML = document.getElementById("ship-counter");
var reloadBody = document.getElementById("reload-body");
var mainBody = document.getElementById("main-body");
var playerShipBoxHTML = document.getElementById("player-ship-box");
var opponentShipBoxHTML = document.getElementById("opponent-ship-box");
var controlsConsoleHTML = document.getElementById("controls-console");
var showYourShipsButtonHTML = document.getElementById("show-your-ships-button");
var showEnemyShipsButtonHTML = document.getElementById("show-enemy-ships-button");
var showBothShipsButtonHTML = document.getElementById("show-both-ships-button");


// Cargo la grilla, traigo los datos del backend e imprimo todo
$(() => {
	dataFetch().then(function (myJson) {
		logOutPanelHTML.style.display = "block";
		assignPlayers(); // separo los datos del jugador y el oponente
		printPlayers(); // Imprimo los nombres de los jugadores
		loadGrid(); // Cargo grilla
		// verifico si el jugador debe ubicar los barcos o ya estan ubicados
		if (gameJson.ships.length == 0) {
			startPlacingShips();
		} else {
			printShips(gameJson.ships); // Imprimo los barcos
		}
		// Si hay disparos, los imprimo
		if (gameJson.salvoes.length > 0) {
			printSalvoes(gameJson.salvoes);
		}
		// Muestro la página
		updateFromBackend();
		htmlRender();
		gameIdHTML.innerHTML = gameJson.gameId;
	}).catch(function (error) {
		// called when an error occurs anywhere in the chain
		alert("Request failed: " + error);
		console.log("Request failed: " + error);
		window.location.replace("/web/games.html");
	});
})

// Funciones
/*********************************************************
 ** Establezco timer para comunicación con backend
 *********************************************************/
function updateFromBackend() {
	backendTimerId = setInterval(function () {
		dataFetch().then(function (myJson) {
			// Actualizo página
			htmlRender();
			if (gameJson.salvoes.length > 0) {
				printSalvoes(gameJson.salvoes);
			}
			//console.log("backend");
		}).catch(function (error) {
			// called when an error occurs anywhere in the chain
			console.log("Request failed: " + error);
		});
	}, 1000);
}

/*********************************************************
 ** Detengo timer para comunicación con backend
 *********************************************************/
function stopUpdateFromBackend() {
	clearInterval(backendTimerId);
}

/*********************************************************
 ** Timer general para disparos y ubicación de barcos cada 1 seg.
 ** Se pasa el id donde imprimir la cuenta regresiva, una función
 ** que se ejecuta al final y el tiempo deseado
 *********************************************************/
function generalTimer1S(elementID, finishWithFunction, timer) {
	// Si el timer no fue llamado
	if (elementID.innerHTML == "") {
		generalTimerId = setInterval(function () {
			// Si no está seteado, empiezo la cuenta regresiva
			if (elementID.innerText == "") {
				elementID.innerText = timer;
				// si ya está contano, decremento el HTML
			}
			// Si llega a 0, llamo a la función indiada, paro el timer y borro tl innerText
			if (elementID.innerText <= 0) {
				stopGeneralTimer1S(elementID);
				finishWithFunction();
			} else {
				elementID.innerText = parseInt(elementID.innerText) - 1;
			}
			if (elementID.innerText == "20") {
				elementID.style.color = "red";
			}
		}, 1000);
	}
}

/*********************************************************
 ** Detengo timer general
 *********************************************************/
function stopGeneralTimer1S(elementID) {
	elementID.innerText = "";
	elementID.style.color = "white";
	clearInterval(generalTimerId);
}

/*********************************************************
 ** Asigno quien es el jugador y quien el oponente
 *********************************************************/
function assignPlayers() {
	gameJson.gamePlayers.map(gp => {
		if (gp.gamePlayerId == gamePlayerParam) {
			player1.username = gp.player.email;
			player1.id = gp.player.playerId;
			player1.team = gp.team;
		} else {
			opponent1.username = gp.player.email;
			opponent1.id = gp.player.playerId;
			opponent1.team = gp.team;
		}
	});
	document.getElementById("player-name").innerHTML = 'Hello <strong>' + player1.username + '</strong>';
}

/*********************************************************
 ** Imprime los jugadores de la partida
 *********************************************************/
function printPlayers() {
	if (!opponent1.username) {
		opponent1.username = "<span class='text-danger'>Waiting your opponent</span>";
		opponent1.team = "undefined";
	}

	// escribo en el dom
	playersId.innerHTML = player1.username + "<img class='flags-list' src='images/" + player1.team.toLocaleLowerCase() + "-flag.jpg'> vs ";
	playersId.innerHTML += opponent1.username + "<img class='flags-list' src='images/" + opponent1.team.toLocaleLowerCase() + "-flag.jpg'>";
}

/*********************************************************
 ** Render Functions
 *********************************************************/
function htmlRender() {
	// Reviso si hay un nuevo estado del juego
	if (gamePlayerState != gameJson.gamePlayerState) {
		gamePlayerState = gameJson.gamePlayerState;
		// Reviso el estado del juego
		switch (gamePlayerState) {
			case gameStateEnum.waitOpponentJoin:
				gameStateHTML.innerHTML = "Waiting your opponent";
				changeGridView("player");
				if (!gameJson.ships.length) {
					gameStateHTML.innerHTML += " / You can place yours ships";
				}
				changeGridView("player");
				break;
			case gameStateEnum.placeShips:
				gameStateHTML.innerHTML = "Place your ships";
				changeGridView("player");
				break;
			case gameStateEnum.waitOpponentShips:
				gameStateHTML.innerHTML = "Waiting opponent's ships";
				changeGridView("player");
				break;
			case gameStateEnum.enterSalvo:
				gameStateHTML.innerHTML = "Enter your salvo";
				setTimeout(function () {
					changeGridView("opponent");
				}, 1000);
				startSelectingSalvoes();
				break;
			case gameStateEnum.waitOpponentSalvo:
				gameStateHTML.innerHTML = "Waiting opponent's salvos";
				setTimeout(function () {
					changeGridView("player");
				}, 1000);
				break;
			case gameStateEnum.gameOverWon:
				gameStateHTML.innerHTML = "Game over: You won";
				salvoHistory.innerHTML = "<div class='end-game'><img src='images/game-won.jpg'></div><h5 class='text-white mt-1'>GAME OVER: YOU WON <br> let's celebrate <i class='fa fa-trophy' aria-hidden='true'></i></h5>";
				changeGridView("both");
				stopUpdateFromBackend();
				document.getElementById("back-img").src = "images/win-image.jpg";
				break;
			case gameStateEnum.gameOverLost:
				gameStateHTML.innerHTML = "Game over: You lost";
				salvoHistory.innerHTML = "<div class='end-game'><img src='images/game-lost.jpg'></div><h5 class='text-white mt-1'>GAME OVER: YOU LOST <br> looser!!! <i class='fa fa-thumbs-down' aria-hidden='true'></i></h5>";
				changeGridView("both");
				stopUpdateFromBackend();
				document.getElementById("back-img").src = "images/lost-image.jpg";
				break;
			case gameStateEnum.gamOverTied:
				gameStateHTML.innerHTML = "Game over: Tied";
				salvoHistory.innerHTML = "<div class='end-game'><img src='images/game-tied.jpg'></div><h5 class='text-white mt-1'>GAME OVER: TIE <br> such a boring game</h5>";
				changeGridView("both");
				stopUpdateFromBackend();
				break;
			case gameStateEnum.unknown:
				gameStateHTML.innerHTML = "There have been some problems, probably is your fault!!!";
		}
	}

	// Cargo el nombre del nuevo jugador
	if (gameJson.gamePlayers.length == 2 && !opponent1.id) {
		assignPlayers();
		printPlayers();
	}

	// saco el icono de cargando
	reloadBody.style.display = "none";
	reloadBody.innerHTML = "";
	// muestro la página una vez que está todo en su lugar ;)
	mainBody.style.visibility = "visible";
}

/*********************************************************
 ** Selecciona que grilla mostrar, la del oponente o la 
 ** del player. Recibe "player", "opponent" o "both"
 *********************************************************/
function changeGridView(gridSelected) {
	if (gridSelected == "player") {
		playerShipBoxHTML.style.display = "block";
		opponentShipBoxHTML.style.display = "none";
		controlsConsoleHTML.classList.add("col-lg");
		showYourShipsButtonHTML.classList.add("select-grid-button-selected");
		showEnemyShipsButtonHTML.classList.remove("select-grid-button-selected");
		showBothShipsButtonHTML.classList.remove("select-grid-button-selected");
	} else if (gridSelected == "opponent") {
		playerShipBoxHTML.style.display = "none";
		opponentShipBoxHTML.style.display = "block";
		controlsConsoleHTML.classList.add("col-lg");
		showYourShipsButtonHTML.classList.remove("select-grid-button-selected");
		showEnemyShipsButtonHTML.classList.add("select-grid-button-selected");
		showBothShipsButtonHTML.classList.remove("select-grid-button-selected");
	} else if (gridSelected == "both") {
		playerShipBoxHTML.style.display = "block";
		opponentShipBoxHTML.style.display = "block";
		controlsConsoleHTML.classList.remove("col-lg");
		showYourShipsButtonHTML.classList.remove("select-grid-button-selected");
		showEnemyShipsButtonHTML.classList.remove("select-grid-button-selected");
		showBothShipsButtonHTML.classList.add("select-grid-button-selected");
	}
}

/*********************************************************
 ** Empieza la ubicación de los barcos por parte del jugador
 *********************************************************/
function startPlacingShips() {
	// Armo el json para ubicar los barcos en la grilla
	gameJson.ships = placeShipsInGrid();
	// Imprimo los barcos en la grilla
	printShips(gameJson.ships);
	// Agrego los listener para rotar
	rotateShips("carrier", 5, true);
	rotateShips("battleship", 4, true);
	rotateShips("submarine", 3, true);
	rotateShips("destroyer", 3, true);
	rotateShips("patrol_boat", 2, true);
	// Permito que el jugador mueva los barcos
	shipGrid.movable('.grid-stack-item', true);
	// Agrego botón para que finalize la ubicación
	finishPlacingButtonHTML.innerHTML = '<button onclick="finishPlacingShips()" class="finish-placing-button">Place the ships <i class="fa fa-ship" aria-hidden="true"></i></button>';
	// Agrego un icono de rotación para celulares
	if (screen.width < 500) {
		let shipsArrayHTML = Array.from(document.getElementsByClassName("grid-stack-item-content ui-draggable-handle"));
		shipsArrayHTML.forEach(shipHTML => {
			shipHTML.innerHTML = '<span><i class="fa fa-repeat" aria-hidden="true"></i></span>';
		});
	}
}

/*********************************************************
 ** Finaliza la ubicación de los barcos por parte del jugador
 *********************************************************/
function finishPlacingShips() {
	let playerGrid = document.getElementById("player-grid");
	let shipsPosition;
	// Tomo la posición de los barcos y la transformo para enviarla al backend
	shipsPosition = shipsHTML2BackEnd(Array.from(playerGrid.children));
	// Envío la posición al backend
	createShips(gamePlayerParam, shipsPosition).then(function () {
		// Una vez que los barcos se crearon en el backend
		// Saco botón para finalizar la ubicación
		finishPlacingButtonHTML.innerHTML = "";
		document.getElementById("alert-text").innerHTML = "";
		// Saco los listener para rotar
		rotateShips("carrier", 5, false);
		rotateShips("battleship", 4, false);
		rotateShips("submarine", 3, false);
		rotateShips("destroyer", 3, false);
		rotateShips("patrol_boat", 2, false);
		// No permito que el jugador mueva los barcos
		shipGrid.movable('.grid-stack-item', false);
		// Busco los datos del backend y agrego los barcos a la grilla
		dataFetch().then(function () {
			printShips(gameJson.ships); // Imprimo los barcos
			htmlRender();
		}).catch(function (error) {
			// called when an error occurs anywhere in the chain
			console.log("Request failed: " + error);
		});
	}).catch(function (xhr) {
		document.getElementById("alert-text").innerHTML = JSON.parse(xhr.responseText).forbidden;
	});
}

/*********************************************************
 ** Recibe un arreglo de html de los barcos y los transforma
 ** en formato listo para enviar al back end
 *********************************************************/
function shipsHTML2BackEnd(shipsHTML) {
	let shipsBackEnd = [];
	shipsHTML.forEach(shipHTML => {
		let shipTypeTemp, x0, y0, height, width, shipsLocationTemp = [];
		// Asigno tipo de barco
		switch (shipHTML.id) {
			case typesOfShip.carrier.id:
				shipTypeTemp = typesOfShip.carrier.name;
				break;
			case typesOfShip.battleship.id:
				shipTypeTemp = typesOfShip.battleship.name;
				break;
			case typesOfShip.submarine.id:
				shipTypeTemp = typesOfShip.submarine.name;
				break;
			case typesOfShip.destroyer.id:
				shipTypeTemp = typesOfShip.destroyer.name;
				break;
			case typesOfShip.patrolBoat.id:
				shipTypeTemp = typesOfShip.patrolBoat.name;
		}
		//Tomo las coordenadas donde empieza el barco, el largo y el ancho 
		x0 = parseInt(shipHTML.getAttribute("data-gs-x"));
		y0 = parseInt(shipHTML.getAttribute("data-gs-y"));
		height = shipHTML.getAttribute("data-gs-height");
		width = shipHTML.getAttribute("data-gs-width");
		// Armo la ubicación con la forma ["A1", "A2", ..]
		for (let i = 0; i < height; i++) {
			for (let j = 1; j <= width; j++) {
				shipsLocationTemp.push([yGridLetters[y0 + i], x0 + j].join(""));
			}
		}
		// Armo el barco con la forma {"shipType": "...","shipLocation": ["XX", ..]}
		shipsBackEnd.push({
			"shipType": shipTypeTemp,
			"shipLocation": shipsLocationTemp
		});
	});
	return shipsBackEnd;
}

/*********************************************************
 ** Arma el json para ubicar barcos nuevos en la grilla
 *********************************************************/
function placeShipsInGrid() {
	let ships = [];
	ships.push({
		type: typesOfShip.carrier.name,
		locations: ["A1", "A2", "A3", "A4", "A5"]
	});
	ships.push({
		type: typesOfShip.battleship.name,
		locations: ["B1", "B2", "B3", "B4"]
	});
	ships.push({
		type: typesOfShip.submarine.name,
		locations: ["C1", "C2", "C3"]
	});
	ships.push({
		type: typesOfShip.destroyer.name,
		locations: ["D1", "D2", "D3"]
	});
	ships.push({
		type: typesOfShip.patrolBoat.name,
		locations: ["E1", "E2"]
	});
	return ships;
}

/*********************************************************
 ** muestra los barcos en la grilla
 *********************************************************/
function printShips(shipsJson) {
	// Borro los barcos que hay
	shipGrid.removeAll($('.grid-stack'))
	// Agrego los nuevos
	shipsJson.map(function (ship) {
		ship = ship2Grid(ship);
		shipGrid.addWidget($('<div id="' + ship.shipType + '"><div class="grid-stack-item-content ' + ship.shipClass + '"></div><div/>'),
			ship.x0, ship.y0, ship.x1, ship.y1);
	});
}

/*********************************************************
 ** muestra los barcos hundidos del enemigo
 *********************************************************/
function printSinkShips(shipsJson) {
	// Borro los barcos que hay
	salvoGrid.removeAll($('.grid-stack'))
	// Agrego los nuevos
	shipsJson.map(function (ship) {
		ship = ship2Grid(ship);
		salvoGrid.addWidget($('<div id="' + ship.shipType + '"><div class="grid-stack-item-content ' + ship.shipClass + '"></div><div/>'),
			ship.x0, ship.y0, ship.x1, ship.y1);
	});
}

/*********************************************************
 ** convierto los datos del barco a un formato simple de utilizar en la grilla
 *********************************************************/
function ship2Grid(ship) {
	let x0, y0, x1, y1, shipClass, temp;

	// Asigno x e y iniciales
	y0 = yGridLetters.indexOf(ship.locations[0][0]);
	x0 = parseInt(ship.locations[0][1]) - 1;

	// Asigno longitud y ancho del barco
	switch (ship.type) {
		case typesOfShip.carrier.name:
			temp = typesOfShip.carrier.size;
			break;
		case typesOfShip.battleship.name:
			temp = typesOfShip.battleship.size;
			break;
		case typesOfShip.submarine.name:
			temp = typesOfShip.submarine.size;
			break;
		case typesOfShip.destroyer.name:
			temp = typesOfShip.destroyer.size;
			break;
		case typesOfShip.patrolBoat.name:
			temp = typesOfShip.patrolBoat.size;
	}
	if (ship.locations[0][0] === ship.locations[1][0]) {
		y1 = 1;
		x1 = temp;
		shipClass = ship.type.toLowerCase().replace(" ", "_") + "Horizontal"
	} else {
		y1 = temp;
		x1 = 1;
		shipClass = ship.type.toLowerCase().replace(" ", "_") + "Vertical"
	}
	return {
		"x0": x0,
		"y0": y0,
		"x1": x1,
		"y1": y1,
		"shipType": ship.type.toLowerCase().replace(" ", "_"),
		"shipClass": shipClass
	};
}

/*********************************************************
 ** muestra los salvos en la grilla de disparo y en la de los barcos
 *********************************************************/
function printSalvoes(salvoesForPrint) {
	printSinkShips(gameJson.sinkShips)
	let x0, y0, cellId, cellEl;
	let hits = [];
	// Armo un array de los hits a los barcos enemigos
	gameJson.hits.forEach(hitByTurn => hitByTurn.hitsLocations.forEach(hit => hits.push(hit)));
	salvoesForPrint.map(function (salvoesByTurn) {
		// Si disparo el jugador, se muestra en la grilla de disparo
		if (salvoesByTurn.playerId === player1.id) {
			salvoesByTurn.locations.map(function (salvo) {
				// Asigno x e y
				y0 = yGridLetters.indexOf(salvo[0]);
				x0 = parseInt(salvo.slice(1)) - 1;
				cellId = x0 + (y0 * cellSize.width); // calculo el Id de la celda
				if (cellId < 10) {
					cellId = "0" + cellId; // si es menor que 10, uso formato 0X
				}
				cellId = "op-" + cellId; // le doy el formato op-xx
				cellEl = document.getElementById(cellId); // busco el elemento
				// Reviso si el disparo aceto en un barco enemigo
				if (hits.indexOf(salvo) != -1) {
					cellEl.classList.add("salvo-hit"); // le asigno la clase de acierto
				}
				cellEl.classList.add("salvo-fired"); // le asigno la clase de disparo
				cellEl.innerHTML = "<span>" + salvoesByTurn.turn + "</span>"; // le agrego el turno a la celda
			});
			// Si disparo el oponente, se muestra en la grilla de barcos
		} else if (salvoesByTurn.playerId === opponent1.id) {
			salvoesByTurn.locations.map(function (salvo) {
				// Asigno x e y
				y0 = yGridLetters.indexOf(salvo[0]);
				x0 = parseInt(salvo.slice(1)) - 1;
				cellId = x0 + (y0 * cellSize.width); // calculo el Id de la celda
				if (cellId < 10) {
					cellId = "0" + cellId; // si es menor que 10, uso formato 0X
				}
				cellId = "pl-" + cellId; // le doy el formato pl-xx
				cellEl = document.getElementById(cellId); // busco el elemento
				if (cellEl.classList.contains("busy-cell")) {
					cellEl.classList.add("salvo-received"); // le asigno la clase
					cellEl.innerHTML = "<span>" + salvoesByTurn.turn + "</span>"; // le agrego el turno a la celda
				}
			});
		}
	});
}

/*********************************************************
 ** Muestra que barcos faltan destruir y la historia de tiros
 *********************************************************/
function showSalvoHistory() {
	let tempHTML = "";
	let shipsUnsink = [];
	for (typeOfShip in typesOfShip) {
		if (!gameJson.sinkShips) {
			shipsUnsink.push(typesOfShip[typeOfShip]);
		} else if (!gameJson.sinkShips.some(ship => {
				return ship.type == typesOfShip[typeOfShip].name
			})) {
			shipsUnsink.push(typesOfShip[typeOfShip]);
		}
	}
	if (shipsUnsink.length != 0) {
		tempHTML = '<div class="title-control">You have to destroy:</div><div class="row mr-3 ml-3 info-control">';
		shipsUnsink.forEach(shipUnsink => {
			tempHTML += '<div class="col-auto ">- Ship: ' + shipUnsink.name + ' (Size: ' + shipUnsink.size + ')</div>';
		});
		tempHTML += '</div>';
	}
	salvoHistory.innerHTML = tempHTML;
}

/*********************************************************
 ** Empieza la selección de salvoes para disparar
 *********************************************************/
function startSelectingSalvoes() {
	stopUpdateFromBackend();
	generalTimer1S(salvoCounterHTML, finishSelectingSalvoes, 60);
	salvoCells = Array.from(salvoCells);
	if (finishSalvoesButtonHTML.innerHTML == "") {
		salvoCells.forEach(function (cell, index) {
			// Reviso que no se haya disparado en esa celda en turnos anteriores
			if (!cell.classList.contains("salvo-fired")) {
				// le asigno a las celdas la clase para hover (amarillo)
				cell.classList.add("salvo-for-select");
				// Agrego un listener para cambiar la clase de la celda que se presiona (verde)
				// y para volver al estado anterior si se presiona de nuevo
				$(cell).click(function () {
					if (cell.classList.contains("salvo-for-select") && cellsSelectedForFired.length < NumberOfSalvoesToFire) {
						cell.classList.remove("salvo-for-select");
						cell.classList.add("salvo-selected");
						cellsSelectedForFired.push(index);
						// Indico los salvos que faltan para disparar
						howManySalvoes();
					} else if (cell.classList.contains("salvo-selected")) {
						cell.classList.remove("salvo-selected");
						cell.classList.add("salvo-for-select");
						cellsSelectedForFired.splice(cellsSelectedForFired.indexOf(index), 1);
						// Indico los salvos que faltan para disparar
						howManySalvoes();
					}
				});
			}
		});
	}
	// Agrego botón para que finalize la ubicación
	finishSalvoesButtonHTML.innerHTML = '<button onclick="finishSelectingSalvoes()" class="finish-salvoes-button">Fire the Salvoes <i class="fa fa-dot-circle-o" aria-hidden="true"></i></button>';
	howManySalvoes();
}
// Función de soporte que indica cuantos salvoes faltan para disparar
function howManySalvoes() {
	if ((NumberOfSalvoesToFire - cellsSelectedForFired.length) === 0) {
		salvoesText.innerHTML = "You can FIRE!!!";
	} else if ((NumberOfSalvoesToFire - cellsSelectedForFired.length) === 1) {
		salvoesText.innerHTML = "You should select 1 more salvo";
	} else {
		salvoesText.innerHTML = "You should select " + (NumberOfSalvoesToFire - cellsSelectedForFired.length) + " more salvoes";
	}
}

/*********************************************************
 ** Termina la selección de salvoes para disparar
 *********************************************************/
function finishSelectingSalvoes() {
	stopGeneralTimer1S(salvoCounterHTML);
	let salvoesBackEnd = [];
	// transformo las ubicaciones de los salvoes y agrego info para enviar al backend
	salvoesBackEnd = salvoesCells2BackEnd(cellsSelectedForFired);
	// Envío la posición al backend
	saveSalvoes(gamePlayerParam, salvoesBackEnd).then(function () {
		// Una vez que los salvoes se crearon en el backend
		// Saco botón para que finalize la ubicación
		finishSalvoesButtonHTML.innerHTML = '';
		salvoesText.innerHTML = '';
		// Recorro las celdas para ...
		salvoCells.forEach(function (cell, index) {
			if (!cell.classList.contains("salvo-fired")) {
				// ... remover las clase
				cell.classList.remove("salvo-for-select");
				cell.classList.remove("salvo-selected");
				// ... remover los listener
				$(cell).off("click");
			}
		});
		// Limpio los salvos que se seleccionaron
		cellsSelectedForFired = [];
		// Busco los datos del backend y agrego los barcos a la grilla
		dataFetch().then(function (myJson) {
			// Actualizo página
			htmlRender();
			if (gameJson.salvoes.length > 0) {
				printSalvoes(gameJson.salvoes);
			}
		}).catch(function (error) {
			// called when an error occurs anywhere in the chain
			console.log("Request failed: " + error);
		});
		// vuelvo a poner el timer
		updateFromBackend();
	}).catch(function (xhr) {
		document.getElementById("alert-text").innerHTML = JSON.parse(xhr.responseText).forbidden;
	});
	gamePlayerState = "Cambio para que entre al switch en htmlRender";
}

/*********************************************************
 ** Función que prepara los salvoes para enviar al backend
 *********************************************************/
function salvoesCells2BackEnd(salvoesCells) {
	let salvoesBackEnd = {},
		x0, y0, locations = [];
	salvoesCells.forEach(function (salvoCell) {
		//Tomo el valor de x e y
		if (salvoCell > 9) {
			y0 = Math.floor(salvoCell / 10);
		} else {
			y0 = 0;
		}
		x0 = salvoCell - y0 * 10 + 1;
		// Transformo y0 en letra
		y0 = yGridLetters[y0];
		// guardo en locations, las posiciones
		locations.push([y0, x0].join(""));
	});
	// Armo el json para enviar
	salvoesBackEnd = {
		"turnNumber": NumberOfTurn,
		"salvoLocation": locations
	};
	return salvoesBackEnd;
}

/******************************************************************************************************************
 ** Funciones que intercambian con el Backend
 ******************************************************************************************************************/
/*********************************************************
 ** Traigo los datos y los asigno a gameJson
 *********************************************************/
function dataFetch() {
	return fetch(url, init).then(function (response) {
		if (response.ok) {
			return response.json();
		}
		// signal a server error to the chain
		throw new Error(response.statusText);
	}).then(function (myJson) {
		// do something with the JSON
		gameJson = myJson;
		NumberOfTurn = gameJson.nextTurn;
		if (gameJson.gamePlayerState == gameStateEnum.waitOpponentSalvo) {
			gameTurnHTML.innerHTML = NumberOfTurn - 1;
		} else {
			gameTurnHTML.innerHTML = NumberOfTurn;
		}
		showSalvoHistory();
	});
}

/*********************************************************
 ** Función de log out
 *********************************************************/
function playerSignOut() {
	$.post("/api/logout")
		.done(function () {
			window.location.replace("/web/games.html");
			console.log("logged out");
		})
}

/*********************************************************
 ** Función que envía los barcos al backend para su creación
 ** Recibe el id del game player y un array de barcos de la forma:
 ** {"shipType": "...","shipLocation": ["XX", ..]}
 *********************************************************/
function createShips(gamePlayerId, shipsData) {
	return $.post({
			url: "/api/games/players/" + gamePlayerId + "/ships",
			data: JSON.stringify(shipsData),
			dataType: "text",
			contentType: "application/json"
		})
		.done(function (xhr) {
			console.log(JSON.parse(xhr).created);
			return xhr.status;
		})
		.fail(function (xhr) {
			console.log(JSON.parse(xhr.responseText));
			return xhr.status;
		})
}

/*********************************************************
 ** Función que envía los salvoes al backend para guardar
 ** Recibe el id del game player y un json de la forma:
 ** {"turnNumber": "...","salvoLocation": ["XX", ..]}
 *********************************************************/
function saveSalvoes(gamePlayerId, salvoesData) {
	return $.post({
			url: "/api/games/players/" + gamePlayerId + "/salvos",
			data: JSON.stringify(salvoesData),
			dataType: "text",
			contentType: "application/json"
		})
		.done(function (xhr) {
			console.log(JSON.parse(xhr).created);
			return xhr.status;
		})
		.fail(function (xhr) {
			console.log(JSON.parse(xhr.responseText));
			return xhr.status;
		})
}

/***************************************************************************************************************
 ** Grid --------------------------------------------------------------------------------------------------------
 **all the functionalities are explained in the gridstack github
 **https://github.com/gridstack/gridstack.js/tree/develop/doc
 ***************************************************************************************************************/

//main function that shoots the gridstack.js framework and load the grid with the ships
const loadGrid = function () {
	var options = {
		//10 x 10 grid
		width: cellSize.width,
		height: cellSize.height,
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
		staticGrid: true,
		//activates animations
		animate: true
	}
	//grid initialization
	$('.grid-stack').gridstack(options);

	shipGrid = $('#player-grid').data('gridstack');
	salvoGrid = $('#opponent-grid').data('gridstack');

	createGrid("pl", 11, $(".grid-ships-player"))
	createGrid("op", 11, $(".grid-ships-opponent"))

	listenBusyCells();
	$('.grid-stack').on('change', listenBusyCells)

	// Agrego la clase salvo-cell a todas las celdas de los salvos
	for (let i = 0; i < 10; i++) {
		for (let j = 0; j < 10; j++) {
			$(`#op-${j}${i}`).addClass('salvo-cell')
		}
	}
}

//creates the grid structure
const createGrid = function (idName, size, element) {

	let wrapper = document.createElement('DIV')
	wrapper.classList.add('grid-wrapper')

	for (let i = 0; i < size; i++) {
		let row = document.createElement('DIV')
		row.classList.add('grid-row')
		row.id = `grid-row${"-" + idName + "-" + i}`
		wrapper.appendChild(row)

		for (let j = 0; j < size; j++) {
			let cell = document.createElement('DIV')
			cell.classList.add('grid-cell')
			if (i > 0 && j > 0)
				cell.id = idName + "-" + `${i - 1}${j - 1}`

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
const rotateShips = function (shipType, cells, addEvent) {

	if (addEvent) {
		$(`#${shipType}`).click(function () {
			document.getElementById("alert-text").innerHTML = ""
			let x = +($(this).attr('data-gs-x'))
			let y = +($(this).attr('data-gs-y'))
			if ($(this).children().hasClass(`${shipType}Horizontal`)) {
				if (shipGrid.isAreaEmpty(x, y + 1, 1, cells) || y + cells < 10) {
					if (y + cells - 1 < 10) {
						shipGrid.resize($(this), 1, cells);
						$(this).children().removeClass(`${shipType}Horizontal`);
						$(this).children().addClass(`${shipType}Vertical`);
					} else {
						shipGrid.update($(this), null, 10 - cells)
						shipGrid.resize($(this), 1, cells);
						$(this).children().removeClass(`${shipType}Horizontal`);
						$(this).children().addClass(`${shipType}Vertical`);
					}
				} else {
					document.getElementById("alert-text").innerHTML = "A ship is blocking the way!"
				}
			} else {
				if (x + cells - 1 < 10) {
					shipGrid.resize($(this), cells, 1);
					$(this).children().addClass(`${shipType}Horizontal`);
					$(this).children().removeClass(`${shipType}Vertical`);
				} else {
					shipGrid.update($(this), 10 - cells)
					shipGrid.resize($(this), cells, 1);
					$(this).children().addClass(`${shipType}Horizontal`);
					$(this).children().removeClass(`${shipType}Vertical`);
				}
			}
		});
	} else {
		$(`#${shipType}`).off("click");
	}
}

//loops over all the grid cells, verifying if they are empty or busy
const listenBusyCells = function () {
	for (let i = 0; i < 10; i++) {
		for (let j = 0; j < 10; j++) {
			if (!shipGrid.isAreaEmpty(i, j)) {
				$(`#pl-${j}${i}`).addClass('busy-cell').removeClass('empty-cell')
			} else {
				$(`#pl-${j}${i}`).removeClass('busy-cell').addClass('empty-cell')
			}
		}
	}
}