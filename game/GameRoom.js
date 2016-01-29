var T = require("../util/Tracing");
var Viewer = require("./Viewer");
var Controller = require("./Controller");
Array.prototype.remove = require("../util/ArrayExtensions").remove;

var GameRoom = function(id) {
    this.id = id;

    this.capacity = 10;
    this.viewsList = [];
    this.controllersList = [];
    this.controllers = {};

    T.tab(id, "ROOM");
};

GameRoom.prototype.addConnection = function(connection, options) {
    var playerPayload = {
        roomName: this.id,
        id: connection.id,
        name: connection.name,
        color: (Math.floor(Math.random() * 0x999999) + 0xf666666).toString(16).substr(1),
        avatar: 'http://thecatapi.com/api/images/get?size=small&player=' + connection.id
    };
    var type = options.type;
    if (type == "view") {
        var viewer = new Viewer(connection, this, options);
        this.viewsList.push(viewer);
        T.tab(connection.id, connection.name, this.viewsList.length, "VIEWER", JSON.stringify(options));
    }
    else if (type == "controller") {
        var controller = new Controller(connection, this, options);
        this.controllers[controller.id] = controller;
        this.controllersList.push(controller);
        this.messageToViews("playerJoin", connection.id, playerPayload);
        T.tab(connection.id, connection.name, this.controllersList.length, "CONTROLLER", JSON.stringify(options));
    }
    connection.emit("welcome", playerPayload);
};

GameRoom.prototype.dropConnection = function(connection) {
    var connectionDetecionPredicate = function(e) {
        return e.id == connection.id;
    };
    var c = this.controllersList.remove(connectionDetecionPredicate);
    if (c) {
        this.messageToViews("playerLeave", connection.id, {
            id: connection.id
        });
    }
    var v = this.viewsList.remove(connectionDetecionPredicate);
    var room = this;
    if (v) {
        setTimeout(function(){room.trySelfDestruct();}, 10000);
    }
    this.controllers[connection.id] = null;
};

GameRoom.prototype.messageToViews = function(messageType, playerId, payload) {
    payload.origin = playerId;
    this.viewsList.forEach(function(view) {
        view.message(messageType, playerId, payload);
    });
};

GameRoom.prototype.messageToPlayers = function(messageType, viewId, payload) {
    payload.origin = viewId;
    this.controllersList.forEach(function(controller) {
        controller.onMessage(messageType, viewId, payload);
    });
};

GameRoom.prototype.trySelfDestruct = function() {
    if (this.viewsList.length == 0) {
        this.controllersList.forEach(function(controller) {
            controller.emit("roomClosed");
        });
        this.server.deleteRoom(this);
    }
};

module.exports = GameRoom;