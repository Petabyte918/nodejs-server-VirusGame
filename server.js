// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

var port = process.env.PORT || 5000;
//app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname+"/static/", 'index.html'));
});

// Starts the server.
server.listen(port, function() {
//server.listen(5000, function() {
  console.log('Starting server');
});




var players = {};
io.on('connection', function(socket) {
	socket.emit('connected', {message: 'Hi!'})
	socket.on('new player', function() {
	    console.log("Server. New player");
	});
});