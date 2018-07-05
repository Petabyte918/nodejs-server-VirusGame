// Dependencies
var express = require('express');
var http = require('http');
var https = require('https');
var fs = require('fs');
var socketIO = require('socket.io');
var mongodb = require("mongodb");
var CryptoJS = require("crypto-js");


var app = express();

/**var options = {
  key: fs.readFileSync('./cert/key.pem'),
  cert: fs.readFileSync('./cert/cert.pem'),
  requestCert: true
};


var server = https.createServer(options, app);**/
var server = http.Server(app);
var io = require('socket.io').listen(server);

/** Express Sirviendo **/

/** BEGIN MONGO DATABASE **/
var USERS_COLLECTION = "users";

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

//Connect to the database before starting the application server
var uri = "mongodb://heroku_5bwn5gbw:ur29uejlq3o50oeldbogs3oguc@ds259085.mlab.com:59085/heroku_5bwn5gbw";
mongodb.MongoClient.connect(uri, function (err, database) {
	if (err) {
		console.log(err);
		process.exit(1);
	}

	//Save database object from the callback for reuse.
	db = database;
	console.log("-----------------------------------");
	console.log("Database connection ready");

	//Nuevo arranque del servidor
  	/**var server = app.listen(process.env.PORT || 8080, function () {
    	var port = server.address().port;
    	console.log('Starting server');
    	console.log("App now running on port", port);
  	});**/

  	//Antiguo arranque servidor
	var port = process.env.PORT || 8080;

	// Starts the server.
	server.listen(port, function() {
	//server.listen(5000, function() {
	  console.log('Starting server');
	  console.log("App now running on port", port);
	  console.log("-----------------------------------");
	});

});

/** EXPRESS **/
//Por defecto redirigimos el / path a index.html automaticamente
var verbose = true;
app.get('/', function(req, res) {
    var file = req.params[0]; 

    //For debugging, we can track what files are requested.
    if(verbose) {
    console.log('\t :: Express :: file requested (index) : ' + file);
    }
    //Send the requesting client the file.
	res.sendFile(__dirname+'/public/index.html');
});

app.get( '/*' , function( req, res, next ) {
    //Este es el archivo que se ha pedido
    var file = req.params[0]; 

    //For debugging, we can track what files are requested.
    if(verbose) {
    	console.log('\t :: Express :: file requested (others) : ' + file);
    }

    //Send the requesting client the file.
    res.sendFile( __dirname + '/public/' + file );
});

/** semiRESTful API server with Nose.js **/

/**
EndPoints we need:

/api/users
Method	Description
GET 	Find all users
POST 	Create a new user

/api/users/:id
Method	Description
GET 	Find a single user by ID
PUT 	Update entire user document
DELETE 	Delete a user by ID
**/

// Generic error handler used by all endpoints.
function handleError(reason, message) {
	console.log("ERROR: "+reason);
	console.log("Error-message: "+message);
}

/**
 *	"/api/users"
 *    GET: finds all users
 *    POST: creates a new user
**/

function getUsers_DB() {
	db.collection(USERS_COLLECTION).find({}).toArray(function(err, doc) {
	    if (err) {
	      	handleError(err.message, "Failed to get users.");
	      	return "";
	    } else {
	    	//Doc es un array de los diferentes usuarios y sus diferentes campos
		    /**for (var i in doc) {
		    	for (var elem in doc[i]){
	    			console.log("Users got: doc[i]-elements-> "+doc[i]+"-"+elem);
	    		}
	    	}**/
	    	return doc;
	    }
  	});
}

function postUser_DB(user) {
	var newUser = user;
	db.collection(USERS_COLLECTION).insertOne(newUser, function(err, doc) {
	    if (err) {
	        handleError(err.message, "Failed to create new user");
	    } else {
	    	//Doc contiene: result, connection, message, ops, insertedCount
	    	//				insertedId, toJSON, toString
	    	/**for (var elem in doc) {
	    		console.log("User Added: "+elem);
			}**/
			console.log("User Added: "+doc.message);
	    }
	});
}

/**  
 *	"/api/users/:id"
 *    GET: find user by id
 *    PUT: update user by id
 *    DELETE: deletes user by id
 **/

function getUser_DB(id) {
	db.collection(USERS_COLLECTION).findOne({ _id: id}, function(err, doc) {
	    if (err) {
	        handleError(err.message, "Failed to get a specific user");
	    } else {
	    	for (var elem in doc) {
	    		console.log("User got: "+elem);
	    	}
	    }
	});
}

