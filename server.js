// Dependencies
var express = require('express');
var http = require('http');
//var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = require('socket.io').listen(server);

var port = process.env.PORT || 5000;
//app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));

// Routing
//app.get('/', function(request, response) {
  //response.sendFile(path.join(__dirname+"/static/", 'index.html'));
//});

// Starts the server.
server.listen(port, function() {
//server.listen(5000, function() {
  console.log('Starting server');
});


var players = [];
var partidas = {};
var estadoPartidas = {};
var deckOfCards = [];

/** Gestion de interfaz de usuario **/

//Establecemos un tiempo de que cada X borre todas las partidas vacias (50min y cambiara a 5min)
setInterval(function(){
	console.log("Borrando partidas vacias");
	for (var id in partidas) {
		if (partidas[id].gamePlayers.length == 0) {
			console.log("Partida con id "+ id+" borrada");
			delete partidas[id];
			delete estadoPartidas[id];
		}
	}
}, 6000000);

io.on('connection', function(socket) {
	console.log("Nuevo cliente conectado. Id: "+socket.id);
	players.push(socket.id);
	//Parche-parchazo. El cliente se bloquea si mando mensajes justo cuando la conexion esta
	//establecida/estableciendose -> preguntar a Jose
	setTimeout(function(){
		//console.log("setTimeout working");
		socket.emit('Connection OK', {player_id: socket.id});
	}, 1000);
	//

	socket.on('create_game', function(data) {
		console.log("Server: create game");
		//Comprobar que no estas dentro de alguna partida o has creado alguna partida
		var enPartida = false;
		for (var id in partidas) {
			for (var i = 0; i < partidas[id].gamePlayers.length; i++) {
				if (partidas[id].gamePlayers[i] == data.creador) {
					enPartida = true;
				}
			}
		}
		if (enPartida == true) {
			socket.emit('create_game-KO');
		} else {
			var strAleat = Math.round(Math.random()*1000).toString();
			var creador = data.creador;
			var idPartida = creador+"---"+strAleat;
			var gameName = data.gameName;
			var gamePlayers = [];
			gamePlayers.push(creador);
			var gameNumPlayers = data.gameNumPlayers;
			//console.log("idPartida: "+idPartida);
			//console.log("gameName: "+gameName);
			//console.log("gamePlayers: "+gamePlayers);
			//console.log("gameNumPlayers: "+gameNumPlayers);
			partidas[idPartida] = {idPartida: idPartida, gameName: gameName, 
				gameNumPlayers: gameNumPlayers, gamePlayers: gamePlayers, estado: "Esperando"};
			socket.emit('create_game-OK', {idPartida: idPartida});
		}
	});

	socket.on('join_game', function(data) {
		console.log("Socketid-join_game: "+socket.id);
		//El jugador no esta en ninguna partida
		var enPartida = false;
		for (var id in partidas) {
			for (var i = 0; i < partidas[id].gamePlayers.length; i++) {
				if (partidas[id].gamePlayers[i] == socket.id) {
					enPartida = true;
				}
			}
		}

		//Si la partida ya no existe
		if (partidas[data.idPartida] != undefined) {
			//Si estoy en partida o la sala esta llena-> puede ocurrir si hay peticiones simultaneas
			if ((enPartida == true) ||
				(partidas[data.idPartida].gamePlayers.length >= partidas[data.idPartida].gameNumPlayers)) {
				console.log("El jugador esta en partida o la sala ya esta llena");
				socket.emit('join_game-KO');
			} else {
				console.log("Jugador "+socket.id+" se ha unido a la partida "+data.idPartida);
				partidas[data.idPartida].gamePlayers.push(socket.id);
				socket.emit('join_game-OK');
				//Si la sala esta completa empezamos la partida
				if (partidas[data.idPartida].gamePlayers.length == partidas[data.idPartida].gameNumPlayers) {
					console.log("Partida "+data.idPartida+" va comenzar con los siguientes jugadores:");
					for (var i = 0; i < partidas[data.idPartida].gamePlayers.length; i++) {
						console.log((i+1)+".- "+partidas[data.idPartida].gamePlayers[i]);
					}
					prepararPartida(data.idPartida);
				} else {
					console.log("Partida "+data.idPartida+" todavia esperando jugadores. (Faltan "+
						(partidas[data.idPartida].gameNumPlayers - partidas[data.idPartida].gamePlayers.length)
					);
				}
			}
		} else {
			console.log("La partida que se ha intentado unir ya no existe");
			socket.emit('join_game-KO');
		}
	});

	socket.on('leave_game', function(data) {
		//El jugador esta en la partida que quiere abandonar
		console.log("Socketid-leave_game: "+socket.id);
		var enPartida = false;
		for (var i = 0; i < partidas[data.idPartida].gamePlayers.length; i++) {
			if (partidas[data.idPartida].gamePlayers[i] == socket.id) {
				enPartida = true;
			}
		}
		if (enPartida == true) {
			var index = partidas[data.idPartida].gamePlayers.indexOf(socket.id);
			if (index > -1) {
				partidas[data.idPartida].gamePlayers.splice(index, 1);
				console.log("Jugador "+socket.id+" ha abandonado la partida "+data.idPartida);
				socket.emit('leave_game-OK');
			} else {
				console.log("Problema al eliminar jugador de partida");
				socket.emit('leave_game-KO');
			}
		} else {
			console.log("El jugador no esta dentro de la partida que quiere abandonar");
			socket.emit('leave_game-KO');
		}
	});

	socket.on('actualizar_partidas', function() {
		console.log("Server: actualizar_partidas");
		//for (var id in partidas) {
		//	console.log("actualizar_partidas. Partidas: "+partidas[id].idPartida);
		//}
		socket.emit('actualizar_partidas', partidas);
	});

	/** -------------------- **/

	socket.on('siguienteTurnoSrv', function(datos_partida){
		var idPartida = datos_partida.idPartida;
		var jugadores = datos_partida.jugadores;
		var turno =  datos_partida.turno;
		var deckOfCardsPartida = datos_partida.deckOfCardsPartida;
		var organosJugadoresCli = datos_partida.organosJugadoresCli;
		var movJugador = datos_partida.movJugador;

		//Comprobacion si la baraja de cartas se esta manejando bien
		//console.log("Baraja de la partida-cartas: "+deckOfCardsPartida.length);
		if (deckOfCardsPartida.length == 0){
			//Copia por valor y no por referencia ojo
			//Trampa. En realidad usamos una baraja nueva sin tener en cuenta las cartas usadas o las 
			//que hay todavia en la mano
			console.log("Recogiendo cartas usadas. Barajeando de nuevo");
			deckOfCardsPartida = shuffle(deckOfCards.slice());
		}

		//Avanzamos turno
		var index = jugadores.indexOf(turno);
		if (index < (jugadores.length -1)) {
			index++;
		} else {
			index = 0;
		}
		console.log("Turno de: "+index+".- "+jugadores[index]);

		var newDatos_partida = {
			idPartida: idPartida,
			jugadores: jugadores,
			turno: jugadores[index],
			deckOfCardsPartida: deckOfCardsPartida,
			organosJugadoresCli: organosJugadoresCli,
			movJugador: movJugador
		};
		estadoPartidas[idPartida] = newDatos_partida;

		//Enviamos la jugada a todos los participantes
		//En un futuro usar rooms para los mensajes de broadcast. De momento lo hacemos a mano
		var socket = "";
		for (var i = 0; i < partidas[idPartida].gamePlayers.length; i++){
			socketid = partidas[idPartida].gamePlayers[i];

			io.to(socketid).emit('siguienteTurnoCli', newDatos_partida);
		}
	});

	socket.on('terminarPartida', function(data){
		var socket = "";
		var idPartida = data.idPartida;
		for (var i = 0; i < partidas[idPartida].gamePlayers.length; i++){
			socketid = partidas[idPartida].gamePlayers[i];
			io.to(socketid).emit('terminarPartida', data);
		}
		partidas[idPartida].gamePlayers = [];
		partidas[idPartida].estado = "terminada";
	});

	socket.on('checkMatchRunning', function(data){
		console.log("Server: checkMatchRunning");
		var idPartida = data.idPartida;
		var usuario = data.usuario; 
		var usuarioAntiguo = data.usuarioAntiguo;
		var socketid = usuario;

		if (partidas[idPartida] != null) {
			for (var i = 0; i < partidas[idPartida].gamePlayers.length; i++){
				//Si el usuario no ha cambiado sera el propio cliente el que gestione el reenganche
				//cuando le llegue informacion a los sockets
				if (usuarioAntiguo == partidas[idPartida].gamePlayers[i]) {
					//Normalmente esta sera la opcion que ocurra
					console.log("Usuario reenganchado y cambio de idUsuario");
					partidas[idPartida].gamePlayers[i] = usuario;
					//Si es el turno del jugador reenganchado el servidor le envia el estado
					//if (estadoPartidas[idPartida].turno == usuario){
					//	var datos_partida = estadoPartidas[idPartida];
					//	socket.emit('siguienteTurnoCli', datos_partida);
					//}
				} else if (usuario == partidas[idPartida].gamePlayers[i]) {
					//Si es el turno del jugador reenganchado el servidor le envia el estado
					if (estadoPartidas[idPartida].turno == usuario){
						var datos_partida = estadoPartidas[idPartida];
						//socket.emit('siguienteTurnoCli', datos_partida);
					}
					console.log("Jugador reenganchado");
				} else {
					socket.emit('ckeckMatchRunningKO');
				}
			}
		}
	})
});

