

function playSound(soundResource){
	if (soundResource) {
		var currentAudio = new Audio();
		currentAudio.src = soundResource + ".wav";
		currentAudio.play();
	} else {
		console.log("Error: not soundResource");
	}
}

var objetoActual, touch = null;
var posInitObjX, posInitObjY = 0;
var cx, cv = null;
var cxAPO, cvAPO = null;
var cvMID, cxMID = null;
var cvBG, cxBG = null;
var inicioX = 0, inicioY = 0;
var windowWidth, windowHeight = 0;
var objetos = [];
var countDownSTO;
var esperarMovSTO;
var idDoneResizing;

function actualizarCanvasBG (){
	var widthCarta = posCartasUsuario[0];
	var heightCarta = posCartasUsuario[1];
	var posCarta1 = posCartasUsuario[2];
	var posCarta2 = posCartasUsuario[3];
	var posCarta3 = posCartasUsuario[4];

	//Imagen del fondo en BG
	var img0 = new Image();
	img0.src = "img/BG/tapete_verde-claro.jpg";
	img0.onload = function(){
		cxBG.drawImage(img0, 0, 0, windowWidth, windowHeight);
		

		//"Containers" de las diferentes cartas de usuario
		/**var img = new Image();
		img.src = "img/cardImages/reversoCarta.jpg";
		img.onload = function(){
			cxBG.drawImage(img, posCarta1[0], posCarta1[1], widthCarta, heightCarta);
			cxBG.drawImage(img, posCarta2[0], posCarta2[1], widthCarta, heightCarta);
			cxBG.drawImage(img, posCarta3[0], posCarta3[1], widthCarta, heightCarta);
		}**/

		//Imagenes de lso diferentes cubos de basura de la zona de descartes
		var widthCubo = posCubosDescarte.widthCubo;
		var heightCubo = posCubosDescarte.heightCubo;

		var cubo1 = posCubosDescarte[1];
		var img1 = new Image();
		img1.src = "img/descartesImages/cuboAmarillo.png";
		img1.onload = function(){
			cxBG.drawImage(img1, cubo1.x, cubo1.y, widthCubo, heightCubo);

			cxBG.font = "bold 50px Arial";
			cxBG.fillStyle = "rgba(60,179,113,0.1)";
			cxBG.strokeStyle = "rgba(0,0,0,0.1)";
			cxBG.fillText("Zona de descartes", ((windowWidth / 6) * 2), ((windowHeight / 2)));
			cxBG.strokeText("Zona de descartes", ((windowWidth / 6) * 2), ((windowHeight / 2)));
		}
		var cubo2 = posCubosDescarte[2];
		var img2 = new Image();
		img2.src = "img/descartesImages/cuboRojo.png"
		img2.onload = function(){
			cxBG.drawImage(img2, cubo2.x, cubo2.y, widthCubo, heightCubo);

			cxBG.font = "bold 50px Arial";
			cxBG.fillStyle = "rgba(60,179,113,0.1)";
			cxBG.strokeStyle = "rgba(0,0,0,0.1)";
			cxBG.fillText("Zona de descartes", ((windowWidth / 6) * 2), ((windowHeight / 2)));
			cxBG.strokeText("Zona de descartes", ((windowWidth / 6) * 2), ((windowHeight / 2)));
		}
		var cubo3 = posCubosDescarte[3];
		var img3 = new Image();
		img3.src = "img/descartesImages/cuboAzul.png";
		img3.onload = function(){
			cxBG.drawImage(img3, cubo3.x, cubo3.y, widthCubo, heightCubo);

			cxBG.font = "bold 50px Arial";
			cxBG.fillStyle = "rgba(60,179,113,0.1)";
			cxBG.strokeStyle = "rgba(0,0,0,0.1)";
			cxBG.fillText("Zona de descartes", ((windowWidth / 6) * 2), ((windowHeight / 2)));
			cxBG.strokeText("Zona de descartes", ((windowWidth / 6) * 2), ((windowHeight / 2)));
		}
		var cubo4 = posCubosDescarte[4];	
		var img4 = new Image();
		img4.src = "img/descartesImages/cuboVerde.png";
		img4.onload = function(){
			cxBG.drawImage(img4, cubo4.x, cubo4.y, widthCubo, heightCubo);

			cxBG.font = "bold 50px Arial";
			cxBG.fillStyle = "rgba(60,179,113,0.1)";
			cxBG.strokeStyle = "rgba(0,0,0,0.1)";
			cxBG.fillText("Zona de descartes", ((windowWidth / 6) * 2), ((windowHeight / 2)));
			cxBG.strokeText("Zona de descartes", ((windowWidth / 6) * 2), ((windowHeight / 2)));
		}

	}
}

function degToRad(degree) {
		var factor = Math.PI / 180 ;
		return degree * factor;
}

