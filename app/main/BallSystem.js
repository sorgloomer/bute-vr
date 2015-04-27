 var BallSystem = (function() {
  function BallSystem() {
    this.balls = [];
    this.obstacles = [];
    this.K = 0.3;
    this.iterations = 5;
  }

  BallSystem.prototype.update = function update(dt) {
    var balls = this.balls, obstacles = this.obstacles, K = this.K, i, j;
    balls.forEach(function(ball) {
      ball.step(dt);
    });

    for (i = 0; i < balls.length; i++) {
      for (j = i + 1; j < balls.length; j++) {
        collide(balls[i], balls[j], K);
      }
    }
    for (i = 0; i < balls.length; i++) {
      for (j = 0; j < obstacles.length; j++) {
        collide(balls[i], obstacles[j], K);
      }
    }

    for (var iter = 0; iter < this.iterations; iter++) {
      for (i = 0; i < balls.length; i++) {
        balls[i].pos_iter();
      }
      for (i = 0; i < balls.length; i++) {
        for (j = i + 1; j < balls.length; j++) {
          collide_pos(balls[i], balls[j], K);
        }
      }
      for (i = 0; i < balls.length; i++) {
        for (j = 0; j < obstacles.length; j++) {
          collide_pos(balls[i], obstacles[j]);
        }
      }
    }
  };

  var TEMP_VECS = vec3.array(3);

   function collide(a, b, K) {
     var normal = vec3.sub(TEMP_VECS[0], a.pos, b.pos);

     var dist = vec3.len(normal);

     var penetration = a.radius + b.radius - dist;
     if (penetration > 0) {
       vec3.lscale(normal, 1 / dist);
       var deltav = vec3.sub(TEMP_VECS[1], a.vel, b.vel);
       var dotp = -vec3.dot(deltav, normal);
       if (dotp > 0) {
         var Iscale = (1 + K) * dotp / (a.imass + b.imass);

         vec3.scaleAdd(a.vel, normal, Iscale * a.imass);
         vec3.scaleAdd(b.vel, normal, -Iscale * b.imass);
       }
     }
   }
   function collide_pos(a, b) {
     var normal = vec3.sub(TEMP_VECS[0], a.pos, b.pos);

     var dist = vec3.len(normal);

     var penetration = a.radius + b.radius - dist;
     if (penetration > 0) {
       vec3.lscale(normal, 1 / dist);
       var temp = (penetration - 1e-7) / (a.imass + b.imass);
       vec3.scaleAdd(a.pos, normal, temp * a.imass);
       vec3.scaleAdd(b.pos, normal, -temp * b.imass);
     }
   }

  return BallSystem;
})();