/** Gestion de cada partida **/
function prepararPartida(idPartida) {
	console.log("Server: prepararPartida()");
	partidas[idPartida].estado = "encurso";

	//Preparar partida
	var jugadores = shuffle(partidas[idPartida].gamePlayers);
	//Copia por valor y no por referencia ojo
	var deckOfCardsPartida = shuffle(deckOfCards.slice());

	//En un futuro usar rooms para los mensajes de broadcast. De momento lo hacemos a mano
	var socket = "";
	for (var i = 0; i < partidas[idPartida].gamePlayers.length; i++){
		socketid = partidas[idPartida].gamePlayers[i];

		var carta1 = takeCard(deckOfCardsPartida);
		var carta2 = takeCard(deckOfCardsPartida);
		var carta3 = takeCard(deckOfCardsPartida);

		var datos_iniciales = {
			idPartida: idPartida,
			jugadores: jugadores,
			carta1: carta1,
			carta2: carta2,
			carta3: carta3
		};
		io.to(socketid).emit('prepararPartida', datos_iniciales);
	}

	//Iniciamos los turnos
	console.log("Server: iniciar turnos");
	var newDatos_partida = {
		idPartida: idPartida,
		jugadores: jugadores,
		turno: jugadores[0],
		deckOfCardsPartida: deckOfCardsPartida,
		organosJugadoresCli: undefined,
		movJugador: ""
	}
	estadoPartidas[idPartida] = newDatos_partida;

	for (var i = 0; i < partidas[idPartida].gamePlayers.length; i++){
		socketid = partidas[idPartida].gamePlayers[i];
		io.to(socketid).emit('siguienteTurnoCli', newDatos_partida);
	}
}

