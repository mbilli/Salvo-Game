// Definición de variables
let gameJson;
let player1 = {};
let opponent1 = {};
const urlParams = new URLSearchParams(location.search);
const gamePlayerParam = urlParams.get('gp');
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
// Defino header
var url = '/api/game_view/' + gamePlayerParam;
var init = {
  headers: {
    'Content-Type': 'application/json',
  }
};

var playersId = document.getElementById("players");
var logOutPanel = document.getElementById("logout-panel");
var finishPlacingButton = document.getElementById("finish-placing-button");


// Cargo la grilla, traigo los datos del backend e imprimo todo
$(() => {
  dataFetch().then(function (myJson) {
    logOutPanel.style.display = "block";
    assignPlayers(); // separo los datos del jugador y el oponente
    printPlayers(); // Imprimo los nombres de los jugadores
    loadGrid(); // Cargo grilla
    // verifico si el jugador debe ubicar los barcos o ya estan ubicados
    if (gameJson.ships.length == 0) {
      startPlacingShips();
    } else {
      printShips(gameJson.ships); // Imprimo los barcos
    }
    printSalvoes(); // Imprimo los disparos
  }).catch(function (error) {
    // called when an error occurs anywhere in the chain
    //alert("Request failed: " + error);
    console.log("Request failed: " + error);
    //window.location.replace("/web/games.html");
  });
})

// Funciones
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
  });
}

/*********************************************************
 ** Asigno quien es el jugador y quien el oponente
 *********************************************************/
function assignPlayers() {
  gameJson.gamePlayers.map(gp => {
    if (gp.gamePlayerId == gamePlayerParam) {
      player1.username = gp.player.email;
      player1.id = gp.player.playerId;
    } else {
      opponent1.username = gp.player.email;
      opponent1.id = gp.player.playerId;
    }
  });
  document.getElementById("player-name").innerHTML = 'Hello <strong>' + player1.username + '</strong>';
}

/*********************************************************
 ** Imprime los jugadores de la partida
 *********************************************************/
function printPlayers() {
  if (!opponent1.username) {
    opponent1.username = "(Waiting for your opponent)";
  }

  // escribo en el dom
  playersId.innerHTML += player1.username + " (you) vs ";
  playersId.innerHTML += opponent1.username;
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
  finishPlacingButton.innerHTML = '<button onclick="finishPlacingShips()" class="">Place the ships</button>';


}

/*********************************************************
 ** Finaliza la ubicación de los barcos por parte del jugador
 *********************************************************/
function finishPlacingShips() {
  let playerGrid = document.getElementById("player-grid");
  let shipsPosition;
  // Saco botón para finalizar la ubicación
  finishPlacingButton.innerHTML = "";
  // Saco los listener para rotar
  rotateShips("carrier", 5, false);
  rotateShips("battleship", 4, false);
  rotateShips("submarine", 3, false);
  rotateShips("destroyer", 3, false);
  rotateShips("patrol_boat", 2, false);
  // No permito que el jugador mueva los barcos
  shipGrid.movable('.grid-stack-item', false);
  // Tomo la posición de los barcos y la transformo para enviarla al backend
  shipsPosition = shipsHTML2BackEnd(Array.from(playerGrid.children));
}

/*********************************************************
 ** Recibe un arreglo de html de los barcos y los transforma
 ** en formato listo para enviar al back end
 *********************************************************/
function shipsHTML2BackEnd(shipsHTML) {
  let shipsBackEnd = [];
  shipsHTML.map(shipHTML => {
    let shipTypeTemp;
    let x0, y0, height, width, shipsLocationTemp = [];

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
  x0 = shipHTML.getAttribute("data-gs-x");
  y0 = shipHTML.getAttribute("data-gs-y");
  height = shipHTML.getAttribute("data-gs-height");
  width = shipHTML.getAttribute("data-gs-width");

  // Armo la ubicación con la forma ["A1", "A2", ..]
  for (let i = 0; i < height; i++) {
    for (let j = 0; i < width; j++) {
      shipsLocationTemp.push([yGridLetters[y0], x0].join(""));
    }
  }

  // Armo el barco con la forma {"shipType": "...","shipLocation": ["XX", ..]}
    shipsBackEnd.push({"shipType": shipTypeTemp, "shipLocation": shipsLocationTemp});
  });
  console.log(shipsBackEnd);
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
  shipsJson.map(function (ship) {
    ship = ship2Grid(ship);
    shipGrid.addWidget($('<div id="' + ship.shipType + '"><div class="grid-stack-item-content ' + ship.shipClass + '"></div><div/>'),
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
function printSalvoes() {
  let x0, y0, cellId, cellEl;

  gameJson.salvoes.map(function (salvoesByTurn) {
    if (salvoesByTurn.playerId === player1.id) {
      salvoesByTurn.locations.map(function (salvo) {
        // Asigno x e y
        y0 = yGridLetters.indexOf(salvo[0]);
        x0 = parseInt(salvo[1]) - 1;
        cellId = x0 + (y0 * cellSize.width); // calculo el Id de la celda
        if (cellId < 10) {
          cellId = "0" + cellId; // si es menor que 10, uso formato 0X
        }
        cellId = "op-" + cellId; // le doy el formato op-xx
        cellEl = document.getElementById(cellId); // busco el elemento
        cellEl.classList.add("salvoes-fired"); // le asigno la clase
        cellEl.innerHTML = "<span>" + salvoesByTurn.turn + "</span>"; // le agrego el turno a la celda
      });
    } else if (salvoesByTurn.playerId === opponent1.id) {
      salvoesByTurn.locations.map(function (salvo) {
        // Asigno x e y
        y0 = yGridLetters.indexOf(salvo[0]);
        x0 = parseInt(salvo[1]) - 1;
        cellId = x0 + (y0 * cellSize.width); // calculo el Id de la celda
        if (cellId < 10) {
          cellId = "0" + cellId; // si es menor que 10, uso formato 0X
        }
        cellId = "pl-" + cellId; // le doy el formato pl-xx
        cellEl = document.getElementById(cellId); // busco el elemento
        if (cellEl.classList.contains("busy-cell")) {
          cellEl.classList.add("salvoes-received"); // le asigno la clase
          cellEl.innerHTML = "<span>" + salvoesByTurn.turn + "</span>"; // le agrego el turno a la celda
        }
      });
    }
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
  $.post({
    url: "/api/games/players/" + gamePlayerId + "/ships",
    data: JSON.stringify(shipsData),
    dataType: "text",
    contentType: "application/json"
  })
    .done(function (xhr) {
      console.log(JSON.parse(xhr).created);
      // Busco los datos del backend y agrego los barcos a la grilla
      dataFetch().then(function () {
        printShips(gameJson.ships); // Imprimo los barcos
      }).catch(function (error) {
        // called when an error occurs anywhere in the chain
        console.log("Request failed: " + error);
      });
    })
    .fail(function (xhr) {
      console.log(JSON.parse(xhr.responseText));
    })
}


// Grid --------------------------------------------------------------------------------------------------------



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


  listenBusyCells()
  $('.grid-stack').on('change', listenBusyCells)


  //all the functionalities are explained in the gridstack github
  //https://github.com/gridstack/gridstack.js/tree/develop/doc

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