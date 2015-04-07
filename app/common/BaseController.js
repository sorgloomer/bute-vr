var BaseController = (function(){
  function BaseController() {
    this.viewmodel = null;
    this.presenter = null;
    this.app = null;
  }
  BaseController.prototype.resize = function(w, h) {
    if (this.presenter) this.presenter.resize(w, h);
  };
  BaseController.prototype.render = function(time) {
    if (this.presenter) this.presenter.render(time);
  };
  BaseController.prototype.destroy = function() {
    if (this.presenter && this.presenter.destroy) this.presenter.destroy();
    if (this.viewmodel && this.viewmodel.destroy) this.viewmodel.destroy();
  };
  return BaseController;
})();