function renderCountDown(time, oldDate){
	//console.log("renderCountDown()");
	var radius = 30;
	var xCountDown = posCubosDescarte[1].x -radius;
	var yCountDown = posCubosDescarte[1].y + radius*6;

	//Cada vez que cambiemos el tiempo del cronometro hay que ajustar el valor
	//multiplicando el tiempo por (60/valorcronometro)
	var ajuste = 2;

	var now = new Date();
	var newMilliseconds = now.getTime();
	var oldMilliseconds = oldDate.getTime();

	var timeLapse = newMilliseconds - oldMilliseconds;

	time = time - (timeLapse / 1000);

	var seconds = Math.floor(time);
	if (seconds < 0){
		seconds = 0;
	}

	//Limpiamos zona particular del canvas + (pxLinea + pxDifuminado)*2
	cxMID.clearRect(xCountDown-10-radius, yCountDown-10-radius, radius*2+20, radius*2+20);

	//Fondo
	cxMID.beginPath();
	cxMID.strokeStyle = '#09303a';
	cxMID.lineWidth = 10;
	cxMID.lineCap = 'black';
	cxMID.shadowBlur = 0;
	cxMID.shadowColor = '#09303a';

	gradient = cxMID.createRadialGradient(250, 250, 5, 250, 250, 300);
	gradient.addColorStop(0, '#09303a');
	gradient.addColorStop(1, 'black');
	cxMID.fillStyle = gradient;
	cxMID.arc(xCountDown,yCountDown,radius, 0, degToRad(360),false);
	cxMID.fill();
	cxMID.stroke();

	//Arco
	cxMID.beginPath();
	cxMID.strokeStyle = '#28d1fa';
	cxMID.lineWidth = 10;
	cxMID.lineCap = 'round';
	cxMID.shadowBlur = 2;
	cxMID.shadowColor = '#28d1fa';

	cxMID.arc(xCountDown,yCountDown,radius, degToRad(270), degToRad(((time*6)*ajuste)-90),false);
	cxMID.stroke();

	//CountDown
	cxMID.beginPath();
	cxMID.font = "20px Arial Bold";
	cxMID.fillStyle = '#28d1fa';
	if (seconds < 10){
		cxMID.fillText(seconds, xCountDown - 5, yCountDown + 8);
	} else {
		cxMID.fillText(seconds, xCountDown - 10, yCountDown + 8);
	}

	//Texto numTurnos (Eliminamos difuminado, color y algunas cosas)
	cxMID.font = "25px Arial Bold";
	cxMID.fillStyle = '#09303a';
	cxMID.shadowBlur = 1;
	cxMID.shadowColor = 'white';
	cxMID.fillText("Turno "+numTurno, xCountDown - 1.3*radius, yCountDown - 45);

	//Vemos si avisamos que nos hemos saltado el turno alguna vez
	if (infoJugadores[usuario].turnosPerdidos > 0) {
		//Solo ponemos la advertencia el siguiente turno al que hemos pasado
		if (infoJugadores[usuario].turnoPerdida + jugadores.length >= numTurno) {
			//¡Cuidado!: Seremos expulsados
			//si perdemos el turno
			//X veces mas
			cxMID.font = "10px Arial Bold";
			cxMID.fillStyle = 'red';
			cxMID.fillText("¡Cuidado!: Seremos expulsados", xCountDown - 2*radius, yCountDown - 45 + radius*3 + 14);
			cxMID.fillText("       si perdemos el turno", xCountDown - 2*radius, yCountDown - 45+ radius*3 +28);
			cxMID.font = "15px Arial Bold";
			var numVeces = infoJugadores[usuario].limiteTurnosPerdidos - infoJugadores[usuario].turnosPerdidos;
			cxMID.fillText("      "+numVeces+" veces mas", xCountDown - 2*radius, yCountDown - 45+ radius*3 + 45);
		}
	}

	countDownSTO = setTimeout(function(){ 
		if (time > 0) {
			renderCountDown(time, now);
		} else {
			console.log("renderCountDown: el tiempo ha llegado a cero");
			//Y nos chivamos al servidor
			comunicarTiempoAgotado();
			//Por si se nos ha pasado el tiempo en medio de un descarte
			fin_descarte();
			//Por si se nos ha pasado el tiempo en medio de un transplante
			fin_transplante();
			movJugador = "tiempo_agotado";

		}
	}, 250);
}

function indicarTurno(turno) {
	//console.log("indicarTurno()-game.js");
	var numJugadores = jugadores.length;
	var index = jugadores.indexOf(turno);
	var posX, posY, widthJug, heightJug = 0;

	//Tengo el jugador veo que pos ocupa
	var posJug = posPorJugador[turno].posicion;

	//Limpiamos el canvas
	cxMID.clearRect(0, 0, windowWidth, windowHeight);

	//Dejamos 20px de margen por cada lado
	posX = posOrganosJugadores[posJug].posCerebro[0]-5-20;
	posY = posOrganosJugadores[posJug].posCerebro[1]-5-20;
	//5px del marco del turno y 20px hasta borde de la pantalla
	widthJug = (posOrganosJugadores[posJug].posComodin[0] - posOrganosJugadores[posJug].posCerebro[0]+posOrganosJugadores[posJug].widthOrgano)+5*2+20*2;
	heightJug =  (posOrganosJugadores[posJug].posComodin[1] - posOrganosJugadores[posJug].posCerebro[1]+posOrganosJugadores[posJug].heightOrgano)+5*2+20*2;
		
	switch (posJug){
	//Posicion 1
	case 1:
		posY = posY-5;
		break;
	//Posicion 2
	case 2:
		posX = posX+5;
		break;
	//Posicion 3
	case 3:
		posY = posY+5;
		break;
	//Posicion 4
	case 4:
		posY = posY+5;
		break;
	//Posicion 5
	case 5:
		posY = posY+5;
		break;
	//Posicion 6
	case 6:
		posX = posX-5;
		break;
	default:
		console.log("Error grave representando los turnos de los jugadores");
	}

	//Creamos un marco para indica el turno de cada jugador
	var gradient = cxMID.createRadialGradient(90,63,30,90,63,90);
	gradient.addColorStop(0, '#FFD700');
	gradient.addColorStop(1, '#DAA520');

	cxMID.fillStyle = gradient;
	cxMID.fillRect(posX, posY, widthJug, heightJug);

	//Creamos el marco de 20 px de grosor
	//console.log("PosX: "+posX);
	//console.log("PosY: "+posY);
	//console.log("widthJug: "+widthJug);
	//console.log("heightJug: "+heightJug);
	cxMID.clearRect(posX + 5, posY + 5, widthJug - 10, heightJug - 10);

	/** Logs para dibujar espacio de descartes
	posX = ((windowWidth / 6) * 1);
	posY = ((windowHeight / 3) * 1);
	widthJug =  (((windowWidth / 6) * 5) - posX);
	heightJug = (((windowHeight / 3) * 2) - posY);
	cxMID.fillStyle = 'red';
	cxMID.fillRect(posX, posY, widthJug, heightJug);**/

	actualizarCanvasMID();
}

function asignarJugadoresAPosiciones(){
	var fin = false;
	var i = 0;
	var contPos = null;
	while (fin != true){
		if (jugadores[i] == usuario){
			contPos = 0;
		}

		if (contPos != null){
			jugPorPosicion[posJugadores[contPos]]= {
				jugador: jugadores[i],
				posicion: posJugadores[contPos]
			};
			//console.log("jugPorPosicion :"+jugPorPosicion[contPos].jugador+", "+jugPorPosicion[contPos].posicion);
			contPos++;
		}
		i++;

		if (i == (jugadores.length)){
			i = 0;
		}
		if (contPos == (jugadores.length)){
			fin = true;
		}

	}
}

function asignarPosicionesAJugadores(){
	for (var pos in jugPorPosicion){
		posPorJugador[jugPorPosicion[pos].jugador] = {
			jugador: jugPorPosicion[pos].jugador,
			posicion: jugPorPosicion[pos].posicion
		}
	}
}

function nuevaCarta(numCarta){
	var newCard = takeCard();
	//console.log("Nueva carta: "+newCard.toString());
	cartasUsuario[numCarta] = newCard;
	objetos[numCarta].src = newCard.picture;
}

