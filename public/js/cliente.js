//FUNCIONALIDAD CLIENTE

var lista_partidas = {};
var idPartidaEsperando = "";
var enPartidaEsperando = false;
var ayudaFuerte;
var ayudaDebil;
/** Establecimiento de la conexion con el servidor **/
socket = io.connect('https://nodejs-server-virusgame.herokuapp.com/');
//Local
//var socket = io.connect('http://localhost:8080');
socket.on('Connection OK', function (data) {
   	console.log("Cliente conectado. Player_id: "+data.player_id);
   	usuario = data.player_id;
   	configInicial();
   	actualizar_partidas();
});
/** -------------------- **/

function configInicial() {
	console.log("configInicial()");
	var autoLogin = localStorage.getItem('autoLogin');
	if (autoLogin == "") {
		document.form_settings_user.autoLoginName.checked = true;
		console.log("AutoLogin no guardado");
		localStorage.setItem('autologin', "true");
	} else if (autoLogin == "true") {
		document.form_settings_user.autoLoginName.checked = true;
		var loginName = localStorage.getItem('loginName');
		var loginPass = localStorage.getItem('loginPass');
		document.getElementById("userNameContainer").innerHTML = "Usuario: "+loginName;
		if (loginName != "") { //true o != de ""
			console.log("configInicial()->socket.emit-login_user");
			socket.emit('login_user', {usuario: loginName, pass: loginPass});
		}
	} else {
		document.form_settings_user.autoLoginName.checked = false;
	}

	ayudaDebil = localStorage.getItem('ayudaDebil');
	if (ayudaDebil == "") {
		document.form_settings_user.ayudaDebilName.checked = true;
		console.log("Ayuda debil no guardada");
		localStorage.setItem('ayudaDebil', 'true');
		ayudaDebil = true;
	} else if (ayudaDebil == "true") {
		document.form_settings_user.ayudaDebilName.checked = true;
		ayudaDebil = true;
	} else if (ayudaDebil == "false") {
		document.form_settings_user.ayudaDebilName.checked = false;
		ayudaDebil == false;
	}

	ayudaFuerte = localStorage.getItem('ayudaFuerte');
	if (ayudaFuerte == "") {
		document.form_settings_user.ayudaFuerteName.checked = true;
		console.log("Ayuda fuerte no guardada");
		localStorage.setItem('ayudaFuerte', 'true');
		ayudaFuerte = true;
	} else if (ayudaFuerte == "true") {
		document.form_settings_user.ayudaFuerteName.checked = true;
		ayudaFuerte = true;
	} else if (ayudaFuerte == "false") {
		document.form_settings_user.ayudaFuerteName.checked = false;
		ayudaFuerte == false;
	}

	//Posicion Cuadros ayuda
	//Partida Rapida
	var elemBotJug = document.getElementById('boton_jugar');
	var posBotJug = elemBotJug.getBoundingClientRect();
	var posX = (Math.floor(posBotJug.left + posBotJug.width + 10)).toString()+"px";
	var posY = (Math.floor(posBotJug.top + posBotJug.height -110)).toString()+"px";
	//console.log("posX: "+posX+", posY: "+posY);
	$("#cuadroPartidaRapida").css("left", posX);
	$("#cuadroPartidaRapida").css("top", posY);
	$("#cuadroPartidaRapida").css("display", "block");

	//Option Ranquing
	var optionRanquing = localStorage.getItem('optionRanquing');
	if (optionRanquing == undefined) {
		localStorage.setItem('optionRanquing', 'wins');
	}
}
//Comprobamos si hemos abandonado una partida en curso
//checkMatchRunning();

/** Los botones iniciales y el boton volver a inicio**/
function button_create() {
	//console.log("button_create()");
	$("#container_botones").css("display", "none");
	$("#container_form_create").css("display", "inline");
	$("#lista_partidas").css("display", "none");
	$("#canvas_container").css("display", "none");
	$("#registerForm").css("display", "none");
	$("#loginForm").css("display", "none");
	$("#settings").css("display", "none");
	$("#ranquing").css("display", "none");
	$("#login").css("display", "none");
	$("#leave").css("display", "none");
	$("#userNameContainer").css("display", "none");
	$("#register").css("display", "none");
	$("#cuadroPartidaRapida").css("display", "none");
}

