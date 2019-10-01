var http = require('http');
var fs = require('fs');
var url = require('url');
var port = 8081;
var httpServer = null;

const VOFF = 0, VERROR = 1, VWARN = 2, VINFO = 3, VDEBUG1 = 4, VDEBUG2 = 5;
var verbosityThsld = VDEBUG2;

function log(verbosity, text) {
  if (verbosity <= verbosityThsld) console.log(text);
}

// https://stackoverflow.com/questions/14626636/how-do-i-shutdown-a-node-js-https-server-immediately
var sockets = {}, nextSocketId = 0;

function maintainSocketHash(server) {
  // Maintain a hash of all connected sockets.
  server.on('connection', function (socket) {
    // Add a newly connected socket.
    var socketId = nextSocketId++;
    sockets[socketId] = socket;
    log(VDEBUG2, 'Socket ' + socketId + ' opened');

    // Remove the socket when it closes.
    socket.on('close', function () {
      log(VDEBUG2, 'Socket ' + socketId + ' closed');
      delete sockets[socketId];
    });
  });
}

function destroyOpenSockets() {
  for (var socketId in sockets) {
    log(VDEBUG2, 'Socket ' + socketId + ' destroyed');
    sockets[socketId].destroy();
  }
}

function exitServer() {
  httpServer.close(() => { log(VWARN, "Server closed"); });
  destroyOpenSockets();
  process.exitCode = 1;
}

function establishFileWatch(filename) {
  // TODO: implement file watch.
}

function handleRequest(request, response) {
  var pathname = url.parse(request.url).pathname;

  log(VDEBUG1, "Request for " + pathname + " received.");

  if (pathname == "/bye") {
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end();
    exitServer();
  }
  // TODO: what to ignore, e.g. favicon.
  else if (pathname == "to be ignored") {
    response.writeHead(404, {'Content-Type': 'text/html'});
    response.end();
  }
  else {
    var fpath = pathname.substr(1);
    // TODO: if it contains 'graph.html'.
    if (pathname == "to be watched") {
      establishFileWatch(fpath);
    }

    fs.readFile(fpath, function (err, data) {
      if (err) {
        log(VERROR, err);
        response.writeHead(404, {'Content-Type': 'text/html'});
      }
      else {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(data.toString());
      }
      response.end();
    });
  }
}

httpServer = http.createServer(handleRequest);
httpServer.listen(port);
maintainSocketHash(httpServer);

log(VWARN, 'Server running at http://127.0.0.1:' + port + '/');
