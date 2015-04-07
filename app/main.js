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
  function cycle() {
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
})();