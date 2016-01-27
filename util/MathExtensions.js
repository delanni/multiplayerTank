var Mex = {
    random: function(max, min) {
        if (typeof min == "undefined") min = 0;
        if (typeof max == "undefined") max = 1;
        return Math.random() * max + min;
    },
    randInt: function(max, min) {
        return Math.floor(this.random(max, min));
    }
}

module.exports = Mex;