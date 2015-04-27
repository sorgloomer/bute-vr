var MainViewmodel = (function() {

  function MainViewmodel(magic) {
    this.points = [];
    this.camera = new THREE.PerspectiveCamera(magic.camera_vertical_fov, 1, magic.screen_distance * 0.01, magic.screen_distance * 10);
    this.system = null;
    this.options = null;
  }

  MainViewmodel.prototype.init = function() {
    this.options.init();
  };

  MainViewmodel.prototype.updateCamera = function(magic) {
    var camera = this.camera;
    camera.fov = magic.camera_vertical_fov;
    camera.near = magic.screen_distance * 0.01;
    camera.far = magic.screen_distance * 10;
    camera.updateProjectionMatrix();
  };

  return MainViewmodel;
})();