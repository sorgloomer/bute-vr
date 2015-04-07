var mat3 = (function() {
  var ELEMENTS = 9;
  var TEMP = create();

  function set(to, m) {
    for (var i = 0; i < ELEMENTS; i++) to[i] = m[i];
    return to;
  }
  function setIdentity(to) {
    to[ 0] = 1; to[ 1] = 0; to[ 2] = 0;
    to[ 3] = 0; to[ 4] = 1; to[ 5] = 0;
    to[ 6] = 0; to[ 7] = 0; to[ 8] = 1;
    return to;
  }


  function clone(m) {
    return set(create(), m);
  }
  function create() {
    return new Float32Array(ELEMENTS);
  }
  function array(cnt) {
    var buf = new Float32Array(ELEMENTS * cnt);
    var res = new Array(cnt);
    for (var i = 0; i < cnt; i++) {
      res[i] = buf.subarray(i*ELEMENTS, i*ELEMENTS + ELEMENTS);
    }
    return res;
  }

  function umul(to, a, b) {
    for (var i = 0; i < 9; i += 3) {
      for (var j = 0; j < 3; j++) {
        to[j + i] = a[i] * b[j] + a[i + 1] * b[j + 3] + a[i + 2] * b[j + 6];
      }
    }
    return to;
  }

  function nmul(a, b) {
    return umul(create(), a, b);
  }
  function mul(to, a, b) {
    return set(to, nmul(a, b));
  }
  function lmul(a, b) {
    return mul(a, a, b);
  }


  function setRowOf(m, ci, v) {
    for (var i = 0; i < 3; i++) {
      m[ci * 3 + i] = v[i];
    }
    return m;
  }
  function setColOf(m, ci, v) {
    for (var i = 0; i < 3; i++) {
      m[ci + 3 * i] = v[i];
    }
    return m;
  }

  function det(M) {
    return M[0] * (M[4] * M[8] - M[5] * M[7]) -
      M[1] * (M[3] * M[8] - M[5] * M[6]) +
      M[2] * (M[3] * M[7] - M[4] * M[6]);
  }

  function uinvert(to, a) {
    to[0] = a[4] * a[8] - a[5] * a[7];
    to[1] = a[2] * a[7] - a[1] * a[8];
    to[2] = a[1] * a[5] - a[2] * a[4];

    to[3] = a[5] * a[6] - a[3] * a[8];
    to[4] = a[0] * a[8] - a[2] * a[6];
    to[5] = a[2] * a[3] - a[0] * a[5];

    to[6] = a[3] * a[7] - a[4] * a[6];
    to[7] = a[1] * a[6] - a[0] * a[7];
    to[8] = a[0] * a[4] - a[1] * a[3];

    var det = a[0] * to[0] + a[1] * to[3] + a[2] * to[6];
    return lscale(to, 1 / det);
  }

  function invert(to, a) {
    return set(to, uinvert(TEMP, a));
  }
  function linvert(a) {
    return invert(a, a);
  }

  function vecmul(to, v, m) {
    var x = v[0] * m[0] + v[1] * m[3] + v[2] * m[6];
    var y = v[0] * m[1] + v[1] * m[4] + v[2] * m[7];
    var z = v[0] * m[2] + v[1] * m[5] + v[2] * m[8];
    to[0] = x;
    to[1] = y;
    to[2] = z;
    return to;
  }
  function lvecmul(v, m) {
    return vecmul(v, v, m);
  }

  function lscale(to, a, s) {
    for (var i = 0; i < ELEMENTS; i++) to[i] = a[i] * s;
    return to;
  }
  function scale(a, s) {
    return lscale(a, a, s);
  }

  return {
    create: create,
    array: array,
    set: set,
    setIdentity: setIdentity,
    clone: clone,

    vecmul: vecmul,
    lvecmul: lvecmul,

    uinvert: uinvert,
    linvert: linvert,
    invert: invert,

    lscale: lscale,
    scale: scale,

    mul: mul,
    lmul: lmul,

    det: det,
    setRowOf: setRowOf,
    setColOf: setColOf
  };
})();