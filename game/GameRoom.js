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

GameRoom.prototype.addConnection = function(connection, options){
    var type = options.type;
    if ( type == "view" ){
        var viewer = new Viewer(connection, this, options);
        this.viewsList.push(viewer);
        T.tab(connection.id, connection.name, this.viewsList.length, "VIEWER", JSON.stringify(options));
    } else if (type == "controller"){
        var controller = new Controller(connection, this, options);
        this.controllers[controller.id] = controller;
        this.controllersList.push(controller);
        this.messageToViews("playerJoin", connection.id, {name: connection.name, id: connection.id});
        T.tab(connection.id, connection.name, this.controllersList.length, "CONTROLLER", JSON.stringify(options));
    }
    connection.emit("welcome", {
        name: connection.name
    });
};

GameRoom.prototype.dropConnection = function(connection){
    var connectionDetecionPredicate = function(e){ return e.id == connection.id };
    var c = this.controllersList.remove(connectionDetecionPredicate);
    if (c){
        this.messageToViews("playerLeave", connection.id, {id : connection.id});
    }
    this.viewsList.remove(connectionDetecionPredicate);
    this.controllers[connection.id] = null;
};

GameRoom.prototype.messageToViews = function(messageType, playerId, payload){
    payload.origin = playerId;
    this.viewsList.forEach(function(view){
        view.onMessage(messageType, playerId, payload);
    });
};

GameRoom.prototype.messageToPlayers = function(messageType, viewId, payload){
    payload.origin = viewId;
    this.controllersList.forEach(function(controller){
        controller.onMessage(messageType, viewId, payload);
    });
};

module.exports = GameRoom;