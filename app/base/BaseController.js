var BaseController = (function(){
  function BaseController() {
    this.viewmodel = null;
    this.presenter = null;
  }
  BaseController.prototype.resize = function(w, h) {
    if (this.presenter) this.presenter.resize(w, h);
  };
  BaseController.prototype.render = function(time) {
    if (this.presenter) this.presenter.render(time);
  };
  return BaseController;
})();
