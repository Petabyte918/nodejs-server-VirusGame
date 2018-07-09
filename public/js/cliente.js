//FUNCIONALIDAD CLIENTE

var lista_partidas = {};
var idPartidaEsperando = "";
var enPartidaEsperando = false;
var logged = "false";
var gamePaused = "false";
/** Establecimiento de la conexion con el servidor **/
var socket = io.connect('https://nodejs-server-virusgame.herokuapp.com/');

//Local
//var socket = io.connect('http://localhost:8090');
socket.on('Connection OK', function (data) {
   	//console.log("Cliente conectado. Player_id: "+data.player_id);
   	usuario = data.player_id;
   	configInicial();
   	actualizar_partidas();
});
/** -------------------- **/
//Tam Pantalla
windowWidth = window.innerWidth;
windowHeight = window.innerHeight;

function configInicial() {
	console.log("configInicial()");

	var autoLogin = localStorage.getItem('autoLogin');
	if (autoLogin == "") {
		document.form_settings_user.autoLoginName.checked = true;
		//console.log("AutoLogin no guardado");
		autoLogin = "true";
	} else if (autoLogin == "true") {
		document.form_settings_user.autoLoginName.checked = true;
		var loginName = localStorage.getItem('loginName');
		var loginPass = localStorage.getItem('loginPass');
		document.getElementById("userNameContainer").innerHTML = "Usuario: "+loginName;
		if (loginName != "") { //true o != de ""
			//console.log("configInicial()->socket.emit-login_user");
			socket.emit('login_user', {usuario: loginName, pass: loginPass});
		}
	} else {
		document.form_settings_user.autoLoginName.checked = false;
	}
	localStorage.setItem('autoLogin', autoLogin);

	var mostrarListaEventos = localStorage.getItem('mostrarListaEventos');
	if (mostrarListaEventos == "") {
		document.form_settings_user.mostrarListaEventosName.checked = true;
		//console.log("Mostrar lista eventos no guardado");
		mostrarListaEventos = "true";
	} else if (mostrarListaEventos == "true") {
		document.form_settings_user.mostrarListaEventosName.checked = true;
	} else if (mostrarListaEventos == "false") {
		document.form_settings_user.mostrarListaEventosName.checked = false;
	}
	localStorage.setItem('mostrarListaEventos', mostrarListaEventos);

	var mostrarListaTurnos = localStorage.getItem('mostrarListaTurnos');
	if (mostrarListaTurnos == "") {
		document.form_settings_user.mostrarListaTurnosName.checked = true;
		//console.log("Mostrar lista turnos no guardadao);
		mostrarListaTurnos = "true";
	} else if (mostrarListaTurnos == "true") {
		document.form_settings_user.mostrarListaTurnosName.checked = true;
	} else if (mostrarListaTurnos == "false") {
		document.form_settings_user.mostrarListaTurnosName.checked = false;
	}
	localStorage.setItem('mostrarListaTurnos', mostrarListaTurnos);

	//Posicion Cuadros ayuda
	reDimPartidaRapida();	

	//Option Ranquing
	var optionRanquing = localStorage.getItem('optionRanquing');
	if (optionRanquing == undefined) {
		localStorage.setItem('optionRanquing', 'wins');
	}

	//Set loading - centrado y tamaño
	reDimLoading();
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
	$("#settingsForm").css("display", "none");
	$("#ranquing").css("display", "none");
	$("#login").css("display", "none");
	$("#leave").css("display", "none");
	$("#userNameContainer").css("display", "none");
	$("#register").css("display", "none");
	$("#cuadroPartidaRapida").css("display", "none");
	$("#instrucciones").css("display", "none");
	$("#ranquingList").css("visibility", "hidden");
	$("#container_instrucciones1").css("display", "none");
	$("#container_instrucciones2").css("display", "none");
	$("#container_instrucciones3").css("display", "none");
	$("#container_instrucciones4").css("display", "none");
	$("#container_instrucciones5").css("display", "none");
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
	$("#settingsForm").css("display", "none");
	$("#ranquing").css("display", "none");
	$("#login").css("display", "none");
	$("#leave").css("display", "none");
	$("#userNameContainer").css("display", "none");
	$("#register").css("display", "none");
	$("#cuadroPartidaRapida").css("display", "none");
	$("#instrucciones").css("display", "none");
	$("#ranquingList").css("visibility", "hidden");
	$("#container_instrucciones1").css("display", "none");
	$("#container_instrucciones2").css("display", "none");
	$("#container_instrucciones3").css("display", "none");
	$("#container_instrucciones4").css("display", "none");
	$("#container_instrucciones5").css("display", "none");
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
	$("#instrucciones").css("display", "inline");
	$("#pauseButton").css("visibility", "hidden");
	$("#listaTurnos").css("visibility", "hidden");
	$("#listaEventos").css("visibility","hidden");
	$("#reloadButton").css("visibility","hidden");
	$("#exitButton").css("visibility","hidden");
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
	//console.log("button_login()");
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
	//console.log("button_register()");
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
	//console.log("button_leave()");
	$("#login").css("display", "block");
	$("#register").css("display", "block");
	$("#leave").css("display", "none");
	$("#userNameContainer").css("display", "none");
	document.getElementById("userNameContainer").innerHTML == "";
	document.form_login_user.loginName.value = "";
	document.form_login_user.loginPass.value = "";
	localStorage.setItem("logged", "false");
	logged = "false";
}

