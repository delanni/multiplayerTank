var express = require("express");

var controllerController = express();

controllerController.get("/", function(req, res, next) {
    req.redirect("../");
});

controllerController.get("/:id", function(req, res, next) {
    var gameServer = controllerController.locals.gameServer;
    var gameId = req.params.id;
    var room = gameServer.rooms[gameId];
    if (!room) {
        res.status(404).end("No such room");
    }
    else {
        res.render("control.html");
    }
});

module.exports = controllerController;