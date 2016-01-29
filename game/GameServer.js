var T = require("../util/Tracing");
var Generator = require("../util/Generators");
var GameRoom = require("./GameRoom");
Array.prototype.remove = require("../util/ArrayExtensions").remove;

var GameServer = function() {
    this.connections = {};
    this.connectionList = [];

    this.rooms = {};
    this.roomList = [];
};

GameServer.prototype.createRoom = function(id){
    var id = id || Generator.GenerateSoup(5);
    var room = new GameRoom(id);
    
    this.rooms[id] = room;
    this.roomList.push(room);
    
    room.server = this;
    return room;
};

GameServer.prototype.deleteRoom = function(room){
    var id = room.id;
    this.roomList.remove(room);
    this.rooms[id] = null;
};

GameServer.prototype.addConnection = function(connection) {
    this.connections[connection.id] = connection;
    this.connectionList.push(connection);
    T.tab(connection.id, connection.name, "CONN");
    this._attachHandlers(connection);
};

GameServer.prototype.dropConnection = function(connection) {
    this.connections[connection.id] = null;
    this.connectionList.remove(connection);
};

/**
 * Will be executed in the context of the server 
 **/
GameServer.prototype.handlers = {
    pong: function(connection, payload) {
        var receivedAt = Date.now();
        var latency = receivedAt - payload.sentAt;
        T.tab(connection.id, connection.name, "PONG", latency);
    },
    ping: function(connection, payload) {
        payload.receivedAt = Date.now();
        connection.emit("pong", payload);
        T.tab(connection.id, connection.name, "PING");
    },
    joinRoom: function(connection, payload) {
        var roomId = payload.roomId;
        var room = this.rooms[roomId];
        if (room){
            T.tab(connection.id, connection.name, roomId, "ROOMJOIN");
            room.addConnection(connection, payload);
            connection.on("disconnect", function(){
                room.dropConnection(connection);
            });
        } else {
            connection.emit("error",{
                message: "The requested room does not exist"
            });
            connection.emit("roomClosed");
        }
    }
};

GameServer.prototype._attachHandlers = function(connection) {
    var _this = this;
    connection.on("disconnect", function() {
        T.tab(connection.id, connection.name, "LEFT");
        _this.dropConnection(connection);
    });

    Object.keys(this.handlers).forEach(function(handlerName) {
        var handler = _this.handlers[handlerName];
        connection.on(handlerName, function(payload) {
            handler.call(_this, connection, payload);
        });
    });
};

module.exports = GameServer;