function button_ranquing () {
	//console.log("button_ranquing()");
	if ($("#ranquingList").css("visibility") == "visible") {
		$("#settingsForm").css("display","none");
		$("#ranquingList").css("visibility", "hidden");
	} else {
		$("#settingsForm").css("display","none");
		$("#ranquingList").css("visibility", "visible");
		reDimRanquingList();
	}
	socket.emit('request_users', {request: 'create_ranquing'});
}

function button_settings () {
	//console.log("button_settings");
	if ($("#settingsForm").css("display") == "block") {
		$("#settingsForm").css("display","none");
		$("#ranquingList").css("visibility", "hidden");
	} else {
		$("#settingsForm").css("display","block");
		$("#ranquingList").css("visibility", "hidden");
	}
}
/** -------------------- **/

/** Interaccion con el servidor de los botones iniciales **/
function form_login() {
	//console.log("form_login()");

	//Motramos la animacion de loading
	$("#container_loading").css("visibility","visible");

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
	//console.log("login_user-OK");

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
	logged = "true";

	//Ocultamos el loading
	$("#container_loading").css("visibility","hidden");
});

socket.on('login_user-KO', function(message) {
	localStorage.removeItem('loginName');
	localStorage.removeItem('loginPass');
	localStorage.setItem("logged", "false");
	logged = "false";

	//console.log("login_user-KO: "+message);
	document.getElementById("loginCorrection").innerHTML = "Usuario o contraseña incorrectos";
	document.getElementById("userNameContainer").innerHTML = ""
	document.form_login_user.loginName.value = "";
	document.form_login_user.loginPass.value = "";

	//Ocultamos el loading
	$("#container_loading").css("visibility","hidden");
});

function form_register() {
	//console.log("form_register()");

	//Mostramos la animacion de loading
	$("#container_loading").css("visibility","visible");

	var registerName = document.form_register_user.registerName.value;
	var registerPass1 = document.form_register_user.registerPass1.value;
	var registerPass2 = document.form_register_user.registerPass2.value;

	if (registerPass1 != registerPass2) {
		//console.log("Las contraseñas no coinciden");
		document.getElementById("registerCorrection").innerHTML = "Las contraseñas no coinciden";
		document.form_register_user.registerPass1.value = "";
		document.form_register_user.registerPass2.value = "";
		//Ocultamos el loading
		$("#container_loading").css("visibility","hidden");
	} else if (registerName != "") {
		socket.emit('register_user', {usuario: registerName, pass: registerPass1});
	} else {
		//console.log('Usuario == ""');
		//Ocultamos el loading
		$("#container_loading").css("visibility","hidden");
	}

	return false;
}

