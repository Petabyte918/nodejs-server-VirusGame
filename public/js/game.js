

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
var imgOnload = {}; //Reuso de imagenes ya cargadas una vez
var windowWidth, windowHeight = 0;
var objetos = [];
var countDownSTO;
var esperarMovSTO;
var idDoneResizing;
var reDimCanvasON = true;

function actualizarCanvasBG(){

	//Imagen del fondo en BG
	var img0 = new Image();
	img0.src = "img/BG/tapete_verde-claro.jpg";
	img0.onload = function(){
		cxBG.drawImage(img0, 0, 0, windowWidth, windowHeight);

		//Mazo de cartas y mazo de descartes
		DeckOfCards.reDimDeckOfCards();
	}
}

function degToRad(degree) {
		var factor = Math.PI / 180 ;
		return degree * factor;
}

function renderCountDown(time, oldDate, first){
	//console.log("renderCountDown()");

	var radius = CountDown.getRadius();;
	//Algo hardCoding. El 84 es la altura de pauseButton..claro, que tp se va a cambiar y estas hasta los huevos
	var xCountDown = CountDown.getPosX();
	var yCountDown = CountDown.getPosY();

	var posYtextoTurno = CountDown.getPosYtextoTurno();
	var heightTextoTurno = CountDown.getHeightTextoTurno();

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
	cxMID.clearRect(xCountDown - radius - 13, yCountDown - radius - 13, radius*2 + 26, radius*2 + 26);

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

	//Evitamos redibujar texto en cada ciclo del crono (Eliminamos difuminado, color raro...etc)
	if ((first == "first") || (reDimCanvasON == true)) {
		reDimCanvasON = false;
		
		//Limpiamos zona particular del canvas
		cxMID.clearRect(xCountDown - radius - 13 - 30, posYtextoTurno - 20, radius * 2 + 26 + 60, 20);

		//Numero de turno
		cxMID.font = "900 25px Arial";
		cxMID.fillStyle = 'black';
		cxMID.shadowBlur = 1;
		cxMID.shadowColor = 'white';
		cxMID.fillText("Turno "+numTurno, xCountDown - 1.5*radius, posYtextoTurno);

		//Vemos si avisamos que nos hemos saltado el turno alguna vez
		if (infoJugadores[usuario].turnosPerdidos > 0) {
			//Solo ponemos la advertencia el siguiente turno al que hemos pasado
			if (infoJugadores[usuario].turnoPerdida + jugadores.length >= numTurno) {
				//¡Cuidado!: Seremos expulsados
				//si perdemos el turno
				//X veces mas
				cxMID.font = "12px Arial bold";
				cxMID.fillStyle = 'red';
				cxMID.fillText("¡Cuidado!: Seremos expulsados", xCountDown - 2*radius, yCountDown - 45 + radius*3 + 14 + 25);
				cxMID.fillText("       si perdemos el turno", xCountDown - 2*radius, yCountDown - 45 + radius*3 +28 + 25);
				cxMID.font = "15px Arial Bold";
				var numVeces = infoJugadores[usuario].limiteTurnosPerdidos - infoJugadores[usuario].turnosPerdidos;
				cxMID.fillText("      "+numVeces+" veces mas", xCountDown - 2*radius, yCountDown - 45 + radius*3 + 45 + 25);
			}
		}
	}

	countDownSTO = setTimeout(function(){ 
		if (time > 0) {
			renderCountDown(time, now, "others");
		} else {
			//console.log("renderCountDown: el tiempo ha llegado a cero");
			//Y nos chivamos al servidor
			comunicarTiempoAgotado();
			//Por si se nos ha pasado el tiempo en medio de un descarte
			descartes[0] = false;
			descartes[1] = false;
			descartes[2] = false;
			fin_descarte();
			//Por si se nos ha pasado el tiempo en medio de un transplante
			fin_transplante();
		}
	}, 250);
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
	//console.log("Nueva carta: "+newCard.toString());
	var newCard = takeCard();

	var imgSrc = 'img/cardImagesLQ/reverseCardLQ.png'
	var posXInitMov = DeckOfCards.getDeckData("posX");
	var posYInitMov = DeckOfCards.getDeckData("posY");
	var widthInitMov = DeckOfCards.getDeckData("width");
	var heightInitMov = DeckOfCards.getDeckData("height");

	var posXFinalMov = posCartasUsuario["carta"+(numCarta+1)].x;
	var posYFinalMov = posCartasUsuario["carta"+(numCarta+1)].y;
	var widthFinalMov = posCartasUsuario.width;
	var heightFinalMov = posCartasUsuario.height;

	moverCartaJugada(500, 20, imgSrc, posXInitMov, posYInitMov, widthInitMov, heightInitMov, posXFinalMov, posYFinalMov, widthFinalMov, heightFinalMov);

	setTimeout(function() {
		cartasUsuario[numCarta] = newCard;
		cartasUsuario[numCarta].numCarta = numCarta;
		objetos[numCarta].src = newCard.picture;
		actualizarCanvasAPO();
	}, 610);
}

function representarMov(movJugador) {
	console.log("representarMov(movJugador)");

	//Si es primer turno no hay movimiento que representar
	if (movJugador.tipoMov == "empezarTurnos") {
		doneResizing(); //Resetea todo
		return;
	}

	//Escribimos el evento en la lista de eventos
	escribirEvento(movJugador);

	//Si es descarte ponemos las cartas usadas en el mazo de descartes
	if (movJugador.tipoMov == "descarte") {
		var cartasUsadas = movJugador.cartasUsadas;
		if (movJugador.jugOrigen == usuario) { //Si somos nosotros vemos el descarte inmediatamente
			for (var i = 0; i < cartasUsadas.length; i++) {
				descartesHist.push(cartasUsadas[i]);
			}
			DeckOfCards.initDeckOfCards();
			DeckOfCards.renderDescarte();
		} else { //Si no, lo vemos tras la animacion
			setTimeout(function(){
				for (var i = 0; i < cartasUsadas.length; i++) {
					descartesHist.push(cartasUsadas[i]);
				}
				DeckOfCards.initDeckOfCards();
				DeckOfCards.renderDescarte();
			}, 1500);
		}
	}

	//Movimiento de cartas simples
	var tipoOrgano = "";
	switch (movJugador.tipoMov) {
	case "organo":
	case "virus":
	case "medicina":
		tipoOrgano = "pos"+mayusPrimera(movJugador.tipoOrgano);

		var posJug = posPorJugador[movJugador.jugDestino].posicion;
		var posXFinalMov = posOrganosJugadores[posJug][tipoOrgano][0];
		var posYFinalMov = posOrganosJugadores[posJug][tipoOrgano][1];
		var widthFinalMov = posOrganosJugadores[posJug].widthOrgano;
		var heightFinalMov = posOrganosJugadores[posJug].heightOrgano;
		break;
	case "descarte":
		var posXFinalMov = DeckOfCards.getDescartesData("posX");
		var posYFinalMov = DeckOfCards.getDescartesData("posY");
		var widthFinalMov = DeckOfCards.getDescartesData("width");
		var heightFinalMov = DeckOfCards.getDescartesData("height");
		break;
	}
	//Solo redibujo todo tras las animaciones. Antes, unicamente  limpia la pantalla del countDown y la lista de turnos
	reDimListaTurnos();
	if ( (movJugador.tipoMov == "organo") || (movJugador.tipoMov == "virus") || (movJugador.tipoMov == "medicina") || (movJugador.tipoMov == "descarte") ) {
		//Mostramos la carta jugada y un pequeño delay para dar tiempo a verla
		if (movJugador.jugOrigen != usuario) {
			var cartasUsadas = movJugador.cartasUsadas;
			for (var i = 0; i < cartasUsadas.length; i++) {
				mostrarCartaJugada(1000, 50, movJugador.jugOrigen, movJugador.cartasUsadas[i].picture, movJugador.cartasUsadas[i].numCarta);			
				var posJug = posPorJugador[movJugador.jugOrigen].posicion;
				var carta = "carta"+(movJugador.cartasUsadas[i].numCarta+1);

				var posXInicial = posPlayersHandCards[posJug][carta].x;
				var posYInicial = posPlayersHandCards[posJug][carta].y;
				var widthInicial = posPlayersHandCards.widthCarta;
				var heightInicial = posPlayersHandCards.heightCarta;
				setTimeout(moverCartaJugada, 1000, 500, 20, movJugador.cartasUsadas[i].picture, posXInicial, posYInicial, widthInicial, heightInicial, posXFinalMov, posYFinalMov, widthFinalMov, heightFinalMov);
			}
			setTimeout('doneResizing()', 1510);
		} else {
			doneResizing(); //Si es tu turno actualizamos e inmediatamente
		}
	}

	//Movimiento de cartas menos simples
	if (movJugador.tipoMov == "ladronDeOrganos") {
		if (movJugador.jugOrigen != usuario) {
			mostrarCartaJugada(1000, 50, movJugador.jugOrigen, movJugador.cartasUsadas[0].picture, movJugador.cartasUsadas[0].numCarta);			
			var posJug = posPorJugador[movJugador.jugOrigen].posicion;
			var posJugDest = posPorJugador[movJugador.cartasUsadas[1].jugPropietario].posicion;
			var tipoOrgano = "pos"+mayusPrimera(movJugador.cartasUsadas[1].organType);
			var carta = "carta"+(movJugador.cartasUsadas[0].numCarta+1); //Carta de la mano para mostrar

			var posXInicial = posPlayersHandCards[posJug][carta].x;
			var posYInicial = posPlayersHandCards[posJug][carta].y;
			var widthInicial = posPlayersHandCards.widthCarta;
			var heightInicial = posPlayersHandCards.heightCarta;

			//Movemos el ladron de organos al organo
			var posXFinalMov = posOrganosJugadores[posJugDest][tipoOrgano][0];
			var posYFinalMov = posOrganosJugadores[posJugDest][tipoOrgano][1];
			var widthFinalMov = posOrganosJugadores[posJugDest].widthOrgano;
			var heightFinalMov = posOrganosJugadores[posJugDest].heightOrgano;
			setTimeout(moverCartaJugada, 1000, 1000, 20, movJugador.cartasUsadas[0].picture, posXInicial, posYInicial, widthInicial, heightInicial, posXFinalMov, posYFinalMov, widthFinalMov, heightFinalMov);
			
			//Movemos el organo hasta los organos del usuario
			var posXFinalMov1 = posOrganosJugadores[posJug][tipoOrgano][0];
			var posYFinalMov1 = posOrganosJugadores[posJug][tipoOrgano][1];
			var widthFinalMov1 = posOrganosJugadores[posJug].widthOrgano;
			var heightFinalMov1 = posOrganosJugadores[posJug].heightOrgano;
			setTimeout(moverCartaJugada, 2000, 1000, 20, movJugador.cartasUsadas[1].picture, posXFinalMov, posYFinalMov, widthFinalMov, heightFinalMov, posXFinalMov1, posYFinalMov1, widthFinalMov1, heightFinalMov1);
			
			setTimeout('doneResizing()', 3020);
		} else {
			doneResizing(); //Si es tu turno actualizamos e inmediatamente
		}
	}

	if (movJugador.tipoMov == "transplante") {
		if (movJugador.jugOrigen != usuario) {
			mostrarCartaJugada(1000, 50, movJugador.jugOrigen, movJugador.cartasUsadas[0].picture, movJugador.cartasUsadas[0].numCarta);			
			var posJug = posPorJugador[movJugador.jugOrigen].posicion;
			var posJugDest1 = posPorJugador[movJugador.cartasUsadas[1].jugPropietario].posicion;
			var posJugDest2 = posPorJugador[movJugador.cartasUsadas[2].jugPropietario].posicion;
			var tipoOrgano = "pos"+mayusPrimera(movJugador.cartasUsadas[1].organType);
			var carta = "carta"+(movJugador.cartasUsadas[0].numCarta+1); //Carta de la mano para mostrar

			var posXInicial = posPlayersHandCards[posJug][carta].x;
			var posYInicial = posPlayersHandCards[posJug][carta].y;
			var widthInicial = posPlayersHandCards.widthCarta;
			var heightInicial = posPlayersHandCards.heightCarta;

			//Movemos el transplante al organo1
			var posXFinalMov1 = posOrganosJugadores[posJugDest1][tipoOrgano][0];
			var posYFinalMov1 = posOrganosJugadores[posJugDest1][tipoOrgano][1];
			var widthFinalMov1 = posOrganosJugadores[posJugDest1].widthOrgano;
			var heightFinalMov1 = posOrganosJugadores[posJugDest1].heightOrgano;
			setTimeout(moverCartaJugada, 1000, 1000, 20, movJugador.cartasUsadas[0].picture, posXInicial, posYInicial, widthInicial, heightInicial, posXFinalMov1, posYFinalMov1, widthFinalMov1, heightFinalMov1);
			//Movemos el organo 1 hasta los organos del usuario 2
			var posXFinalMov2 = posOrganosJugadores[posJugDest2][tipoOrgano][0];
			var posYFinalMov2 = posOrganosJugadores[posJugDest2][tipoOrgano][1];
			var widthFinalMov2 = posOrganosJugadores[posJugDest2].widthOrgano;
			var heightFinalMov2 = posOrganosJugadores[posJugDest2].heightOrgano;
			setTimeout(moverCartaJugada, 2000, 1000, 20, movJugador.cartasUsadas[1].picture, posXFinalMov1, posYFinalMov1, widthFinalMov1, heightFinalMov1, posXFinalMov2, posYFinalMov2, widthFinalMov2, heightFinalMov2);
			
			//Movemos el transplante al organo2
			setTimeout(moverCartaJugada, 1000, 1000, 20, movJugador.cartasUsadas[0].picture, posXInicial, posYInicial, widthInicial, heightInicial, posXFinalMov2, posYFinalMov2, widthFinalMov2, heightFinalMov2);
			//Movemos el organo 2 hasta los organos del usuario 1
			setTimeout(moverCartaJugada, 2000, 1000, 20, movJugador.cartasUsadas[1].picture, posXFinalMov2, posYFinalMov2, widthFinalMov2, heightFinalMov2, posXFinalMov1, posYFinalMov1, widthFinalMov1, heightFinalMov1);
			
			setTimeout('doneResizing()', 3020);
		} else {
			doneResizing(); //Si es tu turno actualizamos e inmediatamente
		}
	}
}

