(function() {
  var app = new App();

  function onWindowResize() {
    app.notifyResize(self.innerWidth, self.innerHeight);
  }

  function init() {
    app.init();
    onWindowResize();
    self.addEventListener('resize', onWindowResize, false);
    Leap.loop(function(frame) {
      app.leapFrame(frame, app.time());
    });
  }

  function scheduleCycle() {
    self.requestAnimationFrame(cycle);
  }
  var ltime = 0;
  function cycle() {
    scheduleCycle();
    var time = app.time();
    var dt = time - ltime;
    if (dt > 0.2) dt = 0.2;
    app.update(time, dt);
    app.render(time, dt);
    ltime = time;
  }
  function start() {
    init();
    ltime = app.time();
    scheduleCycle();
    app.start();
  }
  start();
})();