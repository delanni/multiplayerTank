var Wall = function(x, y, options) {
    options = options || {};

    this.position = new Vector(x, y);

    this.world = options.world;

    this.size = options.size || new Vector(1, 1);
    this.color = options.color || "4A2603";

    this.life = options.life || Infinity;
    this.collisionGroup = options.collisionGroup || "wallplayer,0;wallball,0";
};

Wall.prototype.draw = function(context) {
    context.fillStyle = "#" + this.color;
    context.fillRect(this.position.x - this.size.x, this.position.y - this.size.y, this.size.x * 2, this.size.y * 2);
};

Wall.prototype.animate = function(time) {
    this.life -= time;
    if (this.life < 0) this.world.remove(this);
};

// Wall.prototype.getBoundingRadius = function() {
//     return null;
// };

Wall.prototype.intersects = function(other) {
    if (other.getBoundingRadius) {
        var othersRadius = other.getBoundingRadius();
        var centerCenterVector = other.position.subtract(this.position);
        var horizontal = Math.abs(centerCenterVector.x);
        var vertical = Math.abs(centerCenterVector.y);

        if (horizontal < othersRadius + this.size.x && vertical < othersRadius + this.size.y) {
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

Wall.prototype.collideTo = function(other) {};

Wall.prototype.collideBy = function(other) {};