//En el canvas mid estan los turnos y los organos de los jugadores
function actualizarCanvasMID(){
	//console.log("actualizarCanvasMID");
	var estadoOrgano, pos;
	var posOrgano = {};
	//Puedo recorrer los jugadores desde el array de jugadores o desde los indices de organosJugadoresCli
	for (var jugador in organosJugadoresCli) {
		pos = organosJugadoresCli[jugador].posicion;
		posOrgano.width = posOrganosJugadores[pos].widthOrgano;
		posOrgano.height = posOrganosJugadores[pos].heightOrgano;

		//posOrganosJug = {widthOrgano, heightOrgano, posCerebro, posCorazon, posHueso, posHigado};
		for (var elem in organosJugadoresCli[jugador]) {
			if (elem == "jugador") {
				//No me hace falta porque con jugador es como voy recorriendo el array
				//jug = organosJugadoresCli[jugador].jugador;
				//console.log("Jugador: "+jug);
				continue;
			} else if (elem == "posicion") {
				//No me hace falta porque en el objeto no hay orden y tengo que saber la pos antes
				//pos = organosJugadoresCli[jugador].posicion;
				//console.log("Posicion jugador: "+pos);
				continue;
			} else {
				//elem = corazon, cerebro etc..				
				switch (elem) {
				case "cerebro":
					posOrgano.tipo = "cerebro";
					posOrgano.x = posOrganosJugadores[pos].posCerebro[0];
					posOrgano.y = posOrganosJugadores[pos].posCerebro[1];
					posOrgano.posJug = pos;
					posOrgano.src = 'img/cardImagesLQ/organos/orgaCerebro.png';
					break;
				case "corazon":
					posOrgano.tipo = "corazon";
					posOrgano.x = posOrganosJugadores[pos].posCorazon[0];
					posOrgano.y = posOrganosJugadores[pos].posCorazon[1];
					posOrgano.posJug = pos;
					posOrgano.src = 'img/cardImagesLQ/organos/orgaCorazon.png';
					break;
				case "higado":
					posOrgano.tipo = "higado";
					posOrgano.x = posOrganosJugadores[pos].posHigado[0];
					posOrgano.y = posOrganosJugadores[pos].posHigado[1];
					posOrgano.posJug = pos;
					posOrgano.src = 'img/cardImagesLQ/organos/orgaHigado.png';					
					break;
				case "hueso":
					posOrgano.tipo = "hueso";
					posOrgano.x = posOrganosJugadores[pos].posHueso[0];
					posOrgano.y = posOrganosJugadores[pos].posHueso[1];
					posOrgano.posJug = pos;
					posOrgano.src = 'img/cardImagesLQ/organos/orgaHueso.png';					
					break;
				case "organoComodin":
					posOrgano.tipo = "organoComodin";
					posOrgano.x = posOrganosJugadores[pos].posComodin[0];
					posOrgano.y = posOrganosJugadores[pos].posComodin[1];
					posOrgano.posJug = pos;
					posOrgano.src = 'img/cardImagesLQ/organos/orgaComodin.png';	
					break;
				default:
					console.log("Fallo en actualizarCanvasMID switch elem-opcion extraña ha aparecido");
					break;
				}

				//estadoOrgano = "", "normal" etc...
				estadoOrgano = organosJugadoresCli[jugador][elem];

				renderOrgano(posOrgano, estadoOrgano);
			}
		}
	}
}

function renderOrgano(posOrgano, estadoOrgano) {
	//console.log("Render organo-estado: "+posOrgano.tipo+"-"+estadoOrgano);
	var x = posOrgano.x;
	var y = posOrgano.y;
	var widthOrgano = posOrgano.width;
	var heightOrgano = posOrgano.height;
	var src = posOrgano.src;

	//Estado organos: vacio, normal, enfermo, vacunado, inmunizado
	//Marco negro en fondo blanco
	if (estadoOrgano == ""){
		cxMID.fillStyle = 'black';
		cxMID.fillRect(x-5, y-5, widthOrgano+10, heightOrgano+10);
		cxMID.fillStyle = 'white';
		cxMID.fillRect(x, y, widthOrgano, heightOrgano);

	}

	//Marco negro en fondo blanco y encima la imagen
	if(estadoOrgano == "normal"){
		cxMID.fillStyle = 'black';
		cxMID.fillRect(x-5, y-5, widthOrgano+10, heightOrgano+10);
		/**cxMID.fillStyle = 'white';
		cxMID.fillRect(x, y, widthOrgano, heightOrgano);**/
		var img1 = new Image();
		img1.src = src;
		img1.onload = function(){
			//console.log("objetos[0] :"+objetos[0]);
			cxMID.drawImage(img1, x, y, widthOrgano, heightOrgano);
		}
	}

	//Marco rojo en fondo blanco y encima la imagen
	if (estadoOrgano == "enfermo"){
		cxMID.fillStyle = 'red';
		cxMID.fillRect(x-5, y-5, widthOrgano+10, heightOrgano+10);
		/**cxMID.fillStyle = 'white';
		cxMID.fillRect(x, y, widthOrgano, heightOrgano);**/
		var img1 = new Image();
		img1.src = src;
		img1.onload = function(){
			//console.log("objetos[0] :"+objetos[0]);
			cxMID.drawImage(img1, x, y, widthOrgano, heightOrgano);
		}
	}

	//Marco azul en fondo blanco y encima la imagen
	if (estadoOrgano == "vacunado"){
		cxMID.fillStyle = 'blue';
		cxMID.fillRect(x-5, y-5, widthOrgano+10, heightOrgano+10);
		/**cxMID.fillStyle = 'white';
		cxMID.fillRect(x, y, widthOrgano, heightOrgano);**/
		var img1 = new Image();
		img1.src = src;
		img1.onload = function(){
			//console.log("objetos[0] :"+objetos[0]);
			cxMID.drawImage(img1, x, y, widthOrgano, heightOrgano);
		}
	}

	//Marco azul en fondo blanco, imagen y encima cuadrado azul semitransparente
	if (estadoOrgano == "inmunizado"){
		cxMID.fillStyle = 'blue';
		cxMID.fillRect(x-5, y-5, widthOrgano+10, heightOrgano+10);
		/**cxMID.fillStyle = 'white';
		cxMID.fillRect(x, y, widthOrgano, heightOrgano);**/
		var img1 = new Image();
		img1.src = src;
		img1.onload = function(){
			//console.log("objetos[0] :"+objetos[0]);
			cxMID.drawImage(img1, x, y, widthOrgano, heightOrgano);
			var img2 = new Image();
			img2.src = "img/cardImagesLQ/cadenas.png";
			img2.onload = function(){
				//console.log("objetos[0] :"+objetos[0]);
				cxMID.drawImage(img2, x-5, y-5, widthOrgano+10, heightOrgano+10);
			}
		}
		/**
		cxMID.globalAlpha = 0.2;
		cxMID.fillStyle = 'blue';
	    cxMID.fillRect(x, y, widthOrgano, heightOrgano);;
	    cxMID.globalAlpha = 1.0;
	    **/
	}
}

