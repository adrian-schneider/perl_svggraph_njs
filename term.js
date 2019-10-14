var g_http = require('http');
var g_fs = require('fs');
var g_url = require('url');

var g_sockets = {}, g_nextSocketId = 0;

var g_port = 8081;
var g_httpServer = null;

const VOFF = 0, VERROR = 1, VWARN = 2, VINFO = 3, VDEBUG1 = 4, VDEBUG2 = 5;
var g_verbosityThsld = VDEBUG2;
var g_logWithDate = true;

var g_fileWatcher = null;
var g_timerId = null;

var g_watchedFileChanged = false;
var g_watchedFilename = '';
var g_rootPath = './';

const INDEXFILENAME = '.svggraph/index.html';
const GRAPHFILENAME = '.svggraph/graph.html';

function log(verbosity, text) {
  if (verbosity <= g_verbosityThsld) {
    var date = '';
    if (g_logWithDate) {
      date = new Date().toISOString();
      // Strip the date portion from the time stamp.
      date = date.substr(1 + date.indexOf('T')) + ' ';
    }
    console.log(`${date}${text}`);
  }
}

function statSync(filename) {
  try {
    return g_fs.statSync(filename);
  }
  catch(err) {
    return null;
  }
}

function processFileChangeHandler(filename) {
  log(VDEBUG1, `File change detected on: ${filename}`);
  if (statSync(filename)) {
    g_watchedFileChanged = true;
  }
  else {
    log(VWARN, `File change handler could not stat: ${filename}`);
  }
}

function hasWatchedFileChanged() {
  var dirty = g_watchedFileChanged;
  g_watchedFileChanged = false;
  log(VDEBUG2, `File changed: ${dirty ? 'T' : 'F'}`);
  return dirty;
}

function rerunDelayedHandler(handler, filename, millis) {
  if (g_timerId) {
    clearTimeout(g_timerId);
  }
  g_g_timerId = setTimeout(() => { handler(filename); }, millis);
}

function establishFileWatch(handler, filename) {
  if (g_watchedFilename == '') {
    if (g_fileWatcher) {
      g_fileWatcher.close();
    }
    g_watchedFileChanged = false;
    g_watchedFilename = filename;
    g_fileWatcher = g_fs.watch(filename, (event, eventFilename) => {
      if (eventFilename) {
        // Debounce and dealy:
        // Any file change event occuring within the timeout period
        // prolongs that timeout period by the same amount.
        // Only if no further event occurs during that time, the last
        // event is finally getting handled.
        rerunDelayedHandler(handler, filename, 200);
      }
    });
    log(VINFO, `File watch established on: ${filename}`);
  }
}

// https://stackoverflow.com/questions/14626636/how-do-i-shutdown-a-node-js-https-server-immediately
function maintainSocketHash(server) {
  // Maintain a hash of all connected sockets.
  server.on('connection', function (socket) {
    // Add a newly connected socket.
    var socketId = g_nextSocketId++;
    g_sockets[socketId] = socket;
    log(VDEBUG2, `Socket ${socketId} opened.`);

    // Remove the socket when it closes.
    socket.on('close', function () {
      log(VDEBUG2, `Socket ${socketId} closed.`);
      delete g_sockets[socketId];
    });
  });
}

function destroyOpenSockets() {
  for (var socketId in g_sockets) {
    log(VDEBUG2, `Socket ${socketId} destroyed.`);
    g_sockets[socketId].destroy();
  }
}

function exitServer() {
  if (g_fileWatcher) {
    g_fileWatcher.close();
  }
  g_httpServer.close(() => { log(VWARN, 'Server closed.'); });
  destroyOpenSockets();
  process.exitCode = 1;
}

function serveFile(filename, response) {
  g_fs.readFile(filename, function (err, data) {
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

function handleRequest(request, response) {
  var pathname = g_url.parse(request.url).pathname;

  log(VDEBUG1, `Request for ${pathname} received.`);

  if (pathname == "/bye") {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.write('Bye');
    response.end();
    setTimeout(exitServer, 1000);
  }
  else if (pathname == "/ask_graph_changed") {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.write(hasWatchedFileChanged() ? 'T' : 'F');
    response.end();
  }
  else if (pathname == '/') {
    serveFile(g_rootPath + INDEXFILENAME, response);
  }
  else if (pathname == '/graph.html') {
    var filename = g_rootPath + GRAPHFILENAME;
    establishFileWatch(processFileChangeHandler, filename);
    serveFile(filename, response);
  }
  else {
    log(VINFO, `Ignoring ${pathname}.`);
    response.writeHead(404, {'Content-Type': 'text/html'});
    response.end();
  }
}

g_httpServer = g_http.createServer(handleRequest);
g_httpServer.listen(g_port);
maintainSocketHash(g_httpServer);

log(VWARN, `Server running at http://127.0.0.1:${g_port}/`);
