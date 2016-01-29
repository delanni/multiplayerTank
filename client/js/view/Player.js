var Player = function(id, info, pos, world) {
    this.playerId = id;

    this.name = info.name;
    this.avatar = info.avatar;
    this.color = info.color;
    this.alterColor = this.color.toString().split("").map(function(e) {
        return Math.round(parseInt(e, 16) / 2).toString(16);
    }).join("");

    this.position = pos.clone();
    this._positions = [];
    this.speed = new Vector(0, 0);
    this.speedFactor = 1.5;
    this.rotation = new Vector(0, 0);
    this.aimDirection = new Vector(1, 0);

    this.world = world;

    this.size = new Vector(20, 15);
    this.barrelLength = 25;

    // [thrust, fire, shield]
    this.keyState = [0, 0, 0];
    this.charge = 0;

    this.points = 0;

    this.life = 5;

    this.collisionGroup = "ballplayer,1;wallplayer,1";
    this.collisionGroups = [];
    this.events = {};
};

__mixin(Player.prototype, EventEmitter.prototype);

Player.prototype.updateInfo = function(info){
    this.name = info.name || this.name;
    this.avatar = info.avatar || this.avatar;
    this.color = info.color || this.color;
    this.alterColor = this.color.toString().split("").map(function(e) {
        return Math.round(parseInt(e, 16) / 2).toString(16);
    }).join("");
};

Player.prototype.reborn = function(position) {
    this.life = 5;
    this.charge = 0;
    this.keyState = [0, 0, 0];
    this.speed = new Vector();
    this.rotation = new Vector(0, 0);
    this.aimDirection = new Vector(1, 0);
    this.position = position.clone();
};

Player.prototype.aimTowards = function(aimDir) {
    if (aimDir.angle || aimDir.angle === 0) this.aimDirection.set(Math.cos(aimDir.angle), Math.sin(aimDir.angle)).normalize();
};

Player.prototype.handleKeystateChange = function(keyChange) {
    if (keyChange.value) {
        if (this.keyState[0] || this.keyState[1] || this.keyState[2]) {

        }
        else {
            this.keyState[keyChange.key] = 1;
        }
    }
    else {
        this.keyState[keyChange.key] = 0;
    }
};

Player.prototype.animate = function(delta) {
    if (this.keyState[0]) {
        this.rotation.normalize();
        var direction = this.aimDirection.subtract(this.rotation);
        this.rotation.addInPlace(direction.scaleInPlace(0.05));
        this.rotation.normalize();
        this.speed.copyFrom(this.rotation);
        this.speed.scaleInPlace(this.speedFactor);
    }
    else {
        this.speed.scaleInPlace(0.8);
    }

    this._positions.push(this.position.clone());
    if (this._positions.length > 10) this._positions.shift();
    this.position.addInPlace(this.speed);
    if (this.keyState[1]) {
        this.charge = Math.min(this.charge + 1, 99);
    }
    else {
        if (this.charge) {
            this.charge = Math.floor(Math.min(this.charge, 99) / 25);
            this.shoot(this.charge);
            this.charge = 0;
        }
    }
};

