var Magic = (function() {

  function Magic() {
    this.magic_scale = 0.52;
    this.screen_width = 0.466;
    this.screen_height = 0.262;
    this.screen_distance = 1.0;

    this.aspect = 0;
    this.camera_half_horizontal_fov_tan = 0;
    this.camera_vertical_fov = 0;
    this.actualize();
  }
  var RAD_TO_DEG = 57.2957795;
  Magic.prototype.actualize = function() {
    this.aspect = this.screen_width / this.screen_height;
    this.camera_vertical_fov = 2 * Math.atan(0.5 * this.screen_height / this.screen_distance) * RAD_TO_DEG;
    this.camera_half_horizontal_fov_tan = 0.5 * this.screen_width / this.screen_distance;
  };

  return Magic;
})();