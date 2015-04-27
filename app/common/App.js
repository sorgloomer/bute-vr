var App = (function() {

  function App() {
    this.controller = null;
    this.renderer = null;
    this.canvas = null;
    this.startTime = 0;
    this.state = 0;

    this.global = new AppGlobals();

    this.size = { w: 1, h: 1 };
  }
  App.prototype.notifyResize = function(w, h) {
    this.size.w = w;
    this.size.h = h;
    if (this.controller) this.controller.resize(w, h);
    if (this.renderer) this.renderer.setSize(w, h);
  };
  App.prototype.init = function() {
    var _this = this;
    _this.canvas = document.getElementById('main-canvas');
    _this.canvas.addEventListener('click', function(evt) {
      _this.notifyClicked(evt.clientX, evt.clientY);
    });

    _this.renderer = new THREE.WebGLRenderer({ canvas: _this.canvas });

    _this.controller = new CalibrateController(_this.renderer, _this);
    _this.setStatus('Calibrating');
  };
  App.prototype.setStatus = function(status) {
    var statusBar = document.getElementById('status-bar');
    statusBar.innerText = status;
  };
  App.prototype.leapFrame = function(frame, time) {
    if (this.controller) this.controller.leapFrame(frame, time);
  };
  App.prototype.update = function(time, dt) {
    if (this.controller && this.controller.update) this.controller.update(time, dt);
  };
  App.prototype.render = function (time, dt) {
    if (this.controller && this.controller.presenter) this.controller.presenter.render(time, dt);
  };
  App.prototype.start = function() {
    this.startTime = Date.now();
  };
  App.prototype.time = function() {
    return (Date.now() - this.startTime) * 0.001;
  };

  App.prototype.notifyCalibrated = function(transform) {
    mat4.set(this.global.reality_to_screen, transform);
    EventHandler.emit(this.controller, 'matrix-changed', this.reality_to_screen);
  };
  App.prototype._setController = function(val) {
    destroy(this.controller);
    this.controller = val;
    if (val) val.resize(this.size.w, this.size.h);

    function destroy(o) {
      if (o && o.destroy) o.destroy();
    }
  };


  App.prototype.notifyClicked = function(x, y) {
    var _this = this;
    _this.global.magic.actualize();
    switch (_this.state) {
      case 0:
        _this.state = 1;
        _this.setStatus('Wireframe');
        _this._setController(new MainController(_this.renderer, _this));
        break;
      default:
        _this.state = 0;
        _this.setStatus('Calibrating');
        _this._setController(new CalibrateController(_this.renderer, _this));
        break;
    }
  };
  return App;
})();