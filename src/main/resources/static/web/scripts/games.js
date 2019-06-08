// Declaración de variables
// Defino header
var url = '/api/games';
var init = {
	headers: {
		'Content-Type': 'application/json',
	}
};
// contiene los datos enviados por el Backend
let gameJson, playerJson;
// contiene los datos calculados de los partidos en un array de jugadores
let leaderboardJson = [];

var gameList = document.getElementById("game-list");
var leaderboardTable = document.getElementById("leaderboard-table-data");
var reloadBody = document.getElementById("reload-body");
var mainBody = document.getElementById("main-body");
var logInSignUpPanel = document.getElementById("login-signup-panel");
var logOutPanel = document.getElementById("logout-panel");
var logInForm = document.getElementById("login-form");
var signUpForm = document.getElementById("signup-form");
var logInEmail = document.getElementById("input-login-email");
var logInPassword = document.getElementById("input-login-password");
var signUpEmail = document.getElementById("input-signup-email");
var signUpPassword = document.getElementById("input-signup-password");
var checkShowLogInPassword = document.getElementById("show-login-password");
var checkShowSignUpPassword = document.getElementById("show-signup-password");
var logInError = document.getElementById("login-error");
var signUpError = document.getElementById("signup-error");
var playerName = document.getElementById("player-name");
var createGameButton = document.getElementById("create-game-button");


// Traigo los datos del backend, calcula leaderboard e imprime el html
fetchFunction(url, init).then(function (myJson) {
	calculateGames();
	htmlRender();
}).catch(function (error) {
	// called when an error occurs anywhere in the chain
	console.log("Request failed: " + error.message);
});


// Funciones
/*********************************************************
 ** Trae los datos del backend, crea gameJson, playerJson, 
 *********************************************************/
