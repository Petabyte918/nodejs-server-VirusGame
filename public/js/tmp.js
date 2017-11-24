//PENDIENTE ANTES DEL MARTES
1.- DONE- Settings
2.- DONE- Ranquing
3.- DONE- Login
4.- DONE- Register
5.- DONE- Leave-unlogin (o similar)
6.- DONE- Imagenes cartas
7.- Comentarios bocadillos primera vez al menos para los tres botones principales
8.- Funcionalidad resto cartas
	Especiales:
		-Cambiar el panel de descarte a arriba por ejemplo
		-Cada vez que una carta especial es arrastrada, un cuadro de instrucciones
		aparece a la derecha del cubo. Se puede cerrar si la carta vuelve a su sitio o al final del turno
		por si solo. Y en settings se puede ajustar como ayuda débil.
		-Con un span cada vez que la carta de use mal, podemos remarcar con otro color lo que se ha incumplido
9.- DONE- Poder descartar todas las cartas
10.- Echar al jugador tras pasar tres turnos
11.- Representar movimientos
12.- Virus comodin puede ser curado por cualquier medicina
13.- Medicina comodin puede ser infectado por cualquier virus

Edicion Imagenes
1.-Mejorar nitidez
2.-Exposicion 0-25-0-50-25
3.-Suavizado 100
4.-Suavizar 0-100
5.-Cambiar tamaño 250px


function renderImage(context){
	// context.drawImage(img,x,y,width,height);
	var currentImage = new Image();

	currentImage.onload = function(){
		context.drawImage(currentImage,10,10,150,200);
	}
	randomBinaryNumber = Math.floor(Math.random() * 2);

	if (randomBinaryNumber == 0){
		currentImage.src = 'img/cardImages/organoCorazon.jpg'
	} else if (randomBinaryNumber == 1){
		currentImage.src = 'img/cardImages/organoPulmon.jpg'
	} else {
		console.log(randomBinaryNumber);
	}

}


var jugadorType = {humano: 'humano', maquina: 'maquina'};
function jugador(){
	this.jugadorType = jugadorType;
}

for (var i=0; i < numJugadores; i++){
	jugadores.push(new jugador(jugadorType.humano));
}
for (var i=0; i < numMaquinas; i++){
	jugadores.push(new jugador(jugadorType.maquina));
}


function ponerJugadores(numJugadores, numMaquinas){
	//Queremos que todos los usuarios esten ubicados en cada dispositivo de la misma forma
	//Empezamos por el jugador propio y vamos colocando en sentido horario hasta completar el bucle
	var posUsuario = jugadores.find();
	var i = posUsuario;
	var contador = 0;
	while (contador < numJugadores) {
		posJugadores[i];

		renderBgCard(widthCarta, heightCarta, posCarta1, posCarta2, posCarta3);

		i++;
		if (i == numJugadores){
			i == 0;
		}
	}
}

/**

	cx.fillStyle = '#f0f0f0';
	cx.fillRect(0,0,windowWidth,windowHeight);
	for (var i = 0; i < objetos.length; i++){
		cx.fillStyle = objetos[i].color;
		cx.fillRect(objetos[i].x, objetos[i].y, objetos[i].width, objetos[i].height);
	}


	<div id="container_nickname">
		<input class="user_form" type="text" placeholder=":input">
		<a class="user_form" id="boton_borrar" title="Borrar" onclick="button_delete()"></a>
	</div>

**/

