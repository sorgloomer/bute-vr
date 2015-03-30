var CalibrateController = (function(THREE){
  function CalibrateScene(renderer) {
    this.renderer = renderer;
    this.scene = new THREE.Scene();

    this.geomCircle = new THREE.CircleGeometry(0.05, 36);
    this.geomCircle.vertices.shift();
    this.lineMaterial = new THREE.LineBasicMaterial({ color: 0xff9999 });

    this.target = new THREE.Object3D();
    this.targetOuter = new THREE.Line(this.geomCircle, this.lineMaterial);
    this.target.add(this.targetOuter);
    this.target.add(new THREE.Line(this.geomCircle, this.lineMaterial));

    this.scene.add(this.target);

  }

  function CalibrateController(renderer) {
    this.renderer = renderer;
    this.scene = new CalibrateScene(renderer);
    this.camera = new THREE.OrthographicCamera(-1, 1, -1, 1, -1000, 1000);

    this.transform = new THREE.Matrix4();
    this.pointingStart = 0;
    this.pointingPos = null;
  }

  CalibrateController.prototype.resize = function(w, h) {
    var aspect = w / h;
    this.camera.left = -aspect;
    this.camera.right = aspect;
    this.camera.updateProjectionMatrix();
  };

  function len(vec) {
    return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
  }
  function dist(a, b) {
    var dx = b[0] - a[0];
    var dy = b[1] - a[1];
    var dz = b[2] - a[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  CalibrateController.prototype.leapFrame = function(frame, time) {
    var hand = frame.hands[0];
    var newPointing = null;
    if (hand) {
      var tipVelocityAbs = len(hand.fingers[1].tipVelocity);
      newPointing = tipVelocityAbs < 200 ? hand.fingers[1].tipPosition : null;
    }

    if (this.pointing) {
      if (!newPointing || dist(this.pointing, newPointing) > 10) {
        this.pointing = null;
      }
    } else if (newPointing) {
      this.pointingStart = time;
      this.pointing = newPointing;
    }

  };
  CalibrateController.prototype.update = function(time) {
    var radTime = this.pointing ? (time - this.pointingStart) : 0;
    var scale = (radTime >= 1) ? 5/2 * (3 - radTime) : 5;
    var oscale = this.scene.targetOuter.scale;
    oscale.x = oscale.y = oscale.z = scale;
  };
  CalibrateController.prototype.render = function(time) {
    this.renderer.render(this.scene.scene, this.camera);
  };

  return CalibrateController;
})(THREE);