function renderOrganosTransplante () {
	//Redimensionamos en relacion al tamaño de la carta
	var heightCard = ($(".imagenCartaIzq").css("height")).replace("px","");;
	var widthCard = (heightCard * (1013/1536)) + "px";
	console.log("heightCard: "+heightCard);
	console.log("widthCard: "+widthCard);

	$(".imagenCartaIzq").css("width", widthCard);
	$(".imagenCartaDcha").css("width", widthCard);
	//Compruebo para dibujar organos
	if (transplante.enProceso == true) {
		switch(transplante.organo1.organo) {
		case "corazon":
			$(".imagenCartaIzq").css("background-image", "url('img/cardImagesLQ/organos/orgaCorazon.png')");
			break;
		case "hueso":
			$(".imagenCartaIzq").css("background-image", "url('img/cardImagesLQ/organos/orgaHueso.png')");
			break;
		case "higado":
			$(".imagenCartaIzq").css("background-image", "url('img/cardImagesLQ/organos/orgaHigado.png')");
			break;
		case "cerebro":
			$(".imagenCartaIzq").css("background-image", "url('img/cardImagesLQ/organos/orgaCerebro.png')");
			break;
		default:
			$(".imagenCartaIzq").css("background-image", "");
			break;
		}
		switch(transplante.organo2.organo) {
		case "corazon":
			$(".imagenCartaDcha").css("background-image", "url('img/cardImagesLQ/organos/orgaCorazon.png')");
			break;
		case "hueso":
			$(".imagenCartaDcha").css("background-image", "url('img/cardImagesLQ/organos/orgaHueso.png')");
			break;
		case "higado":
			$(".imagenCartaDcha").css("background-image", "url('img/cardImagesLQ/organos/orgaHigado.png')");
			break;
		case "cerebro":
			$(".imagenCartaDcha").css("background-image", "url('img/cardImagesLQ/organos/orgaCerebro.png')");
			break;
		default:
			$(".imagenCartaDcha").css("background-image", "");
			break;
		}
	}
}

function removeOrgano1Transplante() {
	console.log("removeOrgano1Transplante()");
	transplante.organo1.organo = "";
	transplante.organo1.numJug = -1;
	renderOrganosTransplante();
}

function removeOrgano2Transplante(){
	console.log("removeOrgano2Transplante()");
	transplante.organo2.organo = "";
	transplante.organo2.numJug = -1;
	renderOrganosTransplante();
}

//Ideas de mejora a futuro ->
//1. Renderizar la imagen que se mueve y las otras a diferente ritmo -> DESCARTADA
//2. Detectar la colision en el canvas de las cartas pero dibujar unicamente la que se mueve en otro sola ->Hecho
//3. Tener las imagenes siempre cargadas y solo dibujarlas en el contexto. Y cuando robo cartas, cargarlas
//4. Posibilidad de dibujar siempre pero borrar solo cada cierta diferencia de pixeles

function actualizarCanvasFrontal() {
	cx.clearRect(0, 0, windowWidth, windowHeight);
	if (objetoActual != null) {
		var img0 = new Image();
		img0.src = objetoActual.src;
		img0.onload = function(){
			//console.log("objetos[0] :"+objetos[0]);
			cx.drawImage(img0, objetoActual.x, objetoActual.y, objetoActual.width, objetoActual.height);
		}
	} else {

	}
}

function actualizarCanvas(){
	//console.log("Actualizar canvas");
	cxAPO.clearRect(0, 0, windowWidth, windowHeight);
	var img1 = new Image();
	if ((objetos[0].src != "") && (descartes[0] == false)){
		//Tratamos de evitar parpadeos moviendo cartas
		if (objetos[0] == objetoActual) {
			console.log("Objeto 1 es el objeto actual");
		} else {
			img1.src = objetos[0].src;
			img1.onload = function(){
				//console.log("objetos[0] :"+objetos[0]);
				cxAPO.drawImage(img1, objetos[0].x, objetos[0].y, objetos[0].width, objetos[0].height);
			}
		}
	}
	var img2 = new Image();
	if ((objetos[1].src != "") && (descartes[1] == false)){
		//Tratamos de evitar parpadeos moviendo cartas
		if (objetos[1] == objetoActual) {
			console.log("Objeto 2 es el objeto actual");
		} else {
			img2.src = objetos[1].src;
			img2.onload = function(){
				//console.log("objetos[1] :"+objetos[1]);
				cxAPO.drawImage(img2, objetos[1].x, objetos[1].y, objetos[1].width, objetos[1].height);
			}
		}
	}
	var img3 = new Image();
	if ((objetos[2].src != "") && (descartes[2] == false)){
		//Tratamos de evitar parpadeos moviendo cartas
		if (objetos[2] == objetoActual) {
			console.log("Objeto 3 es el objeto actual");
		} else {
			img3.src = objetos[2].src;
			img3.onload = function(){
				//console.log("objetos[2] :"+objetos[2]);
				cxAPO.drawImage(img3, objetos[2].x, objetos[2].y, objetos[2].width, objetos[2].height);
			}
		}
	}
}