if (cardType == "organo") {
		if (posDestino == 1){
			var widthOrgano = posOrganosJugadores[posDestino-1][0];
			var heightOrgano = posOrganosJugadores[posDestino-1][1];
			var posOrgano = null;
			var src = cartasUsuario[numCarta].picture;
			switch (organType){
			case "cerebro":
				posOrgano = posOrganosJugadores[posDestino-1][2];
				break;
			case "corazon":
				posOrgano = posOrganosJugadores[posDestino-1][3];
				break;
			case "hueso":
				posOrgano = posOrganosJugadores[posDestino-1][4];
				break;
			case "higado":
				posOrgano = posOrganosJugadores[posDestino-1][5];
				break;
			default:
				alert("ValidarMov: cardType erroneo")
				break;
			}

			renderOrgano(widthOrgano, heightOrgano, posOrgano, src, "normal");
			//Mandamos movimiento al servidor
			nuevaCarta(numCarta);
			actualizarCanvas();
		} else {
			alert("Movimiento no valido");
		}

/**function renderCard() {
	var img = new Image();
	img.src = ""
}
(cardType.organo, 'pulmon', 'img/cardImages/organoHueso.png')**/

function renderOrgano (widthOrgano, heightOrgano, posOrgano, src, estado){
	//var x, y, r = 0;
	//var x = posOrgano[0] + widthOrgano / 2;
	//var y = posOrgano[1] + heightOrgano / 2;
	//var r = widthOrgano / 2;
	//Estados: vacio, normal, enfermo, vacunado
	if (estado == "vacio"){
		cxBG.fillStyle = 'white';
		cxBG.fillRect(posOrgano[0], posOrgano[1], widthOrgano, heightOrgano);
	}

	if(estado == "normal"){
		var img1 = new Image();
		img1.src = objetos[0].src;
		img1.onload = function(){
			//console.log("objetos[0] :"+objetos[0]);
			cxBG.drawImage(img1, posOrgano[0], posOrgano[1], widthOrgano, heightOrgano);
		}
	}
	/** SERAN CIRCULOS
		cx.strokeStyle = "red";
		cx.fillStyle = "blue";
		cx.lineWidth = 5;
		cx.arc(x, y, r, 0, 2 * Math.PI);
		cx.fill();
		cx.stroke();
	}
	**/
}

function ponerJugadores(){
	//Queremos que todos los usuarios esten ubicados en cada dispositivo de la misma forma
	//Empezamos por el jugador propio y vamos colocando en sentido horario hasta completar el bucle
	var widthOrgano = "";
	var heightOrgano = "";
	var posOrgano1, posOrgano2, posOrgano3, posOrgano4 = null;
	for (var i = 0; i < posOrganosJugadores.length; i++){
		//console.log("JUGADOR "+i+1);
		widthOrgano = posOrganosJugadores[i][0];
		heightOrgano = posOrganosJugadores[i][1];
		for (var u = 2; u < 6; u++){
			posOrgano = posOrganosJugadores[i][u];
			//console.log("widthCarta: "+widthCarta);
			//console.log("heightCarta: "+heightCarta);
			//console.log("posCarta1: "+posCarta1);
			//console.log("posCarta2: "+posCarta2);
			//console.log("posCarta3: "+posCarta3);
			renderOrgano(widthOrgano, heightOrgano, posOrgano, "", "vacio");
		}
	}
}


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

function handleReconect(){
	console.log("handleReconect");

	//No guardamos al usuario antes, no nos hace falta e igualmente debemos guardalo aqui si tenemos un idPartida
	//guardado pero el servidor ya ha eliminado la partida o nos ha eliminado de la partida
	localStorage.setItem('usuario', usuario);
	localStorage.setItem('idPartida', idPartida);

	var carta1 = takeCard();
	var carta2 = takeCard();
	if (carta2 == null) {
		console.log("handleReconect - La carta 2 es null");
		carta2 = carta1;
	}
	var carta3 = takeCard();
		if (carta3 == null) {
		console.log("handleReconect - La carta 3 es null");
		carta3 = carta1;
	}

	//Un poco tricky porque:
	//1.- Si no es tu turno, otro tipo robara de nuevo cartas que has robado
	//2.- Si no hay suficientes cartas en el mazo al menos puedes robar una y la repites
	//Solucion: tener una baraja entera y robar cartas aleatorias de ahi
	cartasUsuario.push(carta1);
	cartasUsuario.push(carta2);
	cartasUsuario.push(carta3);

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
}



function checkMatchRunning(){
	var idPartidaStored = localStorage.getItem('idPartida');

	if ((idPartidaStored != undefined) && (idPartidaStored != "") && (idPartidaStored != null)) {
		console.log("Hay una partida abandonada");
		console.log("Tratamos de entrar de nuevo");
		var usuarioAntiguo = localStorage.getItem('usuario', usuario);

		//Preguntamos al servidor si en el id de partida que tenemos guardado, esta nuestro nuevo id o el antiguo
		console.log("idPartida: "+idPartidaStored);
		console.log("usuario: "+usuario);
		console.log("usuarioAntiguo: "+usuarioAntiguo);
		var datos = {
			idPartida: idPartidaStored,
			usuario: usuario,
			usuarioAntiguo: usuarioAntiguo
		}
		socket.emit('checkMatchRunning', datos);
			//Si es que si pedimos al servidor que cambie de sus variables el antiguo id por el nuevo
			//Pedimos datos de la partida->Si he ido programando bien, con que nos pase prepararPartida deberia valer
	} else {
		console.log("No hay partidas empezadas");
	}
}

socket.on('checkMatchRunningKO', function(){
	//Aunque el usuario tiene guardada la partida, el servidor no.
	//Puede ser porque la partida ha terminado o porque el servidor le ha expulsado de la partida definitivamente
	//o porque el usuario ha salido de la app bruscamente y no se ha borrado correctamente el localStorage
	console.log("checkMatchRunningKO");
	localStorage.removeItem('idPartida');
})