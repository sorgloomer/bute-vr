var Scene = (function(THREE){
  function Scene(renderer) {
    var _this = this;
    this.renderer = renderer;
    this.scene = new THREE.Scene();

    this.geomSphere = new THREE.SphereGeometry(10);
    this.material = new THREE.MeshBasicMaterial({ color: 0x7777ff });

    this.fingerTips = range(5, function() {
      return {
        sphere: new THREE.Mesh(_this.geomSphere, _this.material),
        arrow: new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 10, 0xffffff)
      };
    });


    this.grid = new THREE.GridHelper(200, 20);
    this.grid.position.y = 0;

    this.anaglyph = new THREE.AnaglyphEffect(renderer, 1, 1);
    this.anaglyph.screenDistance = 500;
    this.scene.add(this.grid);

    this.fingerTips.forEach(function(m) {
      _this.scene.add(m.sphere);
      _this.scene.add(m.arrow);
    });



  }

  function setFingerTipPositions(ps) {
    for (var fi = 0; fi < 5; fi++) {
      var p = ps[fi];
      this.fingerTips[fi].sphere.position.set(p[0], p[1], p[2]);
      this.fingerTips[fi].arrow.setLength(p[1] - 10, 5, 2);
      this.fingerTips[fi].arrow.position.set(p[0], 0, p[2]);
    }
  }


  function range(cnt, fn, thisArg) {
    var result = new Array(cnt);
    for (var i = 0; i < cnt; i++) {
      result[i] = fn.call(thisArg, i);
    }
    return result;
  }

  Scene.prototype.setFingerTipPositions = setFingerTipPositions;
  return Scene;
})(THREE);
