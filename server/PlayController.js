var express = require("express");

var T = require("../util/Tracing");

var playController = express();

playController.get("/", function(req, res, next) {
    var gameServer = playController.locals.gameServer;
    var gameId = req.params.id;
    if (!gameId) {
        var room = gameServer.createRoom();
        gameId = room.id;
        res.redirect(gameId);
    }
});

playController.get("/:id", function(req, res, next) {
    var gameServer = playController.locals.gameServer;
    var gameId = req.params.id;
    if (!gameId) {
        var room = gameServer.createRoom();
        gameId = room.id;
        res.redirect(gameId);
    }
    else {
        room = gameServer.rooms[gameId];
        if (!room) {
            if (gameId.match(/^\w+$/)){
                room = gameServer.createRoom(gameId);
            } else {
                res.end("Please use a room name with: (Only characters, one word) ");
            }
            res.redirect(gameId);
        }
        else {
            res.render("play.html");
        }
    }
});

module.exports = playController;