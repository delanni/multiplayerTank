var Gen = require("../util/Generators");

var Connection = function(socket) {
    this.socket = socket;
    this.id = Gen.GenerateUUID();
    this.name = Gen.GenerateName();

    this.handlers = {};
};

Connection.prototype.emit = function(messageId, payload){
    this.socket.emit(messageId, payload);
};

Connection.prototype.on = function(messageId, handler){
    this.handlers[messageId] = this.handlers[messageId] || [];
    this.handlers[messageId].push(handler);
    this.socket.on(messageId, handler);
};

module.exports = Connection;