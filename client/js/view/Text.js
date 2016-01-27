var Text = function(x, y, text, options) {
    options = options || {};

    this.position = new Vector(x, y);
    this.text = text;

    this.world = options.world;

    this.size = options.size || 2;
    this.color = options.color || "eb01aa";
    this.speed = options.speed || new Vector();

    this.life = options.life || Infinity;
};

Text.prototype.draw = function(context) {
    context.fillStyle = "#" + this.color;
    context.font = this.size + "px Arial";
    context.fillText(this.text, this.position.x, this.position.y);
};

Text.prototype.animate = function(time) {
    this.position.addInPlace(this.speed);

    this.life -= time;
    if (this.life < 0) this.world.remove(this);
};

Text.prototype.getBoundingRadius = function(){
  return 0;
};

Text.prototype.intersects = function(other) {
    return false;
};

Text.prototype.handleCollisionWith = function(other) {
};