function mostrarCartaJugada(tiempoTotal, tiempoRefresco, jugador, imgSrc, numCarta) {
	console.log("mostrarCartaJugada()");

	var carta = "carta"+(numCarta+1);
	var frames = (tiempoTotal / tiempoRefresco);

	//Pintamos cada carta
	var img1 = new Image();
	img1.src = 'img/cardImagesLQ/reverseCardLQ.png';
	var img2 = new Image();
	img2.src = imgSrc;
	img1.onload = function() {
		img2.onload = function() {
			var posJug = posPorJugador[jugador].posicion;

			var posXInicial = posPlayersHandCards[posJug][carta].x;
			var posXFinalGiro = posPlayersHandCards[posJug][carta].x + posPlayersHandCards.widthCarta;
			var posYInicial = posPlayersHandCards[posJug][carta].y;
			var posYFinalGiro = posPlayersHandCards[posJug][carta].y + posPlayersHandCards.heightCarta;
			var widthInicial = posPlayersHandCards.widthCarta;
			var heightInicial = posPlayersHandCards.heightCarta;

			var movFrame = (posXFinalGiro - posXInicial) / frames;

			var posX = posXInicial;
			var posY = posYInicial;
			var width = widthInicial;
			var height = heightInicial;

			//console.log("posXInicial, posXFinal, posYInicial, posYFinal, widthInicial, heightInicial: "+
				//posXInicial+", "+posXFinal+", "+posYInicial+", "+posYFinal+", "+widthInicial+", "+heightInicial);

			//Renderiza la primera mitad del giro
			function renderFrameReverse() {
				cxAPO.clearRect(posXInicial, posYInicial, widthInicial, heightInicial);
				
			    posX = posX + movFrame;
			    width = width - movFrame*2;

				cxAPO.drawImage(img1, posX, posY, width, height);

				if (posX >= (posXFinalGiro - movFrame*(frames/2 +1))) {
			     	clearInterval(idInterval);
			     	idInterval = setInterval(renderFrameCard, tiempoRefresco);
			    } 
			}
			//Renderiza la segunda mitad del giro
			function renderFrameCard() {
				cxAPO.clearRect(posXInicial, posYInicial, widthInicial, heightInicial);
				
			    posX = posX + movFrame;
			    width = width - movFrame*2;

				cxAPO.drawImage(img2, posX, posY, width, height);

				if (posX >= (posXFinalGiro - movFrame)) {
			     	clearInterval(idInterval);
			    } 
			}
			var idInterval = setInterval(renderFrameReverse, tiempoRefresco);
		}
	}
}

function moverCartaJugada(tiempoTotal, tiempoRefresco, imgSrc,
	posXInicial, posYInicial, widthInicial, heightInicial, 
	posXFinal, posYFinal, widthFinal, heightFinal) {

	console.log("moverCartaJugada()");

	var framesTotal = (tiempoTotal / tiempoRefresco);
	var movFrameX = (posXFinal - posXInicial) / framesTotal;
	var movFrameY = (posYFinal - posYInicial) / framesTotal;
	var incrWidth = (widthFinal - widthInicial) / framesTotal;
	var incrHeight = (heightFinal - heightInicial) / framesTotal;

	var posX = posXInicial;
	var posY = posYInicial;
	var width = widthInicial;
	var height = heightInicial;

	var img = new Image();
	img.src = imgSrc;
	img.onload = function() {

		function renderFrame() {
	 		cx.clearRect(posX, posY, width, height);

	 		posX = posX + movFrameX;
	 		posY = posY + movFrameY;
	 		width = width + incrWidth;
	 		height = height + incrHeight;

	 		if ((posXInicial <= posXFinal) && ((posX + movFrameX) >= posXFinal) ) {
	 			clearInterval(idInterval);
	 		} else if ((posXInicial > posXFinal) && ((posX + movFrameX) < posXFinal) ) {
	 			clearInterval(idInterval);
	 		} else {
	 			cx.drawImage(img, posX, posY, width, height);	 					
	 		}
	 	}
	 	var idInterval = setInterval(renderFrame, tiempoRefresco);
	}
}

function escribirEvento(movJugador) {
	//console.log("escribirEvento()");

	//Si es el primer turno no hay eventos
	if (movJugador.tipoMov == "empezarTurnos") {
		return;
	}

	//Protegemos -- destino puede ser null o estar vacio
	if (isEmpty(infoJugadores[movJugador.jugOrigen])) {
		var jugOrigen = movJugador.jugOrigen;
	} else {
		var jugOrigen = infoJugadores[movJugador.jugOrigen].nombre;
	}

	//Protegemos -- destino puede ser null o estar vacio
	if (isEmpty(infoJugadores[movJugador.jugDestino])) {
		var jugDestino = movJugador.jugDestino;
	} else {
		var jugDestino = infoJugadores[movJugador.jugDestino].nombre;
	}


	var texto = movJugador.texto;
	var tipoMov = movJugador.tipoMov;
	var tipoOrgano = movJugador.tipoOrgano;

	if (movJugador.jugOrigen == usuario) {
		jugOrigen = " TU MISMO";
	}

	if (movJugador.jugDestino == usuario) {
		jugOrigen = " TU MISMO";
	}

	var evento = "";

	switch (tipoMov) {
	case "expulsion":
		evento = "<p><b>"+numTurno+" -- </b>Se ha expulsado al jugador <b>"+jugOrigen+"</b> por perder el turno demasiadas veces.</p>";
		break;
	case "abandonarPartida":
		evento = "<p><b>"+numTurno+" -- </b>El jugador <b>"+jugOrigen+"</b> ha abandonado la partida.</p>";
		break;
	case "tiempo_agotado":
		evento = "<p><b>"+numTurno+" -- </b>El jugador <b>"+jugOrigen+"</b> ha perdido el turno por agotar el tiempo.</p>";
		break;
	case "descarte":
		evento = "<p><b>"+numTurno+" -- </b>El jugador <b>"+jugOrigen+"</b> se ha descartado de las siguientes cartas: "+tipoOrgano+".";
		break;
	case "organo":
		evento = "<p><b>"+numTurno+" -- </b>El jugador <b>"+jugOrigen+"</b> ha usado "+tipoMov+" "+tipoOrgano+".</p>";
		break;
	case "virus":
		evento = "<p><b>"+numTurno+" -- </b>El jugador <b>"+jugOrigen+"</b> ha usado "+tipoMov+" "+tipoOrgano+" en jugador "+jugDestino+".</p>";
		break;
	case "medicina":
		evento = "<p><b>"+numTurno+" -- </b>El jugador <b>"+jugOrigen+"</b> ha usado "+tipoMov+" "+tipoOrgano+" en jugador "+jugDestino+".</p>";
		break;
	case "transplante":
		evento = "<p><b>"+numTurno+" -- </b>El jugador <b>"+jugOrigen+"</b> ha usado transplante "+tipoOrgano+".</p>";
		break;
	case "ladronDeOrganos":
		evento = "<p><b>"+numTurno+" -- </b>El jugador <b>"+jugOrigen+"</b> ha usado un ladron de órganos "+tipoOrgano+" a "+jugDestino+".</p>";
		break;
	case "errorMedico":
		evento = "<p><b>"+numTurno+" -- </b>El jugador <b>"+jugOrigen+"</b> ha usado un error medico cambiando su cuerpo por el de "+jugDestino+".</p>";
		break;
	case "guanteDeLatex":
		evento = "<p><b>"+numTurno+" -- </b>El jugador <b>"+jugOrigen+"</b> ha usado guante de latex obligando a descartarse a todos los jugadores.</p>";
		break;
	default:
		console.log("El movimiento extraño ha sido: "+tipoMov);
		evento = "<p><b>"+numTurno+" -- </b>Movimiento extraño.</p>";
		break;
	}

	$("#textoListaEventos").prepend(evento);
}