Player.prototype.draw = function(ctx) {
    ctx.save();

    var rot = Math.atan2(this.rotation.y, this.rotation.x);
    ctx.fillStyle = "#" + this.color;
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(rot);
    ctx.fillRect(-this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);

    ctx.fillStyle = "#" + this.alterColor;
    ctx.fillRect(-this.size.x / 1.8, -this.size.y / 1.8, this.size.x * 1.1, this.size.y / 5);
    ctx.fillRect(-this.size.x / 1.8, this.size.y / 1.8, this.size.x * 1.1, -this.size.y / 5);

    ctx.beginPath();
    ctx.rotate(-rot);
    ctx.strokeStyle = "#" + this.alterColor;
    ctx.lineWidth = 2;
    rot = Math.atan2(this.aimDirection.y, this.aimDirection.x);
    ctx.rotate(rot);
    ctx.moveTo(this.barrelLength / 10, 0);
    ctx.lineTo(this.barrelLength, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.shadowBlur = 3;
    ctx.fillStyle = "#" + this.color;
    ctx.arc(this.barrelLength, 0, this.charge / 25, 0, 2 * Math.PI);
    ctx.fill();

    if (this.keyState[2]) {
        ctx.beginPath();
        ctx.arc(0, 0, this.getBoundingRadius(), -Math.PI / 4, Math.PI / 4);
        ctx.stroke();
    }

    ctx.restore();
};

Player.prototype.shoot = function(charge) {
    charge = charge || 0;
    var sparkleColor = ["E8800C", "E8800C", "E8800C", "C600FF"][charge];
    var barrelEnd = this.aimDirection.scale(this.barrelLength, this.barrelLength).addInPlace(this.position);
    var world = this.world;
    var explosion = new Explosion({
        world: world,
        particles: [this.getBullet(charge)],
        particlesCount: 5 + charge * 2,
        generator: function() {
            return new Pixel(0, 0, {
                size: 3,
                color: sparkleColor,
                world: world,
                mass: 1,
                life: 300 * Math.random() + 100 * charge
            });
        },
        coneWidth: Math.PI / 4,
        coneOffset: Math.atan2(this.aimDirection.y, this.aimDirection.x)
    });
    explosion.fire(barrelEnd);
    this.speed.subtractInPlace(this.aimDirection.scale(charge / 3, charge / 3));
};

Player.prototype.getBullet = function(charge) {
    var size = 6 + charge;
    var speed = this.aimDirection.clone().scale(1.0 + charge / 3);
    var bullet = new Ball(0, 0, {
        color: this.alterColor,
        world: this.world,
        size: size,
        speed: speed,
        life: 1000,
        mass: 2,
        charge: charge
    });

    bullet.owner = this;
    return bullet;
};

Player.prototype.getBoundingRadius = function() {
    return this.size.length() / 2;
};

Player.prototype.intersects = function(other) {
    if (other.getBoundingRadius) {
        var othersRadius = other.getBoundingRadius();
        var boundingRadius = this.getBoundingRadius();
        var distance = other.position.distanceTo(this.position);
        if (distance < (boundingRadius + othersRadius)) {
            return true;
        }
        else {
            return false;
        }
    }
    else {
        return false;
    }
};

Player.prototype.collideBy = function(other) {
    if (other instanceof Ball) {
        if (this.keyState[2]) {

        }
        else {
            this.life -= (1 + other.charge);
            if (this.life <= 0) {
                this.life = 0;
                this.die(other.owner);
            }
            this.world.emit("hit");
        }
    }
    if (other instanceof Wall) {
        var lastPos = this._positions.pop();
        this.position = lastPos;
        if (!lastPos) {
            this.die(this);
        }

        this.rotation.normalize();
        var direction = this.aimDirection.subtract(this.rotation);
        this.rotation.addInPlace(direction.scaleInPlace(0.5));
        this.rotation.normalize();
    }
};

Player.prototype.collideTo = function(other) {

};

Player.prototype.explode = function(direction) {
    var _thisPlayer = this;
    var explosion = new Explosion({
        particlesCount: Math.ceil(this.getBoundingRadius() * Math.random() * 4),
        generator: function() {
            return new Pixel(0, 0, {
                color: [_thisPlayer.color, _thisPlayer.alterColor].pick(),
                size: Math.ceil(_thisPlayer.getBoundingRadius() / 2 * Math.random()),
                world: _thisPlayer.world,
                life: Math.floor(Math.random() * 700 + 1000)
            });
        },
        world: _thisPlayer.world,
        strengthMax: 0.1
    });

    explosion.fire(this.position);
};

Player.prototype.die = function(killer) {
    this.life = 0;
    this.explode();
    this.emit("died", killer);
};

Player.prototype.addPoints = function() {
    this.points++;
    this.world.insert(new Text(this.position.x, this.position.y, "+1", {
        color: this.alterColor,
        speed: Vector.random(),
        world: this.world,
        life: 1200,
        size: 15
    }));
};