function fetchFunction(url, init) {
	return fetch(url, init).then(function (response) {
		if (response.ok) {
			return response.json();
		}
		// signal a server error to the chain
		throw new Error(response.statusText);
	}).then(function (myJson) {
		// do something with the JSON
		gameJson = myJson.games;
		playerJson = myJson.player;
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
	leaderboardTable.innerHTML = "";
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
			} else if (won || lost || tied) {
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

/*********************************************************
 ** Imprime los datos de las lista de juegos
 ** recibe el json
 *********************************************************/
function populateGameList(myJson) {
	gameList.innerHTML = "";
	myJson.forEach(game => {
		let gameDate = new Date(game.created);
		let playersEmail = game.gamePlayers.map(gamePlayer => (gamePlayer.player.email));
		// Variable que indica si un juego tiene un gameplayer perteneciente al jugador actual
		let playersGamePlayer = null;
		// defino el html de la lista sin <li></li>
		let gameHTML = "GAME ID:" + game.gameId + " - CREATED: " + gameDate.toLocaleString() +
			" - PLAYERS: " + playersEmail.join(", ");

		// Para agregar links a los juegos, el jugador debe estar logueado
		// Para agregar el botón de unirse, el jugador debe estar logueado
		if (playerJson) {
			// Reviso si el juego pertenece al jugador y con que gameplayer id
			game.gamePlayers.forEach(gamePlayer => {
				if (gamePlayer.player.playerId === playerJson.playerId) {
					playersGamePlayer = gamePlayer.gamePlayerId;
				}
			});
			// Si pertenece, agrego el link para unirse al gameplayer
			if (playersGamePlayer) {
				gameHTML = "<a href='game.html?gp=" + playersGamePlayer + "' class='join-game-link'>" + gameHTML + "</a>";
			}
			// Si el juego no esta lleno y no el jugador aún no participa, agrego el botón de join
			if (game.gamePlayers.length < 2 && !playersGamePlayer) {
				gameHTML += "<button onclick='joinAGame(" + game.gameId + ")' class='join-game-button'>Join Game -></button>";
			}
		}
		// Agrego la lista al html con <li></li>
		gameList.innerHTML += "<li class='list-group-item'>" + gameHTML + "</li>";
	});
}

/*********************************************************
 ** Chequea los campos ingresados en log in y sign up
 ** devuelve un mensaje con el error o nada si no hubiera errores
 *********************************************************/
function checkPlayerFields(email, password) {
	let errorMessage = "";

	if (email.length < 3) {
		errorMessage = "Enter a valid email!";
	} else if (email.indexOf(" ") !== -1) {
		errorMessage = "Email must not have spaces!";
	} else if (email.indexOf("@") === -1) {
		errorMessage = "Email must have @!";
	} else if (password.indexOf(" ") !== -1) {
		errorMessage = "Password must not have spaces!";
	} else if (password.length === 0) {
		errorMessage = "Password is required!";
	}

	return errorMessage;
}

/*********************************************************
 ** Función de log in
 *********************************************************/
function playerLogIn() {
	let emailValue = logInEmail.value.trim();
	let passwordValue = logInPassword.value.trim();
	let fieldWithError;

	// Chequeo los campos
	if (fieldWithError = checkPlayerFields(emailValue, passwordValue)) {
		logInError.innerHTML = fieldWithError;
	} else {
		$.post("/api/login", {
				username: emailValue,
				password: passwordValue
			})
			.done(function () {
				// recargo los datos e imprimo el html
				fetchFunction(url, init).then(function () {
					htmlRender();
				}).catch(function (error) {
					// called when an error occurs anywhere in the chain
					console.log("Request failed: " + error.message);
				});
				console.log("logged in!");
			})
			.fail(function (xhr) {
				logInError.innerHTML = "Login has failed";
				console.log(xhr);
			})
	}
	eraseFields();
}

/*********************************************************
 ** Función de sign up
 *********************************************************/
function playerSignUp() {
	let emailValue = signUpEmail.value.trim();
	let passwordValue = signUpPassword.value.trim();
	let fieldWithError;

	// Chequeo los campos
	if (fieldWithError = checkPlayerFields(emailValue, passwordValue)) {
		signUpError.innerHTML = fieldWithError;
	} else {
		$.post("/api/players", {
				username: emailValue,
				password: passwordValue
			})
			.done(function () {
				console.log("Sign up!");
				$.post("/api/login", {
						username: emailValue,
						password: passwordValue
					})
					.done(function () {
						// recargo los datos e imprimo el html
						fetchFunction(url, init).then(function () {
							htmlRender();
						}).catch(function (error) {
							// called when an error occurs anywhere in the chain
							console.log("Request failed: " + error.message);
						});
						console.log("logged in!");
					})
			})
			.fail(function (xhr) {
				signUpError.innerHTML = xhr.responseJSON.error;
				console.log(xhr);
			})
	}
	eraseFields();
}

/*********************************************************
 ** Función de log out
 *********************************************************/
function playerSignOut() {
	$.post("/api/logout")
		.done(function () {
			// recargo los datos e imprimo el html
			fetchFunction(url, init).then(function () {
				htmlRender();
			}).catch(function (error) {
				// called when an error occurs anywhere in the chain
				console.log("Request failed: " + error.message);
			});
			console.log("logged out");
		})
}

/*********************************************************
 ** Función de borra los campos de log in y log out
 *********************************************************/
function eraseFields() {
	signUpEmail.value = "";
	signUpPassword.value = "";
	logInEmail.value = "";
	logInPassword.value = "";
	logInForm.style.display = "none";
	signUpForm.style.display = "none";
}

/*********************************************************
 ** Función que crea un juego nuevo
 *********************************************************/
function createNewGame() {
	$.post("/api/games")
		.done(function (response) {
			console.log("Game created (ID = " + response.gamePlayerId + ")");
			window.location.href = "/web/game.html?gp=" + response.gamePlayerId;
		})
		.fail(function (xhr) {
			console.log(xhr);
			alert(xhr.responseJSON.unauthorized);
		})
}

/*********************************************************
 ** Función que une un jugador con un juego existente
 ** Recibe el ID del juego al que debe unirse
 *********************************************************/
function joinAGame(gameId) {
	$.post("/api/games/" + gameId + "/players")
		.done(function (response) {
			window.location.href = "/web/game.html?gp=" + response.gamePlayerId;
		})
		.fail(function (xhr) {
			alert(xhr.responseJSON.forbidden);
			console.log(xhr);
		})
}

/*********************************************************
 ** DOM Functions
 *********************************************************/
// muestra u oculta el panel de log in
function showHideLogIn() {
	if (logInForm.style.display != "block") {
		logInForm.style.display = "block";
		signUpForm.style.display = "none";
	} else {
		logInForm.style.display = "none";
	}
}

// muestra u oculta el panel de sign up
function showHideSignUp() {
	if (signUpForm.style.display != "block") {
		signUpForm.style.display = "block";
		logInForm.style.display = "none";
	} else {
		signUpForm.style.display = "none";
	}
}

// muestra u oculta los caracteres del password para log in
function showLogInPassword() {
	if (checkShowLogInPassword.checked) {
		logInPassword.type = "string";
	} else {
		logInPassword.type = "password";
	}
}

// muestra u oculta los caracteres del password para sign up
function showSignUpPassword() {
	if (checkShowSignUpPassword.checked) {
		signUpPassword.type = "string";
	} else {
		signUpPassword.type = "password";
	}
}

/*********************************************************
 ** Render Functions
 *********************************************************/
function htmlRender() {
	// si el jugador está logueado muestra botón de log out, sino log in y sign up
	if (playerJson) {
		logInSignUpPanel.style.display = "none";
		logOutPanel.style.display = "block";
		playerName.innerHTML = 'Hello <strong>' + playerJson.email + '</strong>';
		createGameButton.innerHTML = '<button onclick="createNewGame()" class="create-game-button">New game</button>';
	} else if (logInSignUpPanel.style.display == "none") {
		logOutPanel.style.display = "none";
		logInSignUpPanel.style.display = "block";
		createGameButton.innerHTML = "";
	}
	// armo la tabla de posiciones
	populateLeaderboardTable();
	// armo la lista de juegos
	populateGameList(gameJson);
	// saco el icono de cargando
	reloadBody.style.display = "none";
	reloadBody.innerHTML = "";
	// muestro la página una vez que está todo en su lugar ;)
	mainBody.style.visibility = "visible";
}