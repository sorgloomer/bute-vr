var MainPresenter = (function() {

  var SCHEMES = {
    "red-cyan": THREE.AnaglyphEffect.Scheme.RedCyan,
    "magenta-green": THREE.AnaglyphEffect.Scheme.MagentaGreen,
    "blue-yellow": THREE.AnaglyphEffect.Scheme.BlueYellow,
    "none": THREE.AnaglyphEffect.Scheme.None
  };

  var EPS = 1e-5;
  var SPHERE_RAD = 0.004;

  var PointDefinition = {
    make: function(src, presenterScene) {
      var dst = {
        sphere: new THREE.Mesh(presenterScene.geomSphere, presenterScene.material),
        arrow: new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 0.1, 0xffffff)
      };
      presenterScene.scene.add(dst.sphere);
      presenterScene.scene.add(dst.arrow);
      return dst;
    },
    remove: function(src, dst, presenterScene) {
      presenterScene.scene.remove(dst.sphere);
      presenterScene.scene.remove(dst.arrow);
    },
    update: function(src, dst, presenterScene) {
      dst.sphere.position.set(src[0], src[1], src[2]);
      dst.arrow.setLength(src[1] - SPHERE_RAD, SPHERE_RAD, 0.5 * SPHERE_RAD);
      dst.arrow.position.set(src[0], 0, src[2]);
    }
  };


  function MainPresenterScene(renderer, magic) {
    this.renderer = renderer;
    this.scene = new THREE.Scene();
    this.geomSphere = new THREE.SphereGeometry(SPHERE_RAD);
    this.material = new THREE.MeshBasicMaterial({ color: 0x7777ff });

    this.points = [];

    this.gridSize = 0.1;
    this.grid = new THREE.GridHelper(this.gridSize, 0.1 * this.gridSize - EPS);
    this.grid.position.y = 0;
    this.scene.add(this.grid);

    this.anaglyph = new THREE.AnaglyphEffect(renderer, 1, 1);
    this.anaglyph.screenDistance = 500;
  }

  function MainPresenter(renderer, viewmodel, magic) {
    this.renderer = renderer;
    this.viewmodel = viewmodel;
    this.magic = magic;

    this.scene = new MainPresenterScene(renderer, magic);

    this.datgui = null;
    this.camera = viewmodel.camera;
    this.watcher = new Watcher();

    this.vecLookAt = new THREE.Vector3(0, -0.01, 0);

    this._initDatGui();
    this._initWatches();

    viewmodel.options.screenDistance = magic.screen_distance;

    this.datgui.__controllers.forEach(function(c) {
      c.updateDisplay();
    });
  }

  MainPresenter.prototype._initDatGui = function() {
    var opts = this.viewmodel.options;
    this.datgui = new dat.GUI();
    this.datgui.add(this.magic, 'screen_width', 0.1, 1.5, 0.01);
    this.datgui.add(this.magic, 'screen_height', 0.1, 1.5, 0.01);
    this.datgui.add(this.magic, 'screen_distance', 0.1, 4.0, 0.01);

    this.datgui.add(opts, 'contrast', -1, 1, 0.1);
    this.datgui.add(opts, 'deghost', 0, 1, 0.05);
    this.datgui.add(opts, 'screenDistance', 0.01, 10);
    this.datgui.add(opts, 'eyeDistance', 0, 0.5);
    this.datgui.add(opts, 'mode', Object.keys(SCHEMES));
  };

  MainPresenter.prototype._initWatches = function() {
    var _this = this;
    _this.watcher.on(_this.viewmodel.options, 'mode', function(val) {
      _this.scene.anaglyph.scheme = SCHEMES[val];
    });
  };

  MainPresenter.prototype.resize = function(w, h) {
    var aspect = w / h;
    this.scene.anaglyph.setSize(w, h);
    this.renderer.setSize(w, h);
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  };

  MainPresenter.prototype.render = function(time) {
    this.watcher.digest();
    var cam_distance = this.magic.screen_distance - this.scene.gridSize;
    var cam_angle = time * 0.16;
    this.camera.position.y = this.magic.screen_distance * 0.25;
    this.camera.position.z = cam_distance * Math.cos(cam_angle);
    this.camera.position.x = cam_distance * Math.sin(cam_angle);
    this.vecLookAt.y = this.magic.screen_distance * 0.03;
    this.camera.lookAt(this.vecLookAt);

    var ana = this.scene.anaglyph, opt = this.viewmodel.options;
    ana.deghost = opt.deghost;
    ana.contrast = opt.contrast;
    ana.eyeDistance = opt.eyeDistance;
    ana.screenDistance = opt.screenDistance;

    ArrayPresenter.update(PointDefinition, this.viewmodel.points, this.scene.points, this.scene);
    this.scene.anaglyph.render(this.scene.scene, this.camera);
  };

  MainPresenter.prototype.destroy = function(time) {
    this.datgui.destroy();
  };

  return MainPresenter;
})();