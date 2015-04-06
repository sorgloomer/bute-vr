(function(self, document, Date, THREE, dat, Leap, Scene, Watcher) {

  function App() {
    this.controller = null;
    this.renderer = null;
    this.canvas = null;
    this.datGui = null;
    this.startTime = 0;
  }
  App.prototype.notifyResize = function(w, h) {
    if (this.controller) this.controller.resize(w, h);
    if (this.renderer) this.renderer.setSize(w, h);
  };
  App.prototype.init = function() {
    this.canvas = document.getElementById('main-canvas');
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });

    this.controller = new CalibrateController(this.renderer, this);
    this.setStatus('Calibrating');
  };
  App.prototype.setStatus = function(status) {
    var statusBar = document.getElementById('status-bar');
    statusBar.innerText = status;
  };
  App.prototype.leapFrame = function(frame, time) {
    if (this.controller) this.controller.leapFrame(frame, time);
  };
  App.prototype.update = function(time) {
    if (this.controller && this.controller.update) this.controller.update(time);
  };
  App.prototype.render = function (time) {
    if (this.controller && this.controller.presenter) this.controller.presenter.render(time);
  };
  App.prototype.start = function() {
    this.startTime = Date.now();
  };
  App.prototype.time = function() {
    return (Date.now() - this.startTime) * 0.001;
  };

  App.prototype.notifyCalibrated = function(transform) {

  };

  var app = new App();

  function onWindowResize() {
    app.notifyResize(self.innerWidth, self.innerHeight);
  }


  function init() {
    app.init();
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
      app.leapFrame(frame, app.time());
      /*
      var hand = frame.hands[0];
      if (hand) {
        scene.setFingerTipPositions(hand.fingers.map(function(f) {
          return f.tipPosition;
        }));
      }*/
    });
  }



  function scheduleCycle() {
    self.requestAnimationFrame(cycle);
  }
  function cycle() {
    Watcher.digest();
    scheduleCycle();
    var time = app.time();
    app.update(time);
    app.render(time);
  }
  function start() {
    init();
    scheduleCycle();
    app.start();
  }
  start();
})(self, document, Date, THREE, dat, Leap, Scene, Watcher);