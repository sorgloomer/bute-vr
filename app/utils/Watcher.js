var Watcher = (function(){

  function Watcher() {
    this.watches = new Set();
    this.maxDigestCycles = 50;
  }
  Watcher.prototype.digest = function digest() {
    var changed;
    for (var i = 0; i < this.maxDigestCycles; ++i) {
      changed = false;
      this.watches.forEach(changer);
      if (!changed) return;
    }
    console.warn("Digest didn't settle");
    function changer(w) {
      if (w.update()) changed = true;
    }
  };

  Watcher.prototype.on = function on(obj, prop, fn) {
    var _this = this;
    var lastVal = obj[prop];
    var watch = {
      update: function update() {
        var currVal = obj[prop];
        if (lastVal !== currVal) {
          fn(currVal, lastVal, obj, prop);
          lastVal = currVal;
          return true;
        } else {
          return false;
        }
      },
      obj: obj,
      prop: prop,
      fn: fn
    };

    _this.watches.add(watch);
    return function() {
      _this.watches.delete(watch);
    };
  };

  return Watcher;
})();