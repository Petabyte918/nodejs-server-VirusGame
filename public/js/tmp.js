
EDICION DE IMAGENES
1.-Mejorar nitidez
2.-Exposicion 0-25-0-50-25
3.-Suavizado 100
4.-Suavizar 0-100
5.-Cambiar tamaño 250px

FUNCIONES RENDER
renderPlayerBackCards()->En cxAPO->Pinta el reverso de las cartas de la mano de los demas jugadores

VARIABLES
-----CLIENTE-----
infojugadores = {
	turnosPerdidos: 0, 
	nombre: playersSrv[jugadores[i]].nombre,
	limiteTurnosPerdidos: 3,
	turnoPerdida: 0
}

posCartasUsuario = {
	width: int,
	height: int,
	posCarta1: {x,y},
	posCarta2: {x,y},
	posCarta3: {x,y}
};

posPorJugador[jugador] = {
	jugador: str,
	posicion: int
}

jugPorPosicion[posicion]= {
	jugador: str,
	posicion: int
}

posPlayersHandCards = {
	widthCarta: int,
	heightCarta: int,
	sepEntreCartas: int,
	imgSrc: str,
	1: null,
	2: {
		carta1: {
			x: int,
			y: int
		},
		carta2: obj,
		carta3: obj,
	},
	3: obj,
	4: obj,
	5: obj,
}

cartasUsuario[0,1,2] -> function card (cardType, organType, picture){
	this.cardType = cardType;
	this.organType = organType;
	this.picture = picture;
}

//Creamos carta especial1
var cartaEspecial1 = {
	cardType: "cartaEspecial",
	organType: organo1,
	picture: 'img/cardImagesLQ/organos/orga'+organo1.toLowerCase()+'.png'
	jugPropietario: jug1
}

-----SERVER-----
partidas[idPartida] = {
	idPartida: idPartida, 				-- str
	gameName: gameName, 				-- str
	gameNumPlayers: gameNumPlayers, 	-- int
	gamePlayers: gamePlayers, 			-- array
	estado: "esperando"
};

var newDatos_partida = {
	idPartida: idPartida,
	jugadores: jugadores,				-- array
	infoJugadores: infoJugadores,		-- obj
	turno: jugadores[index],			-- str
	numTurno: numTurno,
	deckOfCardsPartida: deckOfCardsPartida,
	organosJugadoresCli: organosJugadoresCli,	-- obj
	movJugador: movJugador
};
estadoPartidas[idPartida] = newDatos_partida;

infoJugadores[jugadores[i]] = {
	turnosPerdidos: 0, 
	nombre: playersSrv[jugadores[i]].nombre,
	limiteTurnosPerdidos: 3,
	turnoPerdida: 0
}

playersSrv[socket.id] = {
	nombre: socket.id.slice(0,8),
	fecha_primeraConexion: date,
	fecha_ultimaPartida: date,
	socketid: socket.id
};

