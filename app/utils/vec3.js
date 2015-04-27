var vec3 = (function() {
  function array(n) {
    var buffer = new Float32Array(3 * n);
    var result = new Array(n);
    for (var i = 0; i < result.length; i++) {
      result[i] = buffer.subarray(3 * i, 3 * i + 3);
    }
    return result;
  }
  function create() {
    return new Float32Array(3);
  }

  function copy(a, to) {
    if (!to) to = create();
    for (var i = 0; i < a.length; i++) to[i] = a[i];
    return to;
  }
  function set(to, b) {
    to[0] = b[0];
    to[1] = b[1];
    to[2] = b[2];
    return to;
  }
  function setXYZ(to, x, y, z) {
    to[0] = x;
    to[1] = y;
    to[2] = z;
    return to;
  }
  function clone(a) {
    return set(create(), a);
  }


  function add(to, x, y) {
    for (var i = 0; i < x.length; i++) to[i] = x[i] + y[i];
    return to;
  }
  function sub(to, x, y) {
    for (var i = 0; i < x.length; i++) to[i] = x[i] - y[i];
    return to;
  }
  function scale(to, x, s) {
    for (var i = 0; i < x.length; i++) to[i] = x[i] * s;
    return to;
  }

  function cross(to, a, b) {
    var x = a[1] * b[2] - a[2] * b[1];
    var y = a[2] * b[0] - a[0] * b[2];
    var z = a[0] * b[1] - a[1] * b[0];
    to[0] = x;
    to[1] = y;
    to[2] = z;
    return to;
  }

  function ladd(x, y) { return add(x, x, y); }
  function lsub(x, y) { return sub(x, x, y); }
  function lscale(x, s) { return scale(x, x, s); }
  function lcross(a, b) { return cross(a, a, b); }

  function len2(vec) {
    return dot(vec, vec);
  }
  function len(vec) {
    return Math.sqrt(len2(vec));
  }
  function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }
  function dist2(a, b) {
    var dx = b[0] - a[0];
    var dy = b[1] - a[1];
    var dz = b[2] - a[2];
    return dx * dx + dy * dy + dz * dz;
  }
  function dist(a, b) {
    return Math.sqrt(dist2(a, b));
  }

  function normalize(to, a) {
    return scale(to, a, 1 / len(a));
  }
  function lnormalize(a) {
    return normalize(a, a);
  }

  function scaleAdd(a, b, scale) {
    for (var i = 0; i < a.length; i++) {
      a[i] += b[i] * scale;
    }
  }


  return {
    array: array,
    create: create,
    set: set,
    setXYZ: setXYZ,
    clone: clone,
    len2: len2,
    len: len,
    dist2: dist2,
    dist: dist,
    dot: dot,
    copy: copy,

    add: add,
    sub: sub,
    scale: scale,
    cross: cross,
    normalize: normalize,
    ladd: ladd,
    lsub: lsub,
    lscale: lscale,
    lcross: lcross,
    lnormalize: lnormalize,

    scaleAdd: scaleAdd
  };
})();