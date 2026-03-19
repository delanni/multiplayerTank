var fs = require("fs");
var path = require("path");

var T = {
    _consoleWriting: true,
    _fileWriting: false,
    _fileLineLimit: 10000,
    _fileCounter: 0,
    _lineCounter: 0,
    _path: "./logs/",
    _filePrefix: "fileLog",
    _actualFilename: "bin.log",

    _openFile: function() {
        try {
            if (!fs.existsSync(this._path)) {
                fs.mkdirSync(this._path, { recursive: true });
            }
            var readableDate = new Date().toJSON().split("T")[0];
            do {
                this._actualFilename = this._path + this._filePrefix + "-" + readableDate + "-" + this._fileCounter + ".txt";
            } while (fs.existsSync(this._actualFilename) && ++this._fileCounter);
            fs.writeFileSync(this._actualFilename, "");
        }
        catch (err) {
            console.error("Could not open log file:", err.message);
            this._fileWriting = false;
        }
    },
    _closeFile: function() {
        this._actualFilename = "bin.log";
        this._fileCounter++;
        this._lineCounter = 0;
    },
    _resolveFormat: function(format) {
        var text = format.split("\t").map(function(word) {
            if (TracingDictionary[word]) return word + "\t" + TracingDictionary[word];
            return word;
        }).join("\t");
        return text;
    },
    tab: function() {
        var items = [].slice.call(arguments);
        this.log([new Date().toJSON()].concat(items).join("\t"));
    },
    log: function(format) {
        var _this = this;
        setImmediate(function() {
            var text = _this._resolveFormat(format);
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
        fs.appendFile(this._actualFilename, text + "\n", "utf8", function(err) {
            if (err) {
                console.error("Logging error", err);
            }
        });
    },
    error: function(message, error, trace) {
        this.log("ERROR: " + message + "\n\t" + trace);
        console.error("Error:" + message, error);
    }
};

var TracingDictionary = {
    "PONG": "Server answered roundtrip",
    "PING": "Asked for roundtrip time",
    "LEFT": "Has left the server",
    "ROOM": "Room created",
    "PINGBACK": "Tracked page loaded"
};

module.exports = T;
