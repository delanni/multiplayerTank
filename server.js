var http = require('http');
var path = require('path');
var fs = require("fs");


var socketio = require('socket.io');
var express = require('express');
var ejs = require("ejs");


var playHandler = require("./server/PlayController");
var controlHandler = require("./server/ControllerController");
var Connection = require("./server/Connection");

var GameServer = require("./game/GameServer");

var T = require("./util/Tracing");

//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);


var config = fs.readFileSync("config.js");

// fucking subrouters need to be configured as well
[router, controlHandler, playHandler].forEach(function(app) {
  app.configure(function() {

    // disable layout
    app.set("view options", {
      layout: false
    });

    app.engine('html', ejs.renderFile);
    app.set("views", "./views");
    app.use(express.static(path.resolve(__dirname, 'client')));
  });
});

var gameServer = new GameServer(io);

io.on('connection', function(socket) {
  var connection = new Connection(socket);
  gameServer.addConnection(connection);
});

// router.get("/pingback/:id", function(req,res,next){
//   // retreive cookie or id
//   var personId = "x";
//   var url = req.url;
//   T.tab(personId, url,"PINGBACK");
//   res.end();
// });
router.use("/play", playHandler);
router.use("/control", controlHandler);

router.get("/roomList", function(req,res){
  var rooms = gameServer.roomList.map(function(r){
    return {
      players : r.controllersList.map(function(e){
        return e.name;
      }),
      id: r.id,
      capacity: r.capacity
    };
  });
  res.json(rooms);
});

playHandler.locals.gameServer = gameServer;
controlHandler.locals.gameServer = gameServer;

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
  var addr = server.address();
  console.log("Game server listening at", addr.address + ":" + addr.port);
});
