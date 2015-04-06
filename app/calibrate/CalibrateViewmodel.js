var CalibrateViewmodel = (function() {
  function CalibrateViewmodel() {
    this.pointingProgress = 0;
    this.target = vec3.create();
    this.calibrated = false;
    this.pinch = 0;
    this.radius = 1;
  }

  return CalibrateViewmodel;
})();
