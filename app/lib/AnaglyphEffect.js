/**
 * @author mrdoob / http://mrdoob.com/
 * @author marklundin / http://mark-lundin.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.AnaglyphEffect = (function(THREE) {

  /*
   * Renderer now uses an asymmetric perspective projection
   * (http://paulbourke.net/miscellaneous/stereographics/stereorender/).
   *
   * Each camera is offset by the eye seperation and its projection matrix is
   * also skewed asymetrically back to converge on the same projection plane.
   * Added a focal length parameter to, this is where the parallax is equal to 0.
   */

  var RENDER_TARGET_PARAMS = { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat };
  var Scheme = {
    RedCyan: {
      name: 'RedCyan',
      left: [
        0.70, 0.15, 0.15, 0,
        0.00, 0.00, 0.00, 0,
        0.00, 0.00, 0.00, 0,
        0.00, 0.00, 0.00, 1
      ],
      right: [
        0.00, 0.00, 0.00, 0,
        0.12, 0.65, 0.12, 0,
        0.15, 0.15, 0.70, 0,
        0.00, 0.00, 0.00, 1
      ]
    },
    MagentaGreen: {
      name: 'MagentaGreen',
      left: [
        0.70, 0.15, 0.15, 0,
        0.00, 0.00, 0.00, 0,
        0.15, 0.15, 0.70, 0,
        0.00, 0.00, 0.00, 1
      ],
      right: [
        0.00, 0.00, 0.00, 0,
        0.15, 0.70, 0.15, 0,
        0.00, 0.00, 0.00, 0,
        0.00, 0.00, 0.00, 1
      ]
    },
    BlueYellow: {
      name: 'BlueYellow',
      left: [
        0.70, 0.15, 0.15, 0,
        0.15, 0.70, 0.15, 0,
        0.00, 0.00, 0.00, 0,
        0.00, 0.00, 0.00, 1
      ],
      right: [
        0.00, 0.00, 0.00, 0,
        0.00, 0.00, 0.00, 0,
        0.15, 0.15, 0.70, 0,
        0.00, 0.00, 0.00, 1
      ]

    },
    None: {
      name: 'None',
      left: [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ],
      right: [
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
      ]
    }
  };

  AnaglyphEffect.Scheme = Scheme;

  var AnaglyphEffect_prototype = AnaglyphEffect.prototype;

  AnaglyphEffect_prototype.updateCameraData = updateCameraData;
  AnaglyphEffect_prototype.render = render;
  AnaglyphEffect_prototype.dispose = dispose;

  AnaglyphEffect_prototype.setSize = setSize;
  AnaglyphEffect_prototype.updateScheme = updateScheme;

  AnaglyphEffect_prototype._refreshRenderTargets = _refreshRenderTargets;
  AnaglyphEffect_prototype._createMaterial = _createMaterial;
  AnaglyphEffect_prototype._disposeTargets = _disposeTargets;



  function AnaglyphEffect(renderer, width, height, optScheme) {
    if (width === undefined) width = 256;
    if (height === undefined) height = 256;

    this.renderer = renderer;
    this.scheme = optScheme || Scheme.RedCyan;
    this.screenDistance = 125;
    this.eyeDistance = 30;
    this.contrast = 0;
    this.deghost = 0;

    this._lastValues = {
      aspect: 0, near: 0, far: 0, fov: 0, contrast: 0, deghost: 0,
      screenDistance: this.screenDistance,
      eyeDistance: this.eyeDistance,
      scheme: this.scheme
    };

    this._eyeRight = new THREE.Matrix4();
    this._eyeLeft = new THREE.Matrix4();
    this._cameraL = new THREE.PerspectiveCamera();
    this._cameraL.matrixAutoUpdate = false;
    this._cameraR = new THREE.PerspectiveCamera();
    this._cameraR.matrixAutoUpdate = false;
    this._camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this._scene = new THREE.Scene();
    this._renderTargetL = null;
    this._renderTargetR = null;
    this._refreshRenderTargets(width, height);
    this._material = this._createMaterial();
    this._mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), this._material);
    this._scene.add(this._mesh);
  }

  function setSize( width, height ) {
    this._refreshRenderTargets(width, height);
    this._material.uniforms[ "mapLeft" ].value = this._renderTargetL;
    this._material.uniforms[ "mapRight" ].value = this._renderTargetR;
    this.renderer.setSize( width, height );
  }
  function _refreshRenderTargets(width, height) {
    this._disposeTargets();
    this._renderTargetL = new THREE.WebGLRenderTarget( width, height, RENDER_TARGET_PARAMS );
    this._renderTargetR = new THREE.WebGLRenderTarget( width, height, RENDER_TARGET_PARAMS );
  }
  function _createMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: {
        "mapLeft": {type: "t", value: this._renderTargetL},
        "mapRight": {type: "t", value: this._renderTargetR},
        "Contrast": {type: "f", value: 0},
        "Deghost": {type: "f", value: 0},
        "Left": {type: "Matrix4fv", value: this.scheme.left},
        "Right": {type: "Matrix4fv", value: this.scheme.right}
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER
    });
  }

  function updateScheme() {
    this._material.uniforms.Left.value = this.scheme.left;
    this._material.uniforms.Right.value = this.scheme.right;
    return this;
  }

  function updateCameraData(camera) {
    var camData = this._lastValues;
    camData.aspect = camera.aspect;
    camData.near = camera.near;
    camData.far = camera.far;
    camData.fov = camera.fov;
    var projectionMatrix = camera.projectionMatrix.clone();
    var eyeSep = this.eyeDistance * 0.5;
    var eyeSepOnProjection = eyeSep * camData.near / this.screenDistance;
    var ymax = camData.near * Math.tan( THREE.Math.degToRad( camData.fov * 0.5 ) );
    var xmin, xmax;

    // translate xOffset
    this._eyeRight.elements[12] = eyeSep;
    this._eyeLeft.elements[12] = -eyeSep;

    // for left eye
    xmin = -ymax * camData.aspect + eyeSepOnProjection;
    xmax = ymax * camData.aspect + eyeSepOnProjection;

    projectionMatrix.elements[0] = 2 * camData.near / ( xmax - xmin );
    projectionMatrix.elements[8] = ( xmax + xmin ) / ( xmax - xmin );
    this._cameraL.projectionMatrix.copy( projectionMatrix );

    // for right eye
    xmin = -ymax * camData.aspect - eyeSepOnProjection;
    xmax = ymax * camData.aspect - eyeSepOnProjection;

    projectionMatrix.elements[0] = 2 * camData.near / ( xmax - xmin );
    projectionMatrix.elements[8] = ( xmax + xmin ) / ( xmax - xmin );
    this._cameraR.projectionMatrix.copy( projectionMatrix );
  }

  function render(scene, camera) {
    scene.updateMatrixWorld();
    if ( camera.parent === undefined ) camera.updateMatrixWorld();
    var lastValues = this._lastValues;
    var hasCameraChanged = ( lastValues.aspect !== camera.aspect )
      || ( lastValues.near !== camera.near )
      || ( lastValues.far !== camera.far )
      || ( lastValues.fov !== camera.fov )
      || ( lastValues.eyeDistance !== this.eyeDistance )
      || ( lastValues.screenDistance !== this.screenDistance );
    if ( hasCameraChanged ) {
      this.updateCameraData(camera);
    }

    if (this.contrast !== lastValues.contrast) {
      lastValues.contrast = this._material.uniforms.Contrast.value = this.contrast;
    }

    if (this.deghost !== lastValues.deghost) {
      lastValues.deghost = this._material.uniforms.Deghost.value = this.deghost;
    }

    if (this.scheme !== lastValues.scheme) {
      lastValues.scheme = this.scheme;
      this.updateScheme();
    }

    this._cameraL.matrixWorld.copy( camera.matrixWorld ).multiply( this._eyeLeft );
    this._cameraL.position.copy( camera.position );
    this._cameraL.near = camera.near;
    this._cameraL.far = camera.far;
    this.renderer.render( scene, this._cameraL, this._renderTargetL, true );
    this._cameraR.matrixWorld.copy( camera.matrixWorld ).multiply( this._eyeRight );
    this._cameraR.position.copy( camera.position );
    this._cameraR.near = camera.near;
    this._cameraR.far = camera.far;
    this.renderer.render( scene, this._cameraR, this._renderTargetR, true );
    this.renderer.render( this._scene, this._camera );
  }
  function dispose() {
    this._disposeTargets();
  }
  function _disposeTargets() {
    if ( this._renderTargetL ) this._renderTargetL.dispose();
    if ( this._renderTargetR ) this._renderTargetR.dispose();
  }


  var VERTEX_SHADER = [
    "varying vec2 vUv;",
    "void main() {",
    "	 vUv = vec2( uv.x, uv.y );",
    " gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}"
  ].join("\n");

  var FRAGMENT_SHADER=  [
    "uniform sampler2D mapLeft;",
    "uniform sampler2D mapRight;",
    "varying vec2 vUv;",
    "uniform float Contrast;",
    "uniform float Deghost;",
    "uniform mat4 Left;",
    "uniform mat4 Right;",
    "vec3 contrast(vec3 c, float f) {",
    "  float slope = f >= 0.0 ? 1.0 / (1.0 - f) : 1.0 + f;",
    "  return slope * (c - vec3(0.5)) + vec3(0.5);",
    "}",
    "void main() {",
    "	 vec4 colorL = texture2D( mapLeft, vUv );",
    "	 vec4 colorR = texture2D( mapRight, vUv );",
    "	 vec4 colorL2 = colorL - 0.2 * Deghost * colorR;",
    "	 vec4 colorR2 = colorR - 0.2 * Deghost * colorL;",
    "  vec4 image = colorL2 * Left + colorR2 * Right;",
    "	 gl_FragColor = vec4(contrast(image.rgb, Contrast), image.a);",
    "}"

  ].join("\n");


  return AnaglyphEffect;
})(THREE);
