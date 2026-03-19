var express = require("express");

function createControllerRouter(gameServer) {
    var router = express.Router();

    router.get("/", function(req, res) {
        res.redirect("../");
    });

    router.get("/:id", function(req, res) {
        var gameId = req.params.id;
        var room = gameServer.rooms[gameId];
        if (!room) {
            res.status(404).end("No such room");
        }
        else {
            res.render("control.html");
        }
    });

    return router;
}

module.exports = createControllerRouter;