function checkCards() {
	for (var i = 0; i < objetos.length; i++) {
		if (objetos[i].src == ""){
			nuevaCarta(i);
		}
	}
}

//En el canvas mid estan los turnos y los organos de los jugadores
function actualizarCanvasMID() {
	//console.log("actualizarCanvasMID()");
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
				continue;
			} else if (elem == "posicion") {
				//No me hace falta porque en el objeto no hay orden y tengo que saber la pos antes
				//pos = organosJugadoresCli[jugador].posicion;
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
				case "comodin":
					posOrgano.tipo = "comodin";
					posOrgano.x = posOrganosJugadores[pos].posComodin[0];
					posOrgano.y = posOrganosJugadores[pos].posComodin[1];
					posOrgano.posJug = pos;
					posOrgano.src = 'img/cardImagesLQ/organos/orgaComodin.png';	
					break;
				default:
					console.log("Fallo en actualizarCanvasMID switch elem-opcion extraña ha aparecido");
					break;
				}
				estadoOrgano = organosJugadoresCli[jugador][elem];
				renderOrgano(posOrgano, estadoOrgano);
			}
		}
		//Escribimos el nombre del usuario
		renderUsername(pos, jugador, posOrgano.width, posOrgano.height);
	}
}

function renderPlayerBackCards(pos) {
	//console.log("renderPlayerBackCards()");

	//Nuestras cartas no las pintamos
	if (pos == 1) {
		return;
	}

	var width = posPlayersHandCards.widthCarta;
	var height = posPlayersHandCards.heightCarta;
	var imgSrc = posPlayersHandCards.imgSrc;

	//Pintamos cada carta
	var img = new Image();
	img.src = imgSrc;
	img.onload = function() {
		for (var carta in posPlayersHandCards[pos]) {
			var posX = posPlayersHandCards[pos][carta].x;
			var posY = posPlayersHandCards[pos][carta].y;
			if (pos == 2) {
				cxAPO.save();
				cxAPO.translate(posX, posY);
				cxAPO.translate(width + 10, 0);
				cxAPO.rotate(Math.PI/2);
				cxAPO.clearRect(0, 0, width, height);
				cxAPO.drawImage(img, 0, 0, width, height); //Ojo que invertimos dimensiones
				cxAPO.restore();
			} else {
				cxAPO.clearRect(posX, posY, width, height);
				cxAPO.drawImage(img, posX, posY, width, height);
			}
		}
	}
}

function renderUsername(pos, jugador, widthOrgano, heightOrgano) {
	//console.log("renderUsername()");
	//console.log("pos: "+pos);
	//console.log("jugador: "+jugador);

	var jugador = jugador;

	var posX;
	var posY;

	cxMID.font = "bold 22px sans-serif";
	cxMID.fillStyle = 'FireBrick';
	switch(pos) {
	case 1:
		posX = posOrganosJugadores[pos].posCerebro[0];
		posY = posOrganosJugadores[pos].posCerebro[1] - 12;
		break;
	case 2:
		posX = posOrganosJugadores[pos].posCerebro[0] + widthOrgano + 15;
		posY = posOrganosJugadores[pos].posCerebro[1];
		break;
	case 3:
		posX = posOrganosJugadores[pos].posCerebro[0];
		posY = posOrganosJugadores[pos].posCerebro[1] + heightOrgano + 25;
		break;
	case 4:
		posX = posOrganosJugadores[pos].posCerebro[0];
		posY = posOrganosJugadores[pos].posCerebro[1] + heightOrgano + 25;
		break;
	case 5:
		posX = posOrganosJugadores[pos].posCerebro[0];
		posY = posOrganosJugadores[pos].posCerebro[1] + heightOrgano + 25;
		break;
	case 6:
		console.log("renderUsername-> pos6 no programada");
		posX = -20;
		posY = -20;
		break;
	default:
		console.log("Problema escribiendo nombres de jugadores");
		break;					
	}

	if (jugador.length > 8) {
		jugador = "Jugador: " + infoJugadores[jugador].nombre;
	}

	if (pos == 1) {
		jugador = "TÚ";
		//Limpiamos zona particular del canvas
		cxMID.clearRect(posX, posY - 25, posOrganosJugadores[pos].posComodin[0] + widthOrgano - posOrganosJugadores[pos].posCerebro[0], 25);
		//Texto
		cxMID.fillStyle = '#003321';
		cxMID.fillText(jugador, posX, posY);
	} else if (pos == 2) {
		cxMID.save();
		cxMID.translate(posX, posY);
		cxMID.rotate(Math.PI/2);
		//Limpiamos zona particular del canvas
		cxMID.clearRect(0, - 25, posOrganosJugadores[pos].posComodin[1] + heightOrgano - posOrganosJugadores[pos].posCerebro[1], 25);
		//Texto
		cxMID.fillText(jugador, 0, 0);
		cxMID.restore();		
	} else {
		//Limpiamos zona particular del canvas
		cxMID.clearRect(posX, posY - 25, posOrganosJugadores[pos].posComodin[0] + widthOrgano - posOrganosJugadores[pos].posCerebro[0], 25);
		cxMID.fillText(jugador, posX, posY);
	}
}

function renderOrgano(posOrgano, estadoOrgano) {
	//console.log("Render organo-estado: "+posOrgano.tipo+"-"+estadoOrgano);
	var x = posOrgano.x;
	var y = posOrgano.y;
	var widthOrgano = posOrgano.width;
	var heightOrgano = posOrgano.height;
	var src = posOrgano.src;
	var posJug = posOrgano.posJug;

	//Estado organos: vacio, normal, enfermo, vacunado, inmunizado
	//Marco negro en fondo blanco
	cxMID.shadowBlur = 0;
	if (estadoOrgano == ""){

		var img1 = new Image();
		img1.src = src;
		//Si dibujamos en pos 2 tenemos que rotar el canvas para dibujar la imagen girada
		if (posJug == 2) {
			img1.onload = function(){
				//Limpiamos zona concreta de canvas antes de dibujar nada
				cxMID.shadowBlur = 0;
				cxMID.clearRect(x-5, y-5, widthOrgano+10, heightOrgano+10);
				//Marco
				cxMID.fillStyle = 'black';
				cxMID.fillRect(x-5, y-5, widthOrgano+10, heightOrgano+10);
				cxMID.fillStyle = '#D3D3D3';
				cxMID.fillRect(x, y, widthOrgano, heightOrgano);
				//Imagen
				cxMID.save();
				cxMID.globalAlpha = 0.4;
				cxMID.translate(x, y);
				cxMID.translate(widthOrgano, 0);
				cxMID.rotate(Math.PI/2);
				cxMID.drawImage(img1, 0, 0, heightOrgano, widthOrgano); //Ojo que invertimos dimensiones
				cxMID.restore();
			}
		} else {
			img1.onload = function(){
				//Limpiamos zona concreta de canvas antes de dibujar nada
				cxMID.shadowBlur = 0;
				cxMID.clearRect(x-5, y-5, widthOrgano+10, heightOrgano+10);
				//Marco
				cxMID.fillStyle = 'black';
				cxMID.fillRect(x-5, y-5, widthOrgano+10, heightOrgano+10);
				cxMID.fillStyle = '#D3D3D3';
				cxMID.fillRect(x, y, widthOrgano, heightOrgano);
				//Imagen
				cxMID.globalAlpha = 0.4;
				cxMID.drawImage(img1, x, y, widthOrgano, heightOrgano);
				cxMID.globalAlpha = 1;
			}
		}
	}

	//Marco negro (en fondo blanco) y encima la imagen->como va la imagen encima no es necesario el fondo blanco
	if(estadoOrgano == "normal"){
		var img1 = new Image();
		img1.src = src;
		//Si dibujamos en pos 2 tenemos que rotar el canvas para dibujar la imagen girada
		if (posJug == 2) {
			img1.onload = function(){
				//Limpiamos zona concreta de canvas antes de dibujar nada
				cxMID.shadowBlur = 0;
				cxMID.clearRect(x-5, y-5, widthOrgano+10, heightOrgano+10);
				//Marco
				cxMID.fillStyle = 'black';
				cxMID.fillRect(x-5, y-5, widthOrgano+10, heightOrgano+10);
				//Imagen
				cxMID.save();
				cxMID.translate(x, y);
				cxMID.translate(widthOrgano, 0);
				cxMID.rotate(Math.PI/2);
				cxMID.drawImage(img1, 0, 0, heightOrgano, widthOrgano); //Ojo que invertimos dimensiones
				cxMID.restore();
			}
		} else {
			img1.onload = function(){
				//Limpiamos zona concreta de canvas antes de dibujar nada
				cxMID.shadowBlur = 0;
				cxMID.clearRect(x-5, y-5, widthOrgano+10, heightOrgano+10);
				//Marco
				cxMID.fillStyle = 'black';
				cxMID.fillRect(x-5, y-5, widthOrgano+10, heightOrgano+10);
				//Imagen
				cxMID.drawImage(img1, x, y, widthOrgano, heightOrgano);
			}
		}
	}

	//Marco rojo en fondo blanco y encima la imagen
	if (estadoOrgano == "enfermo"){
		var img1 = new Image();
		img1.src = src;
		//Si dibujamos en pos 2 tenemos que rotar el canvas para dibujar la imagen girada
		if (posJug == 2) {
			img1.onload = function(){
				//Limpiamos zona concreta de canvas antes de dibujar nada
				cxMID.shadowBlur = 0;
				cxMID.clearRect(x-5, y-5, widthOrgano+10, heightOrgano+10);
				//Marco
				cxMID.fillStyle = 'red';
				cxMID.fillRect(x-5, y-5, widthOrgano+10, heightOrgano+10);
				//Imagen
				cxMID.save();
				cxMID.translate(x, y);
				cxMID.translate(widthOrgano, 0);
				cxMID.rotate(Math.PI/2);
				cxMID.drawImage(img1, 0, 0, heightOrgano, widthOrgano); //Ojo que invertimos dimensiones
				cxMID.restore();
			}
		} else {
			img1.onload = function(){
				//Limpiamos zona concreta de canvas antes de dibujar nada
				cxMID.shadowBlur = 0;
				cxMID.clearRect(x-5, y-5, widthOrgano+10, heightOrgano+10);
				//Marco
				cxMID.fillStyle = 'red';
				cxMID.fillRect(x-5, y-5, widthOrgano+10, heightOrgano+10);
				//Imagen
				cxMID.drawImage(img1, x, y, widthOrgano, heightOrgano);
			}
		}
	}

	//Marco azul en fondo blanco y encima la imagen
	if (estadoOrgano == "vacunado"){
		var img1 = new Image();
		img1.src = src;
		//Si dibujamos en pos 2 tenemos que rotar el canvas para dibujar la imagen girada
		if (posJug == 2) {
			img1.onload = function(){
				//Limpiamos zona concreta de canvas antes de dibujar nada
				cxMID.shadowBlur = 0;
				cxMID.clearRect(x-5, y-5, widthOrgano+10, heightOrgano+10);
				//Marco
				cxMID.fillStyle = 'blue';
				cxMID.fillRect(x-5, y-5, widthOrgano+10, heightOrgano+10);
				//Imagen
				cxMID.save();
				cxMID.translate(x, y);
				cxMID.translate(widthOrgano, 0);
				cxMID.rotate(Math.PI/2);
				cxMID.drawImage(img1, 0, 0, heightOrgano, widthOrgano); //Ojo que invertimos dimensiones
				cxMID.restore();
			}
		} else {
			img1.onload = function(){
				//Limpiamos zona concreta de canvas antes de dibujar nada
				cxMID.shadowBlur = 0;
				cxMID.clearRect(x-5, y-5, widthOrgano+10, heightOrgano+10);
				//Marco
				cxMID.fillStyle = 'blue';
				cxMID.fillRect(x-5, y-5, widthOrgano+10, heightOrgano+10);
				//Imagen
				cxMID.drawImage(img1, x, y, widthOrgano, heightOrgano);
			}
		}
	}

	//Marco azul en fondo blanco, imagen y encima cuadrado azul semitransparente
	if (estadoOrgano == "inmunizado"){
		var img1 = new Image();
		img1.src = src;
		//Si dibujamos en pos 2 tenemos que rotar el canvas para dibujar la imagen girada
		if (posJug == 2) {
			img1.onload = function(){
				//Limpiamos zona concreta de canvas antes de dibujar nada
				cxMID.shadowBlur = 0;
				cxMID.clearRect(x-5, y-5, widthOrgano+10, heightOrgano+10);
				//Marco
				cxMID.fillStyle = 'blue';
				cxMID.fillRect(x-5, y-5, widthOrgano+10, heightOrgano+10);
				//Imagen
				cxMID.save();
				cxMID.translate(x, y);
				cxMID.translate(widthOrgano, 0);
				cxMID.rotate(Math.PI/2);
				cxMID.drawImage(img1, 0, 0, heightOrgano, widthOrgano); //Ojo que invertimos dimensiones
				cxMID.restore();
				var img2 = new Image();
				img2.src = "img/cardImagesLQ/cadenas.png";
				img2.onload = function(){
					cxMID.save();
					cxMID.translate(x, y);
					cxMID.translate(widthOrgano, 0);
					cxMID.rotate(Math.PI/2);
					cxMID.drawImage(img2, -5, -5, heightOrgano+10, widthOrgano+10);
					cxMID.restore();
				}
			}
		} else {
			img1.onload = function(){
				//Limpiamos zona concreta de canvas antes de dibujar nada
				cxMID.shadowBlur = 0;
				cxMID.clearRect(x-5, y-5, widthOrgano+10, heightOrgano+10);
				//Marco
				cxMID.fillStyle = 'blue';
				cxMID.fillRect(x-5, y-5, widthOrgano+10, heightOrgano+10);
				//Imagen
				cxMID.drawImage(img1, x, y, widthOrgano, heightOrgano);
				var img2 = new Image();
				img2.src = "img/cardImagesLQ/cadenas.png";
				img2.onload = function(){
					cxMID.drawImage(img2, x-5, y-5, widthOrgano+10, heightOrgano+10);
				}
			}
		}
	}
}

