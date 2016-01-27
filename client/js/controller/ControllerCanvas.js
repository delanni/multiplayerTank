var ControllerCanvas = function(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.isRunning = false;
    this.handlers = [];
    this.renderables = [];
    this.animatables = [];
    this.items = [];

    this.projector = {
        bb: null,
        canvas: null,
        // event to canvas
        project: function(ev) {
            return {
                x: (ev.clientX - this.bb.left) * this.canvas.width / this.bb.width,
                y: (ev.clientY - this.bb.top) * this.canvas.height / this.bb.height,
                identifier: ev.identifier
            };
        },
        // canvas to event?
        unproject: function(p) {
            throw new Error("unimplemented");
        },
        calibrate: function(cnvs) {
            this.canvas = cnvs;
            this.bb = cnvs.getBoundingClientRect();
        }
    };

    var _this = this;
    this.canvas.addEventListener("resize", function(ev) {
        _this.projector.calibrate(_this.canvas);
    });
    window.addEventListener("resize", function(ev) {
        _this.projector.calibrate(_this.canvas);
    });

    this.projector.calibrate(this.canvas);
};

ControllerCanvas.prototype = {
    start: function() {
        var b = this.boundCheckEvents = this.checkEvents.bind(this);
        this.canvas.addEventListener("touchstart", b, false);
        this.canvas.addEventListener("touchend", b, false);
        this.canvas.addEventListener("touchmove", b, false);

        this.isRunning = true;
        this._boundLoop = this.controllerLoop.bind(this);
        window.requestAnimationFrame(this._boundLoop);
    },
    stop: function() {
        var b = this.boundCheckEvents;
        this.canvas.removeEventListener("touchstart", b, false);
        this.canvas.removeEventListener("touchend", b, false);
        this.canvas.removeEventListener("touchmove", b, false);
        this.isRunning = false;
        this._boundLoop = null;
    },
    checkEvents: function(ev) {
        this.animatables.forEach(function(animatable) {
            animatable.checkEvents(ev, this);
        }, this);
        ev.preventDefault();
        return false;
    },
    lockButtons: function() {
        this.items.forEach(function(e) {
            e.lock();
        });
    },
    unlockButtons: function() {
        this.items.forEach(function(e) {
            e.unlock();
        });
    },
    controllerLoop: function() {
        this.animate();
        this.render();
        window.requestAnimationFrame(this._boundLoop);
    },
    animate: function() {
        this.animatables.forEach(function(animatable) {
            animatable.animate();
        });
    },
    render: function() {
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
        this.renderables.forEach(function(renderable) {
            renderable.render(this.ctx);
        }, this);
    },
    addButton: function(button) {
        this.renderables.push(button);
        this.animatables.push(button);
        this.items.push(button);
    },
    persistState: function() {
        var o = this.items.reduce(function(o, next) {
            o[next.name] = {
                color: next.color,
                position: [next.position.x, next.position.y],
                size: next.size
            }
            return o;
        }, {});
        return JSON.stringify(o);
    },
    loadState: function(json) {
        try {
            var conf = JSON.parse(json);
            Object.keys(conf).forEach(function(k) {
                var item = this.items.filter(function(i) {
                    return i.name == k;
                })[0];
                if (!item) return;
                item.color = conf[k].color;
                item.position = new Vector(conf[k].position[0], conf[k].position[1]);
                item.size = conf[k].size;
            }, this);
        }
        catch (ex) {
            console.error(ex);
        }
    }
};

var Button = function(name, options, onpress, onrelease, ondrag) {
    options = options || {};
    var _this = this;

    this.name = name;

    this.onpress = onpress || function() {};
    this.onrelease = onrelease || function() {};
    ondrag = ondrag || function() {};
    this.ondrag = function(touch, ev) {
        ondrag.call(this, touch, ev);
        if (!this.isLocked) {
            this.position.copyFrom(touch);
        }
    };

    this.symbol = options.symbol || "X";
    this.color = options.color || 0x8b29e5;
    this.position = options.position || new Vector(Math.random() * 300, Math.random() * 600);
    this.size = options.size || 40;
    this.extendedSize = options.extendedSize || 55;
    this.alterColor = options.alterColor || "0xbecaba";

    this.isLocked = true;

    this.isPressed = false;
    this.pressingTouchId = null;
};

Button.prototype = {
    checkEvents: function(ev, controller) {
        var touches;
        if (ev.touches) {
            touches = [].map.call(ev.touches, function(t) {
                return controller.projector.project(t);
            });
        }

        if (this.isPressed) {
            var touch = touches.filter(function(t) {
                return t.identifier == this.pressingTouchId
            }, this)[0];
            if (touch) {
                var tv = new Vector(touch.x, touch.y);
                if (tv.subtract(this.position).length() >= this.extendedSize) {
                    this.clearTouched();
                }
                else {
                    this.ondrag(touch, ev);
                }
            }
            else {
                this.clearTouched();
            }
        }
        else {
            touches.forEach(function(touch) {
                var tv = new Vector(touch.x, touch.y);
                if (tv.subtract(this.position).length() < this.extendedSize) {
                    this.setTouched(touch.identifier);
                }
            }, this);
        }
    },
    lock: function() {
        this.isLocked = true;
    },
    unlock: function() {
        this.isLocked = false;
    },
    setTouched: function(byId) {
        this.isPressed = true;
        this.pressingTouchId = byId;
        this.onpress.call(this, byId);
    },
    clearTouched: function() {
        this.isPressed = false;
        this.pressingTouchId = null;
        this.onrelease.call(this);
    },
    animate: function() {},
    render: function(ctx) {
        ctx.save();

        if (!this.isLocked) {
            ctx.setLineDash([10]);
        }

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.translate(this.position.x, this.position.y);
        ctx.beginPath();
        ctx.fillStyle = "#" + this.color.toString(16);
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();

        if (this.isPressed) {
            ctx.beginPath();
            ctx.strokeStyle = "#" + this.alterColor.toString(16);
            ctx.arc(0, 0, this.extendedSize, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.setLineDash([]);
        ctx.strokeStyle = "black";
        ctx.font = (this.extendedSize / 2) + "px Arial";
        ctx.strokeText(this.symbol, 0, 0);

        ctx.restore();
    }
};