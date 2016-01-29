var GameWorld = function(canvasId) {
    this.canvas = document.querySelector(canvasId);
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.aspectDivisors = [this.canvas.offsetWidth / this.width, this.canvas.offsetHeight / this.height];
    this.ctx = this.canvas.getContext("2d");

    this.orderQueue = [];

    this.entityList = [];
    this.players = {};
    this.playerList = [];

    this.collisionGroups = {
        keys: []
    };
    
    this.events = {};
    
    this.populated = false;
};

__mixin(GameWorld.prototype, EventEmitter.prototype);

GameWorld.prototype.populate = function(payload) {
    
    this.walls = [
        new Wall(400, 10, {
            size: new Vector(400, 10)
        }),
        new Wall(10, 300, {
            size: new Vector(10, 300)
        }),
        new Wall(790, 300, {
            size: new Vector(10, 300)
        }),
        new Wall(400, 590, {
            size: new Vector(400, 10)
        }),
        new Wall(400, 300, {
            size: new Vector(200, 10)
        }),
        new Wall(400, 300, {
            size: new Vector(10, 150)
        })
    ];
    var g = this;
    this.walls.forEach(function(e) {
        g.insert(e);
    });
    
    this.populated = true;
};

GameWorld.prototype.start = function() {
    
    if (!this.populated) this.populate();
    
    this.isRunning = true;
    var _this = this;

    var lastTime = 0;
    var gameLoop = function(totalTime) {
        if (_this.isRunning) {
            requestAnimationFrame(gameLoop);
            var delta = totalTime - lastTime;
            lastTime = totalTime;
            if (delta == 0) return;
        }
        else {
            return;
        }

        _this.ctx.fillStyle = "lightgrey";
        _this.ctx.fillRect(0, 0, _this.width, _this.height);

        _this.orderQueue.forEach(function(order) {
            var player = this.players[order.origin];
            if (!player) return;
            if (order.type == "d") {
                player.aimTowards(order);
            }
            else if (order.type == "k") {
                player.handleKeystateChange(order);
            }
        }, _this);
        _this.orderQueue.length = 0;

        _this.collisionGroups.keys.forEach(function(cgKey) {
            if (cgKey == "keys") return;
            var cg = this.collisionGroups[cgKey];
            var colliders = cg[0].filter(function(x) {
                return x.life > 0;
            });
            var collidees = cg[1].filter(function(x) {
                return x.life > 0;
            });
            for (var i = 0; i < colliders.length; i++) {
                for (var j = 0; j < collidees.length; j++) {
                    var a = colliders[i],
                        b = collidees[j];
                    if (a.life <= 0 || b.life <= 0) continue;
                    if (a.intersects(b)) {
                        a.collideTo(b);
                        if (a !== b) {
                            b.collideBy(a);
                        }
                    }
                }
            }
        }, _this);

        _this.playerList.forEach(function(p) {
            if (p.life <= 0) return;
            p.animate(delta);
            p.draw(_this.ctx);
        });

        _this.entityList.forEach(function(e) {
            e.animate(delta);
            e.draw(_this.ctx);
        });
    };
    requestAnimationFrame(gameLoop);
};

GameWorld.prototype.stop = function() {
    this.isRunning = false;
};

GameWorld.prototype.queue = function(order) {
    this.orderQueue.push(order);
};

GameWorld.prototype.addPlayer = function(id, info) {
    var pos = new Vector(Math.random() * this.width, Math.random() * this.height);
    var player = new Player(id, info, pos, this);
    this.players[id] = player;
    this.playerList.push(player);
    if (player.collisionGroup) {
        this.addToCollisionGroup(player);
    }

    player.reborn(pos);
    this._addPlayerHandlers(player);
};

GameWorld.prototype._addPlayerHandlers = function(player) {
    var world = this;
    player.on("died", function(killer) {
        if (player !== killer){
            killer.addPoints();
        }
        
        player.cooldown = 3;
        var intervalId = setInterval(function() {
            if (player.cooldown) {
                player.cooldown--;
            }
            else {
                clearInterval(intervalId);
                var pos = new Vector(Math.random() * world.width, Math.random() * world.height);
                player.reborn(pos);
            }
        }, 1000);
        
        world.emit("point");
    });
};

GameWorld.prototype.kickPlayer = function(id) {
    var p = this.players[id];
    if (p) {
        this.players[id] = null;
        this.playerList = this.playerList.filter(function(e) {
            return e != p;
        });
        this.bufferedRemove(p);
    }
};

GameWorld.prototype.addToCollisionGroup = function(entity, group) {
    if (!group && entity.collisionGroup) {
        var cgroups = entity.collisionGroup.split(";");
        cgroups.forEach(function(group){
            this.addToCollisionGroup(entity, group);
        },this);
    } else {
        var cg = group.split(",");
        var cgKey = cg[0];
        var cgIndex = parseInt(cg[1].trim(), 10);
        if (!this.collisionGroups[cgKey]) {
            this.collisionGroups[cgKey] = [
                [],
                []
            ];
            this.collisionGroups.keys.push(cgKey);
        }
        var actualCollisionGroup = this.collisionGroups[cgKey][cgIndex];
        actualCollisionGroup.push(entity);
        entity.collisionGroups.push(actualCollisionGroup);
    }
};

GameWorld.prototype.insert = function(entity) {
    entity.world = this;
    this.entityList.push(entity);
    if (entity.collisionGroup) {
        this.addToCollisionGroup(entity);
    }
};

GameWorld.prototype.bufferedRemove = function(entity) {
    if (this.intervalId) {
        window.clearInterval(this.intervalId);
    }
    var _this = this;
    this.intervalId = window.setTimeout(function() {
        _this.entityList = _this.entityList.filter(function(e) {
            if (e.life > 0) {
                return true;
            }
            else {
                if (e.collisionGroups) {
                    e.collisionGroups.forEach(function(cGroup){
                        cGroup.remove(e);
                    });
                }
                return false;
            }
        });
    }, 100);
};

GameWorld.prototype.remove = function(entity) {
    entity.life = -1;
    entity.draw = entity.animate = function() {};
    this.bufferedRemove();
};