function takeCard(deckOfCardsPartida){
    if (deckOfCardsPartida.length != 0){
    	var drawedCard = deckOfCardsPartida.shift();
    	//console.log(drawedCard.toString());
    	return drawedCard;
    } else {
    	console.log("No quedan cartas en el mazo");
        return null;
    }
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}
/** -------------------- **/


/** Arrancando servidor **/
var cardType = {organo: 'organo', virus: 'virus', medicina:'medicina', tratamiento: 'tratamiento'}
function card (cardType, organType, picture){
	this.cardType = cardType;
	this.organType = organType;
	this.picture = picture;
}

card.prototype.toString = function () {
	var value = "";
	value += "Carta: "+this.cardType+" "+this.organType;
	return value;
}

function initDeckOfCards(){
	for (var i = 0; i < 5; i++) {
		deckOfCards.push(new card(cardType.organo, 'hueso', 'img/orgaImages/organoHuesoSF.png'));
		deckOfCards.push(new card(cardType.organo, 'corazon', 'img/orgaImages/organoCorazonSF.png'));
		deckOfCards.push(new card(cardType.organo, 'higado', 'img/orgaImages/organoHigadoSF.png'));
		deckOfCards.push(new card(cardType.organo, 'cerebro', 'img/orgaImages/organoCerebroSF.png'));
	}
	for (var i = 0; i < 5; i++) {
		deckOfCards.push(new card(cardType.medicina, 'hueso', 'img/medImages/medHuesoSF.png'));
		deckOfCards.push(new card(cardType.medicina, 'corazon', 'img/medImages/medCorazonSF.png'));
		deckOfCards.push(new card(cardType.medicina, 'higado', 'img/medImages/medHigadoSF.png'));
		deckOfCards.push(new card(cardType.medicina, 'cerebro', 'img/medImages/medCerebroSF.png'));
	}
	for (var i = 0; i < 4; i++) {
		deckOfCards.push(new card(cardType.virus, 'hueso', 'img/virusImages/virusHuesoSF.png'));
		deckOfCards.push(new card(cardType.virus, 'corazon', 'img/virusImages/virusCorazonSF.png'));
		deckOfCards.push(new card(cardType.virus, 'higado', 'img/virusImages/virusHigadoSF.png'));
		deckOfCards.push(new card(cardType.virus, 'cerebro', 'img/virusImages/virusCerebroSF.png'));
	}
	for (var i = 0; i < 2; i++) {
		deckOfCards.push(new card(cardType.tratamiento, 'error medico', 'img/cardImages/otro.png'));
		deckOfCards.push(new card(cardType.tratamiento, 'guante de latex', 'img/cardImages/otro.png'));
		deckOfCards.push(new card(cardType.tratamiento, 'transplante', 'img/cardImages/otro.png'));
		deckOfCards.push(new card(cardType.tratamiento, 'ladron de organos', 'img/cardImages/otro.png'));
		deckOfCards.push(new card(cardType.tratamiento, 'contagio', 'img/cardImages/otro.png'));
	}
	for (var i = 0; i < 1; i++) {
		deckOfCards.push(new card(cardType.organo, 'comodin', 'img/cardImages/otro.png'));
		deckOfCards.push(new card(cardType.medicina, 'comodin', 'img/medImages/medComodinSF.png'));
		deckOfCards.push(new card(cardType.virus, 'comodin', 'img/cardImages/otro.png'));
	}
}
initDeckOfCards();
/** -------------------- **/