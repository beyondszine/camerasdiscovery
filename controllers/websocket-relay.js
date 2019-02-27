// Use the websocket-relay to serve a raw MPEG-TS over WebSockets. You can use
// ffmpeg to feed the relay. ffmpeg -> websocket-relay -> browser
// Example:
// node websocket-relay yoursecret 8081 8082
// ffmpeg -i <some input> -f mpegts http://localhost:8081/yoursecret
//  ffmpeg -rtsp_transport tcp -i "rtsp://192.168.1.99/live/av0?user=beyond&passwd=abcd1234" -f mpegts -codec:v mpeg1video -bf 0 -codec:a mp2 -r 30 http://localhost:8081/mysecret

var fs = require('fs'),
	http = require('http'),
	WebSocket = require('ws');

if (process.argv.length < 3) {
	console.log(
		'Usage: \n' +
		'node websocket-relay.js <secret> [<stream-port> <websocket-port>]'
	);
	process.exitCode(1);
}

console.log("Supplied args are:",process.argv);
var STREAM_SECRET = process.argv[2],
	STREAM_PORT = process.argv[3] || 8081,
	WEBSOCKET_PORT = process.argv[4] || 8082,
	RECORD_STREAM = false;

// Websocket Server
var socketServer = new WebSocket.Server({port: WEBSOCKET_PORT, perMessageDeflate: false});
socketServer.connectionCount = 0;
socketServer.on('connection', function(socket, upgradeReq) {
	socketServer.connectionCount++;
	console.log(
		'New WebSocket Connection: ', 
		(upgradeReq || socket.upgradeReq).socket.remoteAddress,
		(upgradeReq || socket.upgradeReq).headers['user-agent'],
		'('+socketServer.connectionCount+' total)'
	);

	socket.on('close', function(code, message){
		socketServer.connectionCount--;
		console.log(
			'Disconnected WebSocket ('+socketServer.connectionCount+' total)'
		);
		console.log("disconnected one was: ",socket);
	});
});

socketServer.on('error',function(websocketerr){
	console.error("Error occured while binding with port",websocketerr);
	process.exitCode=1;
	// process.send('Could not bind to ',WEBSOCKET_PORT);
});

socketServer.on('listening',function(websocketserver){
	console.error("Successfully bound with port: ",WEBSOCKET_PORT);
	// process.send('Awaiting WebSocket connections on ws://127.0.0.1:'+WEBSOCKET_PORT+'/');
});

socketServer.broadcast = function(data) {
	socketServer.clients.forEach(function each(client) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(data);
		}
	});
};

// HTTP Server to accept incomming MPEG-TS Stream from ffmpeg
var streamServer = http.createServer( function(request, response) {
	var params = request.url.substr(1).split('/');

	if (params[0] !== STREAM_SECRET) {
		console.log(
			'Failed Stream Connection: '+ request.socket.remoteAddress + ':' +
			request.socket.remotePort + ' - wrong secret.'
		);
		response.end();
	}

	response.connection.setTimeout(0);
	console.log(
		'Stream Connected: ' + 
		request.socket.remoteAddress + ':' +
		request.socket.remotePort
	);
	request.on('data', function(data){
		socketServer.broadcast(data);
		if (request.socket.recording) {
			request.socket.recording.write(data);
		}
	});
	request.on('end',function(){
		console.log('close');
		if (request.socket.recording) {
			request.socket.recording.close();
		}
	});

	// Record the stream to a local file?
	if (RECORD_STREAM) {
		var path = 'recordings/' + Date.now() + '.ts';
		request.socket.recording = fs.createWriteStream(path);
	}
})
.on('error', function(httpservererror){
	console.error("Error occured while binding with port",httpservererror);
	process.exitCode=1;
	// process.send('Could not bind to ',STREAM_PORT);
})
.listen(STREAM_PORT, function(){
	console.error("Successfully bound with port: ",STREAM_PORT);
	// process.send('Awaiting WebSocket connections on ws://127.0.0.1:'+STREAM_PORT+'/');
});