function moveObjects(){
	var offsetCartasUsuario = 0;
	offsetCartasUsuario = (posCartasUsuario[1] - posCartasUsuario[0]) / 2;

	objetos.push({
		x: posCartasUsuario[2][0], y: posCartasUsuario[2][1] + offsetCartasUsuario,
		xOrigen: posCartasUsuario[2][0], yOrigen: posCartasUsuario[2][1] + offsetCartasUsuario,
		width: posCartasUsuario[0], height: posCartasUsuario[1],
		numCarta: 0,
		src: cartasUsuario[0].picture
	});
	objetos.push({
		x: posCartasUsuario[3][0], y: posCartasUsuario[3][1] + offsetCartasUsuario,
		xOrigen: posCartasUsuario[3][0], yOrigen: posCartasUsuario[3][1] + offsetCartasUsuario,
		width: posCartasUsuario[0], height: posCartasUsuario[1],
		numCarta: 1,
		src: cartasUsuario[1].picture
	});
	objetos.push({
		x: posCartasUsuario[4][0], y: posCartasUsuario[4][1] + offsetCartasUsuario,
		xOrigen: posCartasUsuario[4][0], yOrigen: posCartasUsuario[4][1] + offsetCartasUsuario,
		width: posCartasUsuario[0], height: posCartasUsuario[1],
		numCarta: 2,
		src: cartasUsuario[2].picture
	});

	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
	    console.log('Esto es un dispositivo movil');
		cv.ontouchstart = function(event) {
			touch = event.touches[0];
			//console.log("Ontouchstart");
			for (var i = 0; i < objetos.length; i++) {
				if (objetos[i].x < touch.pageX
				  && (objetos[i].width + objetos[i].x > touch.pageX)
				  && objetos[i].y < touch.pageY
				  && (objetos[i].height + objetos[i].y > touch.pageY)) {

					objetoActual = objetos[i];
					//Chequeamos cartas para divs de ayuda
					var numCarta = objetoActual.numCarta;
					abrirAyudaCartas(numCarta);

					//console.log("Objeto "+i+" TOCADO");
					inicioY = touch.pageY - objetos[i].y;
					inicioX = touch.pageX - objetos[i].x;
					//Optimizar renderizado
					posInitObjX = objetoActual.x;
					posInitObjY = objetoActual.y;
					break;
				}
			}
		}

		cv.ontouchmove = function(event) {
			touch = event.touches[0];
			//console.log("Ontouchmove");
			//Solo actualizamos si movemos y hay algun objeto seleccionado y cada cierta diferencia de pixeles
			if (objetoActual != null) {
				objetoActual.x = touch.pageX - inicioX;
				objetoActual.y = touch.pageY - inicioY;

				//Calculamos la distancia adecuado de renderizado segun diferencia de pixeles
				//Podriamos hacer un producto escalar de x e y pero...pasando!
				var distRend = 5;

				if ( (((posInitObjX - objetoActual.x) > distRend) || 
					((objetoActual.x - posInitObjX) > distRend)) ||
					(((posInitObjY - objetoActual.y) > distRend) || 
					((objetoActual.y - posInitObjY) > distRend)) ) {

					posInitObjX = objetoActual.x;
					posInitObjY = objetoActual.y;
					actualizarCanvasFrontal();
				}

				//Objeto.x: dist x hasta el inicio de la carta
				//Touch.x: punto x de la pagina donde tocas
				//InicioX: distancia desde el limite izq de la carta al punto donde tocas (FIJO al arrastrar)
				//console.log("ObjetoActual.x: "+objetoActual.x);
				//console.log("touch.pageX: "+touch.pageX);
				//console.log("inicioX :"+inicioX);
			}
		}

		cv.ontouchend = function(event) {
			//console.log("Ontouchend");
			if (objetoActual != null){
				checkCollision();
				objetoActual = null; //Ocurra lo que ocurra acabo soltando el objeto
				actualizarCanvas();
				actualizarCanvasFrontal();
			}
			//	2Eliminar o no objeto
			//	3Agregarlo o no a algun sitio
			//4restablecer coordenadas iniciale
			objetoActual = null;
		}
	} else {
		console.log('Esto es un navegador de ordenador');
		cv.onmousedown = function(event) {
			touch = event;
			//console.log("Onmousedown");
			for (var i = 0; i < objetos.length; i++) {
				if (objetos[i].x < touch.pageX
				  && (objetos[i].width + objetos[i].x > touch.pageX)
				  && objetos[i].y < touch.pageY
				  && (objetos[i].height + objetos[i].y > touch.pageY)) {

					objetoActual = objetos[i];
					//Chequeamos cartas para divs de ayuda
					var numCarta = objetoActual.numCarta;
					abrirAyudaCartas(numCarta);

					//console.log("Objeto "+i+" TOCADO");
					inicioY = touch.pageY - objetos[i].y;
					inicioX = touch.pageX - objetos[i].x;
					//Optimizar renderizado
					posInitObjX = objetoActual.x;
					posInitObjY = objetoActual.y;
					break;
				}
			}
		}

		//Movil - ordenador
		cv.onmousemove = function(event) {
			touch = event;
			//console.log("Onmousemove");
			//Solo actualizamos si movemos y hay algun objeto seleccionado y cada cierta diferencia de pixeles
			if (objetoActual != null) {
				objetoActual.x = touch.pageX - inicioX;
				objetoActual.y = touch.pageY - inicioY;

				//Calculamos la distancia adecuado de renderizado segun diferencia de pixeles
				//Podriamos hacer un producto escalar de x e y pero...pasando!
				var distRend = 5;

				if ( (((posInitObjX - objetoActual.x) > distRend) || 
					((objetoActual.x - posInitObjX) > distRend)) ||
					(((posInitObjY - objetoActual.y) > distRend) || 
					((objetoActual.y - posInitObjY) > distRend)) ) {

					posInitObjX = objetoActual.x;
					posInitObjY = objetoActual.y;
					actualizarCanvasFrontal();
				}

				//Objeto.x: dist x hasta el inicio de la carta
				//Touch.x: punto x de la pagina donde tocas
				//InicioX: distancia desde el limite izq de la carta al punto donde tocas (FIJO al arrastrar)
				//console.log("ObjetoActual.x: "+objetoActual.x);
				//console.log("touch.pageX: "+touch.pageX);
				//console.log("inicioX :"+inicioX);
			}
		}

		cv.onmouseup = function(event) {
			//console.log("Onmouseup");
			if (objetoActual != null){
				checkCollision();
				objetoActual = null; //Ocurra lo que ocurra acabo soltando el objeto
				actualizarCanvas();
				actualizarCanvasFrontal();
			}
			//	2Eliminar o no objeto
			//	3Agregarlo o no a algun sitio
			//4restablecer coordenadas iniciale
			objetoActual = null;
		}
	}
}

//Devuelve el numero de la pos. donde ha habido colision, 0 si descarte o -1 si hay error
//Ahora hacemos la colision
function checkCollision() {
	//Si no es mi turno aunque pueda mover los objetos no proceso nada y devuelvo los obj a su origen
	if (turno != usuario){
		objetoActual.x = objetoActual.xOrigen;
		objetoActual.y = objetoActual.yOrigen;
		return;
	}

	//Ojo con poner 3 y 5 antes de 2 y 6 respectivamente porque ayudan a excluir a estas ultimas pues los organos se colocan
	//con respecto a a windowsHeight, anchura de organos y margenes
	var colision = -1;
	//Si la colision es en la zona donde dejamos las cartas, la contamos como -1
	//posCartasUsuario = [widthCarta, heightCarta, posCarta1, posCarta2, posCarta3];
	if ((touch.pageX < (posCartasUsuario[4][0] + posCartasUsuario[0])) && //posCarta3.x + widthCarta
		(touch.pageX > posCartasUsuario[2][0]) && //posCarta1.x
		(touch.pageY < (posCartasUsuario[4][1] + posCartasUsuario[1])) && //posCarta3.y + heightCarta
		(touch.pageY > posCartasUsuario[2][1])) { //posCarta2.y
		//console.log("Colision zona zona dibujo cartas usuario");
		colision = -1;
	}
	//Posicion 1
	else if ((touch.pageX < ((windowWidth / 6) * 4)) &&
		(touch.pageX > ((windowWidth / 6) * 2)) &&
		(touch.pageY > (windowHeight / 3) * 2)) {
		//console.log("Colision zona 1");
		colision = 1;
	}
	//Posicion 4
	else if ((touch.pageX < ((windowWidth / 6) * 4)) &&
		(touch.pageX > ((windowWidth / 6) * 2)) &&
		(touch.pageY < (windowHeight / 3) * 1)) {
		//console.log("Colision zona 4");
		colision = 4;
	}
	//Posicion 3
	else if ((touch.pageX < ((windowWidth / 6) * 2)) &&
		(touch.pageY < (windowHeight / 3) * 1)) {
		//console.log("Colision zona 3");
		colision = 3;
	}
	//Posicion 2 - y no ha cumplido condicion de pos3
	else if (touch.pageX < ((windowWidth / 6) * 1)) {
		//console.log("Colision zona 2");
		colision = 2;
	}
	//Posicion 5
	else if ((touch.pageX > ((windowWidth / 6) * 4)) &&
		(touch.pageY < (windowHeight / 3) * 1)) {
		//console.log("Colision zona 5");
		colision = 5;
	}
	//Posicion 6 - y no ha cumplido condicion de pos5
	else if (touch.pageX > ((windowWidth / 6) * 5)) {
		//console.log("Colision zona 6");
		colision = 6;
	}
	//Posicion 0 (central = descarte)
	else if ((touch.pageX < ((windowWidth / 6) * 5)) &&
		(touch.pageX > (windowWidth / 6) * 1) &&
		(touch.pageY > (windowHeight / 3) * 1) &&
		(touch.pageY < (windowHeight / 3) * 2)) {
		//console.log("Colision zona 0");
		colision = 0;
	}
	//Posicion -1 - Redibujarmos otra vez
	else {
		colision = -1;
	}

	var organoColision = checkCardColision(colision);
	manejadorMov(colision, organoColision, objetoActual.numCarta);

	//Pase lo que pase siempre colocamos todo de nuevo
	touch.pageX = null;
	touch.pageY = null;
	objetoActual.x = objetoActual.xOrigen;
	objetoActual.y = objetoActual.yOrigen;
}

