var mat4 = (function() {
  var ELEMENTS = 16;
  var TEMP = create();
  function set(to, m) {
    for (var i = 0; i < ELEMENTS; i++) to[i] = m[i];
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

  function setIdentity(to) {
    return setScaleS(to, 1);
  }

  function setRT(to, R, T) {
    to[ 0] = R[0]; to[ 1] = R[1]; to[ 2] = R[2]; to[ 3] = 0;
    to[ 4] = R[3]; to[ 5] = R[4]; to[ 6] = R[5]; to[ 7] = 0;
    to[ 8] = R[6]; to[ 9] = R[7]; to[10] = R[8]; to[11] = 0;
    to[12] = T[0]; to[13] = T[1]; to[14] = T[2]; to[15] = 1;
    return to;
  }
  function setScaleS(to, s) {
    return setScaleXYZ(to, s, s, s);
  }
  function setScaleXYZ(to, x, y, z) {
    to[ 0] = x; to[ 1] = 0; to[ 2] = 0; to[ 3] = 0;
    to[ 4] = 0; to[ 5] = y; to[ 6] = 0; to[ 7] = 0;
    to[ 8] = 0; to[ 9] = 0; to[10] = z; to[11] = 0;
    to[12] = 0; to[13] = 0; to[14] = 0; to[15] = 1;
    return to;
  }


  function vecmul(to, v, m) {
    var x = v[0] * m[0] + v[1] * m[4] + v[2] * m[8] + m[12];
    var y = v[0] * m[1] + v[1] * m[5] + v[2] * m[9] + m[13];
    var z = v[0] * m[2] + v[1] * m[6] + v[2] * m[10] + m[14];
    var w = v[0] * m[3] + v[1] * m[7] + v[2] * m[11] + m[15];
    var iw = 1 / w;
    to[0] = iw * x;
    to[1] = iw * y;
    to[2] = iw * z;
    return to;
  }
  function lvecmul(v, m) {
    return vecmul(v, v, m);
  }

  function umul(to, a, b) {
    for (var i = 0; i < 16; i += 4) {
      for (var j = 0; j < 4; j++) {
        to[j + i] =  a[i] * b[j]
        + a[i + 1] * b[j + 4]
        + a[i + 2] * b[j + 8]
        + a[i + 3] * b[j + 12];
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


  function transpose(to, m) {
    to[ 0] = m[ 0]; to[ 1] = m[ 4]; to[ 2] = m[ 8]; to[ 3] = m[12];
    to[ 4] = m[ 1]; to[ 5] = m[ 5]; to[ 6] = m[ 9]; to[ 7] = m[13];
    to[ 8] = m[ 2]; to[ 9] = m[ 6]; to[10] = m[10]; to[11] = m[14];
    to[12] = m[ 3]; to[13] = m[ 7]; to[14] = m[11]; to[15] = m[15];
    return to;
  }
  function ltranspose(m) {
    var tmp;
    tmp = m[ 1 ]; m[ 1 ] = m[ 4 ]; m[ 4 ] = tmp;
    tmp = m[ 2 ]; m[ 2 ] = m[ 8 ]; m[ 8 ] = tmp;
    tmp = m[ 6 ]; m[ 6 ] = m[ 9 ]; m[ 9 ] = tmp;

    tmp = m[ 3 ]; m[ 3 ] = m[ 12 ]; m[ 12 ] = tmp;
    tmp = m[ 7 ]; m[ 7 ] = m[ 13 ]; m[ 13 ] = tmp;
    tmp = m[ 11 ]; m[ 11 ] = m[ 14 ]; m[ 14 ] = tmp;
    return m;
  }


  function scale(to, a, s) {
    for (var i = 0; i < ELEMENTS; i++) to[i] = a[i] * s;
    return to;
  }
  function uinvert(to, m) {
    to[ 0] =  m[ 5]*m[10]*m[15] - m[ 5]*m[11]*m[14] - m[ 9]*m[ 6]*m[15] + m[ 9]*m[ 7]*m[14] +  m[13]*m[ 6]*m[11] - m[13]*m[ 7]*m[10];
    to[ 4] = -m[ 4]*m[10]*m[15] + m[ 4]*m[11]*m[14] + m[ 8]*m[ 6]*m[15] - m[ 8]*m[ 7]*m[14] -  m[12]*m[ 6]*m[11] + m[12]*m[ 7]*m[10];
    to[ 8] =  m[ 4]*m[ 9]*m[15] - m[ 4]*m[11]*m[13] - m[ 8]*m[ 5]*m[15] + m[ 8]*m[ 7]*m[13] +  m[12]*m[ 5]*m[11] - m[12]*m[ 7]*m[ 9];
    to[12] = -m[ 4]*m[ 9]*m[14] + m[ 4]*m[10]*m[13] + m[ 8]*m[ 5]*m[14] - m[ 8]*m[ 6]*m[13] -  m[12]*m[ 5]*m[10] + m[12]*m[ 6]*m[ 9];

    to[1] = -m[1]  * m[10] * m[15] + m[1]  * m[11] * m[14] +  m[9]  * m[2] * m[15] -  m[9]  * m[3] * m[14] - m[13] * m[2] * m[11] + m[13] * m[3] * m[10];
    to[5] = m[0]  * m[10] * m[15] - m[0]  * m[11] * m[14] - m[8]  * m[2] * m[15] + m[8]  * m[3] * m[14] + m[12] * m[2] * m[11] - m[12] * m[3] * m[10];
    to[9] = -m[0]  * m[9] * m[15] + m[0]  * m[11] * m[13] + m[8]  * m[1] * m[15] - m[8]  * m[3] * m[13] - m[12] * m[1] * m[11] + m[12] * m[3] * m[9];
    to[13] = m[0]  * m[9] * m[14] - m[0]  * m[10] * m[13] - m[8]  * m[1] * m[14] + m[8]  * m[2] * m[13] + m[12] * m[1] * m[10] - m[12] * m[2] * m[9];

    to[2] = m[1]  * m[6] * m[15] - m[1]  * m[7] * m[14] - m[5]  * m[2] * m[15] + m[5]  * m[3] * m[14] + m[13] * m[2] * m[7] - m[13] * m[3] * m[6];
    to[6] = -m[0]  * m[6] * m[15] + m[0]  * m[7] * m[14] + m[4]  * m[2] * m[15] - m[4]  * m[3] * m[14] - m[12] * m[2] * m[7] + m[12] * m[3] * m[6];
    to[10] = m[0]  * m[5] * m[15] - m[0]  * m[7] * m[13] - m[4]  * m[1] * m[15] +  m[4]  * m[3] * m[13] + m[12] * m[1] * m[7] - m[12] * m[3] * m[5];
    to[14] = -m[0]  * m[5] * m[14] + m[0]  * m[6] * m[13] + m[4]  * m[1] * m[14] - m[4]  * m[2] * m[13] - m[12] * m[1] * m[6] + m[12] * m[2] * m[5];

    to[3] = -m[1] * m[6] * m[11] + m[1] * m[7] * m[10] + m[5] * m[2] * m[11] - m[5] * m[3] * m[10] - m[9] * m[2] * m[7] + m[9] * m[3] * m[6];
    to[7] = m[0] * m[6] * m[11] - m[0] * m[7] * m[10] - m[4] * m[2] * m[11] + m[4] * m[3] * m[10] + m[8] * m[2] * m[7] - m[8] * m[3] * m[6];
    to[11] = -m[0] * m[5] * m[11] + m[0] * m[7] * m[9] + m[4] * m[1] * m[11] - m[4] * m[3] * m[9] - m[8] * m[1] * m[7] + m[8] * m[3] * m[5];
    to[15] = m[0] * m[5] * m[10] - m[0] * m[6] * m[9] - m[4] * m[1] * m[10] + m[4] * m[2] * m[9] + m[8] * m[1] * m[6] - m[8] * m[2] * m[5];

    var det = m[0] * to[0] + m[1] * to[4] + m[2] * to[8] + m[3] * to[12];

    return scale(to, to, 1 / det);
  }

  function invert(to, m) {
    return set(to, uinvert(TEMP, m));
  }
  function linvert(m) {
    return invert(m, m);

  }



  function det(m) {
    var to0 =  m[ 5]*m[10]*m[15] - m[ 5]*m[11]*m[14] - m[ 9]*m[ 6]*m[15] + m[ 9]*m[ 7]*m[14] +  m[13]*m[ 6]*m[11] - m[13]*m[ 7]*m[10];
    var to4 = -m[ 4]*m[10]*m[15] + m[ 4]*m[11]*m[14] + m[ 8]*m[ 6]*m[15] - m[ 8]*m[ 7]*m[14] -  m[12]*m[ 6]*m[11] + m[12]*m[ 7]*m[10];
    var to8 =  m[ 4]*m[ 9]*m[15] - m[ 4]*m[11]*m[13] - m[ 8]*m[ 5]*m[15] + m[ 8]*m[ 7]*m[13] +  m[12]*m[ 5]*m[11] - m[12]*m[ 7]*m[ 9];
    var to12 = -m[ 4]*m[ 9]*m[14] + m[ 4]*m[10]*m[13] + m[ 8]*m[ 5]*m[14] - m[ 8]*m[ 6]*m[13] -  m[12]*m[ 5]*m[10] + m[12]*m[ 6]*m[ 9];
    return m[0] * to0 + m[1] * to4 + m[2] * to8 + m[3] * to12;
  }

  return {
    create: create,
    array: array,
    clone: clone,

    set: set,
    setRT: setRT,
    setScaleS: setScaleS,
    setScaleXYZ: setScaleXYZ,
    setIdentity: setIdentity,

    mul: mul,
    umul: umul,
    lmul: lmul,

    uinvert: uinvert,
    linvert: linvert,
    invert: invert,

    transpose: transpose,
    ltranspose: ltranspose,

    det: det,

    vecmul: vecmul,
    lvecmul: lvecmul
  };
})();