var ArrayExtensions = {
    remove : function(item){
        if (typeof item == "function"){
            var idx = this.indexOf(this.filter(item)[0]);
        } else {
            idx = this.indexOf(item);
        }
        if (idx>=0) {
            var i = this.splice(idx,1);
        }
        return i;
    }
};

module.exports = ArrayExtensions;