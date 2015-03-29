(function(self, document, Date, THREE, dat, Leap, Scene, Watcher) {
  var canvas, scene, camera, renderer, datgui;
  var startTime;
  var options = {
    mode: 'red-cyan'
  };
  var schemes = {
    "red-cyan": THREE.AnaglyphEffect.Scheme.RedCyan,
    "magenta-green": THREE.AnaglyphEffect.Scheme.MagentaGreen,
    "blue-yellow": THREE.AnaglyphEffect.Scheme.BlueYellow,
    "none": THREE.AnaglyphEffect.Scheme.None
  };

  var vecLookAt;

  function notifySize(w, h) {
    var aspect = w / h;
    scene.anaglyph.setSize(w, h);
    renderer.setSize(w, h);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  }
  function onWindowResize() {
    notifySize(self.innerWidth, self.innerHeight);
  }

  function init() {
    vecLookAt = new THREE.Vector3(0, -100, 0);

    canvas = document.getElementById('main-canvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvas });
    camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    scene = new Scene(renderer);


    onWindowResize();
    self.addEventListener('resize', onWindowResize, false);

    datgui = new dat.GUI();
    datgui.add(scene.anaglyph, 'contrast', -1, 1, 0.1);
    datgui.add(scene.anaglyph, 'deghost', 0, 1, 0.05);
    datgui.add(scene.anaglyph, 'screenDistance', 0, 1000);
    datgui.add(scene.anaglyph, 'eyeDistance', 0, 100);
    datgui.add(options, 'mode', Object.keys(schemes));

    Watcher.on(options, 'mode', function(val) {
      scene.anaglyph.scheme = schemes[val];
    });

    Leap.loop(function(frame) {
      var hand = frame.hands[0];
      if (hand) {
        scene.setFingerTipPositions(hand.fingers.map(function(f) {
          return f.tipPosition;
        }));
      }

    });
  }
  function update(time) {
    camera.position.z = 350;
    camera.position.y = 120;
    camera.position.x = 20;
    camera.lookAt(vecLookAt);

  }
  function render(time) {
    scene.anaglyph.render(scene.scene, camera);
  }




  function scheduleCycle() {
    self.requestAnimationFrame(cycle);
  }
  function cycle() {
    Watcher.digest();
    scheduleCycle();
    var time = (Date.now() - startTime) * 0.001;
    update(time);
    render(time);
  }
  function start() {
    init();
    scheduleCycle();
    startTime = Date.now();
  }
  start();
})(self, document, Date, THREE, dat, Leap, Scene, Watcher);