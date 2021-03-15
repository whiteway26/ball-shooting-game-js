const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const scoreElem = document.getElementById("scoreElem");
const startGameBtn = document.getElementById("startGameBtn");
const startGameElem = document.getElementById("startGameElem");
const finalScore = document.getElementById("finalScore");

let velocity;
let projectiles = [];
let enemies = [];
let particles = [];
let player, angle, color;
let score = 0;
let x, y, radius;
let animationId;
let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);
const friction = 0.97;

class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}

class Projectile extends Player {
  constructor(x, y, radius, color, velocity) {
    super(x, y, radius, color);
    this.velocity = velocity;
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}

class Enemy extends Projectile {}
class Particle extends Enemy {
  constructor(x, y, radius, color, velocity) {
    super(x, y, radius, color, velocity);
    this.alpha = 1;
  }

  update() {
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    super.update();
  }
}

function init() {
  player = new Player(width / 2, height / 2, 15, "white");
  projectiles = [];
  enemies = [];
  particles = [];
  score = 0;
  scoreElem.innerHTML = score;
  finalScore.innerHTML = score;
}

function spawnEnemies() {
  setInterval(() => {
    color = `hsl(${Math.random() * 360}, 50%, 50%)`;
    radius = Math.random() * 25 + 5;

    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : height + radius;
      y = Math.random() * height;
    } else {
      x = Math.random() * width;
      y = Math.random() < 0.5 ? 0 - radius : width + radius;
    }

    angle = Math.atan2(height / 2 - y, width / 2 - x);
    velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1000);
}

function animate() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.fillRect(0, 0, width, height);
  player.draw();
  animationId = requestAnimationFrame(animate);
  particles.forEach((particle, particleIndex) => {
    particle.update();
    if (particle.alpha <= 0) {
      particles.splice(particleIndex, 1);
    } else {
      particle.update();
    }
  });
  projectiles.forEach((projectile, index) => {
    projectile.update();

    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > height
    ) {
      setTimeout(() => {
        projectiles.splice(index, 1);
      }, 0);
    }
  });

  enemies.forEach((enemy, enemyIndex) => {
    enemy.update();

    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

    // end game
    if (dist - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationId);
      startGameElem.style.display = "block";
      finalScore.innerHTML = score;
    }

    projectiles.forEach((projectile, projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

      // when projectile touch enemy
      if (dist - enemy.radius - projectile.radius < 1) {
        // create explosions
        for (let i = 0; i < 8; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 5),
                y: (Math.random() - 0.5) * (Math.random() * 5),
              }
            )
          );
        }
        if (enemy.radius - 5 > projectile.radius) {
          // increase score
          score += 100;
          scoreElem.innerHTML = score;

          gsap.to(enemy, {
            radius: enemy.radius - projectile.radius,
          });
          enemy.radius -= projectile.radius;
          setTimeout(() => {
            projectiles.splice(projectileIndex, 1);
          }, 0);
        } else {
          // remove from screen
          // increase score
          score += 250;
          scoreElem.innerHTML = score;

          setTimeout(() => {
            enemies.splice(enemyIndex, 1);
            projectiles.splice(projectileIndex, 1);
          }, 0);
        }
      }
    });
  });
}

player = new Player(width / 2, height / 2, 15, "white");

window.addEventListener("click", (event) => {
  angle = Math.atan2(event.clientY - height / 2, event.clientX - width / 2);
  velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  };
  projectiles.push(new Projectile(width / 2, height / 2, 5, "white", velocity));
});

startGameBtn.addEventListener("click", () => {
  init();
  animate();
  spawnEnemies();
  startGameElem.style.display = "none";
});
