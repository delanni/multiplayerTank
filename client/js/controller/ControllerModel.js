var ControllerModel = function(containerId, socket, options) {

    this.container = document.getElementById(containerId);
    this.socket = socket;

    this.name = options.name;
    this.color = options.color;
    this.avatar = options.avatar;

    this.handlers = [];
    this.items = this.createItems(this.container);

    this.loadConfig();

    var pleaseDontHanlde = function(ev) {
        ev.preventDefault();
        return true;
    };
    /*    document.addEventListener("touchstart", pleaseDontHanlde);
        document.addEventListener("touchend", pleaseDontHanlde); */
    document.addEventListener("touchmove", pleaseDontHanlde);
};

ControllerModel.prototype = {
    loadConfig: function() {
        var configJSON = localStorage["controllerConfig_v2"];
        try {
            if (configJSON) var config = JSON.parse(configJSON);
        }
        catch (ex) {
            console.error(ex);
            return;
        }

        if (configJSON && !configJSON.match(/\{\}/)) {
            var items = config.items;
            Object.keys(items).forEach(function(k) {
                var item = items[k];
                this.items[k].setState(item);
            }, this);
            this.name = config.name;
            this.avatar = config.avatar;
            this.color = config.color;
        }
        this.saveConfig();
    },
    getConfig: function() {
        var o = {};
        var items = {};

        Object.keys(this.items).forEach(function(k) {
            var item = this.items[k];
            items[k] = item.getState();
        }, this);

        o.items = items;
        o.name = this.name;
        o.avatar = this.avatar;
        o.color = this.color;

        return o;
    },
    saveConfig: function() {
        localStorage["controllerConfig_v2"] = JSON.stringify(this.getConfig());
    },
    createItems: function(container) {
        var items = {};
        var _this = this;

        // JOYSTICK
        var joystickButton = new Button("joystick", container, {
                position: [-30, 10],
                classes: ["touchable", "touchElement"],
                color: "salmon",
                symbol: "☸"
            },
            function(ev) {},
            function(ev) {
                _this.direction();
            },
            function(ev) {
                var posX = joystickButton.host.offsetLeft + joystickButton.host.offsetWidth / 2;
                var posY = joystickButton.host.offsetTop + joystickButton.host.offsetHeight / 2;
                var touchX = ev.touches ? (ev.touches[0].clientX) : ev.clientX;
                var touchY = ev.touches ? (ev.touches[0].clientY) : ev.clientY;
                _this.direction(touchX - posX, touchY - posY);
            }
        );
        items["joystick"] = joystickButton;

        // THRUST BUTTON
        var thrustButton = new Button("thrust", container, {
                classes: ["pressButton", "touchable", "touchElement"],
                position: [35, 10],
                color: "salmon",
                symbol: "🚀"
            },
            function(ev) {
                _this.action(0, true);
            },
            function(ev) {
                _this.action(0, false);
            },
            function(ev) {});
        items["thrust"] = thrustButton;

        // SHIELD BUTTON
        var shieldButton = new Button("shield", container, {
                classes: ["pressButton", "touchable", "touchElement"],
                position: [35, 30],
                color: "salmon",
                symbol: "⛱ "
            },
            function(ev) {
                _this.action(2, true);
            },
            function(ev) {
                _this.action(2, false);
            },
            function(ev) {});
        items["shield"] = shieldButton;

        // SHOOT BUTTON
        var shootButton = new Button("shoot", container, {
                classes: ["pressButton", "touchable", "touchElement"],
                position: [40, -10],
                color: "salmon",
                symbol: "💣"
            },
            function(ev) {
                _this.action(1, true);
            },
            function(ev) {
                _this.action(1, false);
            },
            function(ev) {});
        items["shoot"] = shootButton;

        var optionsButton = new Button("options", container, {
                classes: ["pressButton", "touchable", "touchElement"],
                position: [0, -40],
                color: 0xacefac,
                symbol: "🔧"
            },
            function(ev) {
                $('#optionsModal').modal('toggle');
            });
        items["options"] = optionsButton;

        var messagePanel = new Button("messagePanel", container, {
                classes: ["messagePanel", "touchElement"],
                position: [0, 10],
                color: 0x40E57B,
                symbol: "Hi.",
            }, function() {},
            function(ev) {
                messagePanel.scriptIndex++;
                messagePanel.symbol = messagePanel.script[messagePanel.scriptIndex] || "";
                if (messagePanel.triggers[messagePanel.scriptIndex]) messagePanel.triggers[messagePanel.scriptIndex]();
                messagePanel.refresh();
            });
        messagePanel.script = [];
        messagePanel.triggers = [];
        messagePanel.scriptIndex = 0;
        items["messagePanel"] = messagePanel;

        return items;
    },
    direction: function(x, y) {
        var granularity = 16;
        var angle = +(Math.round(Math.atan2(y, x) * granularity) / granularity).toPrecision(4);
        if (this.lastDir && this.lastDir.toString() == angle) return;
        this.lastDir = angle;
        this.socket.emit("directionChange", {
            angle: angle
        });
    },
    action: function(id, value) {
        this.socket.emit("keypress", {
            key: id,
            value: value
        });
    },
    updateInfo: function() {
        var color = (this.color.length > 6) ?
            this.color.substring(1) : ((this.color.length == 6) ? this.color : ("0" + this.color));
        this.socket.emit("updateInfo", {
            name: this.name,
            avatar: this.avatar,
            color: color
        });
    },
    refresh: function() {
        Object.keys(this.items).forEach(function(k) {
            this.items[k].refresh();
        }, this);
    },
    startReorganizeScript: function() {
        var _this = this;

        var itemsList = Object.keys(this.items).map(function(e) {
            return this.items[e];
        }, this);
        itemsList.forEach(function(e) {
            e.hide();
        }, this);

        var messagePanel = this.items["messagePanel"];
        messagePanel.show();
        messagePanel.scriptIndex = 0;

        messagePanel.script[0] = "Hi! Tap here to start organizing!";

        messagePanel.script[1] = "Ok. Tap on me to keep the conversation going.";

        messagePanel.script[2] = "You'll start by placing me somewhere.";

        messagePanel.script[3] = "I'm purple, movable. Drag me around to move me there.";
        messagePanel.triggers[3] = function() {
            messagePanel.unlock();
        };

        messagePanel.script[4] = "Good job! Tap on me to proceed.";
        messagePanel.triggers[4] = function() {
            messagePanel.lock();
        };

        messagePanel.script[5] = "Now, place the joystick somewhere.";
        var joystick = this.items["joystick"];
        messagePanel.triggers[5] = function() {
            joystick.show();
            joystick.unlock();
        };

        messagePanel.script[6] = "Good. Now 3 buttons: Fire, shield, and move coming.";
        messagePanel.triggers[6] = function() {
            joystick.lock();
        };

        messagePanel.script[7] = "Find a home for your move button.";
        var move = this.items["thrust"];
        messagePanel.triggers[7] = function() {
            move.show();
            move.unlock();
        };

        messagePanel.script[8] = "Place the 'fire' nearby.";
        var shoot = this.items["shoot"];
        messagePanel.triggers[8] = function() {
            move.lock();
            shoot.show();
            shoot.unlock();
        };

        messagePanel.script[9] = "At last, the shield.";
        var shield = this.items["shield"];
        messagePanel.triggers[9] = function() {
            shoot.lock();
            shield.show();
            shield.unlock();
        };


        messagePanel.script[10] = "Good job! You're done.";
        messagePanel.triggers[10] = function() {
            shield.lock();
        };

        messagePanel.script[11] = "Place the options somewhere.";
        var options = this.items["options"];
        messagePanel.triggers[11] = function() {
            options.show();
            options.unlock();
        };

        messagePanel.script[12] = "Are you satisfied with this? Click here to answer.";
        messagePanel.triggers[12] = function() {
            options.lock();
        };

        messagePanel.triggers[13] = function() {
            var result = window.confirm("Do you want to save this layout?");
            if (result == true) {
                _this.saveConfig();
                _this.refresh();
            }
            else {
                _this.loadConfig();
            }
        };

        messagePanel.symbol = messagePanel.script[0];
        messagePanel.refresh();
    }
};

