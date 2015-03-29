var Watcher = (function(){
  function on(obj, prop, fn) {
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
    Watcher.watches.push(watch);
    return function() {
      Watcher.watches.delete(watch);
    };
  }

  function digest() {
    var changed;
    for (var i = 0; i < 50; ++i) {
      changed = false;
      Watcher.watches.forEach(changer);
      if (!changed) return;
    }
    console.warn("Digest didn't settle");
    function changer(w) {
      if (w.update()) changed = true;
    }
  }

  var Watcher = {
    watches: [],
    on: on,
    digest: digest
  };
  return Watcher;
})();