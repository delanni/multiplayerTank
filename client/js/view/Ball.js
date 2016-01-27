var Ball = function(x, y, options) {
    options = options || {};

    this.position = new Vector(x, y);

    this.world = options.world;

    this.size = options.size || 2;
    this.color = options.color || "eb01aa";
    this.speed = options.speed || new Vector();
    this.mass = options.mass || 5;
    this.charge = options.charge || 0;

    this.speedFactor = 5;
    this.life = options.life || Infinity;
    
    this.collisionGroup = options.collisionGroup || "ballplayer,0;wallball,1";
};

Ball.prototype.draw = function(context) {
    context.fillStyle = "#" + this.color;
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.size / 2, 0, 2 * Math.PI);
    context.fill();
    this.world.insert(new Pixel(this.position.x, this.position.y, {
        life: this.charge*100+Math.random()*10+50,
        size: 1,
        color: this.color,
        speed: Vector.random().scale(0.1)
    }));
};

Ball.prototype.animate = function(time) {
    this.lastPos = this.position.clone();
    this.position.addInPlace(this.speed.scale(this.speedFactor));

    this.life -= time;
    if (this.life < 0) this.world.remove(this);
};

Ball.prototype.getBoundingRadius = function() {
    return this.size / 2;
};

Ball.prototype.intersects = function(other) {
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

Ball.prototype.collideTo = function(other) {
    if (other instanceof Ball) {
        var v1 = this.speed;
        var x1 = this.position;
        var m1 = this.mass;
        var v2 = other.speed;
        var x2 = other.position;
        var m2 = other.mass;
        var x12Diff = x1.subtract(x2);
        var x21Diff = x2.subtract(x1);

        var v1New = v1.subtract(x12Diff.scale(2 * m2 / (m1 + m2) * v1.subtract(v2).scalar(x12Diff) / Math.pow(x12Diff.length(), 2)));
        var v2New = v2.subtract(x21Diff.scale(2 * m1 / (m1 + m2) * v2.subtract(v1).scalar(x21Diff) / Math.pow(x21Diff.length(), 2)));

        this.speed = v1New;
        other.speed = v2New;
    }
    else if (other instanceof Player) {
        if (other.keyState[2] && other.aimDirection.scale(other.getBoundingRadius()).dot(this.position.subtract(other.position).normalize()) > 0.65){
            var normal = this.position.subtract(other.position).normalize();
            var incoming = this.speed.clone();
            var outgoing = incoming.subtract(normal.scale(2*incoming.dot(normal)));
            var outSpeed = this.speed.length();
            this.speed = outgoing.scaleInPlace(outSpeed);
            this.owner = other;
        } else {
            this.life = 0;
            this.explode(this.position.subtract(other.position).normalize(),other);
        }
    }
};

Ball.prototype.collideBy = function(other) {
    if (other instanceof Wall){
        this.explode(this.speed.scale(-1).normalize(), other);
        this.life = 0;
    }
};

Ball.prototype.explode = function(direction, explodeOn) {
    var _thisBall = this;
    var other = explodeOn || this;
    var explosion = new Explosion({
        particlesCount: Math.ceil(this.size * Math.random()),
        generator: function() {
            return new Pixel(0, 0, {
                color: [_thisBall.color, other.color].pick(),
                size: Math.ceil(_thisBall.size / 4),
                world: _thisBall.world,
                life: Math.floor(Math.random() * 400 + 500)
            });
        },
        world: _thisBall.world,
        coneWidth: Math.PI,
        coneOffset: Math.atan2(direction.y, direction.x),
        strengthMax: 0.3
    });

    explosion.fire(this.position);
};