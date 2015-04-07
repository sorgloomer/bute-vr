var ArrayPresenter = (function() {

  function update(methods, source, target, optUserContext) {
    var i;
    var originalTargetLength = target.length;

    if (originalTargetLength < source.length) {
      target.length = source.length;
      for (i = originalTargetLength; i < source.length; ++i) {
        target[i] = methods.make(source[i], optUserContext);
      }
    } else if (originalTargetLength > source.length) {
      for (i = source.length; i < target.length; ++i) {
        methods.remove(source[i], target[i], optUserContext);
      }
      target.length = source.length;
    }
    for (i = 0; i < source.length; ++i) {
      methods.update(source[i], target[i], optUserContext);
    }
  }

  return {
    update: update
  };
})();