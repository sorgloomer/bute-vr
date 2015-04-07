var EventHandler = (function() {

  function $emit(evt, param) {
    var _this = this;
    _this.$listeners.forEach(function(l) {
      if (l.event === evt) {
        l.callback.call(_this, param);
      }
    });
  }
  function $on(event, callback) {
    var listener = {
      event: event,
      callback: callback
    };
    this.$listeners.push(listener);
    return listener;
  }
  function $off(obj, listener) {
    obj.$listeners = obj.$listeners.filter(function(l) { return l !== listener; });
    return listener;
  }

  function decorate(obj) {
    obj.$listeners = [];
    obj.$emit = $emit;
    obj.$on = $on;
    obj.$off = $off;
  }

  function emit(obj, evt, param) {
    if (obj && obj.$emit) obj.$emit(evt, param);
  }
  return {
    decorate: decorate,
    emit: emit
  };
})();