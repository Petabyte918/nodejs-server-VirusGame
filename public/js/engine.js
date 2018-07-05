
//Informacion que se intercambia con el servidor o se pide
var usuario = "";
var idPartida = "";
var numTurno;
var turno;
var jugadores = [];
var infoJugadores = {};
var deckOfCards = [];
var movJugador = {
		jugOrigen: "",
		jugDestino: "",
		texto: "",
		tipoMov: "",
		tipoOrgano: "",
		cartasUsadas: []
	};

//Informacion exclusiva de cada cliente
var posJugadores = []; //Posicion que ocupara cada jugador dependiendo del num de jugadores total
							//Busco pasandole la posicion del jugador
var posOrganosJugadores = {}; //posOrganosJugadores[posJug] Informacion para dibujar los organos de los jugadores
var cartasUsuario = []; //Cartas que tiene en la mano cada jugador
var posCartasUsuario = {}; //Datos cartas usuario
var posPlayersHandCards = {}; //Datos cartas otros jugadores
var organosJugadoresCli = {}; //Informacion de los jugadores y sus organos
var jugPorPosicion = {}; //Dada una posicion te devuelve un jugador
var posPorJugador = {}; //Dado un jugador te devuelve una posicion
var finDescarte = true; //Indica si estoy en proceso de descarte
var descartes = {0: false, 1: false, 2: false}; //
var descartesHist = [];
var transplante = {enProceso: false, organo1: {organo: "", numJug: -1}, organo2: {organo: "", numJug: -1} };

function aleatorioRGBrange(inferior,superior) {
	var numPosibilidades = superior - inferior;
	var aleat = Math.random() * numPosibilidades;
	aleat = Math.floor(aleat);
	return parseInt(inferior) + aleat;
}
function colorAleatorio() {
   return "rgb(" + aleatorioRGBrange(0,255) + "," + aleatorioRGBrange(0,255) + "," + aleatorioRGBrange(0,255) + ")";
}

function cambiaApass(caja) {
	console.log("cambiaApass()-"+caja);
}

