var CalibrateController = (function(){
  function CalibrateController(renderer, app) {
    this.app = app;
    this.constructor.superclass.call(this);
    this.viewmodel = new CalibrateViewmodel();
    this.presenter = new CalibratePresenter(renderer, this.viewmodel);

    this.calibratePos = null;
    this.pointingPos = null;
    this.modelPointIndex = 0;
    this.pointPairs = [];
    this.world_to_model = mat4.create();
    this.calibrationFinished = false;

    this.holdTime = 2;
  }
  extend(CalibrateController, BaseController);
  CalibrateController.POINTS = [[0, 0, 0], [-0.7, -0.8, 0], [0.7, -0.8, 0]];
  CalibrateController.prototype.updateViewmodelPos = function() {
    return this.getViewmodelPos(this.viewmodel.target);
  };
  CalibrateController.prototype.getViewmodelPos = function(to) {
    var points = CalibrateController.POINTS[this.modelPointIndex];
    if (points) {
      vec3.copy(points, to);
    }
    return points;
  };


  CalibrateController.prototype.leapFrame = function(frame, time) {
    var hand = frame.hands[0];
    var newPointing = null;
    if (hand) {
      this.pointingPos = hand.fingers[1].tipPosition;
      var tipVelocityAbs = vec3.len(hand.fingers[1].tipVelocity);
      newPointing = tipVelocityAbs < 200 ? this.pointingPos : null;
      this.viewmodel.pinch = 0.02 * vec3.dist(
        hand.fingers[0].tipPosition,
        hand.fingers[1].tipPosition);

    } else {
      this.pointingPos = null;
    }

    if (this.calibratePos) {
      if (!newPointing || vec3.dist(this.calibratePos, newPointing) > 10) {
        this.calibratePos = null;
      }
    } else if (newPointing) {
      this.pointingStart = time;
      this.calibratePos = newPointing;
    }
  };
  CalibrateController.prototype.update = function(time) {
    var vm = this.viewmodel;
    if (this.calibrationFinished) {
      if (!vm.calibrated) vm.calibrated = true;

      if (this.pointingPos) {
        mat4.vecmul(vm.target, this.pointingPos, this.world_to_model);
        vm.radius = -3 * vm.target[2];
        vm.target[2] = 0;
      }
    } else if (this.calibratePos) {
      var radTime = this.pointingPos ? (time - this.pointingStart) : 0;
      var pp = radTime / this.holdTime;
      if (pp > 1) {
        this.pointPairs.push([
          this.getViewmodelPos(),
          this.calibratePos
        ]);

        this.modelPointIndex++;
        if (!this.updateViewmodelPos()) {
          this.finishCalibration();
        }
        this.calibratePos = null;
        pp = 0;
      }
      vm.pointingProgress = pp;
    } else {
      vm.pointingProgress = 0;
    }

  };

  function myMakeMx(it, ix, iy, lengthenZ) {
    var M = mat4.create();

    var x = vec3.clone(ix);
    var y = vec3.clone(iy);
    var z = vec3.create();
    var t = vec3.clone(it);


    vec3.cross(z, vec3.lsub(x, t), vec3.lsub(y, t));
    var ilen = 1 / vec3.len(z);
    if (lengthenZ) ilen *= (vec3.len(x) + vec3.len(y)) * 0.5;
    vec3.lscale(z, ilen);

    M[ 0] = x[0]; M[ 1] = x[1]; M[ 2] = x[2]; M[ 3] = 0;
    M[ 4] = y[0]; M[ 5] = y[1]; M[ 6] = y[2]; M[ 7] = 0;
    M[ 8] = z[0]; M[ 9] = z[1]; M[10] = z[2]; M[11] = 0;
    M[12] = t[0]; M[13] = t[1]; M[14] = t[2]; M[15] = 1;

    return M;
  }

  CalibrateController.prototype.finishCalibration = function() {
    this.calibrationFinished = true;
    var modelM = myMakeMx(this.pointPairs[0][0], this.pointPairs[1][0], this.pointPairs[2][0], false);
    var worldM = myMakeMx(this.pointPairs[0][1], this.pointPairs[1][1], this.pointPairs[2][1], true);
    mat4.lmul(mat4.invert(this.world_to_model , worldM), modelM);

    this.app.notifyCalibrated(this.world_to_model);
  };

  return CalibrateController;
})();
