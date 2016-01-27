var fs = require("fs");
var T = {
    _consoleWriting: true,
    _fileWriting: true,
    _fileLineLimit: 10000,
    _fileCounter: 0,
    _lineCounter: 0,
    _jsonify: true,
    _path: "./logs/",
    _filePrefix: "fileLog",
    _actualFilename: "bin.log",

    _openFile: function() {
        var readableDate = new Date().toJSON().split("T")[0];
        do {
            this._actualFilename = this._path + this._filePrefix + "-" + readableDate + "-" + this._fileCounter + ".txt";
        } while (fs.existsSync(this._actualFilename) && ++this._fileCounter);
        fs.writeFileSync(this._actualFilename, "");
    },
    _closeFile: function() {
        this._actualFilename = "bin.log";
        this._fileCounter++;
        this._lineCounter = 0;
        //this.save();
    },
    _resolveFormat: function(format, objects) {
        // temp.
        var text = format.split("\t").map(function(word) {
            if (TracingDictionary[word]) return word + "\t" + TracingDictionary[word];
            return word;
        }).join("\t");
        return text;
    },
    tab: function(items) {
        if (arguments.length > 1) {
            items = [].slice.call(arguments);
        }
        this.log([new Date().toJSON()].concat(items).join("\t"));
    },
    log: function(format) {
        var _this = this;
        setImmediate(function() {
            var text = _this._resolveFormat(format, [].slice.call(arguments));
            if (_this._fileWriting) {
                _this._logToFile(text);
            }
            if (_this._consoleWriting) {
                _this._logToConsole(text);
            }
        });
    },
    _logToConsole: function(text) {
        console.log(text);
    },
    _logToFile: function(text) {
        if (this._actualFilename == "bin.log") {
            this._openFile();
        }
        else if (this._lineCounter > this._fileLineLimit) {
            this._closeFile();
            this._openFile();
        }
        this._lineCounter++;
        fs.appendFile(this._actualFilename, text + "\n", "utf8", function(err, res) {
            if (err) {
                console.error("Logging error", err);
            }
        });
    },
    error: function(message, error, trace) {
        this.log("ERROR: " + message + "\n\t" + trace);
        console.error("Error:" + message, error);
    },

    load: function() {
        var configs = JSON.parse(fs.readFileSync("config.json").toString());
        Object.keys(configs.tracing).forEach(function(key) {
            this["_" + key] = configs.tracing[key];
        }, this);
    },
    save: function() {
        var configs = JSON.parse(fs.readFileSync("config.json").toString());
        Object.keys(this).filter(function(e) {
            return e.charAt(0) == "_" && typeof this[e] != "function";
        }, this).forEach(function(key) {
            configs.tracing[key.substr(1)] = this[key];
        }, this);
        fs.writeFileSync("config.json", JSON.stringify(configs));
    }
};

//T.load();

var TracingDictionary = {
    "PONG": "Server answered roundtrip",
    "PING": "Asked for roundtrip time",
    "LEFT": "Has left the server",
    "ROOM": "Room created",
    "PINGBACK": "Tracked page loaded"
};

module.exports = T;