function checkCardColision(colision) {
	var organoColision = "";
	var posX, posY;

	//console.log("checkCardColision() - posPolision: "+colision);

	//He soltado la carta en una posicion que no corresponde a ningún jugador
	if (posOrganosJugadores[colision] == undefined) {
		return;
	}

	var widthOrgano = posOrganosJugadores[colision].widthOrgano;
	var heightOrgano = posOrganosJugadores[colision].heightOrgano;

	//Restamos 5 a cada posX-posY y a widthOrgano y heightOrgano para expresar el borde de la carta
	//Colision cerebro
	posX = posOrganosJugadores[colision].posCerebro[0];
	posY = posOrganosJugadores[colision].posCerebro[1];

	if ( (touch.pageX > (posX - 5)) &&
		(touch.pageX < (posX + widthOrgano + 5)) &&
		(touch.pageY > (posY - 5)) &&
		(touch.pageY < (posY + heightOrgano + 5)) ) {
		organoColision = "cerebro";
	}

	//Colision corazon
	posX = posOrganosJugadores[colision].posCorazon[0];
	posY = posOrganosJugadores[colision].posCorazon[1];

	if ( (touch.pageX > (posX - 5)) &&
		(touch.pageX < (posX + widthOrgano + 5)) &&
		(touch.pageY > (posY - 5)) &&
		(touch.pageY < (posY + heightOrgano + 5)) ) {
		organoColision = "corazon";
	}

	//Colision hueso
	posX = posOrganosJugadores[colision].posHueso[0];
	posY = posOrganosJugadores[colision].posHueso[1];

	if ( (touch.pageX > (posX - 5)) &&
		(touch.pageX < (posX + widthOrgano + 5)) &&
		(touch.pageY > (posY - 5)) &&
		(touch.pageY < (posY + heightOrgano + 5)) ) {
		organoColision = "hueso";
	}

	//Colision higado
	posX = posOrganosJugadores[colision].posHigado[0];
	posY = posOrganosJugadores[colision].posHigado[1];

	if ( (touch.pageX > (posX - 5)) &&
		(touch.pageX < (posX + widthOrgano + 5)) &&
		(touch.pageY > (posY - 5)) &&
		(touch.pageY < (posY + heightOrgano + 5)) ) {
		organoColision = "higado";
	}

	//Colision organoComodin
	posX = posOrganosJugadores[colision].posComodin[0];
	posY = posOrganosJugadores[colision].posComodin[1];

	if ( (touch.pageX > (posX - 5)) &&
		(touch.pageX < (posX + widthOrgano + 5)) &&
		(touch.pageY > (posY - 5)) &&
		(touch.pageY < (posY + heightOrgano + 5)) ) {
		organoColision = "organoComodin";
	}

	//console.log("Colision concreta en organo: "+organoColision);

	return organoColision;
}

