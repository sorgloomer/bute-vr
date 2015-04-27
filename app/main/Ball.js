var Ball = (function() {
  var GRAVITY = -0.06;
  var ROOM = 0.1;
  var DAMPING = 0.995;

  function Ball(pos, radius) {
    this.pos = vec3.clone(pos);
    this.vel = vec3.create();
    this.radius = radius;
    this.imass = 1 / (radius * radius);
  }


  Ball.prototype.step = function step(dt) {
    this.vel[1] += dt * GRAVITY;
    vec3.scaleAdd(this.pos, this.vel, dt);
    vec3.lscale(this.vel, DAMPING);
  };

  Ball.prototype.pos_iter = function pos_iter() {
    if (this.pos[1] - this.radius < 0) {
      this.vel[1] = abs(this.vel[1]);
      this.pos[1] = this.radius;
    }

    if (this.pos[0] - this.radius < -ROOM) {
      this.vel[0] = abs(this.vel[0]);
      this.pos[0] = -ROOM + this.radius;
    }
    if (this.pos[0] + this.radius > ROOM) {
      this.vel[0] = -abs(this.vel[0]);
      this.pos[0] = ROOM - this.radius;
    }
    if (this.pos[2] - this.radius < -ROOM) {
      this.vel[2] = abs(this.vel[2]);
      this.pos[2] = -ROOM + this.radius;
    }
    if (this.pos[2] + this.radius > ROOM) {
      this.vel[2] = -abs(this.vel[2]);
      this.pos[2] = ROOM - this.radius;
    }
  };

  function abs(a) {
    return a < 0 ? -a : a;
  }

  return Ball;

})();