function renderOrganosTransplante() {
	//Redimensionamos en relacion al tamaño de la carta
	var heightCard = ($(".imagenCartaIzq").css("height")).replace("px","");;
	var widthCard = (heightCard * (1013/1536)) + "px";

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
		case "comodin":
			$(".imagenCartaIzq").css("background-image", "url('img/cardImagesLQ/organos/orgaComodin.png')");
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
		case "comodin":
			$(".imagenCartaDcha").css("background-image", "url('img/cardImagesLQ/organos/orgaComodin.png')");
			break;	
		default:
			$(".imagenCartaDcha").css("background-image", "");
			break;
		}
	} else {
		$(".imagenCartaIzq").css("background-image", "");
		$(".imagenCartaDcha").css("background-image", "");				
	}
}

function removeOrgano1Transplante() {
	console.log("removeOrgano1Transplante()");
	transplante.organo1.organo = "";
	transplante.organo1.numJug = -1;
	document.getElementById("correcionTransplante").innerHTML = "";

	renderOrganosTransplante();
	//Si en el segundo organo no hay nada. Dejamos cancelado el transplante
	if (transplante.organo2.organo == "") {
		transplante.enProceso = false;
	}
}

function removeOrgano2Transplante(){
	console.log("removeOrgano2Transplante()");
	transplante.organo2.organo = "";
	transplante.organo2.numJug = -1;
	document.getElementById("correcionTransplante").innerHTML = "";
	renderOrganosTransplante();

	//Si en el primer organo no hay nada. Dejamos cancelado el transplante
	if (transplante.organo1.organo == "") {
		transplante.enProceso = false;
	}
}

//Ideas de mejora a futuro ->
//1. Renderizar la imagen que se mueve y las otras a diferente ritmo -> DESCARTADA
//2. Detectar la colision en el canvas de las cartas pero dibujar unicamente la que se mueve en otro sola -> HECHO
//3. Tener las imagenes siempre cargadas. ->Las vamos dejando cargadas segun aparecen de momento -> HECHO Y SOLUCIONADO
//4. Posibilidad de dibujar siempre pero borrar solo cada cierta diferencia de pixeles -> Lag, DESCARTADA
//5. ClearRect siempre dentro de onload pues si no entre el borrado y el dibujo de la imagen se crea un parpadeo -> HECHO

function actualizarCanvasFrontal() {
	if (objetoActual != null) {
		if (imgOnload[objetoActual.src] == null) {

			imgOnload[objetoActual.src] = new Image();
			imgOnload[objetoActual.src].src = objetoActual.src;
			imgOnload[objetoActual.src].onload = function(){
				cx.clearRect(0, 0, windowWidth, windowHeight);
				cx.drawImage(imgOnload[objetoActual.src], objetoActual.x, objetoActual.y, objetoActual.width, objetoActual.height);
			}
		} else {
			cx.clearRect(0, 0, windowWidth, windowHeight);
			cx.drawImage(imgOnload[objetoActual.src], objetoActual.x, objetoActual.y, objetoActual.width, objetoActual.height);
		}
	} else {
		cx.clearRect(0, 0, windowWidth, windowHeight);
		//console.log("Objeto actual es NULL");
		//objetoActual[objetoActual.src] == null; //Dejamos imagenes cargadas
	}
}

function actualizarCanvasAPO(){
	//console.log("actualizarCanvasAPO()");
	var img1 = new Image();
	if ((objetos[0].src != "") && (descartes[0] == false)){
		//Tratamos de evitar parpadeos moviendo cartas
		if (objetos[0] != objetoActual) {
			img1.src = objetos[0].src;
			img1.onload = function(){
				cxAPO.clearRect(objetos[0].x, objetos[0].y, objetos[0].width, objetos[0].height);
				cxAPO.drawImage(img1, objetos[0].x, objetos[0].y, objetos[0].width, objetos[0].height);
			}
		} else { //Si es el objeto actual no lo dibujamos en la mano
			cxAPO.clearRect(objetos[0].x, objetos[0].y, objetos[0].width, objetos[0].height);
		}
	}
	var img2 = new Image();
	if ((objetos[1].src != "") && (descartes[1] == false)){
		//Tratamos de evitar parpadeos moviendo cartas
		if (objetos[1] != objetoActual) {
			img2.src = objetos[1].src;
			img2.onload = function(){
				cxAPO.clearRect(objetos[1].x, objetos[1].y, objetos[1].width, objetos[1].height);
				cxAPO.drawImage(img2, objetos[1].x, objetos[1].y, objetos[1].width, objetos[1].height);
			}
		} else { //Si es el objeto actual no lo dibujamos en la mano
			cxAPO.clearRect(objetos[1].x, objetos[1].y, objetos[1].width, objetos[1].height);
		}
	}
	var img3 = new Image();
	if ((objetos[2].src != "") && (descartes[2] == false)){
		//Tratamos de evitar parpadeos moviendo cartas
		if (objetos[2] != objetoActual) {
			img3.src = objetos[2].src;
			img3.onload = function(){
				cxAPO.clearRect(objetos[2].x, objetos[2].y, objetos[2].width, objetos[2].height);
				cxAPO.drawImage(img3, objetos[2].x, objetos[2].y, objetos[2].width, objetos[2].height);
			}
		} else { //Si es el objeto actual no lo dibujamos en la mano
			cxAPO.clearRect(objetos[2].x, objetos[2].y, objetos[2].width, objetos[2].height);
		}
	}

	for (var jugador in organosJugadoresCli) {
		var pos = organosJugadoresCli[jugador].posicion;
		renderPlayerBackCards(pos);
	}
}

