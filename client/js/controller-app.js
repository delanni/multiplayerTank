/* global angular, $, facebook */
import { ControllerModel } from './controller/ControllerModel';
import { createSocket } from './socket';

angular.module("ControllerApp", ['ngTouch']).run(function($rootScope) {
    var gameCode = window.location.pathname.split("/").pop();
    var socket = createSocket();
    $rootScope.socket = socket;

    $rootScope.connectionStatus = "working";
    socket.on("connect", function() {
        $rootScope.connectionStatus = "online";
        socket.emit("joinRoom", {
            roomId: gameCode,
            type: "controller"
        });
        $rootScope.$apply();
    });

    socket.on("disconnect", function() {
        $rootScope.connectionStatus = "offline";
        $rootScope.$apply();
    });

    $rootScope.latency = 0;
    socket.on("ping", function(payload) {
        payload.receivedAt = Date.now();
        socket.emit("pong", payload);
    });

    socket.on("pong", function(payload) {
        var receivedAt = Date.now();
        var latency = receivedAt - payload.sentAt;
        $rootScope.latency = latency;
        $rootScope.$apply();
    });

    $rootScope.checkLatency = function() {
        socket.emit("ping", {
            sentAt: Date.now()
        });
    };

    socket.on("welcome", function(payload) {
        console.log("We were welcomed as " + payload.name + "!");
        window.scrollTo(0, 1);

        var controller = new ControllerModel("controlsHost", socket, payload);
        $rootScope.controller = controller;
        $rootScope.controller.updateInfo();
        $rootScope.$apply();
    });

    $rootScope.persistState = function() {
        $rootScope.controller.updateInfo();
        $rootScope.controller.saveConfig();
        $("#optionsModal").modal("hide");
    };

    $rootScope.reorganizeButtons = function() {
        $rootScope.allowReorder = false;
        $("#optionsModal").modal("hide");
        $rootScope.controller.startReorganizeScript();
    };

    $rootScope.randomColor = function() {
        $rootScope.controller.color = "#" + (Math.floor(Math.random() * 0x999999) + 0xf666666).toString(16).substr(1);
    };

    $rootScope.facebookInfo = function() {
        var namePromise = facebook.getName().then(function(n) {
            $rootScope.controller.name = n;
        });
        var avatarPromise = facebook.getPictureUrl().then(function(n) {
            $rootScope.controller.avatar = n;
        });
        Promise.all([namePromise, avatarPromise]).then(function() {
            $rootScope.persistState();
            $rootScope.$apply();
        });
    };

    socket.on("roomClosed", function() {
        alert("Room closed. Please enter another one.");
        window.location.assign("../..");
    });

}).directive("icon", function() {
    return {
        restrict: "E",
        link: function(scope, element, attr) {
            var iconClass = element.text();
            var additionalClasses = attr.class ? " " + attr.class : "";
            element.html('<span class="glyphicon glyphicon-' + iconClass + additionalClasses + '" aria-hidden="true"></span>');
        }
    };
});

window.onerror = function(e) {
    alert(e.message);
};