socket.on('register_user-OK', function(message) {
	//console.log("register_user-OK");
	var loginName = document.form_register_user.registerName.value;
	var loginPass = document.form_register_user.registerPass1.value;
	document.form_login_user.loginName.value = loginName;
	document.form_login_user.loginPass.value = loginPass;
	document.getElementById("registerCorrection").innerHTML = "";
	document.form_register_user.registerName.value = "";
	document.form_register_user.registerPass1.value = "";
	document.form_register_user.registerPass2.value = "";
	$("#registerForm").css("display", "none");
	$("#loginForm").css("display", "block");

	//Ocultamos el loading
	$("#container_loading").css("visibility","hidden");

	//Autologin tras registrarnos correctamente
	form_login();
});

socket.on('register_user-KO', function(message) {
	//console.log("register_user-KO: "+message);
	document.getElementById("registerCorrection").innerHTML = "Usuario repetido";
	//Quitar ya que si por mala conexion llegan peticiones retrasadas, el campo queda vacio.
	//Por register_user-OK ya se gestionado todo
	//document.form_register_user.registerName.value = "";

	//Ocultamos el loading
	$("#container_loading").css("visibility","hidden");
});

function mostrarInstrucciones(pagina) {
	//console.log("containerInstrucciones()->pagina: "+pagina);
	var pagina = pagina;

	switch(pagina) {
	case "container_instrucciones1":
		$("#container_instrucciones1").css("display","block");
		$("#container_instrucciones2").css("display","none");
		break;
	case "container_instrucciones2":
		$("#container_instrucciones1").css("display","none");
		$("#container_instrucciones2").css("display","block");
		$("#container_instrucciones3").css("display","none");
		break;
	case "container_instrucciones3":
		$("#container_instrucciones2").css("display","none");
		$("#container_instrucciones3").css("display","block");
		$("#container_instrucciones4").css("display","none");
		break;
	case "container_instrucciones4":
		$("#container_instrucciones3").css("display","none");
		$("#container_instrucciones4").css("display","block");
		$("#container_instrucciones5").css("display","none");
		break;
	case "container_instrucciones5":
		$("#container_instrucciones4").css("display","none");
		$("#container_instrucciones5").css("display","block");
		break;
	default:
		if (($("#container_instrucciones1").css("display") == "block") ||
			($("#container_instrucciones2").css("display") == "block") ||
			($("#container_instrucciones3").css("display") == "block") ||
			($("#container_instrucciones4").css("display") == "block") ||
			($("#container_instrucciones5").css("display") == "block")) {

			$("#container_instrucciones1").css("display","none");
			$("#container_instrucciones2").css("display","none");
			$("#container_instrucciones3").css("display","none");
			$("#container_instrucciones4").css("display","none");
			$("#container_instrucciones5").css("display","none");

			$("#container_botones").css("visibility","visible");
			$("#cuadroPartidaRapida").css("visibility","visible");
		} else {
			pagina = 'container_instrucciones1';
		
			$("#container_instrucciones1").css("display","block");
			$("#container_botones").css("visibility","hidden");
			$("#cuadroPartidaRapida").css("visibility","hidden");
		}
	}
	reDimContainer_instrucciones(pagina);

}

function form_settings() {
	//console.log("form_settings()");
	var mostrarListaEventos = document.form_settings_user.mostrarListaEventosName.checked;
	localStorage.setItem('mostrarListaEventos', mostrarListaEventos);
	//console.log("Mostrar lista eventos: "+mostrarListaEventos);
	var mostrarListaTurnos = document.form_settings_user.mostrarListaTurnosName.checked;
	localStorage.setItem('mostrarListaTurnos', mostrarListaTurnos);
	//console.log("Mostrar lista turnos: "+mostrarListaTurnos);
	var autoLogin = document.form_settings_user.autoLoginName.checked;
	localStorage.setItem('autoLogin', autoLogin);
	//console.log("Autologin: "+autoLogin);

	return false;
}