function button_lista_partidas() {
	//console.log("button_lista_partidas()");
	$("#container_botones").css("display", "none");
	$("#container_form_create").css("display", "none");
	actualizar_partidas();
	$("#lista_partidas").css("display", "inline");
	$("#canvas_container").css("display", "none");
	$("#registerForm").css("display", "none");
	$("#loginForm").css("display", "none");
	$("#settings").css("display", "none");
	$("#ranquing").css("display", "none");
	$("#login").css("display", "none");
	$("#leave").css("display", "none");
	$("#userNameContainer").css("display", "none");
	$("#register").css("display", "none");
	$("#cuadroPartidaRapida").css("display", "none");
}

function backTo_InitMenu() {
	//console.log("backTo_InitMenu()");
	$("#cuadroPartidaRapida").css("display", "inline");
	$("#container_botones").css("display", "inline");
	$("#container_form_create").css("display", "none");
	$("#lista_partidas").css("display", "none");
	$("#canvas_container").css("display", "none");
	$("#registerForm").css("display", "none");
	$("#loginForm").css("display", "none");
	$("#settings").css("display", "inline");
	$("#ranquing").css("display", "inline");
	$("#cuadroFinPartida").css("display", "none");
	var logged = localStorage.getItem("logged");
	if (logged == "true") {
		$("#leave").css("display", "inline");
		$("#userNameContainer").css("display", "block");
		$("#login").css("display", "none");
		$("#register").css("display", "none");
	} else {
		$("#leave").css("display", "none");
		$("#userNameContainer").css("display", "none");
		$("#login").css("display", "inline");
		$("#register").css("display", "inline");
	}
}

function button_loginForm () {
	console.log("button_login()");
	if ($("#loginForm").css("display") == "block") {
		$("#loginForm").css("display", "none");
		$("#registerForm").css("display","none");
	} else {
		$("#loginForm").css("display", "block");
		$("#registerForm").css("display","none");
		document.getElementById("loginCorrection").innerHTML = "";
	}
}

function button_registerForm () {
	console.log("button_register()");
	//console.log("Display: "+$("#registerForm").css("display"));
	if ($("#registerForm").css("display") == "block") {
		$("#registerForm").css("display","none");
		$("#loginForm").css("display", "none");
	} else {
		$("#registerForm").css("display","block");
		$("#loginForm").css("display", "none");
	}
}

function button_leave () {
	console.log("button_leave()");
	$("#login").css("display", "block");
	$("#register").css("display", "block");
	$("#leave").css("display", "none");
	$("#userNameContainer").css("display", "none");
	document.getElementById("userNameContainer").innerHTML == "";
	document.form_login_user.loginName.value = "";
	document.form_login_user.loginPass.value = "";
	localStorage.setItem("logged", "false");
}

function button_ranquing () {
	console.log("button_ranquing()");
	if ($("#ranquingList").css("display") == "block") {
		$("#settingsForm").css("display","none");
		$("#ranquingList").css("display", "none");
	} else {
		$("#settingsForm").css("display","none");
		$("#ranquingList").css("display", "block");
	}
	socket.emit('request_users', {request: 'create_ranquing'});
}

function button_settings () {
	console.log("button_settings");
	if ($("#settingsForm").css("display") == "block") {
		$("#settingsForm").css("display","none");
		$("#ranquingList").css("display", "none");
	} else {
		$("#settingsForm").css("display","block");
		$("#ranquingList").css("display", "none");
	}
}
/** -------------------- **/

