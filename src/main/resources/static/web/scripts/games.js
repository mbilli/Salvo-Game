var gameList = document.getElementById("game-list");
var leaderboardTable = document.getElementById("leaderboard-table");
// Defino header
var url = '/api/games';
var init = {
  headers: {
    'Content-Type': 'application/json',
  }
};
// contiene los datos enviados por el Backend
let gameJson;
// contiene los datos calculados de los partidos en un array de jugadores
let leaderboardJson = [];


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
  calculateGames();
  populateLeaderboardTable();
  //populateGameList(myJson);
}).catch(function (error) {
  // called when an error occurs anywhere in the chain
  console.log("Request failed: " + error.message);
});

/*********************************************************
 ** Imprime los datos de los jugadores
 ** recibe el json
 *********************************************************/
function populateGameList(myJson) {
  myJson.forEach(game => {
    var gameDate = new Date(game.created);
    gameList.innerHTML += "<li>GAME ID: " + game.gameId + " - CREATED: " + gameDate.toLocaleString() +
      " - PLAYERS: " + game.gamePlayers.map(players => (players.player.email)).join(", ") + "</li>";
  });
}

/*********************************************************
 ** Imprime la tabla de posiciones
 ** Trabaja sobre leaderboardJson
 *********************************************************/
function populateLeaderboardTable() {
  // Ordeno el json dependiendo del score y los partidos ganados, perdidos o empatados
  leaderboardJson = leaderboardSorted(leaderboardJson);
  // imprimo
  leaderboardJson.forEach(player => {
    leaderboardTable.innerHTML += "<tr><th>" + player.playerName + "</th><td>" + player.score + "</td><td>" +
      player.won + "</td><td>" + player.lost + "</td><td>" + player.tied + "</td></tr>"
  });
}

/*********************************************************
 ** Calcula los datos de los partidos
 ** Trabaja sobre gameJson y leaderboardJson
 *********************************************************/
function calculateGames() {
  // Recorro los juegos
  gameJson.forEach(game => {
    // recorro los gameplayers
    game.gamePlayers.forEach(gamePlayer => {
      let playerId = gamePlayer.player.playerId;
      let index, won = 0,
        lost = 0,
        tied = 0;
      // me fijo si ganó, empató o perdió
      switch (gamePlayer.score) {
        case 1:
          won = 1;
          break;
        case 0.5:
          tied = 1;
          break;
        case 0:
          lost = 1;
      }
      // Si el jugador ya existe en el array, actualizo los datos, si no existe lo creo
      if ((index = leaderboardJson.findIndex(player => player.playerId === playerId)) !== -1) {
        leaderboardJson[index].score += gamePlayer.score;
        leaderboardJson[index].won += won;
        leaderboardJson[index].lost += lost;
        leaderboardJson[index].tied += tied;
      } else {
        leaderboardJson.push({
          playerId: gamePlayer.player.playerId,
          playerName: gamePlayer.player.email,
          score: gamePlayer.score,
          won: won,
          lost: lost,
          tied: tied
        });
      }
    });
  });
}

/*********************************************************
 ** Ordena la tabla por 1 - mayor puntaje, 2 - más ganados,
 ** 3 - menos perdidos, 4 - menos empatados
 *********************************************************/
function leaderboardSorted(leaderboard) {
  return leaderboard.sort(function (playerA, playerB) {
    if (playerA.score !== playerB.score) {
      return playerB.score - playerA.score;
    }
    if (playerA.won !== playerB.won) {
      return playerB.won - playerA.won;
    }
    if (playerA.lost !== playerB.lost) {
      return playerA.lost - playerB.lost;
    }
    return playerA.tied - playerB.tied;
  });
}