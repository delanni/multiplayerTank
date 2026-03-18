var http = require('http');
var path = require('path');

var express = require('express');
var { Server } = require('socket.io');
var cors = require('cors');
var ejs = require("ejs");

var createPlayRouter = require("./server/PlayController");
var createControllerRouter = require("./server/ControllerController");
var Connection = require("./server/Connection");
var GameServer = require("./game/GameServer");
var T = require("./util/Tracing");

var app = express();
var server = http.createServer(app);

var io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    pingTimeout: 60000,
    pingInterval: 25000
});

app.use(cors());
app.engine('html', ejs.renderFile);
app.set("view options", { layout: false });
app.set("views", path.resolve(__dirname, "views"));
app.use(express.static(path.resolve(__dirname, 'client')));

var gameServer = new GameServer();

io.on('connection', function(socket) {
    var connection = new Connection(socket);
    gameServer.addConnection(connection);
});

io.engine.on("connection_error", function(err) {
    T.log("Socket.IO connection error: " + err.message);
});

app.use("/play", createPlayRouter(gameServer));
app.use("/control", createControllerRouter(gameServer));

app.get("/roomList", function(req, res) {
    var rooms = gameServer.roomList.map(function(r) {
        return {
            players: r.controllersList.map(function(e) {
                return e.name;
            }),
            id: r.id,
            capacity: r.capacity
        };
    });
    res.json(rooms);
});

var port = process.env.PORT || 3000;
var host = process.env.IP || "0.0.0.0";

server.listen(port, host, function() {
    var addr = server.address();
    console.log("Game server listening at", addr.address + ":" + addr.port);
});
