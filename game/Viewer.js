var Viewer = function(connection, options){
    this.connection = connection;
    this.id = connection.id;
    this.name = connection.name;
    
    // other info: eg. webgl enabled / browser vendor / screen size 
    
    this._attachHandlers(connection);
};

// Message received, pipe it down to the client
// TODO: probably shouldn't assume its only a ctr -> view message
Viewer.prototype.onMessage = function(messageType, controllerId, payload){
    this.connection.emit(messageType, payload);
};

// Events that the client viewer sends, handlers executed in the context of the viewr
Viewer.prototype.handlers = {
    // dont know what events do we want to handle from the client. eg.: request for start -> this would trigger every controller to vote y/n
};

Viewer.prototype._attachHandlers = function(connection){
    var _this = this;
    Object.keys(this.handlers).forEach(function(handlerName) {
        var handler = _this.handlers[handlerName];
        connection.on(handlerName, function(payload) {
            handler.call(_this, connection, payload);
        });
    });
};

module.exports = Viewer;