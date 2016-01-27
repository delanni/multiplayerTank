var Vector = function(x, y) {
    this.x = x || 0;
    this.y = y || 0;
};

Vector.prototype.set = function(x,y){
    this.x = x;
    this.y = y;
    return this;
};

Vector.prototype.copyFrom = function(other){
    this.x = other.x;
    this.y = other.y;
    return this;
};

Vector.prototype.add = function(other) {
    return new Vector(this.x + other.x, this.y + other.y);
};

Vector.prototype.subtract = function(other) {
    return new Vector(this.x - other.x, this.y - other.y);
};

Vector.prototype.subtractInPlace = function(other) {
    this.x -= other.x;
    this.y -= other.y;
    return this;
};

Vector.prototype.addInPlace = function(other) {
    this.x += other.x;
    this.y += other.y;
    return this;
};

Vector.prototype.scale = function(scaler) {
    return new Vector(this.x * scaler, this.y * scaler);
};

Vector.prototype.scaleInPlace = function(scaler) {
    this.x *= scaler;
    this.y *= scaler;
    return this;
};

Vector.prototype.length = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector.prototype.dot = function(other){
    return this.x * other.x + this.y * other.y;
}

Vector.prototype.normalize = function() {
    var len = this.length();
    if (len == 0) return this;
    
    this.scaleInPlace(1 / len);
    return this;
};
Vector.prototype.clamp = function(min, max) {
    if (min > max) throw new Error("Inverse ranges");
    if (this.x > max) {
        this.x = max;
    }
    else if (this.x < min) {
        this.x = min;
    }
    if (this.y > max) {
        this.y = max;
    }
    else if (this.y < min) {
        this.y = min;
    }
};

Vector.prototype.distanceTo = function(other){
    return other.subtract(this).length();
};

Vector.prototype.clone = function() {
    return this.scale(1);
};

Vector.random = function(scaleX, scaleY) {
    if (arguments.length == 0) {
        scaleX = scaleY = 1;
    }
    else if (arguments.length == 1) {
        scaleY = scaleX;
    }

    return new Vector((Math.random() - 0.5) * scaleX, (Math.random() - 0.5) * scaleY);
};