
//Informacion que se intercambia con el servidor o se pide
var usuario = "";
var idPartida = "";
var numTurno;
var turno;
var jugadores = [];
var infoJugadores = {};
var deckOfCards = [];
var movJugador = "";

//Informacion exclusiva de cada cliente
var posJugadores = []; //Posicion que ocupara cada jugador dependiendo del num de jugadores total
							//Busco pasandole la posicion del jugador
var posOrganosJugadores = {}; //posOrganosJugadores[posJug] Informacion para dibujar los organos de los jugadores
var cartasUsuario = []; //Cartas que tiene en la mano cada jugador
var posCartasUsuario = []; //Informacion para dibujar las cartas de la mano
var posCubosDescarte = {};
var organosJugadoresCli = {}; //Informacion de los jugadores y sus organos
var jugPorPosicion = {}; //Dada una posicion te devuelve un jugador
var posPorJugador = {}; //Dado un jugador te devuelve una posicion
var finDescarte = true; //Indica si estoy en proceso de descarte
var descartes = {0: false, 1: false, 2: false}; //
var transplante = {enProceso: false, organo1: {organo: "", numJug: -1}, organo2: {organo: "", numJug: -1}};

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
			organoComodin: ""
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

function gestionarMov(movJugador){

}

function abrirAyudaCartas (numCarta) {
	console.log("abrirAyudaCartas()");	
	//Antes de abrir nuevas cerramos las ya abiertas
	cerrarAyudaCartas();

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
	console.log("cerrarAyudaCartas()");
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

Engine = new function () {
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
			heightOrgano:heightOrgano,
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
	this.initCubosDescarte = function(){
		var widthCubo = ((windowWidth / 6) * 0.65) - 20;
		var heightCubo = (widthCubo * 0.9) //(180/201) Para mantener la prop de la imagen

		posCubosDescarte.widthCubo = widthCubo;
		posCubosDescarte.heightCubo = heightCubo;

		posCubosDescarte[1] = {
			x: ((windowWidth / 2) - widthCubo * 2 - 30),
			y: ((windowHeight / 3) + 30)
		}
		posCubosDescarte[2] = {
			x: ((windowWidth / 2) - widthCubo * 1 - 10),
			y: ((windowHeight / 3) + 30)
		}
		posCubosDescarte[3] = {
			x: ((windowWidth / 2) + widthCubo * 0 + 10),
			y: ((windowHeight / 3) + 30)
		}
		posCubosDescarte[4] = {
			x: ((windowWidth / 2) + widthCubo * 1 + 30),
			y: ((windowHeight / 3) + 30)
		}
	}	
	this.initPosCartasUsuario = function(){

		var distDisp = posCubosDescarte[1].y + posCubosDescarte.heightCubo;
		//La altura de las cartas del usuario sera proporcional al espacio entre los cubos y los organos del usuario
		var heightCarta = (posOrganosJugadores[1].posCerebro[1] - distDisp - 70) * 0.90;
		//La anchura de las cartas del usuario esta en proporcion con (1536/1013)
		var widthCarta = heightCarta * (1013/1536);

		//La posY sera centrada entre los cubos y el espacio para los organos
		var posY = ((distDisp - heightCarta) / 2) + posCubosDescarte[1].y;

		var posCarta1 = [windowWidth/2 - widthCarta*1.5 - 10, posY];
		var posCarta2 = [windowWidth/2 - widthCarta*0.5, posY];
		var posCarta3 = [windowWidth/2 + widthCarta*0.5 + 10, posY];
		posCartasUsuario = [widthCarta, heightCarta, posCarta1, posCarta2, posCarta3];

	}
	this.initFinDescartesButton = function() {
		/** Colocacion Por cubos de descarte **/
		var widthCubo = ((windowWidth / 6) * 0.65) - 20;

		var posX = posCubosDescarte[4].x + widthCubo + 10;
		var posY = posCubosDescarte[4].y - 5;

		$("#descartes_boton").css({"top": posY, "left": posX});


		/** Colocacion por cartas de usuario
		var posX = posCartasUsuario[4][0] + posCartasUsuario[0] + 20;
		var posY = posCartasUsuario[4][1] + 20;

		$("#descartes_boton").css({"top": posY, "left": posX});**/
	}
	this.initPauseButton = function() {
		$("#pauseButton").css("visibility","visible");

		var left = (Math.floor(posCubosDescarte[1].x - 50)).toString()+"px";
		//Algo hardCoding. El 84 es la altura del elemento..claro, que tp se va a cambiar y estas hasta los huevos
		var top = (Math.floor(windowHeight - 84 - 30)).toString()+"px";

		$("#pauseButton").css("left", left);
		$("#pauseButton").css("top", top);
	}
}