socket.on('create_ranquing', function(data) {
	//console.log("create_ranquing");
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

	$(".ranquingElems").remove();

	var optionRanquing = localStorage.getItem('optionRanquing');

	var sortedObj = getUsersSorted(optionRanquing, data);
	var maxLoop = (Object.keys(sortedObj)).length;

	console.log("maxOfLoops: "+maxOfLoops);
	if (maxOfLoops < maxLoop) {
		maxLoop = maxOfLoops;
	}

	//Eliminamos el elemento test
	$(".ranquingElems").remove();

	var html = "";
	for (var i = 0; i < maxLoop; i++) {
		var pos = i + 1;
		var percent = (Math.round(((sortedObj[i].stats.wins / sortedObj[i].stats.total)*100))).toString()+"%";
		//No mostramos porcentajes de jugadores que no han jugado partidas
		//console.log("Percent: "+percent);
		if (percent == "NaN%") {
			//Los usuarios nuevos tambien aparecen
			percent = "0%";
			//continue;
		}	
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
	 	gameName = "Juego de "+usuario.substr(0,6);
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
	//console.log("new_player_joined");
	actualizar_partidas();
})

socket.on('new_game_available', function() {
	//console.log("new_game_available");
	actualizar_partidas();
})

socket.on('player_leaved', function() {
	//console.log("player_leaved");
	actualizar_partidas();
}); 

function actualizar_partidas() {
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
			} else { //Esto era para reengancharse a una partida
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

//Partida en sala de espera
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
			//console.log("join_game-OK");
			idPartidaEsperando = data.idPartida;
			enPartidaEsperando = true;
			button_lista_partidas();
		});
		//Muy tricky. Con socket.once solo escuchamos el primer evento que llegue de ese tipo
		socket.once('join_game-KO', function(){
			//console.log("join_game-KO");
			alert("Servidor alerta que no ha sido posible unirse a la partida. Intentalo de nuevo");
			button_lista_partidas();
		});
	}
}

//Partida en sala de espera
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
			//console.log("leave_game-OK");
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
	//console.log("prepararPartida");

	idPartida = datos_iniciales.idPartida;
	jugadores = datos_iniciales.jugadores;

	cartasUsuario.push(datos_iniciales.carta1);
	cartasUsuario.push(datos_iniciales.carta2);
	cartasUsuario.push(datos_iniciales.carta3);

	//Animacion de repartir cartas
	Engine.initCanvas();
	Engine.initJugadores();
	Engine.initPosOrganosJugadores();
	Engine.initPosCartasUsuario();
	Engine.initPosPlayersHandCards();
	Engine.initFinDescartesButton();
	Engine.initPauseButton();

	actualizarCanvasBG();

	//Crea dos arrays para poder buscar informacion comodamente.
	asignarJugadoresAPosiciones();
	asignarPosicionesAJugadores();

	prepararOrganosJugadoresCli();
	moveObjects();

	actualizarCanvasAPO();

	reDimReloadButton(); //Solo para hacerlos visibles
	reDimExitButton(); //Solo para hacerlos visibles
})

function esperarMovimiento(){
	esperarMovSTO = setTimeout(function(){ 
		if (movJugador.tipoMov == "") {
			//console.log("Esperando movimiento");
			esperarMovimiento();
		} else {
			if (turno == usuario) {
				//Comprobamos si hay ganador
				var ganador = checkPartidaTerminada();
				if (ganador != "") {
					console.log("Hemos ganado");
					var data = {
						idPartida: idPartida,
						infoJugadores: infoJugadores,
						ganador: infoJugadores[ganador].nombre,
						organosJugadoresCli: organosJugadoresCli
					}
					socket.emit('terminarPartida', data);
				} else {
					//Si no hay ganador seguimos con el juego
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
					cerrarAyudaCartas();
					socket.emit('siguienteTurnoSrv', newDatos_partida);
				}
			}
		}
	}, 250);
}

