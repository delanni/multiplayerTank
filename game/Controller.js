var Controller = function(connection, room, options){
    this.connection = connection;
    this.id = connection.id;
    this.room = room;
    
    // other info: eg. webgl enabled / browser vendor / screen size 
    
    this._attachHandlers(connection);
};

// Events that the controller sends, handlers executed in the context of the controller
Controller.prototype.handlers = {
    // events such as "virtual" keypress - validate and pipe it to the room
    directionChange: function(connection, payload){
        this.room.messageToViews("directionChange", connection.id, payload);
    },
    keypress: function(connection, payload){
        this.room.messageToViews("keypress", connection.id, payload);
    },
    updateInfo: function(connection, payload){
        this.room.messageToViews("updateInfo", connection.id, payload);
    }
};

// Message received, pipe it down to the client
Controller.prototype.emit = function(messageType, payload){
    this.connection.emit(messageType, payload);
};

Controller.prototype._attachHandlers = function(connection){
    var _this = this;
    Object.keys(this.handlers).forEach(function(handlerName) {
        var handler = _this.handlers[handlerName];
        connection.on(handlerName, function(payload) {
            handler.call(_this, connection, payload);
        });
    });
};

module.exports = Controller;