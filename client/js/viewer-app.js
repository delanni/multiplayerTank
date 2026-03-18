/* global angular */
import './Helpers';
import { GameWorld } from './view/GameWorld';
import { createSocket } from './socket';

window.onresize = function() {
    var gameCanvas = document.querySelector("#game");
    if (!gameCanvas) return;
    var documentSize = document.body.getClientRects()[0];
    if (documentSize.width < documentSize.height) {
        gameCanvas.style.height = "";
        gameCanvas.style.width = "100%";
    }
    else {
        gameCanvas.style.width = "";
        gameCanvas.style.height = "100%";
    }
};

window.onresize();

angular.module("ViewApp", []).run(function($rootScope) {
    var gameCode = window.location.pathname.split("/").pop();
    var socket = createSocket();
    $rootScope.socket = socket;

    $rootScope.connectionStatus = "working";
    socket.on("connect", function() {
        $rootScope.connectionStatus = "online";
        socket.emit("joinRoom", {
            roomId: gameCode,
            type: "view"
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
        $rootScope.viewName = payload.name;
        console.log("We were welcomed as " + $rootScope.viewName + "!");
        $rootScope.$apply();
    });
}).controller("gameController", function($scope, $rootScope) {
    $scope.gameWorld = new GameWorld("#game");

    $rootScope.socket.on("directionChange", function(obj) {
        obj.type = "d";
        $scope.gameWorld.queue(obj);
    });

    $rootScope.socket.on("keypress", function(obj) {
        obj.type = "k";
        $scope.gameWorld.queue(obj);
    });

    $rootScope.socket.on("playerJoin", function(obj) {
        $scope.gameWorld.addPlayer(obj.id, obj);
        $scope.$apply();
    });

    $rootScope.socket.on("playerLeave", function(obj) {
        $scope.gameWorld.kickPlayer(obj.id);
        $scope.$apply();
    });

    $rootScope.socket.on("updateInfo", function(info) {
        var player = $scope.gameWorld.players[info.origin];
        if (player) {
            player.updateInfo(info);
        }
        $scope.$apply();
        $rootScope.$apply();
    });

    $rootScope.socket.on("welcome", function(payload) {
        $scope.gameWorld.start(payload);
        $scope.$apply();
    });

    $scope.gameWorld.on("point", function() {
        $scope.$apply();
    });

    $scope.gameWorld.on("hit", function() {
        $scope.$apply();
    });
}).directive('playercard', function() {
    return {
        restrict: 'E',
        scope: {
            player: "="
        },
        templateUrl: '../playerCard.html',
        link: function(scope) {
            scope.range = function(n) {
                return new Array(n);
            };
        }
    };
});
