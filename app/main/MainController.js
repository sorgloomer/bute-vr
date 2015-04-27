var MainController = (function() {

  var TEMP_MAT = mat4.create();
  // It seems that the real speed of the fingertips is too fast,
  // maybe because of the trembling. Speed is multiplied by this factor before
  // physics calculation.
  var SPEED_FACTOR = 0.5;

  function createBallSystem() {
    var result = new BallSystem();
    var r = 0.03, y = 0.03;
    for (var i = 0; i < 5; i++) {
      result.balls.push(new Ball([0, y, 0], r));
      y += 2 * r;
      r -= 0.005;
    }
    result.balls[0].pos[0] -= result.balls[0].radius * 1e-7;
    return result;
  }

  function MainController(renderer, app) {
    this.constructor.superclass.call(this);
    EventHandler.decorate(this);

    this.reality_to_model = mat4.create();

    this.app = app;
    this.viewmodel = new MainViewmodel(app.global.magic);
    this.viewmodel.options = app.global.rendering;
    this.presenter = new MainPresenter(renderer, this.viewmodel, app.global.magic);

    this._points = [];
    this.viewmodel.system = this._ballSystem = createBallSystem();

    var _this = this;
    _this.TipDefinition = {
      make: vec3.create,
      update: function(src, dst) {
        mat4.vecmul(dst, src, _this.reality_to_model);
      },
      remove: noop
    };
    _this.InterfereDefinition = {
      make: function() {
        var ball =  new Ball([0, 0, 0], 0.005);
        ball.imass = 0;
        return ball;
      },
      update: function(src, dst, idt) {
        vec3.sub(dst.vel, src, dst.pos);
        vec3.lscale(dst.vel, SPEED_FACTOR  * idt);
        vec3.set(dst.pos, src);
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

  MainController.prototype.update = function(time, dt) {
    this.app.global.magic.actualize();
    this.viewmodel.updateCamera(this.app.global.magic);
    this._updateTransform();
    ArrayPresenter.update(
      this.TipDefinition,
      this._points,
      this.viewmodel.points);
    ArrayPresenter.update(
      this.InterfereDefinition,
      this.viewmodel.points,
      this._ballSystem.obstacles,
      1/dt);
    this._ballSystem.update(dt);
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