var Button = function(name, container, options, onpress, onrelease, ondrag) {
    options = options || {};
    var _this = this;

    this.name = name;
    var host = document.createElement("div");
    container.appendChild(host);
    host.id = name;
    this.host = host;

    this.host.touchDown = {};

    onpress = onpress || function() {};
    onrelease = onrelease || function() {};
    ondrag = ondrag || function() {};

    this.host.addEventListener("mousedown", function(ev) {
        _this.host.mouseDown = true;
        onpress.call(_this.host, ev);
        return false;
    });
    this.host.addEventListener("mouseup", function(ev) {
        _this.host.mouseDown = false;
        onrelease.call(_this.host, ev);
        return false;
    });
    this.host.addEventListener("mousemove", function(ev) {
        if (_this.host.mouseDown) {
            ondrag.call(_this.host, ev);
        }
        return false;
    });
    document.addEventListener("mousemove", function(ev) {
        if (_this.host.mouseDown) {
            ondrag.call(_this.host, ev);
        }
        return false;
    });
    document.addEventListener("mouseup", function(ev) {
        if (_this.host.mouseDown) {
            onrelease.call(_this.host, ev);
        }
        _this.host.mouseDown = false;
        return false;
    });

    this.host.addEventListener("touchstart", function(ev) {
        _this.host.touchDown = true;
        _this.pressingTouchId = ev.changedTouches[0].identifier;

        if (!_this.isLocked) {

        }
        else {
            onpress.call(_this.host, ev);
        }

        _this.host.classList.add("touched");
        _this.host.classList.remove("touchable");
        ev.preventDefault();
        return true;
    });
    this.host.addEventListener("touchend", function(ev) {
        if (ev.changedTouches[0].identifier !== _this.pressingTouchId) return;

        _this.host.touchDown = false;

        onrelease.call(_this.host, ev);

        _this.host.classList.add("touchable");
        _this.host.classList.remove("touched");
        ev.preventDefault();
        return true;
    });
    this.host.addEventListener("touchmove", function(ev) {
        if (ev.changedTouches[0].identifier !== _this.pressingTouchId) return;
        if (_this.host.touchDown) {
            if (!_this.isLocked) {
                _this.displacer.call(_this, ev);
            }
            else {
                ondrag.call(_this.host, ev);
            }
        }
        ev.preventDefault();
        return true;
    });
    document.addEventListener("touchmove", function(ev) {
        if (ev.changedTouches[0].identifier !== _this.pressingTouchId) return;
        if (_this.host.touchDown) {
            if (!_this.isLocked) {
                _this.displacer.call(_this, ev);
            }
            else {
                ondrag.call(_this.host, ev);
            }
        }
        ev.preventDefault();
        return true;
    });
    document.addEventListener("touchend", function(ev) {
        if (ev.changedTouches[0].identifier !== _this.pressingTouchId) return;
        if (_this.host.touchDown) {
            onrelease.call(_this.host, ev);
        }
        _this.host.classList.add("touchable");
        _this.host.classList.remove("touched");
        _this.host.touchDown = false;
        ev.preventDefault();
        return true;
    });

    this.symbol = options.symbol || "X";
    this.classes = options.classes || [];
    var color = options.color || 0x8b29e5;
    this.color = typeof(color) == "number" ? ("#" + color.toString(16)) : color;
    this.position = options.position || [0, 0];

    this.refresh();

    this.isLocked = true;
    this.pressingTouchId = null;
};