/** Interaccion con el servidor de los botones iniciales **/
function form_login() {
	console.log("form_login()")
	var loginName = document.form_login_user.loginName.value;
	var loginPass = document.form_login_user.loginPass.value;
	//Guardamos usuario y contraseña
	localStorage.setItem('loginName', loginName);
	localStorage.setItem('loginPass', loginPass);

	document.getElementById("userNameContainer").innerHTML = "Usuario: "+document.form_login_user.loginName.value;

	socket.emit('login_user', {usuario: loginName, pass: loginPass});
	return false;
}

socket.on('login_user-OK', function(message) {
	console.log("login_user-OK");

	//Borramos el formulario
	document.getElementById("loginCorrection").innerHTML = "";
	document.form_login_user.loginPass.value = "";
	document.form_login_user.loginPass.value = "";

	$("#userNameContainer").css("display", "block");
	$("#registerForm").css("display", "none");
	$("#loginForm").css("display", "none");
	$("#register").css("display", "none");
	$("#login").css("display", "none");
	$("#leave").css("display", "block");

	localStorage.setItem("logged", "true");
});

socket.on('login_user-KO', function(message) {
	localStorage.removeItem('loginName');
	localStorage.removeItem('loginPass');
	localStorage.setItem("logged", "false");

	console.log("login_user-KO: "+message);
	document.getElementById("loginCorrection").innerHTML = "Usuario o contraseña incorrectos";
	document.getElementById("userNameContainer").innerHTML = ""
	document.form_login_user.loginName.value = "";
	document.form_login_user.loginPass.value = "";
});

function form_register() {
	console.log("form_register()");
	var registerName = document.form_register_user.registerName.value;
	var registerPass1 = document.form_register_user.registerPass1.value;
	var registerPass2 = document.form_register_user.registerPass2.value;

	if (registerPass1 != registerPass2) {
		console.log("Las contraseñas no coinciden");
		document.getElementById("registerCorrection").innerHTML = "Las contraseñas no coinciden";
		document.form_register_user.registerPass1.value = "";
		document.form_register_user.registerPass2.value = "";
	} else if (registerName != "") {
		socket.emit('register_user', {usuario: registerName, pass: registerPass1});
	} else {
		console.log('Usuario == ""');
	}

	return false;
}

socket.on('register_user-OK', function(message) {
	console.log("register_user-OK");
	document.form_login_user.loginName.value = document.form_register_user.registerName.value;
	document.form_login_user.loginPass.value = document.form_register_user.registerPass1.value;
	document.getElementById("registerCorrection").innerHTML = "";
	document.form_register_user.registerName.value = "";
	document.form_register_user.registerPass1.value = "";
	document.form_register_user.registerPass2.value = "";
	$("#registerForm").css("display", "none");
	$("#loginForm").css("display", "block");
});

socket.on('register_user-KO', function(message) {
	console.log("register_user-KO: "+message);
	document.getElementById("registerCorrection").innerHTML = "Usuario repetido";
	document.form_register_user.registerName.value = "";
});

function form_settings() {
	console.log("form_settings()");
	ayudaDebil = document.form_settings_user.ayudaDebilName.checked;
	localStorage.setItem('ayudaDebil', ayudaDebil);
	//console.log("Ayuda Debil: "+ayudaDebil);
	ayudaFuerte = document.form_settings_user.ayudaFuerteName.checked;
	localStorage.setItem('ayudaFuerte', ayudaFuerte);
	//console.log("Ayuda Fuerte: "+ayudaFuerte);
	var autoLogin = document.form_settings_user.autoLoginName.checked;
	localStorage.setItem('autoLogin', autoLogin);
	//console.log("Autologin: "+autoLogin);

	return false;
}