function comunicarTiempoAgotado () {
	datos = {
		idPartida: idPartida,
		numTurno: numTurno,
		turno: turno,
		infoJugadores: infoJugadores
	}
	//console.log("Avisamos al servidor que puede haber un jugador inactivo");
	socket.emit('tiempo_agotado', datos);
}

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
		if ((organosJugadoresCli[jugador].comodin == "normal") ||
			(organosJugadoresCli[jugador].comodin == "vacunado") ||
			(organosJugadoresCli[jugador].comodin == "inmunizado")) {
			
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

	//Actualizo datos
	if (datos_partida.movJugador.tipoMov == "abandonarPartida") {
		console.log("Recibido jugador que abandona partida. Actualizo datos y canvas");
		//Actualizo ciertos datos
		//Para eliminar al jugador que abandona de organosJugadoresCli
		for (var i = 0; i < jugadores.length; i++) {
			if (datos_partida.jugadores.indexOf(jugadores[i]) == -1) {
				delete organosJugadoresCli[jugadores[i]];
			}
		}
		//Otros
		jugadores = datos_partida.jugadores;
   		infoJugadores = datos_partida.infoJugadores;
		representarMov(datos_partida.movJugador); //Escribo en el cuadro de movs
		doneResizing(); //Recargo
	}

	//Evitamos replicas
	if (turno == datos_partida.turno) {
		//console.log("Mensajes retrasados");
		return;
	}
	turno = datos_partida.turno;
	movJugador = datos_partida.movJugador;

	clearTimeout(countDownSTO);
	clearTimeout(esperarMovSTO);

	cerrarAyudaCartas();

	//Guante de Latex
	//El jugador de la carta no se descarta
	if ((movJugador.tipoMov == "guanteDeLatex") && (usuario != movJugador.jugOrigen)) {
		objetos[0].src = "";
		objetos[1].src = "";
		objetos[2].src = "";
		descartes[0] = true;
		descartes[1] = true;
		descartes[2] = true;
		finDescarte = false;
		actualizarCanvasAPO();
	}
	//Pero solo le permitimos recuperar sus cartas en SU turno
	if ((finDescarte == false) && (usuario == datos_partida.turno)) {
		$("#descartes_boton").css("visibility","visible");
	}

	idPartida = datos_partida.idPartida;
	jugadores = datos_partida.jugadores;
    infoJugadores = datos_partida.infoJugadores;
	numTurno = datos_partida.numTurno;
	deckOfCards = datos_partida.deckOfCardsPartida;

	if (!(isEmpty(datos_partida.organosJugadoresCli))) {
		for (var jugador in datos_partida.organosJugadoresCli){
			organosJugadoresCli[jugador].cerebro = datos_partida.organosJugadoresCli[jugador].cerebro;
			organosJugadoresCli[jugador].corazon = datos_partida.organosJugadoresCli[jugador].corazon;
			organosJugadoresCli[jugador].higado = datos_partida.organosJugadoresCli[jugador].higado
			organosJugadoresCli[jugador].hueso = datos_partida.organosJugadoresCli[jugador].hueso;
			organosJugadoresCli[jugador].comodin = datos_partida.organosJugadoresCli[jugador].comodin;
		}
		//Lo dejo como aviso a navegantes. Lo de abajo es caca
		//organosJugadoresCli = datos_partida.organosJugadoresCli;
		//Si un jugador ha sido eliminado, tb lo eliminamos de nuestra lista de organosJugadoresCli
		for (var jugador in organosJugadoresCli) {
			if (isEmpty(datos_partida.organosJugadoresCli[jugador])) {
				delete organosJugadoresCli[jugador];
			}
		}
	}

	checkCards();

	representarMov(movJugador);

	//Actualizo despues de procesar mov, pues hasta despues animacion no se resetea todo
	renderCountDown(30, new Date(),"first"); //->setTimeOut

	//Una vez representado el movimiento del jugador, borramos el mov
	movJugador = {
		jugOrigen: "",
		jugDestino: "",
		texto: "",
		tipoMov: "",
		tipoOrgano: "",
		cartasUsadas: []
	};

	esperarMovimiento(); //->setTimeOut
});

function pauseGame(){
	console.log("pauseGame()");

	var datos_partida = {
		idPartida: idPartida
	};

	if (gamePaused == "false") {
		socket.emit('pauseGame', datos_partida);
	} else if (gamePaused == "true") {
		socket.emit('continueGame', datos_partida);
	}
}

socket.on('pauseGame', function(datos_partida) {
	console.log("socket.on->pauseGame");
	gamePaused = "true";
	//Cambiamos color
	$("#pauseButton").css("background-color","red");
	$("#pauseButton").css("background-image","url(css/img/pauseButton.png)");
	clearTimeout(countDownSTO); //->setTimeOut
	clearTimeout(esperarMovSTO); //->setTimeOut
});

socket.on('contineGame', function(datos_partida) {
	console.log("socket.on->continueGame");	
	gamePaused = "false";
	//Cambiamos color
	$("#pauseButton").css("background-color","green");
	$("#pauseButton").css("background-image","url(css/img/continueButton.png)");
	esperarMovimiento(); //->setTimeOut
	renderCountDown(30, new Date()); //->setTimeOut
});