function putUser_DB(id, user) {
    db.collection(USERS_COLLECTION).updateOne({_id: id}, user, function(err, doc) {
	    if (err) {
	        handleError(err.message, "Failed to update contact");
	    } else {
	    	for (var elem in doc) {
	    		console.log("User update: "+elem);
	    	}
	    }
  	});
}

function deleteUser_DB(id) {
	db.collection(USERS_COLLECTION).deleteOne({_id: id}, function(err, doc) {
	    if (err) {
	        handleError(err.message, "Failed to delete user");
	    } else {
	    	for (var elem in doc) {
	    		console.log("User delete: "+elem);
	    	}
	    }
	});
}

/** END MONGO DATABASE **/


/** Gestion de interfaz de usuario **/
var playersSrv = {};
var partidas = {};
var estadoPartidas = {};
var deckOfCards = [];

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
	var date = new Date();
	playersSrv[socket.id] = {
		nombre: socket.id.slice(0,8),
		fecha_primeraConexion: date,
		fecha_ultimaPartida: date,
		socketid: socket.id
	};
	//Parche-parchazo. El cliente se bloquea si mando mensajes justo cuando la conexion esta
	//establecida/estableciendose -> preguntar a Jose
	setTimeout(function(){
		//console.log("setTimeout working");
		socket.emit('Connection OK', {player_id: socket.id});
	}, 1000);
	//

	socket.on('create_game', function(data) {
		console.log("Server - create game->creador: "+data.creador);
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
			partidas[idPartida] = {
				idPartida: idPartida, 
				gameName: gameName, 
				gameNumPlayers: gameNumPlayers,
				gamePlayers: gamePlayers, 
				estado: "esperando"};
			socket.emit('create_game-OK', {idPartida: idPartida});
			//Mandamos un aviso a todos los jugadores para que actualicen su lista de partidas
			//y el juego rapido
			socket.broadcast.emit('new_game_available');
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

		var idPartida = data.idPartida;
		//Si activo el flag random entro en una partida al azar..o la mas llena
		if (data.random == "true") {
			console.log("Join game - partida rapida");
			var mejorDif = 9999;
			var dif = 0;
			for (var id in partidas) {
				if (partidas[id].estado == "esperando") {
					dif = partidas[id].gameNumPlayers - partidas[id].gamePlayers.length;
					if (dif < mejorDif) {
						mejorDif = dif;
						idPartida = id;
					}
				}
			}
		}

		//Si la partida ya no existe
		if (partidas[idPartida] != undefined) {
			//Si estoy en partida o la sala esta llena-> puede ocurrir si hay peticiones simultaneas
			if ((enPartida == true) ||
				(partidas[idPartida].gamePlayers.length >= partidas[idPartida].gameNumPlayers)) {
				console.log("El jugador esta en partida o la sala ya esta llena");
				socket.emit('join_game-KO');
			} else {
				console.log("Jugador "+socket.id+" se ha unido a la partida "+idPartida);
				partidas[idPartida].gamePlayers.push(socket.id);
				socket.emit('join_game-OK', {idPartida: idPartida});
				//Mandamos un aviso a todos los jugadores para que actualicen su lista de partidas
				//y el juego rapido
				socket.broadcast.emit('new_player_joined');
				//Si la sala esta completa empezamos la partida
				if (partidas[idPartida].gamePlayers.length == partidas[idPartida].gameNumPlayers) {
					console.log("Partida "+idPartida+" va comenzar con los siguientes jugadores:");
					for (var i = 0; i < partidas[idPartida].gamePlayers.length; i++) {
						console.log((i+1)+".- "+partidas[idPartida].gamePlayers[i]);
					}
					prepararPartida(idPartida);
				} else {
					console.log("Partida "+idPartida+" todavia esperando jugadores. (Faltan "+
						(partidas[idPartida].gameNumPlayers - partidas[idPartida].gamePlayers.length)
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
				//Mandamos un aviso a todos los jugadores para que actualicen su lista de partidas
				//y el juego rapido
				io.sockets.emit('player_leaved');
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

	socket.on('siguienteTurnoSrv', function(datos_partida) {
		var idPartida = datos_partida.idPartida;


		var jugadores = datos_partida.jugadores;
		var infoJugadores = datos_partida.infoJugadores;
		var turno =  datos_partida.turno;
		var numTurno = datos_partida.numTurno + 1;
		var deckOfCardsPartida = datos_partida.deckOfCardsPartida;
		var organosJugadoresCli = datos_partida.organosJugadoresCli;
		var movJugador = datos_partida.movJugador;

		//Si la partida no existe no retransmito nada
		if (isEmpty(partidas[idPartida])) {
			console.log("SiguienteTurnoSrv: Partida no existe");
			return;
		}

		//Si el jugador no esta en partida no retransmito nada
		if (isEmpty(infoJugadores[socket.id])) {
			console.log("SiguienteTurnoSrv: Jugador no esta en la partida");
			console.log("socket.id: "+socket.id);
			printObject(jugadores, 0);
			return;
		}

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
		//console.log("Turno de: "+index+".- "+jugadores[index]);

		var newDatos_partida = {
			idPartida: idPartida,
			jugadores: jugadores,
			infoJugadores: infoJugadores,
			turno: jugadores[index],
			numTurno: numTurno,
			deckOfCardsPartida: deckOfCardsPartida,
			organosJugadoresCli: organosJugadoresCli,
			movJugador: movJugador
		};
		estadoPartidas[idPartida] = newDatos_partida;

		//Enviamos la jugada a todos los participantes
		var socketid = "";
		//Por si llegan mensajes retrasados y la partida ya ha sido eliminada
		if (partidas[idPartida] != undefined) {
			for (var i = 0; i < partidas[idPartida].gamePlayers.length; i++){
				socketid = partidas[idPartida].gamePlayers[i];

				io.to(socketid).emit('siguienteTurnoCli', newDatos_partida);
			}
		}
	});

	socket.on('tiempo_agotado', function(data) {
		console.log("Tiempo agotado en partida");
		//Procesamos el turno perdido
		var idPartida = data.idPartida;
		var numTurno = data.numTurno;
		var turno = data.turno;
		var infoJugadores = data.infoJugadores;

		//Si la partida no existe no retransmito nada
		if (isEmpty(partidas[idPartida])) {
			console.log("Tiempo_agotado: Partida no existe");
			return;
		}

		//Si el jugador no esta en partida no retransmito nada
		if (isEmpty(estadoPartidas[idPartida].infoJugadores[socket.id])) {
			console.log("Tiempo agotado: Jugador no esta en la partida");
			return;
		}

		//Evitamos que lleguen replicas muy retrasadas - ya se le ha eliminado
		if (isEmpty(estadoPartidas[idPartida].infoJugadores[turno])) {
			console.log("Replicas muy retrasadas - ya se le ha eliminado de tiempo agotado en numTurno: "+numTurno);
			return;
		}

		//Evitamos que lleguen replicas de la misma peticion
		if (estadoPartidas[idPartida].infoJugadores[turno].turnoPerdida >= numTurno) {
			console.log("Replicas de la misma peticion de tiempo agotado en numTurno: "+numTurno);
			return;
		}

		//Actualizamos el mov del jugador
		estadoPartidas[idPartida].movJugador.jugOrigen = turno;
		estadoPartidas[idPartida].movJugador.jugDestino = "";
		estadoPartidas[idPartida].movJugador.texto = "El jugador "+turno+" ha perdido el turno.";
		estadoPartidas[idPartida].movJugador.tipoMov = "tiempo_agotado";
		estadoPartidas[idPartida].movJugador.tipoOrgano = "";
		estadoPartidas[idPartida].movJugador.cartasUsadas = [];		

		//Avanzamos turno - tanto si se le va a echar, como si no
		var index = estadoPartidas[idPartida].jugadores.indexOf(turno);
		if (index < (estadoPartidas[idPartida].jugadores.length -1)) {
			index++;
		} else {
			index = 0;
		}
		estadoPartidas[idPartida].turno = estadoPartidas[idPartida].jugadores[index];
		estadoPartidas[idPartida].numTurno++;

		//Actualizamos la informacion del jugador con el turno perdido
		estadoPartidas[idPartida].infoJugadores[turno].turnoPerdida = numTurno;
		estadoPartidas[idPartida].infoJugadores[turno].turnosPerdidos++;	

		//Comprobamos que a un jugador no se le haya pasado el turno X veces, si no se le echa
		for (var idJugador in estadoPartidas[idPartida].infoJugadores) {
			if (estadoPartidas[idPartida].infoJugadores[idJugador].turnosPerdidos >= 
				estadoPartidas[idPartida].infoJugadores[idJugador].limiteTurnosPerdidos) {
				console.log("Se va a echar al jugador "+idJugador+" por haber estado inactivo "+estadoPartidas[idPartida].infoJugadores[idJugador].limiteTurnosPerdidos+" veces");
				
				//Actualizamos el mov del jugador
				estadoPartidas[idPartida].movJugador.jugOrigen = estadoPartidas[idPartida].infoJugadores[idJugador].nombre;
				estadoPartidas[idPartida].movJugador.texto = "Se ha expulsado al jugador "+estadoPartidas[idPartida].infoJugadores[idJugador].nombre+" por perder el turno demasiadas veces.";
				estadoPartidas[idPartida].movJugador.tipoMov = "expulsion";

				//Entorno juego
				//Lo elimino del array y por ende de los turnos (ya no le vuelve a tocar)
				var posJug = estadoPartidas[idPartida].jugadores.indexOf(idJugador);
				if (posJug != -1) { //Ojo, que si ya esta eliminado te cargas otro..y puede haber replicas
					estadoPartidas[idPartida].jugadores.splice(posJug, 1);
				}
				//Lo elimino de infoJugadores
				delete estadoPartidas[idPartida].infoJugadores[idJugador];
				
				//Evita dibujarlo en cliente
				if (!(isEmpty(estadoPartidas[idPartida].organosJugadoresCli))) {
					delete estadoPartidas[idPartida].organosJugadoresCli[idJugador];
				}

				//Entorno servidor
				//Le elimino de partidas
				var posJug = partidas[idPartida].gamePlayers.indexOf(idJugador);
				if (posJug != -1) { //Ojo, que si ya esta eliminado te cargas otro..y puede haber replicas
					partidas[idPartida].gamePlayers.splice(posJug, 1);
					
					//Importante: resta un jugador para que no aparezca de nuevo en lista de partidas
					partidas[idPartida].gameNumPlayers = partidas[idPartida].gameNumPlayers - 1;
					io.to(idJugador).emit('expulsadoPartida');
				}

				//Si no quedan mas jugadores, elimino la partida
				if (partidas[idPartida].gameNumPlayers == 0) {
					console.log("No quedan mas jugadores, partida eliminada");
					delete partidas[idPartida];
					delete estadoPartidas[idPartida];
				}
			}
		}

		//Si la partida todavia existe, retransmito
		if (partidas[idPartida] != undefined) {
			//Retransmito
			var socketid = "";
			for (var i = 0; i < partidas[idPartida].gamePlayers.length; i++) {
				socketid = partidas[idPartida].gamePlayers[i];
				io.to(socketid).emit('siguienteTurnoCli', estadoPartidas[idPartida]);
			}
		}
	})

	socket.on('abandonarPartida', function(datos_partida) {
		var idJugador = socket.id;
		var idPartida = datos_partida.idPartida;
		var turno =  datos_partida.turno;
		console.log("AbandonarPartida-> gameId: "+idPartida+" - socket.id: "+socket.id);

		//Si la partida no existe no retransmito nada
		if (isEmpty(partidas[idPartida])) {
			console.log("AbandonarPartida: Partida no existe");
			return;
		}

		//Si el jugador no esta en partida no retransmito nada
		if (isEmpty(estadoPartidas[idPartida].infoJugadores[idJugador])) {
			console.log("AbandonarPartida: Jugador no esta en la partida");
			return;
		}

		//Describimos el movimiento
		estadoPartidas[idPartida].movJugador = {
			jugOrigen: estadoPartidas[idPartida].infoJugadores[idJugador].nombre,
			jugDestino: "",
			texto: "El jugador "+estadoPartidas[idPartida].infoJugadores[idJugador].nombre+" ha abandonado la partida",
			tipoMov: "abandonarPartida",
			tipoOrgano: "",
			cartasUsadas: []
		}

		//Si estamos en el turno del jugador que abandona, avanzo turno, sino, lo dejo tal cual esta
		if (turno == idJugador) {
			//Avanzamos turno
			var index = estadoPartidas[idPartida].jugadores.indexOf(turno);
			if (index < (estadoPartidas[idPartida].jugadores.length - 1)) {
				index++;
			} else {
				index = 0;
			}
			estadoPartidas[idPartida].turno = estadoPartidas[idPartida].jugadores[index];
			estadoPartidas[idPartida].numTurno++;
		}

		//Entorno juego
		//Lo elimino del array y por ende de los turnos (ya no le vuelve a tocar)
		var posJug = estadoPartidas[idPartida].jugadores.indexOf(idJugador);
		if (posJug != -1) { //Ojo, que si ya esta eliminado te cargas otro..y puede haber replicas
			estadoPartidas[idPartida].jugadores.splice(posJug, 1);
		}

		//Lo elimino de infoJugadores
		delete estadoPartidas[idPartida].infoJugadores[idJugador];

		//Evita dibujarlo en cliente
		if (!(isEmpty(estadoPartidas[idPartida].organosJugadoresCli))) {
			delete estadoPartidas[idPartida].organosJugadoresCli[idJugador];
		}

		//Entorno servidor
		//Le elimino de partidas
		var posJug = partidas[idPartida].gamePlayers.indexOf(idJugador);
		if (posJug != -1) { //Ojo, que si ya esta eliminado te cargas otro..y puede haber replicas
			partidas[idPartida].gamePlayers.splice(posJug, 1);

			partidas[idPartida].gameNumPlayers = partidas[idPartida].gameNumPlayers - 1;
			io.to(idJugador).emit('partidaAbandonadaOK');
		} else {
			console.log("Warning: partida no abandonada");
		}

		//Si no quedan mas jugadores, elimino la partida
		if (partidas[idPartida].gameNumPlayers == 0) {
			console.log("No quedan mas jugadores, partida eliminada");
			delete partidas[idPartida];
			delete estadoPartidas[idPartida];
		}

		//Si la partida todavia existe, retransmito
		if (partidas[idPartida] != undefined) {

			//Retransmito
			var socketid = "";
			for (var i = 0; i < partidas[idPartida].gamePlayers.length; i++) {
				socketid = partidas[idPartida].gamePlayers[i];
				io.to(socketid).emit('siguienteTurnoCli', estadoPartidas[idPartida]);
			}
		}
	})

	socket.on('terminarPartida', function(data){
		var idPartida = data.idPartida;
		console.log("Terminar partida-> gameId: "+idPartida);

		//Si la partida no existe no retransmito nada
		if (isEmpty(partidas[idPartida])) {
			console.log("TerminarPartida: Partida "+idPartida+" no existe");
			return;
		}

		//Si el jugador no esta en partida no retransmito nada
		if (isEmpty(data.infoJugadores[socket.id])) {
			console.log("TerminarPartida: Jugador no esta en partida");
			return;
		}

		var socketid = "";
		for (var i = 0; i < partidas[idPartida].gamePlayers.length; i++){
			socketid = partidas[idPartida].gamePlayers[i];
			io.to(socketid).emit('terminarPartida', data);
		}
		//Actualizo la base de datos con el ganador y los jugadores
		var stats = {};
		var dbId;
		var userName = "";
		var usuario = "";
		var pass = "";
		//var socketid = "";
		for (var i = 0; i < partidas[idPartida].gamePlayers.length; i++){
			socketid = partidas[idPartida].gamePlayers[i];
			userName = data.infoJugadores[socketid].nombre;
			//console.log("Jugador: "+userName);
			if (userName == "Anonimo") {
				continue;
			}
			db.collection(USERS_COLLECTION).find({usuario: userName}).toArray(function(err, doc) {
				
				if (doc[0] != undefined) {
					dbId = doc[0]._id;
					console.log("id dbusuario: "+dbId);
					usuario = doc[0].usuario;
					pass = doc[0].pass;
					stats.total = doc[0].stats.total + 1;
					if (data.ganador == userName) {
						stats.wins = doc[0].stats.wins + 1;
					} else {
						stats.wins = doc[0].stats.wins;
					}

					db.collection(USERS_COLLECTION).updateOne({_id: dbId}, {usuario: usuario, pass: pass, stats: stats}, function(err, doc) {
						console.log("Partida terminadas. Datos de "+socketid+"actualizados");
					});
				}
			});
		}

		//Elimino la partida terminada
		console.log("Partida terminada y eliminada");
		delete partidas[idPartida];
		delete estadoPartidas[idPartida];
	});

	socket.on('pauseGame', function(datos_partida) {
		var idPartida = datos_partida.idPartida;
		var idJugador = socket.id;
		console.log("pauseGame-> gameId: "+idPartida);

		//Si la partida no existe no retransmito nada
		if (isEmpty(partidas[idPartida])) {
			console.log("pauseGame: Partida no existe");
			return;
		}

		//Si el jugador no esta en partida no retransmito nada
		if (isEmpty(estadoPartidas[idPartida].infoJugadores[idJugador])) {
			console.log("pauseGame: Jugador no esta en partida");
			return;
		}

		//Enviamos la pausa a todos lo participantes
		var socketid = "";
		//Por si llegan mensajes retrasados y la partida ha sido eliminada
		if (partidas[idPartida] != undefined) {
			for (var i = 0; i < partidas[idPartida].gamePlayers.length; i++){
				socketid = partidas[idPartida].gamePlayers[i];
				console.log("socketiD donde responde: "+socketid);
				io.to(socketid).emit('pauseGame', datos_partida);
			}
		}
	})

	socket.on('continueGame', function(datos_partida) {
		var idPartida = datos_partida.idPartida;
		var idJugador = socket.id;
		console.log("continueGame-> gameId: "+idPartida);

		//Si la partida no existe no retransmito nada
		if (isEmpty(partidas[idPartida])) {
			console.log("continueGame: Partida no existe");
			return;
		}

		//Si el jugador no esta en partida no retransmito nada
		if (isEmpty(estadoPartidas[idPartida].infoJugadores[idJugador])) {
			console.log("contineGame: Jugador no esta en partida");
			return;
		}

		//Enviamos la pausa a todos lo participantes
		var socketid = "";
		//Por si llegan mensajes retrasados y la partida ha sido eliminada
		if (partidas[idPartida] != undefined) {
			for (var i = 0; i < partidas[idPartida].gamePlayers.length; i++){
				socketid = partidas[idPartida].gamePlayers[i];

				io.to(socketid).emit('contineGame', datos_partida);
			}
		}
	})

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
	});

	socket.on('login_user', function(data) {
		//Comprobamos que el nombre de usuario no este ya usado
	    db.collection(USERS_COLLECTION).find({usuario: data.usuario}).toArray(function(err, doc) {
	    	/**console.log("login_user->find->err: "+err);
	    	console.log("login_user->find->doc: "+doc);**/
	    	var loginOk = false;
	    	//Este for es un tanto inutil, pues solo deberia haber un campo con el mismo nombre de usuario
	    	//pero por si acaso
	    	for (var i in doc) {
	    		//Doc es un array de los diferentes usuarios y sus diferentes campos
			    /**for (var i in doc) {
			    	for (var elem in doc[i]){
		    			console.log("Users got: doc[i]-elements-> "+doc[i]+"-"+elem);
		    		}
		    	}**/

	    		//Encriptamos la contraseña enviada para compararla con la almacenada
				/**var cipherpass = CryptoJS.AES.encrypt(data.pass, 'clave muy secreta');
				console.log("Pass encriptada enviada: "+cipherpass);
				console.log("Pass encriptada almacenada: "+doc[i].pass);**/
				var decipherpass = CryptoJS.AES.decrypt(doc[i].pass, 'clave muy secreta');
				var decipherpassUTF8 = decipherpass.toString(CryptoJS.enc.Utf8);
				//console.log("Pass desencriptada almacenada: "+decipherpassUTF8);
				//console.log("Pass no encriptada enviada: "+data.pass);
	    		if (data.pass == decipherpassUTF8) {
	    			loginOk = true;
	    		}
	    	}
		    if (loginOk == true) {
		      	console.log("login_user: El usuario esta registrado=>login ok");
		      	//Guardamos el login con su socket
		      	playersSrv[socket.id].nombre = data.usuario;
				socket.emit('login_user-OK', 'Usuario logueado');
		    } else {
		    	if (i >= 0) {
		    		console.log("login_user: La contraseña del usuario "+data.usuario+" es erronea");
					socket.emit('login_user-KO', 'La contraseña es erronea');
		    	} else {
			    	console.log("login_user: El usuario "+data.usuario+" no existe");
					socket.emit('login_user-KO', 'Usuario no existe');
				}
		    }
	  	});
	});

	socket.on('register_user', function(data) {
		//Comprobamos que el nombre de usuario no este ya usado
	    db.collection(USERS_COLLECTION).find({usuario: data.usuario}).toArray(function(err, doc) {
	    	/**console.log("register_user->find->err: "+err);
	    	console.log("register_user->find->doc: "+doc);
	    	for (var i in doc) {
	    		console.log("register_user->find->i: "+i);
	    		console.log("register_user->find->doc[i]: "+doc[i]);
	    	}**/
		    if (doc == "") {
		      	//console.log("register_user: El usuario no esta repetido");

		      	//Encriptamos la contraseña antes de almacenarla en la base de datos
		      	//console.log("Register_User: Pass sin encriptar: "+data.pass);
				var cipherpass = CryptoJS.AES.encrypt(data.pass, 'clave muy secreta');
				var cipherpassStr = cipherpass.toString();
				//Comprobando encriptacion
				/**var decipherpass = CryptoJS.AES.decrypt(cipherpass, 'clave muy secreta');
				var decipherpassStr = CryptoJS.AES.decrypt(cipherpassStr, 'clave muy secreta');
				var decipherpassStr_toString = decipherpassStr.toString(CryptoJS.enc.Utf8);

				console.log("RegisterUser: Pass desencriptada: "+decipherpass);
				console.log("RegisterUser: PassStr desencriptada: "+decipherpassStr);
				console.log("RegisterUser: PassStr_toStr() desencriptada: "+decipherpassStr_toString);

				console.log("Register_User: Pass encriptada: "+cipherpass);
				console.log("Register_User: PassStr encriptada: "+cipherpassStr);**/

				var newUser = {
					"usuario": data.usuario,
					"pass": cipherpassStr,
					"stats": {
						"wins": 0,
						"losts": 0,
						"draws": 0,
						"total": 0,
						"retired": 0
					}
				};

				db.collection(USERS_COLLECTION).insertOne(newUser, function(err, doc) {
				    if (err) {
				    	console.log("register_user->find->insertOne->"+err);
				        socket.emit('register_user-KO', 'Usuario no repetido pero error al registrarlo');
				    } else {
						console.log("User Added: "+doc.message);
						socket.emit('register_user-OK', 'Usuario registrado');
				    }
				});
		    } else {
		    	console.log("register_user: usuario repetido");
				socket.emit('register_user-KO', 'Usuario repetido');
		    }
	  	});
	});

	socket.on('request_users', function(data) {
		if (data.request == 'create_ranquing') {
			db.collection(USERS_COLLECTION).find({}).toArray(function(err, doc) {
				if (err) {
				  	console.log("request_users->create_ranquing->find->err: "+err);
				} else {
					console.log("request_users->create_ranquing->OK");
					//Copy second into first. Not sure if is a deep copy :-)
					var cloneUsers = extend({}, doc);
					for (var i in cloneUsers) {
						//console.log("Var i is: "+i);
						//Enviamos la lista de usuarios sin poner las contraseñas
						delete cloneUsers[i].pass;
						//console.log("cloneUsers[i].pass: "+cloneUsers[i].pass);
					}
					socket.emit('create_ranquing', cloneUsers);
				}
			});
		}
	});
});

/** Gestion de cada partida **/
function prepararPartida(idPartida) {
	console.log("Server: prepararPartida()");
	partidas[idPartida].estado = "encurso";

	//Copia por valor y no por referencia ojo (su pm. 8 horas por esto)
	var jugadores = shuffle(partidas[idPartida].gamePlayers.slice());
	//Copia por valor y no por referencia ojo
	var deckOfCardsPartida = shuffle(deckOfCards.slice());

	//En un futuro usar rooms para los mensajes de broadcast. De momento lo hacemos a mano
	var socketid = "";
	for (var i = 0; i < partidas[idPartida].gamePlayers.length; i++) {
		socketid = partidas[idPartida].gamePlayers[i];

		var carta1 = takeCard(deckOfCardsPartida);
		carta1.numCarta = 0;
		var carta2 = takeCard(deckOfCardsPartida);
		carta2.numCarta = 1;
		var carta3 = takeCard(deckOfCardsPartida);
		carta3.numCarta = 2;

		var datos_iniciales = {
			idPartida: idPartida,
			jugadores: jugadores,
			carta1: carta1,
			carta2: carta2,
			carta3: carta3
		};
		io.to(socketid).emit('prepararPartida', datos_iniciales);
	}
	//Campo de informacion variada sobre los jugadores
	var infoJugadores = {};
	for (var i = 0; i < jugadores.length; i++) {
		if (isEmpty(playersSrv[jugadores[i]]) == false) {
			var nombre = playersSrv[jugadores[i]].nombre;
		} else {
			var nombre = "unknown";
		}
		infoJugadores[jugadores[i]] = {turnosPerdidos: 0, 
										nombre: nombre,
										limiteTurnosPerdidos: 3,
										turnoPerdida: 0
									}
	}

	//Iniciamos los turnos
	console.log("Server: iniciar turnos");
	var newDatos_partida = {
		idPartida: idPartida,
		jugadores: jugadores,
		infoJugadores: infoJugadores,
		turno: jugadores[0],
		numTurno: 1,
		deckOfCardsPartida: deckOfCardsPartida,
		organosJugadoresCli: null,
		movJugador: {
			jugOrigen: "",
			jugDestino: "",
			texto: "",
			tipoMov: "empezarTurnos",
			tipoOrgano: "",
			cartasUsadas: []
		}
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

function printObject(obj, contObjLevel) {
	console.log("Object: "+obj+" - level-> "+contObjLevel);
	/**for (var elem in obj) {
	 	console.log("elem: "+elem);
	 	if ((Object.keys(obj).length > 0) && (contObjLevel < 3)) {
	 	  	console.log("Length:" +Object.keys(obj).length);
	 		printObject(obj[elem], contObjLevel+1);
	 	} else {
	 		console.log("undefined");
	 	}
	}
	var object = {
		uno: "uno",
		dos: "dos",
		tres: {
			algo: "primer algo",
			segalgo: 2
		}
	};

	printObject(object,0);**/
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

function isEmpty(data) {
	if ((data == undefined) || (data == null) || (data == "")) {
		return true;
	} else {
		return false;
	}
}

//Use it for extend a object without Jquery. Return a object built merging second into first
function extend(first, second) {
    for (var secondProp in second) {
        var secondVal = second[secondProp];
        // Is this value an object?  If so, iterate over its properties, copying them over
        if (secondVal && Object.prototype.toString.call(secondVal) === "[object Object]") {
            first[secondProp] = first[secondProp] || {};
            extend(first[secondProp], secondVal);
        }
        else {
            first[secondProp] = secondVal;
        }
    }
    return first;
};
/** -------------------- **/


/** Arrancando servidor **/
var cardType = {organo: 'organo', virus: 'virus', medicina:'medicina', tratamiento: 'tratamiento'}
function card (cardType, organType, picture) {
	this.cardType = cardType;
	this.organType = organType;
	this.picture = picture;
	this.numCarta = -1;
}

card.prototype.toString = function () {
	var value = "";
	value += "Carta: "+this.cardType+" "+this.organType;
	return value;
}

function initDeckOfCards(){
	for (var i = 0; i < 5; i++) {
		deckOfCards.push(new card(cardType.organo, 'hueso', 'img/cardImagesLQ/organos/orgaHueso.png'));
		deckOfCards.push(new card(cardType.organo, 'corazon', 'img/cardImagesLQ/organos/orgaCorazon.png'));
		deckOfCards.push(new card(cardType.organo, 'higado', 'img/cardImagesLQ/organos/orgaHigado.png'));
		deckOfCards.push(new card(cardType.organo, 'cerebro', 'img/cardImagesLQ/organos/orgaCerebro.png'));
	}
	for (var i = 0; i < 4; i++) {
		deckOfCards.push(new card(cardType.medicina, 'hueso', 'img/cardImagesLQ/medicinas/medHueso.png'));
		deckOfCards.push(new card(cardType.medicina, 'corazon', 'img/cardImagesLQ/medicinas/medCorazon.png'));
		deckOfCards.push(new card(cardType.medicina, 'higado', 'img/cardImagesLQ/medicinas/medHigado.png'));
		deckOfCards.push(new card(cardType.medicina, 'cerebro', 'img/cardImagesLQ/medicinas/medCerebro.png'));
	}
	for (var i = 0; i < 4; i++) {
		deckOfCards.push(new card(cardType.virus, 'hueso', 'img/cardImagesLQ/virus/virusHueso.png'));
		deckOfCards.push(new card(cardType.virus, 'corazon', 'img/cardImagesLQ/virus/virusCorazon.png'));
		deckOfCards.push(new card(cardType.virus, 'higado', 'img/cardImagesLQ/virus/virusHigado.png'));
		deckOfCards.push(new card(cardType.virus, 'cerebro', 'img/cardImagesLQ/virus/virusCerebro.png'));
	}
	for (var i = 0; i < 3; i++) {
		deckOfCards.push(new card(cardType.tratamiento, 'errorMedico', 'img/cardImagesLQ/especiales/errorMedico.png'));
		deckOfCards.push(new card(cardType.tratamiento, 'guanteDeLatex', 'img/cardImagesLQ/especiales/guanteDeLatex.png'));
		deckOfCards.push(new card(cardType.tratamiento, 'transplante', 'img/cardImagesLQ/especiales/transplante.png'));
		deckOfCards.push(new card(cardType.tratamiento, 'ladronDeOrganos', 'img/cardImagesLQ/especiales/ladronDeOrganos.png'));
		//deckOfCards.push(new card(cardType.tratamiento, 'contagio', 'img/cardImagesLQ/especiales/contagio.png'));
	}
	//Para seguir mejorando esta carta y hacer pruebas
	for (var i = 0; i < 14; i++) {
		//deckOfCards.push(new card(cardType.tratamiento, 'ladronDeOrganos', 'img/cardImagesLQ/especiales/ladronDeOrganos.png'));
		//deckOfCards.push(new card(cardType.tratamiento, 'transplante', 'img/cardImagesLQ/especiales/transplante.png'));
		//deckOfCards.push(new card(cardType.organo, 'comodin', 'img/cardImagesLQ/organos/orgaComodin.png'));
		//deckOfCards.push(new card(cardType.tratamiento, 'contagio', 'img/cardImagesLQ/especiales/contagio.png'));
	}
	
	for (var i = 0; i < 1; i++) {
		deckOfCards.push(new card(cardType.organo, 'comodin', 'img/cardImagesLQ/organos/orgaComodin.png'));
		deckOfCards.push(new card(cardType.medicina, 'comodin', 'img/cardImagesLQ/medicinas/medComodin.png'));
		deckOfCards.push(new card(cardType.virus, 'comodin', 'img/cardImagesLQ/virus/virusComodin.png'));
	}
}
initDeckOfCards();
/** -------------------- **/