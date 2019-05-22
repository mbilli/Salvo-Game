// Definición de variables
let playersId = document.getElementById("players");
let gameJson;
let player1 = {};
let opponent1 = {};
const urlParams = new URLSearchParams(location.search);
const gamePlayerParam = urlParams.get('gp');
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


$(() => {
  loadGrid();
  dataFetch();
})


/*********************************************************
 ** Traigo los datos e imprimo todo
 *********************************************************/
function dataFetch() {
  fetch(url, init).then(function (response) {
    if (response.ok) {
      return response.json();
    }
    // signal a server error to the chain
    throw new Error(response.statusText);
  }).then(function (myJson) {
    // do something with the JSON
    gameJson = myJson;
    assignPlayers(); // separo los datos del jugador y el oponente
    printPlayers(); // Imprimo los nombres de los jugadores
    printShips(); // Imprimo los barcos
    printSalvoes(); // Imprimo los disparos
  }).catch(function (error) {
    // called when an error occurs anywhere in the chain
    console.log("Request failed: " + error.message);
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
 ** convierto los datos del barco a un formato simple de utilizar en la grilla
 *********************************************************/
function ship2Grid(ship) {
  let x0, y0, x1, y1, shipClass, temp;

  // Asigno x e y iniciales
  y0 = yGridLetters.indexOf(ship.locations[0][0]);
  x0 = parseInt(ship.locations[0][1]) - 1;

  // Asigno longitud y ancho del barco
  switch (ship.type) {
    case "Carrier":
      temp = 5;
      break;
    case "Battleship":
      temp = 4;
      break;
    case "Submarine":
      temp = 3;
      break;
    case "Destroyer":
      temp = 3;
      break;
    case "Patrol Boat":
      temp = 2;
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
    "shipType": ship.type.toLowerCase(),
    "shipClass": shipClass
  };
}

/*********************************************************
 ** muestra los barcos en la grilla
 *********************************************************/
function printShips() {
  gameJson.ships.map(function (ship) {
    ship = ship2Grid(ship);
    shipGrid.addWidget($('<div id="' + ship.shipType + '"><div class="grid-stack-item-content ' + ship.shipClass + '"></div><div/>'),
      ship.x0, ship.y0, ship.x1, ship.y1);
  });
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
        cellId = "pl-" + cellId; // le doy el formato pl-xx
        cellEl = document.getElementById(cellId); // busco el elemento
        cellEl.classList[1].indexOf("empty")
        if (cellEl.classList.contains("busy-cell")) {
          cellEl.classList.add("salvoes-fired"); // le asigno la clase
          cellEl.innerHTML = "<span>" + salvoesByTurn.turn + "</span>"; // le agrego el turno a la celda
        }
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
        cellId = "op-" + cellId; // le doy el formato op-xx
        cellEl = document.getElementById(cellId); // busco el elemento
        cellEl.classList.add("salvoes-received"); // le asigno la clase
        cellEl.innerHTML = "<span>" + salvoesByTurn.turn + "</span>"; // le agrego el turno a la celda
      });
    }
  });
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
        cell.id = idName + "-" + `${i - 1}${ j - 1}`

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