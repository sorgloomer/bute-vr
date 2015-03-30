(function(self, document, Date, THREE, dat, Leap, Scene, Watcher) {
  var canvas, scene, camera, renderer, datgui;
  var startTime;

  var controller = null;

  function notifySize(w, h) {
    if (controller) controller.resize(w, h);
    renderer.setSize(w, h);
  }

  function onWindowResize() {
    notifySize(self.innerWidth, self.innerHeight);
  }

  function init() {

    canvas = document.getElementById('main-canvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvas });

    controller = new CalibrateController(renderer);

    onWindowResize();

    self.addEventListener('resize', onWindowResize, false);

    /*
    datgui = new dat.GUI();
    datgui.add(scene.anaglyph, 'contrast', -1, 1, 0.1);
    datgui.add(scene.anaglyph, 'deghost', 0, 1, 0.05);
    datgui.add(scene.anaglyph, 'screenDistance', 0, 1000);
    datgui.add(scene.anaglyph, 'eyeDistance', 0, 100);
    datgui.add(options, 'mode', Object.keys(schemes));


    Watcher.on(options, 'mode', function(val) {
      scene.anaglyph.scheme = schemes[val];
    });
    */


    Leap.loop(function(frame) {
      var time = (Date.now() - startTime) * 0.001;
      if (controller && controller.leapFrame) controller.leapFrame(frame, time);
      /*
      var hand = frame.hands[0];
      if (hand) {
        scene.setFingerTipPositions(hand.fingers.map(function(f) {
          return f.tipPosition;
        }));
      }*/
    });
  }

  function update(time) {
    if (controller && controller.update) controller.update(time);
  }

  function render(time) {
    if (controller && controller.render) controller.render(time);
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