//TIPOS DE MOVIMIENTO
-----abandonarPartida-----
estadoPartidas[idPartida].movJugador = {
	jugOrigen: estadoPartidas[idPartida].infoJugadores[idJugador].nombre,
	jugDestino: "",
	texto: "<p>El jugador <b>"+jugOrigen+"</b> ha abandonado la partida</p>",
	tipoMov: "abandonarPartida",
	tipoOrgano: "",
	carta: [{
				cardType,
				organType,
				picture,
				numCarta: añadido en fin descarte
			},{},{}]
}
-----turnoPerdido-----
estadoPartidas[idPartida].movJugador = {
	jugOrigen: estadoPartidas[idPartida].infoJugadores[idJugador].nombre,
	jugDestino: "",
	texto: "<p>El jugador <b>"+jugOrigen+"</b> ha perdido el turno por agotar el tiempo</p>",
	tipoMov: "turnoPerdido",
	tipoOrgano: ""
}
-----Descarte-----
estadoPartidas[idPartida].movJugador = {
	jugOrigen: estadoPartidas[idPartida].infoJugadores[idJugador].nombre,
	jugDestino: "",
	texto: "<p>El jugador <b>"+jugOrigen+"</b> se ha descartado de las siguientes cartas: "+tipoOrgano,
	tipoMov: "descarte",
	tipoOrgano: "carta1(,carta2(,carta3))"
}
-----Organo-----
estadoPartidas[idPartida].movJugador = {
	jugOrigen: estadoPartidas[idPartida].infoJugadores[idJugador].nombre,
	jugDestino: estadoPartidas[idPartida].infoJugadores[idJugador].nombre,
	texto: "<p>El jugador <b>"+jugOrigen+"</b> ha usado "+tipoMov+" "+tipoOrgano+"</p>",
	tipoMov: "organo",
	tipoOrgano: "corazon", "cerebro", "higado", "hueso", "comodin"
}
-----Virus-----
estadoPartidas[idPartida].movJugador = {
	jugOrigen: estadoPartidas[idPartida].infoJugadores[idJugador].nombre,
	jugDestino: estadoPartidas[idPartida].infoJugadores[idJugador].nombre,
	texto: "<p>El jugador <b>"+jugOrigen+"</b> ha usado "+tipoMov+" "+tipoOrgano+" en jugador "+jugDestino+"</p>",
	tipoMov: "virus",
	tipoOrgano: "corazon", "cerebro", "higado", "hueso", "comodin"
}
-----Medicina-----
estadoPartidas[idPartida].movJugador = {
	jugOrigen: estadoPartidas[idPartida].infoJugadores[idJugador].nombre,
	jugDestino: estadoPartidas[idPartida].infoJugadores[idJugador].nombre,
	texto: "<p>El jugador <b>"+jugOrigen+"</b> ha usado "+tipoMov+" "+tipoOrgano+" en jugador "+jugDestino+"</p>",
	tipoMov: "medicina",
	tipoOrgano: "corazon", "cerebro", "higado", "hueso", "comodin"
}
-----Cartas especiales-----
estadoPartidas[idPartida].movJugador = {
	jugOrigen: estadoPartidas[idPartida].infoJugadores[idJugador].nombre,
	jugDestino: estadoPartidas[idPartida].infoJugadores[idJugador].nombre,
	texto: "<p>El jugador <b>"+jugOrigen+"</b> ha usado transplante con jugador "+jugDestino+" "+tipoOrgano+"</p>",
	tipoMov: "transplante",
	tipoOrgano: "y ha cambiado '"+organo1+"'' por '"+organo2+"'"
}

estadoPartidas[idPartida].movJugador = {
	jugOrigen: estadoPartidas[idPartida].infoJugadores[idJugador].nombre,
	jugDestino: estadoPartidas[idPartida].infoJugadores[idJugador].nombre,
	texto: "<p>El jugador <b>"+jugOrigen+"</b> ha usado un ladron de órganos "+tipoOrgano+" a "+jugDestino+"</p>",
	tipoMov: "ladronDeOrganos",
	tipoOrgano: "robando '"+organo1+"'"
}

estadoPartidas[idPartida].movJugador = {
	jugOrigen: estadoPartidas[idPartida].infoJugadores[idJugador].nombre,
	jugDestino: estadoPartidas[idPartida].infoJugadores[idJugador].nombre,
	texto: "<p>El jugador <b>"+jugOrigen+"</b> ha usado un error medico cambiando su cuerpo por el de "+jugDestino+"</p>",
	tipoMov: "errorMedico",
	tipoOrgano: ""
}

estadoPartidas[idPartida].movJugador = {
	jugOrigen: estadoPartidas[idPartida].infoJugadores[idJugador].nombre,
	jugDestino: estadoPartidas[idPartida].infoJugadores[idJugador].nombre,
	texto: "<p>El jugador <b>"+jugOrigen+"</b> ha usado guante de latex obligando a descartarse a todos los jugadores</p>",
	tipoMov: "guanteDeLatex",
	tipoOrgano: ""
}

//Copia por valor y no por referencia ojo (su pm. 8 horas por)
var jugadores = shuffle(partidas[idPartida].gamePlayers.slice());

var cloneUsers = extend({}, doc);


DEBUGGING // - para no tener que escribir todo el rato
for (var jugador in estadoPartidas[idPartida].infoJugadores) {
	console.log("estadoPartidas[idPartida].infoJugadores[jugador]: "+ estadoPartidas[idPartida].infoJugadores[jugador]);
}

for (var i = 0; i < partidas[idPartida].gamePlayers.length; i++) {
	console.log("partidas[idPartida].gamePlayers[i]]6: "+partidas[idPartida].gamePlayers[i]);
}