socket.on('create_ranquing', function(data) {
	console.log("create_ranquing");
	//User fields
	//	{"usuario": data.usuario,
	//	"pass": data.pass,
	//	"stats": {
	//		"wins": 0,
	//		"losts": 0,
	//		"draws": 0,
	//		"total": 0,
	//		"retired": 0
	//		}
	//	};

	//Si hay menos usuarios que la cantidad de gente del ranquing que queremos mostrar
	keysObj = Object.keys(data);
	numUsers = keysObj.length;
	if (numUsers < 10) {
		maxLoop = numUsers;
	} else {
		maxLoop = 10;
	}

	$(".ranquingElems").remove();

	var optionRanquing = localStorage.getItem('optionRanquing');
	console.log("optionRanquing: "+ optionRanquing);

	var sortedObj = getUsersSorted(optionRanquing, data, maxLoop);

	var html = "";
	for (var i = 0; i < maxLoop; i++) {
		var pos = i + 1;
		var percent = (Math.round(((sortedObj[i].stats.wins / sortedObj[i].stats.total)*100))).toString()+"%";
		html+=
		'<div class="ranquingElems ranquingLine">'+
			'<a class="ranquingPos">'+pos+'</a>'+
			'<a class="ranquingUsuario">'+sortedObj[i].usuario+'</a>'+
			'<a class="ranquingPercent" onclick=sortRanquing("percent")>'+percent+'</a>'+
			'<a class="ranquingWins" onclick=sortRanquing("wins")>'+sortedObj[i].stats.wins+'</a>'+
			'<a class="ranquingTotal" onclick=sortRanquing("total")>'+sortedObj[i].stats.total+'</a>'+
		'</div>';
	}
	$("#ranquingList").append(html);

})

function sortRanquing(option) {
	localStorage.setItem('optionRanquing', option);
	socket.emit('request_users', {request: 'create_ranquing'});
}

function form_createGame() {
	//console.log("form_createGame()");
	var gameName = document.form_create_game.gameName.value;
	var gameNumPlayers = document.form_create_game.gameNumPlayers.value;
	//console.log("gameName: "+gameName);
	//console.log("gameNumPlayers: "+gameNumPlayers);
	 if (gameName == "") {
	 	gameName = "Juego de: "+usuario.substr(0,6);
	 }

	socket.emit('create_game', 
		{creador: usuario, gameName: gameName, gameNumPlayers: gameNumPlayers});
	//Pantalla de lista de espera
	return false;
}

socket.on('create_game-OK', function(data) {
	//console.log("Recibido: create_game-OK");
	idPartidaEsperando = data.idPartida;
	enPartidaEsperando = true;
	button_lista_partidas();
})

socket.on('create_game-KO', function() {
	//console.log("Recibido: create game-KO");
	alert("Ya has creado o ya estas dentro de alguna partida");
	button_lista_partidas();
})

socket.on('new_player_joined', function() {
	console.log("new_player_joined");
	actualizar_partidas();
})

socket.on('new_game_available', function() {
	console.log("new_game_available");
	actualizar_partidas();
})

socket.on('player_leaved', function() {
	console.log("player_leaved");
	actualizar_partidas();
}); 

function actualizar_partidas(){
	//console.log("function actualizar_partidas()");
	socket.emit('actualizar_partidas');
}

socket.on('actualizar_partidas', function(data){
	//console.log("Recibido: actualizar_partidas");
	lista_partidas = data;
	actualizar_listaPartidas();
})

