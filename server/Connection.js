var Gen = require("../util/Generators");
var T = require("../util/Tracing");

function Connection(socket) {
    this.socket = socket;
    this.id = Gen.GenerateUUID();
    this.name = Gen.GenerateName();
    this.handlers = {};
}

Connection.prototype.emit = function(messageId, payload) {
    if (this.socket.connected) {
        this.socket.emit(messageId, payload);
    }
};

Connection.prototype.on = function(messageId, handler) {
    this.handlers[messageId] = this.handlers[messageId] || [];
    this.handlers[messageId].push(handler);
    this.socket.on(messageId, handler);
};

Connection.prototype.removeAllListeners = function() {
    var socket = this.socket;
    Object.keys(this.handlers).forEach(function(messageId) {
        var handlers = this.handlers[messageId];
        handlers.forEach(function(handler) {
            socket.removeListener(messageId, handler);
        });
    }, this);
    this.handlers = {};
};

module.exports = Connection;