function reloadGame() {
	console.log("reloadGame()");

	doneResizing();
}

function exitGame() {
	console.log("exitGame()");
	$("#sureExitGameButton").css("visibility", "visible");
}

function noExitGame() {
	console.log("noExitGame()");
	$("#sureExitGameButton").css("visibility", "hidden");
}

function yesExitGame() {
	console.log("yesExitGame()");
	$("#sureExitGameButton").css("visibility", "hidden");
	var datos_partida = {
		idPartida: idPartida,
		jugadores: jugadores,
		infoJugadores: infoJugadores,
		turno: turno,
		numTurno : numTurno,
		deckOfCardsPartida: deckOfCards,
		organosJugadoresCli: organosJugadoresCli,
		movJugador: movJugador
	};
	socket.emit('abandonarPartida', datos_partida);
}

socket.on('partidaAbandonadaOK', function(data) {
	console.log("socket.on->partidaAbandonadaOK");	
	//En lugar de volver inmediatamente al menu principal, mostramos cartel de expulsado
	//similar al de haber acabado la partida
	//backTo_InitMenu();

	//Reseteamos cosas
	clearTimeout(countDownSTO);
	clearTimeout(esperarMovSTO);

	//Representamos cuadro fin de partida
	var widthElem = parseInt(($("#cuadroFinPartida").css("width")).replace("px",""));
	var heightElem = parseInt(($("#cuadroFinPartida").css("height")).replace("px",""));
	var marginElem = parseInt(($("#cuadroFinPartida").css("margin")).replace("px",""));
	var borderElem = parseInt(($("#cuadroFinPartida").css("border-width")).replace("px",""));
	var paddingTopElem = parseInt(($("#cuadroFinPartida").css("padding-top")).replace("px",""));
	var paddingLeftElem = parseInt(($("#cuadroFinPartida").css("padding-left")).replace("px",""));

	var posX = (windowWidth - widthElem)/2 - marginElem - borderElem - paddingLeftElem;
	var posY = (windowHeight - heightElem)/2 - marginElem - borderElem - paddingTopElem;
	var posXStr = (Math.floor(posX)).toString()+"px";
	var posYStr = (Math.floor(posY)).toString()+"px";
	$("#cuadroFinPartida").css("left", posXStr);
	$("#cuadroFinPartida").css("top", posYStr);

	$("#cartelFinPartida").css("color", "darkred");
	document.getElementById("cartelFinPartida").innerHTML = "¡HAS abandonado la partida!"
	document.getElementById("jugadorFinPartida").innerHTML = "(Looser)";
	$("#jugadorFinPartida").css("visibility", "visible");

	$("#pauseButton").css("visibility", "hidden");
	$("#listaTurnos").css("visibility", "hidden");
	$("#listaEventos").css("visibility","hidden");
	$("#reloadButton").css("visibility","hidden");
	$("#exitButton").css("visibility","hidden");
	$("#cuadroFinPartida").css("display", "block");

	Engine.varsToInit();
	actualizar_partidas();
});

socket.on('expulsadoPartida', function(data) {
	console.log("socket.on->expulsadoPartida");	
	//En lugar de volver inmediatamente al menu principal, mostramos cartel de expulsado
	//similar al de haber acabado la partida
	//backTo_InitMenu();

	//Reseteamos cosas
	clearTimeout(countDownSTO);
	clearTimeout(esperarMovSTO);

	//Representamos cuadro fin de partida
	var widthElem = parseInt(($("#cuadroFinPartida").css("width")).replace("px",""));
	var heightElem = parseInt(($("#cuadroFinPartida").css("height")).replace("px",""));
	var marginElem = parseInt(($("#cuadroFinPartida").css("margin")).replace("px",""));
	var borderElem = parseInt(($("#cuadroFinPartida").css("border-width")).replace("px",""));
	var paddingTopElem = parseInt(($("#cuadroFinPartida").css("padding-top")).replace("px",""));
	var paddingLeftElem = parseInt(($("#cuadroFinPartida").css("padding-left")).replace("px",""));

	var posX = (windowWidth - widthElem)/2 - marginElem - borderElem - paddingLeftElem;
	var posY = (windowHeight - heightElem)/2 - marginElem - borderElem - paddingTopElem;
	var posXStr = (Math.floor(posX)).toString()+"px";
	var posYStr = (Math.floor(posY)).toString()+"px";
	$("#cuadroFinPartida").css("left", posXStr);
	$("#cuadroFinPartida").css("top", posYStr);

	$("#cartelFinPartida").css("color", "darkred");
	document.getElementById("cartelFinPartida").innerHTML = "¡HAS sido expulsado de la partida!"
	document.getElementById("jugadorFinPartida").innerHTML = "(Por estar inactivo 3 turnos)";
	$("#jugadorFinPartida").css("visibility", "visible");

	$("#pauseButton").css("visibility", "hidden");
	$("#listaTurnos").css("visibility", "hidden");
	$("#listaEventos").css("visibility","hidden");
	$("#reloadButton").css("visibility","hidden");
	$("#exitButton").css("visibility","hidden");
	$("#cuadroFinPartida").css("display", "block");

	Engine.varsToInit();
	actualizar_partidas();
});

