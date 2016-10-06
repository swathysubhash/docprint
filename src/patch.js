String.prototype.isJSON = function(){
    try {
        var o = JSON.parse(this);
    	if (o && typeof o === "object") {
            return o;
        }
    }
    catch (e) { }
    return false;
};


String.prototype.replaceAll = function(target, replacement) {
  return this.split(target).join(replacement);
};