function moveObjects(){
	console.log("moveObjects()");

	objetos.push({
		x: posCartasUsuario.carta1.x, y: posCartasUsuario.carta1.y,
		xOrigen: posCartasUsuario.carta1.x, yOrigen: posCartasUsuario.carta1.y,
		width: posCartasUsuario.width, height: posCartasUsuario.height,
		numCarta: 0,
		src: cartasUsuario[0].picture
	});
	objetos.push({
		x: posCartasUsuario.carta2.x, y: posCartasUsuario.carta2.y,
		xOrigen: posCartasUsuario.carta2.x, yOrigen: posCartasUsuario.carta2.y,
		width: posCartasUsuario.width, height: posCartasUsuario.height,
		numCarta: 1,
		src: cartasUsuario[1].picture
	});
	objetos.push({
		x: posCartasUsuario.carta3.x, y: posCartasUsuario.carta3.y,
		xOrigen: posCartasUsuario.carta3.x, yOrigen: posCartasUsuario.carta3.y,
		width: posCartasUsuario.width, height: posCartasUsuario.height,
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
				actualizarCanvasAPO();
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

					inicioY = touch.pageY - objetos[i].y;
					inicioX = touch.pageX - objetos[i].x;

					actualizarCanvasAPO(); //Si hay objeto actual borro carta de la mano
					actualizarCanvasFrontal(); //Pero la dibujo en el canvas frontal (si solo click y no muevo => carta no desaparece)

					//Optimizar renderizado
					posInitObjX = objetoActual.x;
					posInitObjY = objetoActual.y;
					break;
				}
			}
			evalClick(touch.x, touch.y);
		}

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
				actualizarCanvasMID(); //Redibujamos organos
				actualizarCanvasAPO(); //Dibujamos cartas de la mano
				actualizarCanvasFrontal(); //Refrescamos en canvas frontal
			}
			//	2Eliminar o no objeto
			//	3Agregarlo o no a algun sitio
			//4restablecer coordenadas iniciale
			objetoActual = null;
			evalUnClick(touch.x, touch.y);
		}
	}
}

function actObjects() {
	//console.log("actObjects()");

	objetos[0] = {
		x: posCartasUsuario.carta1.x, y: posCartasUsuario.carta1.y,
		xOrigen: posCartasUsuario.carta1.x, yOrigen: posCartasUsuario.carta1.y,
		width: posCartasUsuario.width, height: posCartasUsuario.height,
		numCarta: 0,
		src: cartasUsuario[0].picture
	};
	objetos[1] = {
		x: posCartasUsuario.carta2.x, y: posCartasUsuario.carta2.y,
		xOrigen: posCartasUsuario.carta2.x, yOrigen: posCartasUsuario.carta2.y,
		width: posCartasUsuario.width, height: posCartasUsuario.height,
		numCarta: 1,
		src: cartasUsuario[1].picture
	};
	objetos[2] = {
		x: posCartasUsuario.carta3.x, y: posCartasUsuario.carta3.y,
		xOrigen: posCartasUsuario.carta3.x, yOrigen: posCartasUsuario.carta3.y,
		width: posCartasUsuario.width, height: posCartasUsuario.height,
		numCarta: 2,
		src: cartasUsuario[2].picture
	};
}

//Algunos son elementos html que van debajo del canvas
function evalClick(touchX, touchY) {
	//console.log("evalClick()");

	//1.- Recuadro listaEventos
	var elemListaEventos = document.getElementById("listaEventos");
	var posListaEventos = elemListaEventos.getBoundingClientRect();

	if ( (touchX > posListaEventos.left) && 
		(touchX < posListaEventos.right) &&
		(touchY > posListaEventos.top) &&
		(touchY < posListaEventos.bottom) ) {
		//console.log("click en lista Eventos");

		var elemMaximizeListaEventos = document.getElementById("maximizeListaEventos");
		var posMaximizeListaEventos = elemMaximizeListaEventos.getBoundingClientRect();
		var display = $("#maximizeListaEventos").css("display");

		if ( (touchX > posMaximizeListaEventos.left) && 
			(touchX < posMaximizeListaEventos.right) &&
			(touchY > posMaximizeListaEventos.top) &&
			(touchY < posMaximizeListaEventos.bottom) &&
			(display != "none") ) {
			
			localStorage.setItem("modeListaEventos", "maximize");
			reDimListaEventos();
			return;
		}

		var elemReplaceListaEventos = document.getElementById("restoreListaEventos");
		var posReplaceListaEventos = elemReplaceListaEventos.getBoundingClientRect();
		var display = $("#restoreListaEventos").css("display");

		if ( (touchX > posReplaceListaEventos.left) && 
			(touchX < posReplaceListaEventos.right) &&
			(touchY > posReplaceListaEventos.top) &&
			(touchY < posReplaceListaEventos.bottom) &&
			(display != "none") ) {
			
			localStorage.setItem("modeListaEventos", "restore");
			reDimListaEventos();
			return;
		}

		var elemReplaceListaEventos = document.getElementById("minimizeListaEventos");
		var posReplaceListaEventos = elemReplaceListaEventos.getBoundingClientRect();
		var display = $("#minimizeListaEventos").css("display");

		if ( (touchX > posReplaceListaEventos.left) && 
			(touchX < posReplaceListaEventos.right) &&
			(touchY > posReplaceListaEventos.top) &&
			(touchY < posReplaceListaEventos.bottom) &&
			(display != "none") ) {

			localStorage.setItem("modeListaEventos", "minimize");
			reDimListaEventos();
			return;
		}
	}

	//2.- Recuadro listaTurnos
	var elemListaTurnos = document.getElementById("listaTurnos");
	var posListaTurnos = elemListaTurnos.getBoundingClientRect();

	if ( (touchX > posListaTurnos.left) && 
		(touchX < posListaTurnos.right) &&
		(touchY > posListaTurnos.top) &&
		(touchY < posListaTurnos.bottom) ) {
		//console.log("click en lista turnos");
		return;
	}

	//3.- Mazo de descartes
	var descartesDataPosX = DeckOfCards.getDescartesData("posX");
	var descartesDataPosY = DeckOfCards.getDescartesData("posY"); 
	var descartesDataWidth = DeckOfCards.getDescartesData("width");
	var descartesDataHeight = DeckOfCards.getDescartesData("height");

	if ( (touchX > descartesDataPosX) && 
		(touchX < (descartesDataPosX + descartesDataWidth)) &&
		(touchY > descartesDataPosY) &&
		(touchY < (descartesDataPosY + descartesDataHeight)) ) {
		console.log("Click en mazo descartes");
		if (descartesHist.length != 0) {
			mostrarDescartes();
			return;
		}
	}

	//4.- okButtonTransplante
	var elemOkButtonTransplante = document.getElementById("okButtonTransplante");
	var posOkButtonTransplante = elemOkButtonTransplante.getBoundingClientRect();
	if ( (touchX > posOkButtonTransplante.left) && 
		(touchX < posOkButtonTransplante.right) &&
		(touchY > posOkButtonTransplante.top) &&
		(touchY < posOkButtonTransplante.bottom) ) {
		//console.log("click en okButtonTransplante");
		$("#okButtonTransplante").css("top", "3.7em");
		$("#okButtonTransplante").css("left", "0.2em");
		setTimeout(function(){
			$("#okButtonTransplante").css("top", "3.5em");
			$("#okButtonTransplante").css("left", "0em");
			evalTransplante();
		},100);
		return;
	}

	//5.- eliminar organo escogido de transplante
	if (transplante.enProceso == true) {
		var elemCartaIzq = document.getElementById("cartaIzq");
		var posCartaIzq = elemCartaIzq.getBoundingClientRect();
		if ( (touchX > posCartaIzq.left) && 
			(touchX < posCartaIzq.right) &&
			(touchY > posCartaIzq.top) &&
			(touchY < posCartaIzq.bottom) ) {
			removeOrgano1Transplante();
		}

		var elemCartaDcha = document.getElementById("cartaDcha");
		var posCartaDcha = elemCartaDcha.getBoundingClientRect();
		if ( (touchX > posCartaDcha.left) && 
			(touchX < posCartaDcha.right) &&
			(touchY > posCartaDcha.top) &&
			(touchY < posCartaDcha.bottom) ) {
			removeOrgano2Transplante();
		}
	}
}

function evalUnClick(touchX, touchY) {
	//console.log("evalUnclick()");

	//1.- Limpio las cartas de descartes mostradas
	var posXDescartes = DeckOfCards.getDescartesData("posX");
	var posYDescartes = DeckOfCards.getDescartesData("posY"); 
	var widthDescartes = DeckOfCards.getDescartesData("width");
	var heightDescartes = DeckOfCards.getDescartesData("height");

	cx.clearRect(posXDescartes, posYDescartes, widthDescartes*3, heightDescartes);

	//2.- Cierro los cuadros de ayuda en partida
	//cerrarAyudaCartas();
}

function mostrarDescartes() {
	console.log("mostrarDescartes()");

	var posXInicial = DeckOfCards.getDescartesData("posX");
	var posYInicial = DeckOfCards.getDescartesData("posY"); 
	var widthInicial = DeckOfCards.getDescartesData("width");
	var heightInicial = DeckOfCards.getDescartesData("height");

	var widthFinalMov = widthInicial*0.8;
	var heightFinalMov = heightInicial*0.8;
	var posXFinalMov = posXInicial + widthInicial*2 + widthInicial/3;
	var posYFinalMov = posYInicial + (heightInicial - heightFinalMov)/2;


	var descartesHistReverse = descartesHist.reverse();
	if (!(isEmpty(descartesHistReverse[0]))) {
		var imgSrc0 = descartesHistReverse[0].picture;
		var img0 = new Image();
		img0.src = imgSrc0;

		img0.onload = function() {
			var posXFinalMov0 = posXFinalMov - (widthInicial/3)*1;
			moverCartaJugada(500, 20, imgSrc0, 
		    	posXInicial, posYInicial, widthInicial, heightInicial, 
		    	posXFinalMov0, posYFinalMov, widthFinalMov, heightFinalMov);
			setTimeout(function() {
				cx.drawImage(img0, posXFinalMov0, posYFinalMov, widthFinalMov, heightFinalMov);	 	
			}, 510);
		}
	}

	if (!(isEmpty(descartesHistReverse[1]))) {
		var imgSrc1 = descartesHistReverse[1].picture;
		var img1 = new Image();
		img1.src = imgSrc1;

		img1.onload = function() {
			var posXFinalMov1 = posXFinalMov - (widthInicial/3)*2;
			moverCartaJugada(500, 20, imgSrc1, 
		    	posXInicial, posYInicial, widthInicial, heightInicial, 
		    	posXFinalMov1, posYFinalMov, widthFinalMov, heightFinalMov);
			setTimeout(function(){
				cx.drawImage(img1, posXFinalMov1, posYFinalMov, widthFinalMov, heightFinalMov);	 	
			}, 515);
		}
	}

	if (!(isEmpty(descartesHistReverse[2]))) {
		var imgSrc2= descartesHistReverse[2].picture;
		var img2 = new Image();
		img2.src = imgSrc2;

		img2.onload = function() {
			var posXFinalMov2 = posXFinalMov - (widthInicial/3)*3;
			moverCartaJugada(500, 20, imgSrc2, 
		    	posXInicial, posYInicial, widthInicial, heightInicial, 
		    	posXFinalMov2, posYFinalMov, widthFinalMov, heightFinalMov);
			setTimeout(function(){
				cx.drawImage(img2, posXFinalMov2, posYFinalMov, widthFinalMov, heightFinalMov);	 	
			}, 520);
		}
	}
}

