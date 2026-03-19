/* global angular */

angular.module("main", []).run(function($rootScope, $http) {
    $rootScope.create = function() {
        window.location.href = "/play/" + ($rootScope.gameCode || "");
    };
    $rootScope.join = function(id) {
        window.location.href = "/control/" + ($rootScope.gameCode || id || "");
    };
    $rootScope.getColor = function(room) {
        return room.capacity > room.players.length ? 'lightgreen' : 'salmon';
    };

    $rootScope.rooms = [];

    var refresh = function() {
        $http({
            method: 'GET',
            url: '/roomList'
        }).then(function successCallback(response) {
            if (response.data instanceof Array) {
                $rootScope.rooms = response.data;
            }
        }, function errorCallback(response) {
            console.error(response);
        });
    };

    setInterval(refresh, 3000);
    refresh();

}).directive("icon", function() {
    return {
        restrict: "E",
        scope: {
            cls: '=class',
        },
        link: function(scope, element) {
            var iconClass = element.text();
            var additionalClasses = scope.cls ? " " + scope.cls : "";
            element.html('<span class="glyphicon glyphicon-' + iconClass + additionalClasses + '" aria-hidden="true"></span>');
        }
    };
});