function manejadorMov(posDestino, organoColision, numCarta) {
	//console.log("Pos destino del movimiento: "+posDestino);
	//console.log("numCarta-typeOf(numcarta): "+numCarta+("-")+typeof(numCarta));

	//Transplante-block. Si estamos en proceso de transplante no podemos hacer otra cosa hasta acabar
	//if (transplante.enProceso == true) {
		//console.log("Transplante en proceso");
		//return;
	//}

	//Descarte
	if (posDestino == 0) {
		finDescarte = false;
		descartes[numCarta] = true;
		actualizarCanvas();
		$("#descartes_boton").css("display","inline");
	}
	//Descarte-block. Si estamos en proceso de descarte no podemos hacer otra cosa hasta acabar
	if (finDescarte == false) {
		console.log("Descarte en proceso");
		return;
	}

	//He soltado la carta en una posicion que no corresponde a ningún jugador
	if (jugPorPosicion[posDestino] == undefined) {
		//console.log("jugPorPosicion[posDestino] == "+jugPorPosicion[posDestino]);
		return;
	}

	var jugDestino = jugPorPosicion[posDestino].jugador;

	var cardType = cartasUsuario[numCarta].cardType;
	var organType = cartasUsuario[numCarta].organType;

	//Si es un organo y la pos es la mia, evaluo si no lo tengo
	if ((cardType == "organo") && (posDestino == 1)) {
		//console.log("organosJugadoresCli[jugDestino][organType]: "+organosJugadoresCli[jugDestino][organType]);
		//console.log("jugDestino: "+jugDestino);
		//console.log("organtype: "+organType);
		if (organosJugadoresCli[jugDestino][organType] == ""){
			organosJugadoresCli[jugDestino][organType] = "normal";
			movJugador = "algo";
		} else {
			console.log("manejadorMov() - Organo repetido");
		}
	}

	//Si el tipo de organo de la carta es igual al lugar del organo donde la he soltado evaluo
	//O si es tipo comodin evaluo en el sitio donde he soltado
	//O si donde la he soltado es el organo comodin tambien evaluo
	//organType-> tipo del organo de la carta que he jugado
	//organoColision-> tipo del organo del organo destino
	if ((organType == organoColision) || (organType == "comodin") || (organoColision == "organoComodin")) {
		if (cardType == "medicina") {
			//Estado organos: vacio, normal, enfermo, vacunado, inmunizado
			if (organosJugadoresCli[jugDestino][organoColision] == "enfermo") {
				organosJugadoresCli[jugDestino][organoColision] = "normal";
				movJugador = "algo";
			} else if (organosJugadoresCli[jugDestino][organoColision] == "normal") {
				organosJugadoresCli[jugDestino][organoColision] = "vacunado";
				movJugador = "algo";
			} else if (organosJugadoresCli[jugDestino][organoColision] == "vacunado") {
				organosJugadoresCli[jugDestino][organoColision] = "inmunizado";
				movJugador = "algo";
			} else {
				console.log("manejadorMov() - Medicina. Organo inmunizado o no existe");
			}
		}
			
		if (cardType == "virus") {
			//Estado organos: vacio, normal, enfermo, vacunado, inmunizado
			if (organosJugadoresCli[jugDestino][organoColision] == "enfermo") {
				organosJugadoresCli[jugDestino][organoColision] = "";
				movJugador = "algo";
			} else if (organosJugadoresCli[jugDestino][organoColision] == "normal") {
				organosJugadoresCli[jugDestino][organoColision] = "enfermo";
				movJugador = "algo";
			} else if (organosJugadoresCli[jugDestino][organoColision] == "vacunado") {
				organosJugadoresCli[jugDestino][organoColision] = "normal";
				movJugador = "algo";
			} else {
				console.log("manejadorMov() - Virus. Organo inmunizado o no existe");
			}
		}
	}

	if (cardType == "tratamiento") {
		//Estado organos: vacio, normal, enfermo, vacunado, inmunizado
		switch (organType) {
		case "error_medico":
			console.log("manejadorMov() - Error medico");
			var auxCerebro = organosJugadoresCli[jugDestino].cerebro;
			var auxCorazon = organosJugadoresCli[jugDestino].corazon;
			var auxHigado = organosJugadoresCli[jugDestino].higado;
			var auxHueso = organosJugadoresCli[jugDestino].hueso;
			var auxOrganoComodin = organosJugadoresCli[jugDestino].organoComodin;
			organosJugadoresCli[jugDestino].cerebro = organosJugadoresCli[usuario].cerebro;
			organosJugadoresCli[jugDestino].corazon = organosJugadoresCli[usuario].corazon;
			organosJugadoresCli[jugDestino].higado = organosJugadoresCli[usuario].higado;
			organosJugadoresCli[jugDestino].hueso = organosJugadoresCli[usuario].hueso;
			organosJugadoresCli[jugDestino].organoComodin = organosJugadoresCli[usuario].organoComodin;
			organosJugadoresCli[usuario].cerebro = auxCerebro;
			organosJugadoresCli[usuario].corazon = auxCorazon;
			organosJugadoresCli[usuario].higado = auxHigado;
			organosJugadoresCli[usuario].hueso = auxHueso;
			organosJugadoresCli[usuario].organoComodin = auxOrganoComodin;

			movJugador = "algo";
			break;
		case "guante_de_latex":
			console.log("manejadorMov() - Guante de latex");
			movJugador = "guante_de_latex";
			break;
		case "transplante":
			console.log("manejadorMov() - Transplante");
			//Guardo el intercambio
			if (transplante.organo1.numJug == -1) {
				transplante.organo1.organo = organoColision;
				transplante.organo1.numJug = jugDestino;
				console.log("El organo para el cambio 1 es: "+organoColision);

				transplante.enProceso = true;
			} else if (transplante.organo2.numJug == -1) {
				transplante.organo2.organo = organoColision;
				transplante.organo2.numJug = jugDestino;
				console.log("El organo para el cambio 2 es: "+organoColision);
				transplante.enProceso = true;
			}
			renderOrganosTransplante();
			//Evaluo si la jugada esta completa
			if (((transplante.organo1.organo != "") && (transplante.organo1.numJug != -1)) &&
				((transplante.organo2.organo != "") && (transplante.organo2.numJug != -1))) {

				var jug1 = transplante.organo1.numJug;
				var jug2 = transplante.organo2.numJug;
				var organo1 = transplante.organo1.organo;
				var organo2 = transplante.organo2.organo;
				var estadoOrgano1 = organosJugadoresCli[jug1][organo1];
				var estadoOrgano2 = organosJugadoresCli[jug2][organo2];

				//Dos condiciones para que sea legal
				//1: que el tipo de organos sea el mismo (y distintos de "")
				if (organo1 == organo2) {
					console.log("Transplante organos iguales");
					console.log("Organo 1: "+organo1+", estado 1: "+estadoOrgano1);
					console.log("Organo 2: "+organo2+", estado 2: "+estadoOrgano2);
					organosJugadoresCli[jug1][organo1] = estadoOrgano2;
					organosJugadoresCli[jug2][organo2] = estadoOrgano1;
					movJugador = "true";
					fin_transplante();
				}
				//2: si no que los organos, para el cambio esten vacios
				else if ((organosJugadoresCli[jug1][organo2] == "")
					&& (organosJugadoresCli[jug2][organo1] == "")) {

					console.log("Transplante organos no iguales");
					console.log("Organo 1: "+organo1+", estado 1: "+estadoOrgano1);
					console.log("Organo 2: "+organo2+", estado 2: "+estadoOrgano2);
					organosJugadoresCli[jug1][organo2] = estadoOrgano2;
					organosJugadoresCli[jug2][organo1] = estadoOrgano1;
					organosJugadoresCli[jug1][organo1] = "";
					organosJugadoresCli[jug2][organo2] = "";
					movJugador = "true";
					fin_transplante();
				} else {
					console.log("El transplante no ha sido posible");
					console.log("Organo 1: "+organo1+", estado 1: "+estadoOrgano1);
					console.log("Organo 2: "+organo2+", estado 2: "+estadoOrgano2);
				}
			}
			break;
		case "ladron_de_organos":
			console.log("manejadorMov() - Ladron de organos");
			//Si no tengo el organo destino y se puede lo robo
			if (organosJugadoresCli[usuario][organoColision] == "") {
				var estadoOrgano = organosJugadoresCli[jugDestino][organoColision];
				if ((estadoOrgano == "vacunado") ||
					(estadoOrgano == "normal") ||
					(estadoOrgano == "enfermo")) {

					organosJugadoresCli[usuario][organoColision] = estadoOrgano;
					organosJugadoresCli[jugDestino][organoColision] = "";
					movJugador = "true";
				}
			}
			break;
		case "contagio":
			//Mov valido pero de momento no hacemos nada
			console.log("Contagio");
			movJugador = "true";
			break;
		default:
			console.log("Error grave en manejadorMov()-switch tratamiento");
		}
	}
	
	if (movJugador != "") {
		//console.log("Movimiento valido");
		nuevaCarta(numCarta);
	} else {
		//console.log("Movimiento no valido");
	}
}

function fin_descarte() {
	finDescarte = true;
	$("#descartes_boton").css("display","none");
	if (descartes[0] == true) {
		nuevaCarta(0);
	}
	if (descartes[1] == true) {
		nuevaCarta(1);
	}
	if (descartes[2] == true) {
		nuevaCarta(2);
	}

	descartes[0] = false;
	descartes[1] = false;
	descartes[2] = false;
	movJugador = "algo";
	actualizarCanvas();
}

