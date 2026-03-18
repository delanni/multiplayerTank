var express = require("express");
var T = require("../util/Tracing");

function createPlayRouter(gameServer) {
    var router = express.Router();

    router.get("/", function(req, res) {
        var room = gameServer.createRoom();
        res.redirect(room.id);
    });

    router.get("/:id", function(req, res) {
        var gameId = req.params.id;
        if (!gameId) {
            var room = gameServer.createRoom();
            res.redirect(room.id);
        }
        else {
            var room = gameServer.rooms[gameId];
            if (!room) {
                if (gameId.match(/^\w+$/)) {
                    gameServer.createRoom(gameId);
                    res.redirect(gameId);
                }
                else {
                    res.status(400).end("Please use a room name with: (Only characters, one word) ");
                }
            }
            else {
                res.render("play.html");
            }
        }
    });

    return router;
}

module.exports = createPlayRouter;
