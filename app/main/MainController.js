var MainController = (function() {

  var TEMP_MAT = mat4.create();

  function MainController(renderer, app) {
    this.constructor.superclass.call(this);
    EventHandler.decorate(this);

    this.reality_to_model = mat4.create();

    this.app = app;
    this.viewmodel = new MainViewmodel(app.global.magic);
    this.viewmodel.options = app.global.rendering;
    this.presenter = new MainPresenter(renderer, this.viewmodel, app.global.magic);

    this._points = [];

    var _this = this;
    _this.TipDefinition = {
      make: vec3.create,
      update: function(src, dst) {
        mat4.vecmul(dst, src, _this.reality_to_model);
      },
      remove: noop
    };
  }

  extend(MainController, BaseController);

  MainController.prototype.leapFrame = function(frame) {
    var points = this._points, i = 0;
    frame.hands.forEach(function(hand) {
      hand.fingers.forEach(function(finger) {
        // will expand array if necessary
        points[i++] = finger.tipPosition;
      });
    });
    // will shrink array if necessary
    points.length = i;

  };

  MainController.prototype.update = function(time) {
    this._updateTransform();
    ArrayPresenter.update(this.TipDefinition, this._points, this.viewmodel.points);
  };

  MainController.prototype._updateTransform = function() {
    var rtm = this.reality_to_model;
    var temp = TEMP_MAT;

    var magic = this.app.global.magic;
    mat4.setScaleS(temp, magic.screen_height * magic.magic_scale);
    temp[14] = -magic.screen_distance;


    mat4.mul(rtm, this.app.global.reality_to_screen, temp);
    mat4.set(temp, this.viewmodel.camera.matrixWorld.elements);
    mat4.lmul(this.reality_to_model, temp);
  };

  return MainController;
})();