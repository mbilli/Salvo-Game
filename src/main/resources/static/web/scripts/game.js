let playersId = document.getElementById("players");
let gameJson;
let player1 = {};
let opponent1 = {};
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
  assignPlayers(); // separo los datos del jugador y el oponente
  printPlayers(); // Imprimo los nombres de los jugadores
  printShips(); // Imprimo los barcos
  printSalvoes(); // Imprimo los disparos
}).catch(function (error) {
  // called when an error occurs anywhere in the chain
  console.log("Request failed: " + error.message);
});

/*********************************************************
 ** Asigno quien es el jugador y quien el oponente
 *********************************************************/
function assignPlayers() {
  gameJson.gamePlayers.map(gp => {
    if (gp.gamePlayerId == gamePlayerParam) {
      player1.username = gp.player.email;
      player1.id = gp.gamePlayerId;
    } else {
      opponent1.username = gp.player.email;
      opponent1.id = gp.gamePlayerId;
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
  let x0, y0;

  gameJson.salvoes.map(function (salvoesByTurn) {
    if (salvoesByTurn.playerId === player1.id) {
      salvoesByTurn.locations.map(function (salvo) {
        // Asigno x e y
        y0 = yGridLetters.indexOf(salvo[0]);
        x0 = parseInt(salvo[1]) - 1;
        salvoGrid.addWidget($('<div class="salvoes-fired"></div><div/>'), x0, y0, 1, 1);
      });
    } else if (salvoesByTurn.playerId === opponent1.id) {
      salvoesByTurn.locations.map(function (salvo) {
        // Asigno x e y
        y0 = yGridLetters.indexOf(salvo[0]);
        x0 = parseInt(salvo[1]) - 1;
        shipGrid.addWidget($('<div class="salvoes-received"></div><div/>'), x0, y0, 1, 1);
      });
    }
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
    staticGrid: true,
    //activates animations
    animate: true
  }
  //grid initialization
  $('.grid-stack').gridstack(options);

  shipGrid = $('#player-grid').data('gridstack');
  salvoGrid = $('#opponent-grid').data('gridstack');

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
        $(`#${j}${i}`).addClass('busy-cell').removeClass('empty-cell')
      } else {
        $(`#${j}${i}`).removeClass('busy-cell').addClass('empty-cell')
      }
    }
  }
}