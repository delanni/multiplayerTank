Array.prototype.pick = function() {
    return this[Math.floor(this.length * Math.random())];
};

Array.prototype.remove = function(item) {
    if (typeof item == "function") {
        var idx = this.indexOf(this.filter(item)[0]);
    }
    else {
        idx = this.indexOf(item);
    }
    if (idx >= 0) {
        var i = this.splice(idx, 1);
    }
    return i;
};

var EventEmitter = function() {
    this.events = {};
};

EventEmitter.prototype.on = function(eventName, callback) {
    var handlerList = this.events[eventName];
    if (!handlerList) {
        handlerList = this.events[eventName] = [];
    }
    handlerList.push(callback);
};

EventEmitter.prototype.off = function(eventName, callback) {
    var handlerList = this.events[eventName];
    if (!handlerList) return;
    if (!callback) handlerList.length = 0;
    else {
        var index = handlerList.indexOf(callback);
        if (index >= 0) handlerList.splice(handlerList.indexOf(callback), 1);

    }
};

EventEmitter.prototype.emit = function(eventName, payload) {
    var handlerList = this.events[eventName];
    if (handlerList) {
        handlerList.forEach(function(h) {
            h.call(this, payload);
        }, this);
    }
};


var __mixin = function(target, source, override){
    var keys = Object.keys(source);
    keys.forEach(function(k){
        if (source.hasOwnProperty(k)){
            if (override || !target.hasOwnProperty(k)){
                target[k] = source[k];
            }
        }
    });
    return target;
};

var __extends = function(derived, base){
    for (var prop in base) if (base.hasOwnProperty(prop)) derived[prop] = base[prop];
    __mixin(derived.prototype, base.prototype);
    derived.super = base;
    return derived;
};