Button.prototype = {
    refresh: function() {
        while (this.host.children[0]) {
            this.host.removeChild(this.host.children[0]);
        }

        this.classes.forEach(function(c) {
            this.host.classList.add(c);
        }, this);
        this.size = [this.host.offsetWidth, this.host.offsetHeight];

        this.host.style.marginLeft = -this.host.offsetWidth / 2 + "px";
        this.host.style.marginTop = -this.host.offsetHeight / 2 + "px";

        this.host.style.backgroundColor = this.color;

        this.host.style.left = (50 + this.position[0]) + "%";
        this.host.style.top = (50 + this.position[1]) + "%";

        var contentHolder = document.createElement("div");
        contentHolder.textContent = this.symbol;
        this.host.appendChild(contentHolder);
        contentHolder.style.position = "absolute";
        contentHolder.style.left = this.size[0] / 2 - contentHolder.offsetWidth / 2 + "px";
        contentHolder.style.top = this.size[1] / 2 - contentHolder.offsetHeight / 2 + "px";
    },
    getState: function() {
        var stateObj = {};
        stateObj.position = this.position
        return stateObj;
    },
    setState: function(stateObj) {
        this.position = stateObj.position;
        this.refresh();
    },
    placer: function(_this) {
        var x = parseInt(_this.host.style.left);
        if (_this.host.style.left.match("px")) {
            var left = (x / _this.host.parentElement.offsetWidth) * 100 - 50;
        }
        else {
            left = x - 50;
        }

        var y = parseInt(_this.host.style.top);
        if (_this.host.style.top.match("px")) {
            var top = (y / _this.host.parentElement.offsetHeight) * 100 - 50;
        }
        else {
            top = y - 50;
        }
        _this.position = [left, top];
        _this.refresh();
    },
    displacer: function(ev) {
        var x = ev.clientX || ev.changedTouches[0].clientX;
        var y = ev.clientY || ev.changedTouches[0].clientY;
        this.host.style.left = x + "px";
        this.host.style.top = y + "px";
    },
    unlock: function() {
        this.host.classList.add("unlocked");
        this.isLocked = false;
    },
    lock: function() {
        this.host.classList.remove("unlocked");
        this.isLocked = true;
        this.placer(this);
    },
    hide: function() {
        $(this.host).hide();
    },
    show: function() {
        $(this.host).show();
    }
};