socket.on('terminarPartida', function(data){
	console.log("socket.on->terminarPartida");
	//Dibujamos organos por ultima vez
	if (data.organosJugadoresCli != undefined){
		for (var jugador in data.organosJugadoresCli){
			organosJugadoresCli[jugador].cerebro = data.organosJugadoresCli[jugador].cerebro;
			organosJugadoresCli[jugador].corazon = data.organosJugadoresCli[jugador].corazon;
			organosJugadoresCli[jugador].higado = data.organosJugadoresCli[jugador].higado
			organosJugadoresCli[jugador].hueso = data.organosJugadoresCli[jugador].hueso;
			organosJugadoresCli[jugador].comodin = data.organosJugadoresCli[jugador].comodin;
		}
	}
	cerrarAyudaCartas();
	actualizarCanvasMID();

	//Reseteamos cosas
	clearTimeout(countDownSTO);
	clearTimeout(esperarMovSTO);

	//Representamos cuadro fin de partida
	var widthElem = parseInt(($("#cuadroFinPartida").css("width")).replace("px",""));
	var heightElem = parseInt(($("#cuadroFinPartida").css("height")).replace("px",""));
	var marginElem = parseInt(($("#cuadroFinPartida").css("margin")).replace("px",""));
	var borderElem = parseInt(($("#cuadroFinPartida").css("border-width")).replace("px",""));
	var paddingTopElem = parseInt(($("#cuadroFinPartida").css("padding-top")).replace("px",""));
	var paddingLeftElem = parseInt(($("#cuadroFinPartida").css("padding-left")).replace("px",""));

	var posX = (windowWidth - widthElem)/2 - marginElem - borderElem - paddingLeftElem;
	var posY = (windowHeight - heightElem)/2 - marginElem - borderElem - paddingTopElem;
	var posXStr = (Math.floor(posX)).toString()+"px";
	var posYStr = (Math.floor(posY)).toString()+"px";
	$("#cuadroFinPartida").css("left", posXStr);
	$("#cuadroFinPartida").css("top", posYStr);

	$("#cartelFinPartida").css("color", "darkslateblue");
	console.log("usuario: "+usuario);
	console.log("data.ganador: "+data.ganador);
	if (infoJugadores[usuario].nombre.indexOf(data.ganador) > -1) {
		$("#jugadorFinPartida").css("visibility", "hidden");
		document.getElementById("cartelFinPartida").innerHTML = "¡HAS GANADO!";
	} else {
		document.getElementById("cartelFinPartida").innerHTML = "Ha ganado el jugador";
		$("#jugadorFinPartida").css("visibility", "visible");
		document.getElementById("jugadorFinPartida").innerHTML = data.ganador;

	}

	$("#pauseButton").css("visibility", "hidden");
	$("#listaTurnos").css("visibility", "hidden");
	$("#listaEventos").css("visibility","hidden");
	$("#reloadButton").css("visibility","hidden");
	$("#exitButton").css("visibility","hidden");
	$("#cuadroFinPartida").css("display", "block");


	//Pendiene dejar a null variables globales
	idPartida = "";
	infoJugadores = null;
})
/** -------------------- **/

/**  **/
/** -------------------- **/