function actualizar_listaPartidas() {
	//Actualizamos partida rapida
	var mejorDif = 9999;
	var dif = 0;
	var idPartida = "";
	for (var id in lista_partidas) {
		if (lista_partidas[id].estado == "esperando") {
			dif = lista_partidas[id].gameNumPlayers - lista_partidas[id].gamePlayers.length;
			if (dif < mejorDif) {
				mejorDif = dif;
				idPartida = id;
			}
		}
	}
	if (idPartida == "") {
		document.getElementById("partidaRapidaNombre").innerHTML = "No hay partidas";
		document.getElementById("partidaRapidaJugadores").innerHTML = "-----";
	} else {
		document.getElementById("partidaRapidaNombre").innerHTML = 
			"-Partida: "+lista_partidas[idPartida].gameName;
		document.getElementById("partidaRapidaJugadores").innerHTML = 
			"-(Necesarios "+mejorDif+" jugadores)";
	}

	//console.log("function actualizar_listaPartidas()");
	//Eliminamos primero los eventos asociados a los nodos hijos pues remove/empty no lo hace
	//y en un mal escenario puedes tener millones de eventos disparandose cada vez
	/** Hasta los huevos. Dia perdido. Retomar esta mierda algun dia
	('#container_partidas *').unbind();
	$('#container_partidas *').unbind('click');
	$('#container_partidas *').attr('onClick','');
	$('#container_partidas *').attr('onclick','');
	$('.partida').unbind();
	$('.partida').unbind('click');
	$('.partida').attr('onClick','');
	$('.partida').attr('onclick','');**/
	
	//Actualizamos la lista de partidas
	$("#container_partidas").empty();
	for (var id in lista_partidas) {
		if (enPartidaEsperando == false) {
			//Si no estoy en partida y la sala esta llena, me la salto
			if (lista_partidas[id].gamePlayers.length >= lista_partidas[id].gameNumPlayers) {
				continue;
			}
			$("#container_partidas").append(
				'<li class=partida onclick=joinPartida("'+lista_partidas[id].idPartida+'","'+false+'")>'+
					'<a class=nombre_partida>Nombre partida: '+lista_partidas[id].gameName+'</a>'+
					'<a class=idPartida>'+lista_partidas[id].idPartida+'</a>'+
					'<a class=num_jugadores>'+lista_partidas[id].gamePlayers.length+'/'+lista_partidas[id].gameNumPlayers+'</a>'+
					'<a class=join_partida>ENTRAR</a>'+
				'</li>'
			);
		} else {
			if (id == idPartidaEsperando) {
				$("#container_partidas").append(
					'<li class=partida onclick=leavePartida("'+lista_partidas[id].idPartida+'")>'+
						'<a class=nombre_partida>Nombre partida: '+lista_partidas[id].gameName+'</a>'+
						'<a class=idPartida>'+lista_partidas[id].idPartida+'</a>'+
						'<a class=num_jugadores>'+lista_partidas[id].gamePlayers.length+'/'+lista_partidas[id].gameNumPlayers+'</a>'+
						'<a class="leave_partida">SALIR</a>'+
					'</li>'
				);
			} else {
				//Si estoy en partida me salto las partidas llenas si no son la mía
				if (lista_partidas[id].gamePlayers.length >= lista_partidas[id].gameNumPlayers) {
					continue;
				}
				$("#container_partidas").append(
					'<li class=partida>'+
						'<a class=nombre_partida>Nombre partida: '+lista_partidas[id].gameName+'</a>'+
						'<a class=idPartida>'+lista_partidas[id].idPartida+'</a>'+
						'<a class=num_jugadores>'+lista_partidas[id].gamePlayers.length+'/'+lista_partidas[id].gameNumPlayers+'</a>'+
					'</li>'
				);
			}
		}
	}
}			

function joinPartida(idPartida , flag) {
	//console.log("joinPartida()");

	var enPartida = false;
	for (var id in lista_partidas) {
		for (var i = 0; i < lista_partidas[id].gamePlayers.length; i++) {
			if (lista_partidas[id].gamePlayers[i] == usuario) {
				enPartida = true;
			}
		}
	}
	if (enPartida == true) {
		alert("Ya has creado o ya estas dentro de alguna partida");
		button_lista_partidas();
	} else {
		socket.emit('join_game', {idPartida: idPartida, random: flag});
		socket.on('join_game-OK', function(data) {
			console.log("join_game-OK");
			idPartidaEsperando = data.idPartida;
			enPartidaEsperando = true;
			button_lista_partidas();
		});
		socket.on('join_game-KO', function(){
			//console.log("join_game-KO");
			alert("Servidor alerta que no ha sido posible unirse a la partida. Intentalo de nuevo");
			button_lista_partidas();
		});
	}
}

