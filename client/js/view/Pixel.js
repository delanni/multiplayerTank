var Pixel = function(x, y, options) {
    options = options || {};

    this.position = new Vector(x, y);

    this.world = options.world;

    this.size = options.size || 2;
    this.color = options.color || "eb01aa";
    this.speed = options.speed || new Vector();
    this.mass = options.mass || 5;

    this.speedFactor = 5;
    this.life = options.life || Infinity;
};

Pixel.prototype.draw = function(context) {
    context.fillStyle = "#" + this.color;
    context.fillRect(this.position.x-this.size/2, this.position.y-this.size/2, this.size, this.size);
};

Pixel.prototype.animate = function(time) {
    this.position.addInPlace(this.speed.scale(this.speedFactor));

    this.life -= time;
    if (this.life < 0) this.world.remove(this);
};

Pixel.prototype.getBoundingRadius = function(){
  return this.size * 0.7071;
};

Pixel.prototype.intersects = function(other) {
    if (other.getBoundingRadius){
        var othersRadius = other.getBoundingRadius();
        var boundingRadius = this.getBoundingRadius();
        var distance = other.position.distanceTo(this.position);
        if (distance < (boundingRadius + othersRadius)){
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
};

Pixel.prototype.handleCollisionWith = function(other) {
    if (other instanceof Pixel) {
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
};