//Devuelve el numero de la pos. donde ha habido colision, 0 si descarte o -1 si hay error
function checkCollision() {
	//Si no es mi turno aunque pueda mover los objetos no proceso nada y devuelvo los obj a su origen
	if (turno != usuario){
		objetoActual.x = objetoActual.xOrigen;
		objetoActual.y = objetoActual.yOrigen;
		return;
	}

	//Ojo con poner 3 y 5 antes de 2 y 6 respectivamente porque ayudan a excluir a estas ultimas pues los organos se colocan
	//con respecto a a windowHeight, anchura de organos y margenes
	var colision = -1;
	//Si la colision es en la zona donde dejamos las cartas, la contamos como -1
	//posCartasUsuario = [widthCarta, heightCarta, posCarta1, posCarta2, posCarta3];
	if ((touch.pageX < (posCartasUsuario.carta3.x + posCartasUsuario.width)) && //posCarta3.x + widthCarta
		(touch.pageX > posCartasUsuario.carta1.x) && 
		(touch.pageY < (posCartasUsuario.carta3.y + posCartasUsuario.height)) && //posCarta3.y + heightCarta
		(touch.pageY > posCartasUsuario.carta1.y)) { //posCarta2.y
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
	/**else if ((touch.pageX < ((windowWidth / 6) * 5)) &&
		(touch.pageX > (windowWidth / 6) * 1) &&
		(touch.pageY > (windowHeight / 3) * 1) &&
		(touch.pageY < (windowHeight / 3) * 2)) {
		//console.log("Colision zona 0");
		colision = 0;
	} **/
	//Posición 0 exacta en mazo descarte
	else if  ( (touch.pageX < (DeckOfCards.descartesData.x + DeckOfCards.descartesData.width)) &&
		(touch.pageX > DeckOfCards.descartesData.x) &&
		(touch.pageY > DeckOfCards.descartesData.y) &&
		(touch.pageY < (DeckOfCards.descartesData.y + DeckOfCards.descartesData.height)) ) {
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

	//Colision comodin
	posX = posOrganosJugadores[colision].posComodin[0];
	posY = posOrganosJugadores[colision].posComodin[1];

	if ( (touch.pageX > (posX - 5)) &&
		(touch.pageX < (posX + widthOrgano + 5)) &&
		(touch.pageY > (posY - 5)) &&
		(touch.pageY < (posY + heightOrgano + 5)) ) {
		organoColision = "comodin";
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
		abrirAyudaCartas("ayudaDescartes");
		descartes[numCarta] = true;
		actualizarCanvasAPO();
		$("#descartes_boton").css("visibility","visible");
	}
	//Descarte-block. Si estamos en proceso de descarte no podemos hacer otra cosa hasta acabar
	if (finDescarte == false) {
		//console.log("Descarte en proceso");
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
		if (organosJugadoresCli[jugDestino][organType] == ""){
			organosJugadoresCli[jugDestino][organType] = "normal";
			var cartasUsadas = [];
			cartasUsadas.push(cartasUsuario[numCarta]);
			movJugador = {
				jugOrigen: usuario,
				jugDestino: jugDestino,
				texto: "",
				tipoMov: "organo",
				tipoOrgano: organType,
				cartasUsadas: cartasUsadas
			};
		} else {
			//console.log("manejadorMov() - Organo repetido");
		}
	}

	//Si el tipo de organo de la carta es igual al lugar del organo donde la he soltado evaluo
	//O si es tipo comodin evaluo en el sitio donde he soltado
	//O si donde la he soltado es el organo comodin tambien evaluo
	//organType-> tipo del organo de la carta que he jugado
	//organoColision-> tipo del organo del organo destino
	if ((organType == organoColision) || (organType == "comodin") || (organoColision == "comodin")) {
		if (cardType == "medicina") {
			//Estado organos: vacio, normal, enfermo, vacunado, inmunizado
			if (organosJugadoresCli[jugDestino][organoColision] == "enfermo") {
				organosJugadoresCli[jugDestino][organoColision] = "normal";
				var cartasUsadas = [];
				cartasUsadas.push(cartasUsuario[numCarta]);
				movJugador = {
					jugOrigen: usuario,
					jugDestino: jugDestino,
					texto: "",
					tipoMov: "medicina",
					tipoOrgano: organType,
					cartasUsadas: cartasUsadas
				};
			} else if (organosJugadoresCli[jugDestino][organoColision] == "normal") {
				organosJugadoresCli[jugDestino][organoColision] = "vacunado";
				var cartasUsadas = [];
				cartasUsadas.push(cartasUsuario[numCarta]);
				movJugador = {
					jugOrigen: usuario,
					jugDestino: jugDestino,
					texto: "",
					tipoMov: "medicina",
					tipoOrgano: organType,
					cartasUsadas: cartasUsadas
				};
			} else if (organosJugadoresCli[jugDestino][organoColision] == "vacunado") {
				organosJugadoresCli[jugDestino][organoColision] = "inmunizado";
				var cartasUsadas = [];
				cartasUsadas.push(cartasUsuario[numCarta]);
				movJugador = {
					jugOrigen: usuario,
					jugDestino: jugDestino,
					texto: "",
					tipoMov: "medicina",
					tipoOrgano: organType,
					cartasUsadas: cartasUsadas
				};
			} else {
				//console.log("manejadorMov() - Medicina. Organo inmunizado o no existe");
			}
		}
			
		if (cardType == "virus") {
			//Estado organos: vacio, normal, enfermo, vacunado, inmunizado
			if (organosJugadoresCli[jugDestino][organoColision] == "enfermo") {
				organosJugadoresCli[jugDestino][organoColision] = "";
				var cartasUsadas = [];
				cartasUsadas.push(cartasUsuario[numCarta]);
				movJugador = {
					jugOrigen: usuario,
					jugDestino: jugDestino,
					texto: "",
					tipoMov: "virus",
					tipoOrgano: organType,
					cartasUsadas: cartasUsadas
				};
			} else if (organosJugadoresCli[jugDestino][organoColision] == "normal") {
				organosJugadoresCli[jugDestino][organoColision] = "enfermo";
				var cartasUsadas = [];
				cartasUsadas.push(cartasUsuario[numCarta]);
				movJugador = {
					jugOrigen: usuario,
					jugDestino: jugDestino,
					texto: "",
					tipoMov: "virus",
					tipoOrgano: organType,
					cartasUsadas: cartasUsadas
				};
			} else if (organosJugadoresCli[jugDestino][organoColision] == "vacunado") {
				organosJugadoresCli[jugDestino][organoColision] = "normal";
				var cartasUsadas = [];
				cartasUsadas.push(cartasUsuario[numCarta]);
				movJugador = {
					jugOrigen: usuario,
					jugDestino: jugDestino,
					texto: "",
					tipoMov: "virus",
					tipoOrgano: organType,
					cartasUsadas: cartasUsadas
				};
			} else {
				//console.log("manejadorMov() - Virus. Organo inmunizado o no existe");
			}
		}
	}

	if (cardType == "tratamiento") {
		//Estado organos: vacio, normal, enfermo, vacunado, inmunizado
		switch (organType) {
		case "errorMedico":
			console.log("manejadorMov() - Error medico");
			var auxCerebro = organosJugadoresCli[jugDestino].cerebro;
			var auxCorazon = organosJugadoresCli[jugDestino].corazon;
			var auxHigado = organosJugadoresCli[jugDestino].higado;
			var auxHueso = organosJugadoresCli[jugDestino].hueso;
			var auxOrganoComodin = organosJugadoresCli[jugDestino].comodin;
			organosJugadoresCli[jugDestino].cerebro = organosJugadoresCli[usuario].cerebro;
			organosJugadoresCli[jugDestino].corazon = organosJugadoresCli[usuario].corazon;
			organosJugadoresCli[jugDestino].higado = organosJugadoresCli[usuario].higado;
			organosJugadoresCli[jugDestino].hueso = organosJugadoresCli[usuario].hueso;
			organosJugadoresCli[jugDestino].comodin = organosJugadoresCli[usuario].comodin;
			organosJugadoresCli[usuario].cerebro = auxCerebro;
			organosJugadoresCli[usuario].corazon = auxCorazon;
			organosJugadoresCli[usuario].higado = auxHigado;
			organosJugadoresCli[usuario].hueso = auxHueso;
			organosJugadoresCli[usuario].comodin = auxOrganoComodin;

			var cartasUsadas = [];
			cartasUsadas.push(cartasUsuario[numCarta]);
			movJugador = {
				jugOrigen: usuario,
				jugDestino: jugDestino,
				texto: "",
				tipoMov: "errorMedico",
				tipoOrgano: "",
				cartasUsadas: cartasUsadas
			};
			break;
		case "guanteDeLatex":
			console.log("manejadorMov() - Guante de latex");
			var cartasUsadas = [];
			cartasUsadas.push(cartasUsuario[numCarta]);
			movJugador = {
				jugOrigen: usuario,
				jugDestino: jugDestino,
				texto: "",
				tipoMov: "guanteDeLatex",
				tipoOrgano: "",
				cartasUsadas: cartasUsadas
			};
			break;
		case "transplante":
			console.log("manejadorMov() - Transplante");
			if (transplante.organo1.numJug == -1) {
				//No pueden intercambiarse organos del mismo jugador
				if (transplante.organo2.numJug != jugDestino) {
					//No pueden cambiarse organos inmunizados
					if ( (organosJugadoresCli[jugDestino][organoColision] != "inmunizado") && (organosJugadoresCli[jugDestino][organoColision] != "") ) {
						transplante.organo1.organo = organoColision;
						transplante.organo1.numJug = jugDestino;
						console.log("El organo para el cambio 1 es: "+organoColision);
						transplante.enProceso = true;
					}
				} else {
					document.getElementById("correcionTransplante").innerHTML = "No puedes cambiarte órganos contigo mismo.";
				}
			} else if (transplante.organo2.numJug == -1) {
				//No pueden intercambiarse organos del mismo jugador
				if (transplante.organo1.numJug != jugDestino) {
					//No pueden cambiarse organos inmunizados
					if ( (organosJugadoresCli[jugDestino][organoColision] != "inmunizado") && (organosJugadoresCli[jugDestino][organoColision] != "") ) {
						transplante.organo2.organo = organoColision;
						transplante.organo2.numJug = jugDestino;
						console.log("El organo para el cambio 2 es: "+organoColision);
						transplante.enProceso = true;
					}
				} else {
					document.getElementById("correcionTransplante").innerHTML = "No puedes cambiarte órganos contigo mismo.";
				}
			}
			renderOrganosTransplante();
			break;
		case "ladronDeOrganos":
			console.log("manejadorMov() - Ladron de organos");
			//Si no tengo el organo destino y se puede lo robo
			if (organosJugadoresCli[usuario][organoColision] == "") {
				var estadoOrgano = organosJugadoresCli[jugDestino][organoColision];
				if ((estadoOrgano == "vacunado") ||
					(estadoOrgano == "normal") ||
					(estadoOrgano == "enfermo")) {

					organosJugadoresCli[usuario][organoColision] = estadoOrgano;
					organosJugadoresCli[jugDestino][organoColision] = "";
					var cartasUsadas = [];
					cartasUsadas.push(cartasUsuario[numCarta]);
					//Creamos carta especial
					var cartaEspecial = {
						cardType: "cartaEspecial",
						organType: organoColision,
						picture: 'img/cardImagesLQ/organos/orga'+mayusPrimera(organoColision)+'.png',
						jugPropietario: jugDestino
					}
					cartasUsadas.push(cartaEspecial);
					movJugador = {
						jugOrigen: usuario,
						jugDestino: "",
						texto: "",
						tipoMov: "ladronDeOrganos",
						tipoOrgano: "robando '"+organoColision+"'",
						cartasUsadas: cartasUsadas
					};
				}
			}
			break;
		case "contagio":
			//Mov valido pero de momento no hacemos nada
			console.log("Contagio");
			var cartasUsadas = [];
			cartasUsadas.push(cartasUsuario[numCarta]);
			movJugador = {
				jugOrigen: "",
				jugDestino: "",
				texto: "",
				tipoMov: "contagio",
				tipoOrgano: "",
				cartasUsadas: cartasUsadas
			};
			break;
		default:
			console.log("Error grave en manejadorMov()-switch tratamiento");
		}
	}
	
	if (movJugador.tipoMov != "") {
		//console.log("Movimiento valido");
		nuevaCarta(numCarta);
	} else {
		//console.log("Movimiento no valido");
	}
}

function evalTransplante() {
	console.log("evalTransplante()");

	//Evaluo si la jugada esta completa
	if ( (transplante.organo1.organo == "") || (transplante.organo1.numJug == -1) ||
		(transplante.organo2.organo == "") || (transplante.organo2.numJug == -1) ) {

		document.getElementById("correcionTransplante").innerHTML = "La jugada no está completa.";
	} else {
		var jug1 = transplante.organo1.numJug;
		var jug2 = transplante.organo2.numJug;
		var organo1 = transplante.organo1.organo;
		var organo2 = transplante.organo2.organo;
		var estadoOrgano1 = organosJugadoresCli[jug1][organo1];
		var estadoOrgano2 = organosJugadoresCli[jug2][organo2];

		var jugadaCorrecta = false;
		//Condicion para que sea legal: Que los jugadores no posean ya el organo a cambiar
		if (organo1 == organo2) {
			jugadaCorrecta = true;
		} else if ( (organosJugadoresCli[jug1][organo2] == "") && 
				(organosJugadoresCli[jug2][organo1] == "") ) {
			jugadaCorrecta = true;
		} else { //Vemos que ha ido mal
			if (organosJugadoresCli[jug1][organo2] == organo1) {
				$("#cartaDcha").css("border", "red");
				document.getElementById("correcionTransplante").innerHTML = "El jugador "+jug1+" ya tiene el organo "+organo2+".";
			} else if (organosJugadoresCli[jug2][organo1] == organo2) {
				$("#cartaIzq").css("border", "red");
				document.getElementById("correcionTransplante").innerHTML = "El jugador "+jug2+" ya tiene el organo "+organo1+".";
			}
		}
		
		//Si la jugada ha sido correcta evaluamos el transplante
		if (jugadaCorrecta == true) {
			organosJugadoresCli[jug1][organo1] = "";
			organosJugadoresCli[jug2][organo2] = "";
			organosJugadoresCli[jug1][organo2] = estadoOrgano2;
			organosJugadoresCli[jug2][organo1] = estadoOrgano1;

			var cartasUsadas = [];
			var numCarta = -1;
			for (var i = 0; i < cartasUsuario.length; i++) {
				if (cartasUsuario[i].organType == "transplante") {
					numCarta = i;
				}
			} 
			cartasUsadas.push(cartasUsuario[numCarta]);

			//Creamos carta especial1
			var cartaEspecial1 = {
				cardType: "cartaEspecial",
				organType: organo1,
				picture: 'img/cardImagesLQ/organos/orga'+mayusPrimera(organo1)+'.png',
				jugPropietario: jug1
			}
			cartasUsadas.push(cartaEspecial1);
			//Creamos carta especial 2
			var cartaEspecial2 = {
				cardType: "cartaEspecial",
				organType: organo2,
				picture: 'img/cardImagesLQ/organos/orga'+mayusPrimera(organo2)+'.png',
				jugPropietario: jug2
			}
			cartasUsadas.push(cartaEspecial2);

			movJugador = {
				jugOrigen: usuario,
				jugDestino: "",
				texto: "",
				tipoMov: "transplante",
				tipoOrgano: "y ha cambiado '"+organo1+"'' por '"+organo2+"'",
				cartasUsadas: cartasUsadas
			};
			fin_transplante();
		}
	}
}

function fin_descarte() {
	finDescarte = true;
	$("#descartes_boton").css("visibility","hidden");
	var cartasUsadas = [];

	var descripcionDescarte = "";
	if (descartes[0] == true) {
		descripcionDescarte += cartasUsuario[0].cardType+"-"+cartasUsuario[0].organType+",";
		cartasUsadas.push(cartasUsuario[0]);
		nuevaCarta(0);
	}
	if (descartes[1] == true) {
		descripcionDescarte += cartasUsuario[1].cardType+"-"+cartasUsuario[1].organType+",";
		cartasUsadas.push(cartasUsuario[1]);
		nuevaCarta(1);
	}
	if (descartes[2] == true) {
		descripcionDescarte += cartasUsuario[2].cardType+"-"+cartasUsuario[2].organType;
		cartasUsadas.push(cartasUsuario[2]);
		nuevaCarta(2);
	}

	descartes[0] = false;
	descartes[1] = false;
	descartes[2] = false;
	movJugador = {
		jugOrigen: usuario,
		jugDestino: "",
		texto: "",
		tipoMov: "descarte",
		tipoOrgano: descripcionDescarte,
		cartasUsadas: cartasUsadas
	};
	actualizarCanvasAPO();
}

function fin_transplante() {
	transplante.enProceso = false;
	transplante.organo1.organo = "";
	transplante.organo1.numJug = -1;
	transplante.organo2.organo = "";
	transplante.organo2.numJug = -1;
	renderOrganosTransplante();
}

function reDimLoading() {

	var elemLoading = document.getElementById('loading');
	var posLoading = elemLoading.getBoundingClientRect();

	var width = posLoading.width;
	var height = (width).toString() + "px";

	var top = (windowHeight/2 - (width/2)).toString() + "px";

	$("#loading").css("height", height);
	$("#loading").css("top", top);
}

function reDimPartidaRapida() {
	//console.log("reDimPartidaRapida()");
	var elemBotonJug = document.getElementById('boton_jugar');
	var posBotonJug = elemBotonJug.getBoundingClientRect();

	$("#cuadroPartidaRapida").css("display", "block");
	var elemPartidaRapida = document.getElementById('cuadroPartidaRapida');
	var posPartRapida = elemPartidaRapida.getBoundingClientRect();

	var posX = (Math.floor(posBotonJug.left - posPartRapida.width - 10)).toString()+"px";
	var posY = (Math.floor(posBotonJug.top)).toString()+"px";

	$("#cuadroPartidaRapida").css("left", posX);
	$("#cuadroPartidaRapida").css("top", posY);
}

function reDimRanquingList() {
	//console.log("reDimRanquingList()");
	var elemBotonJug = document.getElementById('boton_jugar');
	var posBotonJug = elemBotonJug.getBoundingClientRect();

	var widthRanquingList = (Math.floor(windowWidth - posBotonJug.right - 15))
	var widthRanquingListStr = widthRanquingList.toString() + "px";


	var elemNumPos = document.getElementById('ranquingPos');
	var posNumPos = elemNumPos.getBoundingClientRect();
	var elemUsuario = document.getElementById('ranquingUsuario');
	var posUsuario = elemUsuario.getBoundingClientRect();
	var elemPercent = document.getElementById('ranquingPercent');
	var posPercent = elemPercent.getBoundingClientRect();
	var elemWins = document.getElementById('ranquingWins');
	var posWins = elemWins.getBoundingClientRect();
	var elemTotal = document.getElementById('ranquingTotal');
	var posTotal = elemTotal.getBoundingClientRect();

	//La anchura de todas las cajas mas unos 50px de margenes
	var widthMin = posNumPos.width + posUsuario.width + posPercent.width + posWins.width + posTotal.width +65;
	var widthMinStr = widthMin.toString() + "px";
	//console.log("widthRanquingList: "+widthRanquingList);
	//console.log("widthMin: "+widthMin);

	if (widthMin > widthRanquingList) {
		//console.log("Descuadre");
		$("#ranquingList").css("width", widthMinStr);
	} else {
		//console.log("Bien");
		$("#ranquingList").css("width", widthRanquingListStr);
	}
}

function maximizeListaEventos() {
	//console.log("maximizeListaEventos()");

	//Ocultamos-mostramos boton
	$("#maximizeListaEventos").css("display", "none");
	$("#restoreListaEventos").css("display", "block");
	$("#minimizeListaEventos").css("display", "block");

	var maxHeight = (windowHeight/4);
	var maxHeightStr = maxHeight.toString() + "px";

	$("#listaEventos").css("max-height", maxHeightStr);
	$("#listaEventos").css("background-size", "100% 150%");

	//Para tener los eventos antiguos ocultos en el overflow
	var elemTittleListaEventos = document.getElementById("tittleListaEventos");
	var posTittleListaEventos = elemTittleListaEventos.getBoundingClientRect();

	var heightTittle = posTittleListaEventos.height;

	var maxHeightText = (maxHeight - heightTittle - 8).toString() + "px";

	$("#textoListaEventos").css("max-height", maxHeightText);
}

function restoreListaEventos() {
	console.log("restoreListaEventos()");

	//Ocultamos-mostramos boton
	$("#maximizeListaEventos").css("display", "block");
	$("#restoreListaEventos").css("display", "none");
	$("#minimizeListaEventos").css("display", "block");

	var elemTittleListaEventos = document.getElementById('tittleListaEventos');
	var posTittleListaEventos = elemTittleListaEventos.getBoundingClientRect();

	var maxHeight = (posTittleListaEventos.height + 20);
	var maxHeightStr = maxHeight.toString() + "px";

	$("#listaEventos").css("max-height", maxHeightStr);
	$("#listaEventos").css("background-size", "100% 450%");

	//Para tener los eventos antiguos ocultos en el overflow
	var maxHeightText = "0px";
	$("#textoListaEventos").css("max-height", maxHeightText);
}

function minimizeListaEventos() {
	console.log("minimizeListaEventos()");

	//Ocultamos-mostramos boton
	$("#maximizeListaEventos").css("display", "block");
	$("#restoreListaEventos").css("display", "block");
	$("#minimizeListaEventos").css("display", "none");

	var elemTittleListaEventos = document.getElementById('tittleListaEventos');
	var posTittleListaEventos = elemTittleListaEventos.getBoundingClientRect();

	var maxWidth = (posTittleListaEventos.width + 60);
	var maxWidthStr = maxWidth.toString() + "px";
	var maxHeight = (posTittleListaEventos.height + 20);
	var maxHeightStr = maxHeight.toString() + "px";

	$("#listaEventos").css("max-width", maxWidthStr);
	$("#listaEventos").css("max-height", maxHeightStr);
	$("#listaEventos").css("background-size", "100% 450%");

	//Para tener los eventos antiguos ocultos en el overflow
	var maxHeightText = "0px";
	$("#textoListaEventos").css("max-height", maxHeightText);
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
	}
}

function reDimAyudaCartaEspecial(cartaEspecial) {
	console.log("reDimAyudaCartaEspecial()");

	var marginIzqDcha = 30;
	var marginBottom = 30;
	var posXNum = Math.floor(posOrganosJugadores[1].widthOrgano + posOrganosJugadores[1].posComodin[0] + marginIzqDcha);
	var posX = (Math.floor(posOrganosJugadores[1].widthOrgano + posOrganosJugadores[1].posComodin[0] + marginIzqDcha)).toString() + "px";
	var width = (Math.floor(windowWidth - posXNum - marginIzqDcha)).toString() + "px";

	var height = "auto";

	//console.log("posXNum: "+posXNum+" - posX: "+posX);
	//console.log("width: "+width);
	//console.log("height: "+height);

	$("#"+cartaEspecial).css("left", posX);
	$("#"+cartaEspecial).css("width", width);
	$("#"+cartaEspecial).css("height", height);

	var elemAyudaLadronDeOrganos = document.getElementById(cartaEspecial);
	var posAyudaLadronDeOrganos = elemAyudaLadronDeOrganos.getBoundingClientRect();

	var top = (Math.floor(windowHeight - posAyudaLadronDeOrganos.height - marginBottom));

	//Si se trata de un descarte tengo en cuenta donde he colocado el boton de fin descartes
	if (cartaEspecial == "ayudaDescartes") {
		var elemDescartesButton = document.getElementById("descartes_boton");
		var posDescartesButton = elemDescartesButton.getBoundingClientRect();
		top= Math.floor(top - (windowHeight - posDescartesButton.top - 10));
	}

	var topStr = top.toString() + "px";

	$("#"+cartaEspecial).css("top", top);
}

function reDimListaTurnos() {
	//console.log("reDimListaTurnos()");

	//Aseguramos solo mostrar en partida
	if (isEmpty(infoJugadores)) {
		return;
	}

	//redimensionamos en relacion al cronometro
	var radius = 30;
	var xCountDown = posCartasUsuario.carta1.x - radius*2.2;
	var yCountDown = posCartasUsuario.carta1.y + radius*2.2;
	
	var xMax = xCountDown - radius*2 - 20;
	var xMin = posOrganosJugadores[2].widthOrgano + posOrganosJugadores[2].posComodin[0] + 20;
	var maxWidth = xMax - xMin - 40;
	var maxHeight = windowHeight - yCountDown - 50;

	var posXStr = (Math.floor(xMin)).toString() + "px";
	var posYStr = (Math.floor(yCountDown)).toString() + "px";
	var maxWidthStr = (Math.floor(maxWidth)).toString() + "px";
	var maxHeightStr = (Math.floor(maxHeight)).toString() + "px";
	
	$("#listaTurnos").css("left", posXStr);
	$("#listaTurnos").css("top", posYStr);
	$("#listaTurnos").css("max-width", maxWidthStr);
	$("#listaTurnos").css("max-height", maxHeightStr);

	var nombreJug = ""; 
	var textoListaTurnos = "";
	for (var i = 0; i < jugadores.length; i++) {
		if (jugadores[i] == usuario) {
			nombreJug = "<b>TÚ</b>";
		} else {
			nombreJug = infoJugadores[jugadores[i]].nombre;
		}
		
		if (jugadores[i] == turno) {
			textoListaTurnos += "<p class='textoListaTurnosActual'><b>"+(i+1)+".- </b>"+nombreJug+"</br></p>";
		} else {
			textoListaTurnos += "<p><b>"+(i+1)+".- </b>"+nombreJug+"</br></p>";
		}
		
	}
	document.getElementById("textoListaTurnos").innerHTML = textoListaTurnos;

	$("#listaTurnos").css("visibility","visible");
}

function reDimListaEventos() {
	//console.log("reDimListaEventos()");
	
	//Aseguramos solo mostrar en partida
	if (isEmpty(infoJugadores)) {
		return;
	}

	var maxWidthStr = (windowWidth/4 + 30).toString() + "px";
	var maxHeight = (windowHeight/4);
	var maxHeightStr = maxHeight.toString() + "px";

	//Si hay menos de 5 jugadores en juego, lo ponemos en el hueco de un jugador libre en pref 3, 4, 5, 2.
	var arrPosPref = [3, 4, 5, 2];
	var posPref = -1;
	for (var i = 0; i < arrPosPref.length; i++) {
		posPref = arrPosPref[i];
		for (var u = 0; u < posJugadores.length; u++) {
			if (posJugadores[u] == arrPosPref[i]) {
				posPref = -1;
				break;
			}
		}
		if (posPref != -1) {
			break;;
		}
	}

	var posX = 0;
	var posY = 0;
	//Si no hay posicion preferida lo ponemos "donde siempre"
	if (posPref == -1) {
		posX = (windowWidth/3) * 2 + 10;
		posY = windowHeight/2 - maxHeight/2 - 20;
	} else {
		posX = posOrganosJugadores[posPref].posCerebro[0] - 30;
		posY = posOrganosJugadores[posPref].posCerebro[1];
	}

	/**
	//Alt: Por si gestionamos movimiento de listaEventos
	var strgLeft = localStorage.getItem('strgLeft');
	var strgTop = localStorage.getItem('strgTop');

	if (isEmpty(strgLeft) || isEmpty(strgTop)) {
		var posX = (windowWidth/3) * 2 + 10;
		var posY = windowHeight/2 - maxHeight/2 - 20;
		localStorage.setItem('strgLeft', posX);
		localStorage.setItem('strgTop', posY);
	} else {
		var posX = strgLeft;
		var posY = strgTop;
	}
	**/

	var posXStr = posX.toString() + "px";
	var posYStr = posY.toString() + "px";

	$("#listaEventos").css("left", posXStr);
	$("#listaEventos").css("top", posYStr);
	$("#listaEventos").css("max-width", maxWidthStr);
	$("#listaEventos").css("max-height", maxHeightStr);

	$("#listaEventos").css("visibility","visible");
	$("#listaEventos").css("background-size", "100% 150%");

	//Altura y anchura de los iconos de maximize, minimize y restore
	var elemTittleListaEventos = document.getElementById('tittleListaEventos');
	var posTittleListaEventos = elemTittleListaEventos.getBoundingClientRect();

	var heightMaxMinIcons = posTittleListaEventos.height.toString() + "px";
	var widthMaxMinIcons = heightMaxMinIcons;	

	$("#maximizeListaEventos").css("width", widthMaxMinIcons);
	$("#maximizeListaEventos").css("height", heightMaxMinIcons);	
	$("#restoreListaEventos").css("width", widthMaxMinIcons);
	$("#restoreListaEventos").css("height", heightMaxMinIcons);
	$("#minimizeListaEventos").css("width", widthMaxMinIcons);
	$("#minimizeListaEventos").css("height", heightMaxMinIcons);

	var modeListaEventos = localStorage.getItem('modeListaEventos');
	switch (modeListaEventos) {
	case "maximize":
		maximizeListaEventos();
		break;
	case "restore":
		restoreListaEventos();
		break;
	case "minimize":
		minimizeListaEventos();
		break;
	default:
		maximizeListaEventos();
		break;
	}
}

function reDimReloadButton() {
	//console.log("reDimReloadButton()");
	$("#reloadButton").css("visibility","visible");
	$("#exitButton").css("visibility","visible");
}

function reDimExitButton() {
	//console.log("reDimExitButton()");
	$("#reloadButton").css("visibility","visible");
	$("#exitButton").css("visibility","visible");
}

function reDimCanvas(option) {
	//No tiene porque ir con doneResizing()
	windowWidth = window.innerWidth;
	windowHeight = window.innerHeight;

	//Para redibujar texto en canvas
	reDimCanvasON = true; 

	//Parte de preparar partida
	if (option == "resizing") {
		Engine.initCanvas();
	}

	Engine.initJugadores();
	Engine.initPosOrganosJugadores();
	Engine.initPosPlayersHandCards();
	Engine.initPosCartasUsuario();
	Engine.initFinDescartesButton();
	Engine.initPauseButton();

	if (option == "resizing") {
		actualizarCanvasBG();
	}

	actObjects();
	actualizarCanvasAPO();

	//Parte de los turnos
	actualizarCanvasMID();
	reDimCanvasON = true;
}

function doneResizing(option) {
	console.log("doneResizing()");
	windowWidth = window.innerWidth;
	windowHeight = window.innerHeight;
	reDimPartidaRapida();
	reDimRanquingList();
	reDimContainer_instrucciones();

	if (idPartida != "") {
		CountDown.reDimCountDown();
		first = true;

		reDimCanvas(option);
		reDimListaEventos();
		reDimListaTurnos();
		reDimReloadButton(); //Solo para hacerlos visibles
		reDimExitButton(); //Solo para hacerlos visibles
	}
}

$(document).ready(function(){
	console.log("Document Ready");
	console.log("Orientation before lock is: "+screen.orientation.type);
	//Da error en el navegador, pero no para la ejecucion
	screen.orientation.lock('landscape');

	window.onload = function(){
		console.log("Window onload");

		//Para no llamar a doneResizing() un millon de veces
		$(window).resize(function() {
		    clearTimeout(idDoneResizing);
		    idDoneResizing = setTimeout(doneResizing, 50, "resizing");	 
		});
	}
})
