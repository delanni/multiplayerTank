var Mex = require("./MathExtensions");

var Generator = {
    GenerateUUID : function(){
        return [Mex.randInt(0xffffffff), Mex.randInt(0xffffffff), Mex.randInt(0xffffffff), Mex.randInt(0xffffffff)].map( function(e){ return e.toString(16)}).join("");
    },
    _pick: function(pickFromArray){ return pickFromArray[Mex.randInt(pickFromArray.length)]; },
    _soupBase : "abcdefghijklmnopqrstuvwxyz0123456789", //ABCDEFGHIJKLMNOPQRSTUVWXYZ
    GenerateSoup: function(n){
        var ret = [];
        while (n-->0){
            ret.push(this._pick(this._soupBase));
        }
        return ret.join("");
    },
    // 9*9 = 81
    _nameBase : [["Donnie", "Fat", "Indiana", "John", "Rocky", "Darth", "Forrest", "Vincent", "Tyler"],
                 ["Darko", "Kyle", "Jones", "McLane", "Balboa","Vader", "Gump", "Vega", "Durden"]],
    GenerateName: function(){
        return this._nameBase.map(function(part){
            return this._pick(part); 
        }, this).join("") + Mex.randInt(1000);
    }
};

module.exports = Generator;