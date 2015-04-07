var AppGlobals = (function() {

  function GlobalRenderingOptions() {
    this.contrast = 0.01;
    this.deghost = 0.01;
    this.screenDistance = 0.35;
    this.eyeDistance = 0.18;
    this.mode = 'red-cyan';
  }

  function AppGlobals() {
    this.reality_to_screen = mat4.setScaleS(mat4.create(), 0.001);
    this.rendering = new GlobalRenderingOptions();
    this.magic = new Magic();
  }

  return AppGlobals;
})();