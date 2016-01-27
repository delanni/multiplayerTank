var Explosion = function(options) {
    options = options || {};

    this.world = options.world;
    this.particles = options.particles || [];
    this.generator = options.generator;
    this.particlesCount = options.particlesCount || this.particles.length || 0;
    if (this.particles.length < this.particlesCount) {
        if (this.generator) {
            while (this.particles.length < this.particlesCount) {
                this.particles.push(this.generator());
            }
        }
    }

    this.coneWidth = options.coneWidth || Math.PI * 2;
    this.coneOffset = options.coneOffset || 0;

    this.strengthMin = options.strengthMin || 0;
    this.strengthMax = options.strengthMax || 1;
};


Explosion.prototype.fire = function(explosionOrigin) {
    var origin = explosionOrigin || this.origin;
    for (var i = 0; i < this.particles.length; i++) {
        var p = this.particles[i];
        if (p.speed.length() == 0) {
            p.speed = Explosion._conal2(this.coneWidth, this.coneOffset);
            p.speed.scaleInPlace(Explosion._randbetween(this.strengthMin, this.strengthMax));
        }
        if (origin){
            p.position.x = origin.x;
            p.position.y = origin.y;
        }
        this.world.insert(p);
    }
};

Explosion._conal2 = function(width, offset) {
    var minRot = offset - width / 2;
    var randomRot = minRot + Math.random() * width;

    var x = Math.cos(randomRot);
    var y = Math.sin(randomRot);
    return new Vector(x, y);
};

Explosion._randbetween = function(a, b) {
    return Math.random() * Math.abs(a - b) + Math.min(a, b);
};