function leavePartida(idPartida) {
	//console.log("leavePartida()");
	var enPartida = false;
	//Estamos en la partida que queremos abandonar
	for (var i = 0; i < lista_partidas[idPartida].gamePlayers.length; i++) {
		if (lista_partidas[idPartida].gamePlayers[i] == usuario) {
			enPartida = true;
		}
	}
	if (enPartida == true) {
		socket.emit('leave_game', {idPartida: idPartida});
		socket.on('leave_game-OK', function() {
			idPartidaEsperando = "";
			enPartidaEsperando = false;
			console.log("leave_game-OK");
			button_lista_partidas();
		});
		socket.on('leave_game-KO', function(){
			//console.log("leave_game-KO");
			alert("Servidor alerta que no ha sido posible abandonar a la partida. Intentalo de nuevo");
			button_lista_partidas();
		});
	} else {
		alert("No estas dentro de la partida que quieres abandonar");
		button_lista_partidas();
	}
}
/** -------------------- **/

/** Interaccion con el servidor de la partida **/

socket.on('prepararPartida', function(datos_iniciales){
	console.log("prepararPartida");

	idPartida = datos_iniciales.idPartida;
	//No guardamos al usuario antes, no nos hace falta e igualmente debemos guardalo aqui si tenemos un idPartida
	//guardado pero el servidor ya ha eliminado la partida o nos ha eliminado de la partida
	jugadores = datos_iniciales.jugadores;
	cartasUsuario.push(datos_iniciales.carta1);
	cartasUsuario.push(datos_iniciales.carta2);
	cartasUsuario.push(datos_iniciales.carta3);

	//Animacion de repartir cartas
	Engine.initCanvas();
	Engine.initJugadores();
	Engine.initPosOrganosJugadores();
	Engine.initCubosDescarte();
	Engine.initPosCartasUsuario();
	Engine.initFinDescartesButton();

	renderBGCards();

	//Crea dos arrays para poder buscar informacion comodamente.
	asignarJugadoresAPosiciones();
	asignarPosicionesAJugadores();

	prepararOrganosJugadoresCli();
	moveObjects();

	actualizarCanvas();
	//actualizarCanvasMID();
})

function esperarMovimiento(){
	esperarMovSTO = setTimeout(function(){ 
		if (movJugador == "") {
			//console.log("Esperando movimiento");
			esperarMovimiento();
		} else {

			if (movJugador == "tiempo_agotado") {
				var newDatos_partida = {
					idPartida: idPartida,
					jugadores: jugadores,
					infoJugadores: infoJugadores,
					turno: turno,
					numTurno : numTurno,
					deckOfCardsPartida: deckOfCards,
					organosJugadoresCli: organosJugadoresCli,
					movJugador: movJugador
				};
				socket.emit('tiempo_agotado', newDatos_partida);
			} 
			if (turno == usuario) {
				//Comprobamos si hay ganador
				var ganador = checkPartidaTerminada();
				if (ganador != "") {
					console.log("Hemos ganado");
					var data = {
						idPartida: idPartida,
						infoJugadores: infoJugadores,
						ganador: infoJugadores[ganador].nombre
					}
					socket.emit('terminarPartida', data);
				} else {
					//Si no hay ganador seguimos con el juego
					console.log("Nuestro movimiento ha sido: "+movJugador);
					var newDatos_partida = {
						idPartida: idPartida,
						jugadores: jugadores,
						infoJugadores: infoJugadores,
						turno: turno,
						numTurno : numTurno,
						deckOfCardsPartida: deckOfCards,
						organosJugadoresCli: organosJugadoresCli,
						movJugador: movJugador
					};
					socket.emit('siguienteTurnoSrv', newDatos_partida);
				}
			}
		}
	}, 250);
}

function comunicarTiempoAgotado () {
	datos = {
		idPartida: idPartida,
		turno: turno,
		numTurno: numTurno
	}
	console.log("Avisamos al servidor que puede haber un jugador inactivo");
	socket.emit('tiempo_agotado', datos);
}