function isEmpty(data) {
	if ((data == undefined) || (data == null) || (data == "")) {
		return true;
	} else {
		return false;
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

//Convierte la primera letra de un String en mayusculas
function mayusPrimera(string){
  return string.charAt(0).toUpperCase() + string.slice(1);
}

//
function prepararOrganosJugadoresCli(){
	var posicion = null;
	for (var i = 0; i < jugadores.length; i++){
		//Estados: vacio, normal, enfermo, vacunado, inmunizado
		posicion = posPorJugador[jugadores[i]].posicion;
		organosJugadoresCli[jugadores[i]] = {
			jugador: jugadores[i],
			posicion: posicion,
			cerebro: "",
			corazon: "",
			higado: "",
			hueso: "",
			comodin: ""
		};
	}
}

function getUsersSorted (optionRanquing, data) {
	//Para no cargarnos data
	var auxData = $.extend(true,{},data);
	var sortedObj = {};
	var objIndex = 0;

	//Si hay menos usuarios que la cantidad de gente del ranquing que queremos mostrar
	var keysObj = Object.keys(data);
	var numUsers = keysObj.length;
	var maxLoop = -1;

	if (numUsers < 10) {
		maxLoop = numUsers;
	} else {
		maxLoop = 10;
	}

	if (optionRanquing == "wins") {
		var topWin = -1;
		var win = -1;
		for (var cont = 0; cont < maxLoop; cont++) {
			for (var i in auxData) {
				win = auxData[i].stats.wins;
				if (win > topWin) {
					topWin = win;
					objIndex = i;
				}
			}
			var auxObj = $.extend(true,{},auxData[objIndex]);
			delete auxData[objIndex];
			sortedObj[cont] = auxObj;
			topWin = -1;
			win = -1;
			objIndex = 0;
		}
	}

	if (optionRanquing == "percent") {
		var topPercent = -1;
		var percent = -1;
		for (var cont = 0; cont < maxLoop; cont++) {
			for (var i in auxData) {
				percent = auxData[i].stats.wins / auxData[i].stats.total;
				//Nos protegemos del Nah
				if (isNaN(percent)) {
					percent = 0;
				}
				if (percent > topPercent) {
					topPercent = percent;
					objIndex = i;
				}
			}
			var auxObj = $.extend(true,{},auxData[objIndex]);
			delete auxData[objIndex];
			sortedObj[cont] = auxObj;
			topPercent = -1;
			percent = -1;
			objIndex = 0;
		}
	}

	if (optionRanquing == "total") {
		var topTotal = -1;
		var total = -1;
		for (var cont = 0; cont < maxLoop; cont++) {
			for (var i in auxData) {
				total = auxData[i].stats.total;
				if (total > topTotal) {
					topTotal = total;
					objIndex = i;
				}
			}
			var auxObj = $.extend(true,{},auxData[objIndex]);
			delete auxData[objIndex];
			sortedObj[cont] = auxObj;
			topTotal = -1;
			total = -1;
			objIndex = 0;
		}
	}

	return sortedObj;
}

function abrirAyudaCartas (numCarta) {
	//console.log("abrirAyudaCartas()");	

	//Si estamos realizando un descarte no abrimos otras ayudas - Muy hacky
	if (numCarta == "ayudaDescartes") {
		reDimAyudaCartaEspecial("ayudaDescartes");
		$("#ayudaDescartes").css("visibility", "visible");
	}
	if (finDescarte == false) {
		return;
	}

	var cardType = cartasUsuario[numCarta].cardType;
	var organType = cartasUsuario[numCarta].organType;
	if (cardType == "tratamiento") {
		switch (organType) {
		case "errorMedico":
			reDimAyudaCartaEspecial("ayudaErrorMedico");
			$("#ayudaErrorMedico").css("visibility", "visible");
			break;
		case "guanteDeLatex":
			reDimAyudaCartaEspecial("ayudaGuanteDeLatex");
			$("#ayudaGuanteDeLatex").css("visibility", "visible");
			break;
		case "transplante":
			reDimAyudaCartaEspecial("ayudaTransplante");
			$("#ayudaTransplante").css("visibility", "visible");
			break;
		case "ladronDeOrganos":
			reDimAyudaCartaEspecial("ayudaLadronDeOrganos");
			$("#ayudaLadronDeOrganos").css("visibility", "visible");
			break;
		case "contagio":
			//reDimAyudaCartaEspecial("contagio");
			//$("#ayudaContagio").css("visibility", "visible");
			break;
		default:
			console.log("Abrir cartas imposible default");
			break;
		}
	}
}

function cerrarAyudaCartas() {
	//console.log("cerrarAyudaCartas()");
	$("#ayudaErrorMedico").css("visibility", "hidden");
	$("#ayudaGuanteDeLatex").css("visibility", "hidden");

	//Solo si el transplante no esta en proceso y si lo esta no se descarta la carta
	if ((transplante.enProceso == false) || (finDescarte == false)) {
		$("#ayudaTransplante").css("visibility", "hidden");
		renderOrganosTransplante();
	}

	$("#ayudaLadronDeOrganos").css("visibility", "hidden");
	$("#ayudaContagio").css("visibility", "hidden");

	$("#ayudaDescartes").css("visibility", "hidden");
}

function takeCard(){
    if (deckOfCards.length != 0){
    	var drawedCard = deckOfCards.shift();
    	//console.log(drawedCard.toString());
    	return drawedCard;
    } else {
    	alert("Oh! No quedan cartas en el mazo!");
        return null;
    }
}

Engine = new function() {
	//Responsive canvas
	this.initCanvas = function(){

		//Canvas frontal - cosas que solo se mueven
		cv = document.getElementById('canvas');
		cv.width = windowWidth;
		cv.height = windowHeight;
		cx = cv.getContext('2d');
		cx.fillStyle = "rgba(0,0,255,0)";
		cx.fillRect(0,0,windowWidth,windowHeight);

		//Canvas apoyo - cosas que se mueven (es un apoyo del frontal)
		cvAPO = document.getElementById('canvasAPO');
		cvAPO.width = windowWidth;
		cvAPO.height = windowHeight;
		cxAPO = cvAPO.getContext('2d');
		cxAPO.fillStyle = "rgba(0,0,255,0)";
		cxAPO.fillRect(0,0,windowWidth,windowHeight);

		//Canvas del medio - turnos y estado tablero (se borra a veces)
		//Este canvas se actualiza junto con el reloj
		cvMID = document.getElementById('canvasMID');
		cvMID.width = windowWidth;
		cvMID.height = windowHeight;
		cxMID = cvMID.getContext('2d');
		cxMID.fillStyle = "rgba(0,0,255,0)";
		cxMID.fillRect(0,0,windowWidth,windowHeight);

		//Canvas en background - fondo y cosas permanentes (no se borra nunca o casi nunca)
		cvBG = document.getElementById('canvasBG');
		cvBG.width = windowWidth;
		cvBG.height = windowHeight;
		cxBG = cvBG.getContext('2d');
		cxBG.fillStyle = 'MediumSeaGreen';
		cxBG.fillRect(0,0,windowWidth,windowHeight);

		$("#container_botones").css("display", "none");
		$("#container_form_create").css("display", "none");
		$("#lista_partidas").css("display", "none");
		$("#canvas_container").css("display", "inline");
	}
	this.initJugadores = function(){
		//Servidor: Esta funcion debe pedir al servidor los jugadores

		//Y saber como colocarlos en la mesa
		//6 posiciones libres. La propia, una a la izq, tres enfrente y otra a la dcha
		var pos1, pos2, pos3, pos4, pos5, pos6 = [];
		switch(jugadores.length){
		case 1:
			posJugadores = [1];
			break;
		case 2:
			posJugadores = [1, 5];
			break;
		case 3:
			posJugadores = [1, 3, 5]; //o [1, 2, 6];
			break;
		case 4:
			posJugadores = [1, 3, 4, 5];
			break;
		case 5:
			posJugadores = [1, 2, 3, 4, 5];
			break;
		case 6:
			posJugadores = [1, 2, 3, 4, 5, 6];
			break;
		default:
			alert("Posicion jugadores erroneo por numero de jugadores erroneo");
			break;
		}
	}
	this.initPosOrganosJugadores = function(){
		var widthDisponible, heightDisponible = 0;
		var widthOrgano, heightOrgano = 0;
		var posCerebro, posCorazon, posHueso, posHigado = 0;
		var relTam = (1536/1013);
		//Posiciones y tamaños estaran proporcionados con el tamaño de la pantalla

		//POSICION 1
		widthDisponible = windowWidth / 3;
		//Los 20px solo afectan al tamanio de la carta
		widthOrgano = widthDisponible / 6 - 20; 
		//La altura de la carta va en relacion a su anchura para que no se deforme (1536/1013);
		heightOrgano = widthOrgano * relTam;

		//La separacion entre organos sera 15px (real 5px pues 5px de borde del organo izq, 5 de borde de organo dcho y 5px de separacion)
		posCerebro = [(windowWidth / 6) * 3  - widthOrgano * 2.5 - 15 * 2, windowHeight - heightOrgano - 20];
		posCorazon = [(windowWidth / 6) * 3  - widthOrgano * 1.5 - 15 * 1, windowHeight - heightOrgano - 20];
		posHueso = [(windowWidth / 6) * 3  - widthOrgano * 0.5 - 15 * 0, windowHeight - heightOrgano - 20];
		posHigado = [(windowWidth / 6) * 3  + widthOrgano * 0.5 + 15 * 1, windowHeight - heightOrgano - 20];
		posComodin = [(windowWidth / 6) * 3  + widthOrgano * 1.5 + 15 * 2, windowHeight - heightOrgano - 20];
		posOrganosJugadores[1] = {
			widthOrgano: widthOrgano,
			heightOrgano:heightOrgano,
			posCerebro: posCerebro,
			posCorazon: posCorazon,
			posHueso: posHueso,
			posHigado: posHigado,
			posComodin: posComodin
		};

		//POSICION 2
		widthDisponible = windowWidth / 3;
		heightDisponible = windowHeight / 3;
		//La separacion entre organos sera 15px (real 5px pues 5px de borde del organo izq, 5 de borde de organo dcho y 5px de separacion)
		heightOrgano = widthDisponible / 6 - 20; 
		//La altura de la carta va en relacion a su anchura para que no se deforme (1536/1013);
		widthOrgano = heightOrgano * relTam;

		posCerebro = [20, windowHeight / 2 - heightOrgano * 2.5 - 15 * 2];
		posCorazon = [20, windowHeight / 2 - heightOrgano * 1.5 - 15 * 1];
		posHueso = [20, windowHeight / 2 - heightOrgano * 0.5 - 15 * 0];
		posHigado = [20, windowHeight / 2 + heightOrgano * 0.5 + 15 * 1];
		posComodin = [20, windowHeight / 2 + heightOrgano * 1.5 + 15 * 2];
		posOrganosJugadores[2] = {
			widthOrgano: widthOrgano,
			heightOrgano: heightOrgano,
			posCerebro: posCerebro,
			posCorazon: posCorazon,
			posHueso: posHueso,
			posHigado: posHigado,
			posComodin: posComodin
		};

		//POSICION 3
		widthDisponible = windowWidth / 3;
		//Los 20px solo afectan al tamanio de la carta
		widthOrgano = widthDisponible / 6 - 20; 
		//La altura de la carta va en relacion a su anchura para que no se deforme (1536/1013);
		heightOrgano = widthOrgano * relTam;

		//La separacion entre organos sera 15px (real 5px pues 5px de borde del organo izq, 5 de borde de organo dcho y 5px de separacion)
		posCerebro = [(windowWidth / 6) * 1  - widthOrgano * 2.5 - 15 * 2, 20];
		posCorazon = [(windowWidth / 6) * 1  - widthOrgano * 1.5 - 15 * 1, 20];
		posHueso = [(windowWidth / 6) * 1  - widthOrgano * 0.5 - 15 * 0, 20];
		posHigado = [(windowWidth / 6) * 1  + widthOrgano * 0.5 + 15 * 1, 20];
		posComodin = [(windowWidth / 6) * 1  + widthOrgano * 1.5 + 15 * 2, 20];
		posOrganosJugadores[3] = {
			widthOrgano: widthOrgano,
			heightOrgano:heightOrgano,
			posCerebro: posCerebro,
			posCorazon: posCorazon,
			posHueso: posHueso,
			posHigado: posHigado,
			posComodin: posComodin
		};	

		//POSICION 4
		widthDisponible = windowWidth / 3;
		//Los 20px solo afectan al tamanio de la carta
		widthOrgano = widthDisponible / 6 - 20; 
		//La altura de la carta va en relacion a su anchura para que no se deforme (1536/1013);
		heightOrgano = widthOrgano * relTam;

		//La separacion entre organos sera 15px (real 5px pues 5px de borde del organo izq, 5 de borde de organo dcho y 5px de separacion)
		posCerebro = [(windowWidth / 6) * 3  - widthOrgano * 2.5 - 15 * 2, 20];
		posCorazon = [(windowWidth / 6) * 3  - widthOrgano * 1.5 - 15 * 1, 20];
		posHueso = [(windowWidth / 6) * 3  - widthOrgano * 0.5 - 15 * 0, 20];
		posHigado = [(windowWidth / 6) * 3  + widthOrgano * 0.5 + 15 * 1, 20];
		posComodin = [(windowWidth / 6) * 3  + widthOrgano * 1.5 + 15 * 2, 20];
		posOrganosJugadores[4] = {
			widthOrgano: widthOrgano,
			heightOrgano:heightOrgano,
			posCerebro: posCerebro,
			posCorazon: posCorazon,
			posHueso: posHueso,
			posHigado: posHigado,
			posComodin: posComodin
		};

		//POSICION 5
		widthDisponible = windowWidth / 3;
		//Los 20px solo afectan al tamanio de la carta
		widthOrgano = widthDisponible / 6 - 20; 
		//La altura de la carta va en relacion a su anchura para que no se deforme (1536/1013);
		heightOrgano = widthOrgano * relTam;

		//La separacion entre organos sera 15px (real 5px pues 5px de borde del organo izq, 5 de borde de organo dcho y 5px de separacion)
		posCerebro = [(windowWidth / 6) * 5  - widthOrgano * 2.5 - 15 * 2, 20];
		posCorazon = [(windowWidth / 6) * 5  - widthOrgano * 1.5 - 15 * 1, 20];
		posHueso = [(windowWidth / 6) * 5  - widthOrgano * 0.5 - 15 * 0, 20];
		posHigado = [(windowWidth / 6) * 5  + widthOrgano * 0.5 + 15 * 1, 20];
		posComodin = [(windowWidth / 6) * 5  + widthOrgano * 1.5 + 15 * 2, 20];
		posOrganosJugadores[5] = {
			widthOrgano: widthOrgano,
			heightOrgano:heightOrgano,
			posCerebro: posCerebro,
			posCorazon: posCorazon,
			posHueso: posHueso,
			posHigado: posHigado,
			posComodin: posComodin
		};

		//POSICION 6
		widthDisponible = windowWidth / 3;
		heightDisponible = windowHeight / 3;
		//La separacion entre organos sera 15px (real 5px pues 5px de borde del organo izq, 5 de borde de organo dcho y 5px de separacion)
		heightOrgano = widthDisponible / 6 - 20; 
		//La altura de la carta va en relacion a su anchura para que no se deforme (1536/1013);
		widthOrgano = heightOrgano * relTam;

		posCerebro = [windowWidth - widthOrgano - 20, windowHeight / 2 - heightOrgano * 2.5 - 15 * 2];
		posCorazon = [windowWidth - widthOrgano - 20, windowHeight / 2 - heightOrgano * 1.5 - 15 * 1];
		posHueso = [windowWidth - widthOrgano - 20, windowHeight / 2 - heightOrgano * 0.5 - 15 * 0];
		posHigado = [windowWidth - widthOrgano - 20, windowHeight / 2 + heightOrgano * 0.5 + 15 * 1];
		posComodin = [windowWidth - widthOrgano - 20, windowHeight / 2 + heightOrgano * 1.5 + 15 * 2];

		posOrganosJugadores[6] = {
			widthOrgano: widthOrgano,
			heightOrgano:heightOrgano,
			posCerebro: posCerebro,
			posCorazon: posCorazon,
			posHueso: posHueso,
			posHigado: posHigado,
			posComodin: posComodin
		};
	}
	this.initPosCartasUsuario = function(){
		//console.log("Engine.initPosCartasUsuario()");
		//1536px width //console.log("windowWidth: "+windowWidth);
		//1013px height //console.log("windowHeight: "+windowHeight);

		if (windowWidth/windowHeight < 1.6) {
			var widthCarta = ((windowWidth/3)/4);
			var heightCarta = widthCarta * (1536/1013);
		} else {
			var posYUsername = posOrganosJugadores[1].posCerebro[1] - 20;
			var posUser = ((windowHeight/3)*2);
			var heightCarta = posYUsername - posUser;
			var widthCarta = heightCarta * (1013/1536);
		}

		var sepEntreCartas = 8; //max = widthCarta/4

		//Debajo del mazo de descartes
		//Aprovechamos que los descartes no ocupan toda su altura y comenzamos desde ahí
		//var posYDeck = Math.floor(windowHeight/3); //De DeckOfCards.initDeckOfCards();
		//var widthDeck = Math.floor((windowWidth/3)/3); //De DeckOfCards.initDeckOfCards();
		//var heightDeck = Math.floor(widthDeck*210/148); //De DeckOfCards.initDeckOfCards();
		//var posY = posYDeck + heightDeck + sepEntreCartas;

		//Justo encima del nombre de jugador
		var posY = posOrganosJugadores[1].posCerebro[1] - 40 - heightCarta;

		var posCarta1 = {x: windowWidth/2 - widthCarta*1.5 - sepEntreCartas, 
						 y: posY};
		var posCarta2 = {x: windowWidth/2 - widthCarta*0.5,
						 y: posY};
		var posCarta3 = {x: windowWidth/2 + widthCarta*0.5 + sepEntreCartas,
						 y: posY};

		posCartasUsuario = {width: widthCarta, 
							height: heightCarta,
							carta1: posCarta1,
							carta2: posCarta2,
							carta3: posCarta3};

	}
	this.initPosPlayersHandCards = function() {
		//1536px width //console.log("windowWidth: "+windowWidth);
		//1013px height //console.log("windowHeight: "+windowHeight);
		var posCarta1, posCarta2, posCarta3 = {};
		var posX, posY = 0;
		var imgSrc = 'img/cardImagesLQ/reverseCardLQ.png';

		imgOnload[imgSrc] = new Image();
		imgOnload[imgSrc].src = imgSrc;

		if (windowWidth/windowHeight < 1.6) {
			var widthCarta = ((windowWidth/3)/4) * 0.8; //Relacion de tamaño igual que cartas de usuario, pero mas pequenias
			var heightCarta = widthCarta * (1536/1013);
		} else {
			var posYUsername = posOrganosJugadores[1].posCerebro[1] - 20;
			var posUser = ((windowHeight/3)*2);
			var heightCarta = (posYUsername - posUser) * 0.8; //Relacion de tamaño igual que cartas de usuario, pero mas pequenias
			var widthCarta = (heightCarta * (1013/1536));
		}

		var sepEntreCartas = 4; //max = widthCarta/4
		var sepDesdeOrganos = 32; //Hay que separarlo de los nombres de jugadores
		
		posPlayersHandCards.widthCarta = widthCarta;
		posPlayersHandCards.heightCarta = heightCarta;
		posPlayersHandCards.sepEntreCartas = sepEntreCartas;
		posPlayersHandCards.imgSrc = imgSrc;

		//Posicion 1
		posicion1 = null;
		/**
		//Necesario poner posPlayersHandCards.width/height como variable por posicion, no para todos
		posCarta1 = {x: posCartasUsuario.carta1.x,
				  y: posCartasUsuario.carta1.y}
		posCarta2 = {x: posCartasUsuario.carta2.x,
				  y: posCartasUsuario.carta2.y}
		posCarta3 = {x: posCartasUsuario.carta3.x,
				  y: posCartasUsuario.carta3.y}

		posPlayersHandCards[1] = {carta1: posCarta1,
								  carta2: posCarta2,
								  carta3: posCarta3};
		**/

		//Posicion 2
		posX = posOrganosJugadores[2].posCerebro[0] + posOrganosJugadores[2].widthOrgano + sepDesdeOrganos*2;

		posCarta1 = {x: posX,
				  y: windowHeight/2 - widthCarta*1.5 - sepEntreCartas}
		posCarta2 = {x: posX,
				  y: windowHeight/2 - widthCarta*0.5}
		posCarta3 = {x: posX,
				  y: windowHeight/2 + widthCarta*0.5 + sepEntreCartas}

		posPlayersHandCards[2] = {carta1: posCarta1,
								  carta2: posCarta2,
								  carta3: posCarta3};

		//Posicion 3
		posY = posOrganosJugadores[3].posCerebro[1] + posOrganosJugadores[3].heightOrgano + sepDesdeOrganos;

		posCarta1 = {x: (windowWidth/6)*1 - widthCarta*1.5 - sepEntreCartas,
				  y: posY}
		posCarta2 = {x: (windowWidth/6)*1 - widthCarta*0.5,
				  y: posY}
		posCarta3 = {x: (windowWidth/6)*1 + widthCarta*0.5 + sepEntreCartas,
				  y: posY}

		posPlayersHandCards[3] = {carta1: posCarta1,
								  carta2: posCarta2,
								  carta3: posCarta3};

		//Posicion 4
		posY = posOrganosJugadores[4].posCerebro[1] + posOrganosJugadores[4].heightOrgano + sepDesdeOrganos;

		posCarta1 = {x: (windowWidth/6)*3 - widthCarta*1.5 - sepEntreCartas,
				  y: posY}
		posCarta2 = {x: (windowWidth/6)*3 - widthCarta*0.5,
				  y: posY}
		posCarta3 = {x: (windowWidth/6)*3 + widthCarta*0.5 + sepEntreCartas,
				  y: posY}

		posPlayersHandCards[4] = {carta1: posCarta1,
								  carta2: posCarta2,
								  carta3: posCarta3};		
		//Posicion 5
		posY = posOrganosJugadores[5].posCerebro[1] + posOrganosJugadores[5].heightOrgano + sepDesdeOrganos;

		posCarta1 = {x: (windowWidth/6)*5 - widthCarta*1.5 - sepEntreCartas,
				  y: posY}
		posCarta2 = {x: (windowWidth/6)*5 - widthCarta*0.5,
				  y: posY}
		posCarta3 = {x: (windowWidth/6)*5 + widthCarta*0.5 + sepEntreCartas,
				  y: posY}

		posPlayersHandCards[5] = {carta1: posCarta1,
								  carta2: posCarta2,
								  carta3: posCarta3};	
	}
	this.initFinDescartesButton = function() {
		var elemDescartesButton = document.getElementById("descartes_boton");
		var posDescartesButton = elemDescartesButton.getBoundingClientRect();

		var posX = (Math.floor(windowWidth - posDescartesButton.width - 20)).toString()+"px";
		var posY = (Math.floor(windowHeight - posDescartesButton.height - 20)).toString()+"px";

		$("#descartes_boton").css({"top": posY, "left": posX});
	}
	this.initPauseButton = function() {
		$("#pauseButton").css("visibility","visible");
		var elemPauseButton = document.getElementById("pauseButton");
		var posPauseButton = elemPauseButton.getBoundingClientRect();

		var left = (Math.floor(posOrganosJugadores[1].posCerebro[0] - posPauseButton.width - 20)).toString()+"px";
		//Algo hardCoding. El 84 es la altura del elemento..claro, que tp se va a cambiar y estas hasta los huevos
		var top = (Math.floor(windowHeight - 84 - 30)).toString()+"px";

		$("#pauseButton").css("left", left);
		$("#pauseButton").css("top", top);
	}
	this.varsToInit = function () {
		//ENGINE
		idPartida = "";
		turno = "";
		jugadores = [];
		infoJugadores = {};
		deckOfCards = [];
		movJugador = {
			jugOrigen: "",
			jugDestino: "",
			texto: "",
			tipoMov: "",
			cartasUsadas: []
		};

		//Informacion exclusiva de cada cliente
		posJugadores = []; //Posicion que ocupara cada jugador dependiendo del num de jugadores total
									//Busco pasandole la posicion del jugador
		posOrganosJugadores = {}; //posOrganosJugadores[posJug] Informacion para dibujar los organos de los jugadores
		cartasUsuario = []; //Cartas que tiene en la mano cada jugador
		posCartasUsuario = {}; //Datos cartas usuario
		posPlayersHandCards = {}; //Datos cartas otros jugadores
		organosJugadoresCli = {}; //Informacion de los jugadores y sus organos
		jugPorPosicion = {}; //Dada una posicion te devuelve un jugador
		posPorJugador = {}; //Dado un jugador te devuelve una posicion
		descartes = {0: false, 1: false, 2: false}; //
		transplante = {enProceso: false, organo1: {organo: "", numJug: -1}, organo2: {organo: "", numJug: -1}};

		//GAME
		objetos = [];
		reDimCanvasON = true;

		//CLIENTE
		lista_partidas = {};
		idPartidaEsperando = "";
		enPartidaEsperando = false;
		gamePaused = "false";
	}
}

DeckOfCards = new function() {
	//148px width
	//210px height
	this.deckData = {};
	this.descartesData = {};

	this.tmp = 0;

	this.initDeckOfCards = function() {
		var reduccion = 0.8;
		if (windowWidth/windowHeight < 1.6) {
			var width = ((windowWidth/3)/3) * reduccion;
			var height = width*210/148;
		} else {
			var height = (windowHeight/4) * reduccion;
			var width = height*148/210;
		}

		var posXDeck = windowWidth/2 - width;
		var posYDeck = windowHeight/2 - height/1.5; //No esta centrado sino algo mas arriba

		this.deckData = {x: posXDeck, y: posYDeck, width: width, height: height};

		var posXDescartes = windowWidth/2 + 10;
		var posYDescartes = windowHeight/2 - height/1.5; //No esta centrado sino algo mas arriba

		//Los ajustes de tamanio finales son debidos a la diferencia de tamanio entre el mazo y la carta del reverso,
		//por el efecto profundidad del mazo
		if (descartesHist.length == 0) {
			var src = 'img/cardImagesLQ/reverseCardLQ.png';
		} else {
			var src = descartesHist[descartesHist.length - 1].picture;
		}
		this.descartesData = {
							x: posXDescartes,
							y: posYDescartes+5, 
							width: width*0.91, 
							height: height*0.91,
							src: src
							};
	}
	this.renderDeck = function() {
		var deck = new Image();
		deck.src = 'img/cardImagesLQ/deckCardsLQ.png';

		var posX = this.deckData.x;
		var posY = this.deckData.y;
		var width = this.deckData.width;
		var height = this.deckData.height;

		deck.onload = function(){
			cxBG.drawImage(deck, posX, posY, width, height);
		}
	}
	this.renderDescarte = function() {
		var descarte = new Image();

		descarte.src = this.descartesData.src;

		var posX = this.descartesData.x;
		var posY = this.descartesData.y;
		var width = this.descartesData.width;
		var height = this.descartesData.height;

		var verDescarte = new Image();
		//verDescarte.src = 'img/cardImagesLQ/verDescartes.png';
		verDescarte.src = 'img/cardImagesLQ/eyeDescartes.png';

		descarte.onload = function() {
			cxBG.drawImage(descarte, posX, posY, width, height);
			if (descartesHist.length != 0) {
				verDescarte.onload = function() {
					cxBG.drawImage(verDescarte, posX + width - 5 - width/3, posY + 5, width/3, width*(352/480)/3);
				}
			}
		}
	}
	this.getDescartesData = function(data) {
		switch(data){
		case "posX":
			return this.descartesData.x;
			break ;
		case "posY":
			return this.descartesData.y;
			break
		case "width":
			return this.descartesData.width;
			break;
		case "height":
			return this.descartesData.height;
			break;
		default:
			return null;
			break;
		}
	}
	this.getDeckData = function(data) {
		switch(data){
		case "posX":
			return this.deckData.x;
			break ;
		case "posY":
			return this.deckData.y;
			break
		case "width":
			return this.deckData.width;
			break;
		case "height":
			return this.deckData.height;
			break;
		default:
			return null;
			break;
		}
	}
	this.reDimDeckOfCards =  function() {
		this.initDeckOfCards();
		this.renderDeck();
		this.renderDescarte();
	}
}

CountDown = new function() {
	this.radius = 30;
	this.x = 0;
	this.y = 0;

	this.reDimCountDown = function() {
		this.radius = 30;
		this.x = windowWidth/3;
		this.y = windowHeight/2;
	}
	this.getPosX = function() {
		return this.x;
	}
	this.getPosY = function() {
		return this.y;
	}
	this.getRadius = function() {
		return this.radius;
	}
	this.getPosYtextoTurno = function() {
		return this.y - 50;
	}
	this.getHeightTextoTurno = function() {
		return 25;
	}
}
