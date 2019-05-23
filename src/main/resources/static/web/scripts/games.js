let gameJson;

//  ------------ Solo si estoy en las página games-list ------------------------
if (document.getElementById("game-list")) {
  var gameList = document.getElementById("game-list");
  // Defino header
  var url = '/api/games';
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
    console.log(myJson); //
    populateGameList(myJson);
  }).catch(function (error) {
    // called when an error occurs anywhere in the chain
    console.log("Request failed: " + error.message);
  });
}

function populateGameList(myJson) {
  myJson.map(function (game) {
    var gameDate = new Date(game.created);
    gameList.innerHTML += "<li>GAME ID: " + game.gameId + " - CREATED: " + gameDate.toLocaleString() +
      " - PLAYERS: " + game.gamePlayers.map(players => (players.player.email)).join(", ") + "</li>";
  });
}