socket.on('tiempo_agotadoOK', function() {
	console.log("Servidor ha recibido correctamente el turno perdido. Retransmitimos avanzar turno");
	//Avanzamos turno - NO -> En principio ya avanzamos turno en el servidor
	/**var index = jugadores.indexOf(turno);
	if (index < (jugadores.length -1)) {
		index++;
	} else {
		index = 0;
	}
	turno = jugadores[index];
	numTurno = numTurno++;**/

	//Todos los demas jugadores aumentaran este turno, pero tenemos un "seguro" en socket.on('siguienteTurnoCli'
	//pero si no, daria igual
	infoJugadores[turno].turnosPerdidos++;
	infoJugadores[turno].turnoPerdida = numTurno;
	//Avisamos al servidor que retransmita el cambio de turno
	var newDatos_partida = {
		idPartida: idPartida,
		jugadores: jugadores,
		infoJugadores: infoJugadores,
		turno: turno,
		numTurno : numTurno,
		deckOfCardsPartida: deckOfCards,
		organosJugadoresCli: organosJugadoresCli,
		movJugador: movJugador
	};
	socket.emit('siguienteTurnoSrv', newDatos_partida);
});

function checkPartidaTerminada(){
	//Dos formas de ganar. Tener un cuerpo entero completo SANO...
	var totalOrganosCompletos;
	for (var jugador in organosJugadoresCli) {
		totalOrganosCompletos = 0;
		if ((organosJugadoresCli[jugador].cerebro == "normal") ||
			(organosJugadoresCli[jugador].cerebro == "vacunado") ||
			(organosJugadoresCli[jugador].cerebro == "inmunizado")) {

			totalOrganosCompletos++;
		}
		if ((organosJugadoresCli[jugador].corazon == "normal") ||
			(organosJugadoresCli[jugador].corazon == "vacunado") ||
			(organosJugadoresCli[jugador].corazon == "inmunizado")) {
			
			totalOrganosCompletos++;
		}
		if ((organosJugadoresCli[jugador].hueso == "normal") ||
			(organosJugadoresCli[jugador].hueso == "vacunado") ||
			(organosJugadoresCli[jugador].hueso == "inmunizado")) {
			
			totalOrganosCompletos++;
		}
		if ((organosJugadoresCli[jugador].higado == "normal") ||
			(organosJugadoresCli[jugador].higado == "vacunado") ||
			(organosJugadoresCli[jugador].higado == "inmunizado")) {
			
			totalOrganosCompletos++;
		}
		if ((organosJugadoresCli[jugador].organoComodin == "normal") ||
			(organosJugadoresCli[jugador].organoComodin == "vacunado") ||
			(organosJugadoresCli[jugador].organoComodin == "inmunizado")) {
			
			totalOrganosCompletos++;
		}

		if (totalOrganosCompletos >= 4){
			return jugador;
		}
	}
	//...o ser el ultimo jugador que queda en la partida
	if (jugadores.length == 1) {
		return jugadores[0];
	}
	return "";
}