function fin_transplante() {
	transplante.enProceso = false;
	transplante.organo1.organo = "";
	transplante.organo1.numJug = -1;
	transplante.organo2.organo = "";
	transplante.organo2.numJug = -1;
}

function reDimPartidaRapida() {
	//console.log("reDimPartidaRapida()");

	//Partida Rapida
	//Derecha de boton jugar
	//var elemBotonJug = document.getElementById('boton_jugar');
	//var posBotonJug = elemBotonJug.getBoundingClientRect();
	//var posX = (Math.floor(posBotonJug.left + posBotonJug.width + 10)).toString()+"px";
	//var posY = (Math.floor(posBotonJug.top + posBotonJug.height -110)).toString()+"px";

	//Izquierda de boton jugar
	var elemBotonJug = document.getElementById('boton_jugar');
	var posBotonJug = elemBotonJug.getBoundingClientRect();

	$("#cuadroPartidaRapida").css("display", "block");
	var elemPartidaRapida = document.getElementById('cuadroPartidaRapida');
	var posPartRapida = elemPartidaRapida.getBoundingClientRect();

	var posX = (Math.floor(posBotonJug.left - posPartRapida.width - 10)).toString()+"px";
	var posY = (Math.floor(posBotonJug.top + posBotonJug.height -110)).toString()+"px";

	console.log("posX: "+posX+", posY: "+posY);
	$("#cuadroPartidaRapida").css("left", posX);
	$("#cuadroPartidaRapida").css("top", posY);
}

function reDimRanquingList() {
	//console.log("reDimRanquingList()");
	var elemBotonJug = document.getElementById('boton_jugar');
	var posBotonJug = elemBotonJug.getBoundingClientRect();

	console.log("windowWidth: "+windowWidth);

	var widthRanquingList = (Math.floor(windowWidth - (posBotonJug.left + posBotonJug.width) - 40)).toString() + "px";

	$("#ranquingList").css("width", widthRanquingList);
}

function reDimContainer_instrucciones(pagina) {
	//Si redimensionamos, que le den, cerramos las instrucciones y que las habra por procedimiento normal
	if (pagina == undefined) {
		return;
	}

	var elemBotonInstrucciones = document.getElementById('instrucciones');
	var posBotonInstrucciones = elemBotonInstrucciones.getBoundingClientRect();

	var elemContainer_botones = document.getElementById('container_botones');
	var posContainer_botones = elemContainer_botones.getBoundingClientRect();

	var elemRegister = document.getElementById('register');
	var posRegister = elemRegister.getBoundingClientRect();

	//var widthContainer_intrucciones = (Math.floor(windowWidth - posContainer_botones.right - 40)).toString() + "px";
	var widthContainer_intrucciones = (Math.floor(windowWidth / 2)).toString() + "px";
	$("#container_instrucciones1").css("width", widthContainer_intrucciones);
	$("#container_instrucciones2").css("width", widthContainer_intrucciones);
	$("#container_instrucciones3").css("width", widthContainer_intrucciones);
	$("#container_instrucciones4").css("width", widthContainer_intrucciones);
	$("#container_instrucciones5").css("width", widthContainer_intrucciones);

	var leftContainer_instrucciones = (Math.floor(posBotonInstrucciones.right + 10)).toString() + "px";
	$("#container_instrucciones1").css("left", leftContainer_instrucciones);
	$("#container_instrucciones2").css("left", leftContainer_instrucciones);
	$("#container_instrucciones3").css("left", leftContainer_instrucciones);
	$("#container_instrucciones4").css("left", leftContainer_instrucciones);
	$("#container_instrucciones5").css("left", leftContainer_instrucciones);

	var bottomContainer_instrucciones = (Math.floor(windowHeight - posBotonInstrucciones.bottom)).toString() + "px"; 
	console.log("windowHeight: "+windowHeight);
	$("#container_instrucciones1").css("bottom", bottomContainer_instrucciones);
	$("#container_instrucciones2").css("bottom", bottomContainer_instrucciones);
	$("#container_instrucciones3").css("bottom", bottomContainer_instrucciones);
	$("#container_instrucciones4").css("bottom", bottomContainer_instrucciones);
	$("#container_instrucciones5").css("bottom", bottomContainer_instrucciones);

	var elemContainer_instrucciones = document.getElementById(pagina);
	var posContainer_instrucciones = elemContainer_instrucciones.getBoundingClientRect();

	if (posContainer_instrucciones.top < (posRegister.bottom + 5)) {
		var newWidth = (Math.floor(windowWidth - posBotonInstrucciones.right - 50)).toString() + "px";
		$("#"+pagina).css("width", newWidth);

		/** En el caso de necesitar un segundo ajuste..pero meh
		var elemContainer_instrucciones = document.getElementById(pagina);
		var posContainer_instrucciones = elemContainer_instrucciones.getBoundingClientRect();
		if (posContainer_instrucciones.top < (posRegister.bottom + 5)) {
			var newWidth
			var heightContainer_instrucciones = (Math.floor(posBotonInstrucciones.top - posRegister.bottom - 10)).toString() + "px"; 
			$("#container_instrucciones1").css("max-height", heightContainer_instrucciones);
			$("#container_instrucciones2").css("max-height", heightContainer_instrucciones);
			$("#container_instrucciones3").css("max-height", heightContainer_instrucciones);
			$("#container_instrucciones4").css("max-height", heightContainer_instrucciones);
			$("#container_instrucciones5").css("max-height", heightContainer_instrucciones);
		}**/
	}
}

function doneResizing() {
	console.log("Pantalla modificada");
	windowWidth = window.innerWidth;
	windowHeight = window.innerHeight;
	
	reDimPartidaRapida();
	reDimRanquingList();
	reDimContainer_instrucciones();

	//Redimensionamos la configuracion inicial
	/**
	Engine.initCanvas();
	Engine.initJugadores();
	Engine.initPosOrganosJugadores();
	Engine.initCubosDescarte();
	Engine.initPosCartasUsuario();
	Engine.initFinDescartesButton();

	actualizarCanvasBG();
	actualizarCanvasMID();
	indicarTurno(turno);
	actualizarCanvas();
	actualizarCanvasFrontal();**/
}

$(document).ready(function(){
	console.log("Document Ready");
	console.log("Orientation before lock is: "+screen.orientation.type);
	//Da error en el navegador, pero no para la ejecucion
	screen.orientation.lock('landscape');

	window.onload = function(){
		console.log("Window onload");

		//Controlamos el resizing de la ventana
		$(window).resize(function() {
		    clearTimeout(idDoneResizing);
		    idDoneResizing = setTimeout(doneResizing, 50);	 
		});
	}
})


