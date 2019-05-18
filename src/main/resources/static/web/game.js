var gameView = document.getElementById("game-list");
  // Defino header
  var url = '/api/games';
  var init = {
    headers: {
      'Content-Type': 'application/json',
    }
  };

  // Traigo los datos
  fetch(url, init).then(function(response) {
    if (response.ok) {
      return response.json();
    }
    // signal a server error to the chain
    throw new Error(response.statusText);
  }).then(function(myJson) {
    // do something with the JSON
    console.log(myJson);   //
    populateGameList(myJson);
  }).catch(function(error) {
    // called when an error occurs anywhere in the chain
    console.log( "Request failed: " + error.message );
  });