socket.on('siguienteTurnoCli', function(datos_partida){
	//console.log("siguienteTurnoCli");

	//Si el anterior jugador ha perdido el turno, llegaran uno o varios mensajes
	//Usamos el primero y saltamos el resto
	//Si el turno que teniamos guardado, es igual al turno que nos llega es que el turno ya ha sido procesado
	if (turno == datos_partida.turno) {
		console.log("Mensajes retrasados de pierde turno");
		return;
	}

	clearTimeout(countDownSTO);
	clearTimeout(esperarMovSTO);
	cerrarAyudaCartas();

	movJugador = datos_partida.movJugador;

	//Representar movimiento (nuestro mov quedara representado en el sig mensaje
	//enviado por el servidor)
	//Pendiente
	representarMov(movJugador);

	//Guante de Latex
	//El jugador de la carta no se descarta
	if ((movJugador == "guante_de_latex") && (usuario != turno)) {
		objetos[0].src = "";
		objetos[1].src = "";
		objetos[2].src = "";
		descartes[0] = true;
		descartes[1] = true;
		descartes[2] = true;
		finDescarte = false;
		actualizarCanvas();
	}
	//Pero solo le permitimos recuperar sus cartas en SU turno
	if ((finDescarte == false) && (usuario == datos_partida.turno)) {
		$("#descartes_boton").css("display","inline");
	}

	//Una vez representado el movimiento del jugador, borramos el mov
	movJugador = "";

	turno = datos_partida.turno;
	idPartida = datos_partida.idPartida;
	jugadores = datos_partida.jugadores;
    infoJugadores = datos_partida.infoJugadores,
	numTurno = datos_partida.numTurno;
	deckOfCards = datos_partida.deckOfCardsPartida;

	//Compruebo si me han echado de la partida
	if (jugadores.indexOf(usuario) == -1) {
		console.log("Hemos sido expulsado de la partida");
		backTo_InitMenu();
		return;
	}

	//Comprobamos si nos estamos reenchando a la partida
	//if (cartasUsuario.length <= 0){
	//	handleReconect();
	//}

	if (datos_partida.organosJugadoresCli != undefined){
		for (var jugador in datos_partida.organosJugadoresCli){
			organosJugadoresCli[jugador].cerebro = datos_partida.organosJugadoresCli[jugador].cerebro;
			organosJugadoresCli[jugador].corazon = datos_partida.organosJugadoresCli[jugador].corazon;
			organosJugadoresCli[jugador].higado = datos_partida.organosJugadoresCli[jugador].higado
			organosJugadoresCli[jugador].hueso = datos_partida.organosJugadoresCli[jugador].hueso;
			organosJugadoresCli[jugador].organoComodin = datos_partida.organosJugadoresCli[jugador].organoComodin;
		}
	}

	checkCards();
	indicarTurno(turno);

	esperarMovimiento(); //->setTimeOut
	renderCountDown(30, new Date()); //->setTimeOut
});

function representarMov(movJugador) {

}

function checkCards() {
	for (var i = 0; i < objetos.length; i++) {
		if (objetos[i].src == ""){
			nuevaCarta(i);
		}
	}
}

socket.on('terminarPartida', function(data){
	//Reseteamos cosas
	clearTimeout(countDownSTO);
	clearTimeout(esperarMovSTO);

	console.log("Terminar Partida");
	console.log("Ganador: "+data.ganador);

	var widthElem = parseInt(($("#cuadroFinPartida").css("width")).replace("px",""));
	var heightElem = parseInt(($("#cuadroFinPartida").css("height")).replace("px",""));
	var marginElem = parseInt(($("#cuadroFinPartida").css("margin")).replace("px",""));
	var borderElem = parseInt(($("#cuadroFinPartida").css("border-width")).replace("px",""));
	var paddingTopElem = parseInt(($("#cuadroFinPartida").css("padding-top")).replace("px",""));
	var paddingLeftElem = parseInt(($("#cuadroFinPartida").css("padding-left")).replace("px",""));
	/**console.log("widthElem: "+widthElem);
	console.log("heightElem: "+heightElem);
	console.log("marginElem: "+marginElem);
	console.log("borderElem: "+borderElem);
	console.log("paddingTopElem: "+paddingTopElem);
	console.log("paddingLeftElem: "+paddingLeftElem);**/
	var posX = (windowWidth - widthElem)/2 - marginElem - borderElem - paddingLeftElem;
	var posY = (windowHeight - heightElem)/2 - marginElem - borderElem - paddingTopElem;
	var posXStr = (Math.floor(posX)).toString()+"px";
	var posYStr = (Math.floor(posY)).toString()+"px";
	$("#cuadroFinPartida").css("left", posXStr);
	$("#cuadroFinPartida").css("top", posYStr);

	document.getElementById("jugadorFinPartida").innerHTML = data.ganador;
	$("#cuadroFinPartida").css("display", "block");
})
/** -------------------- **/

/**  **/
/** -------------------- **/
