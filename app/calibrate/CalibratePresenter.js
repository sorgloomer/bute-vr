var CalibratePresenter = (function(THREE){
  function setU(v, s) {
    v.x = v.y = v.z = s;
  }

  function CalibrateScene() {
    this.scene = new THREE.Scene();

    this.geomCircle = new THREE.CircleGeometry(0.05, 36);
    this.geomCircle.vertices.shift();
    this.lineMaterial = new THREE.LineBasicMaterial({ color: 0xff9999 });

    this.target = new THREE.Object3D();
    this.targetOuter = new THREE.Line(this.geomCircle, this.lineMaterial);
    this.target.add(this.targetOuter);

    var targetX = new THREE.Line(this.geomCircle, this.lineMaterial);
    var targetY = new THREE.Line(this.geomCircle, this.lineMaterial);
    var targetZ = new THREE.Line(this.geomCircle, this.lineMaterial);
    targetY.rotateY(Math.PI * 0.5);
    setU(targetY.scale, 4);
    targetX.rotateX(Math.PI * 0.5);
    setU(targetX.scale, 4);
    this.target.add(targetX);
    this.target.add(targetY);
    this.target.add(targetZ);

    this.scene.add(this.target);
  }

  function CalibratePresenter(renderer, viewmodel) {
    this.renderer = renderer;
    this.viewmodel = viewmodel;
    this.scene = new CalibrateScene(renderer);
    this.camera = new THREE.OrthographicCamera(-1, 1, -1, 1, -1000, 1000);

    this.pointingStart = 0;
    this.calibratePos = null;
  }

  CalibratePresenter.prototype.resize = function(w, h) {
    var aspect = w / h;
    this.camera.left = -aspect;
    this.camera.right = aspect;
    this.camera.updateProjectionMatrix();
  };


  function setVec(objVec, arrVec) {
    objVec.x = arrVec[0];
    objVec.y = arrVec[1];
    objVec.z = arrVec[2];
  }
  function setScale(objVec, f) {
    objVec.x = f;
    objVec.y = f;
    objVec.z = f;
  }
  function s(v) {
    v = (v * 256)|0;
    if (v > 255) v = 255;
    if (v < 0) v = 0;
    return v;
  }
  function ss(c, r, g, b) {
    c.set(s(r), s(g), s(b));
  }
  CalibratePresenter.prototype.render = function(time) {
    var vm = this.viewmodel;
    var scale = vm.calibrated
      ? vm.radius
      : 3 * Math.pow((1 - vm.pointingProgress), 0.5);
    if (vm.calibrated) {
      var p = vm.pinch * 2;
      ss(this.scene.lineMaterial.color, 2+p, 0-p, 2+p);
    }

    scale = Math.max(scale, 1e-4);
    setScale(this.scene.targetOuter.scale, scale);
    setVec(this.scene.target.position, this.viewmodel.target);
    this.renderer.render(this.scene.scene, this.camera);
  };

  return CalibratePresenter;
})(THREE);
