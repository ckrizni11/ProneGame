const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const leftScoreEl = document.getElementById("leftScore");
const rightScoreEl = document.getElementById("rightScore");

const width = canvas.width;
const height = canvas.height;

const keys = {
  ArrowUp: false,
  ArrowDown: false
};

const mouse = {
  y: height / 2
};

const leftPaddle = {
  x: 30,
  y: height / 2 - 60,
  width: 12,
  height: 120,
  speed: 7,
  targetY: height / 2 - 60
};

const rightPaddle = {
  x: width - 42,
  y: height / 2 - 60,
  width: 12,
  height: 120,
  speed: 5.5
};

const ball = {
  x: width / 2,
  y: height / 2,
  radius: 8,
  vx: 5,
  vy: 2
};

let leftScore = 0;
let rightScore = 0;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateScoreboard() {
  leftScoreEl.textContent = leftScore;
  rightScoreEl.textContent = rightScore;
}

function resetBall(direction = Math.random() < 0.5 ? -1 : 1) {
  ball.x = width / 2;
  ball.y = height / 2;

  const angle = (Math.random() * 1.4) - 0.7; // -0.7 to 0.7 radians
  const speed = 5.5;

  ball.vx = direction * speed * (Math.random() * 0.3 + 0.9);
  ball.vy = angle * 5;
}

function drawRect(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

function drawBall(x, y, radius, color) {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawCenterLine() {
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.setLineDash([12, 12]);
  ctx.beginPath();
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function handlePaddleCollision(paddle, isLeft) {
  const ballLeft = ball.x - ball.radius;
  const ballRight = ball.x + ball.radius;
  const ballTop = ball.y - ball.radius;
  const ballBottom = ball.y + ball.radius;

  const paddleLeft = paddle.x;
  const paddleRight = paddle.x + paddle.width;
  const paddleTop = paddle.y;
  const paddleBottom = paddle.y + paddle.height;

  const intersects =
    ballRight >= paddleLeft &&
    ballLeft <= paddleRight &&
    ballBottom >= paddleTop &&
    ballTop <= paddleBottom;

  if (!intersects) return;

  const relativeIntersectY =
    (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
  const bounceAngle = relativeIntersectY * 1.1;

  if (isLeft) {
    ball.x = paddle.x + paddle.width + ball.radius;
    ball.vx = Math.abs(ball.vx) * 1.12;
  } else {
    ball.x = paddle.x - ball.radius;
    ball.vx = -Math.abs(ball.vx) * 1.12;
  }

  ball.vy = ball.vx * 0.7 + bounceAngle * 5;

  if (Math.abs(ball.vx) < 5.5) {
    ball.vx = (isLeft ? 1 : -1) * 5.5;
  }
}

function updateLeftPaddle() {
  if (keys.ArrowUp || keys.ArrowDown) {
    if (keys.ArrowUp) leftPaddle.targetY -= leftPaddle.speed;
    if (keys.ArrowDown) leftPaddle.targetY += leftPaddle.speed;
  } else {
    leftPaddle.targetY = mouse.y - leftPaddle.height / 2;
  }

  leftPaddle.targetY = clamp(leftPaddle.targetY, 0, height - leftPaddle.height);
  leftPaddle.y += (leftPaddle.targetY - leftPaddle.y) * 0.25;
  leftPaddle.y = clamp(leftPaddle.y, 0, height - leftPaddle.height);
}

function updateRightPaddle() {
  const targetY = ball.y - rightPaddle.height / 2;
  rightPaddle.y += (targetY - rightPaddle.y) * 0.12;
  rightPaddle.y = clamp(rightPaddle.y, 0, height - rightPaddle.height);
}

function updateBall() {
  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.y - ball.radius <= 0) {
    ball.y = ball.radius;
    ball.vy *= -1;
  } else if (ball.y + ball.radius >= height) {
    ball.y = height - ball.radius;
    ball.vy *= -1;
  }

  if (ball.x - ball.radius <= 0) {
    rightScore++;
    updateScoreboard();
    resetBall(1);
  } else if (ball.x + ball.radius >= width) {
    leftScore++;
    updateScoreboard();
    resetBall(-1);
  }

  handlePaddleCollision(leftPaddle, true);
  handlePaddleCollision(rightPaddle, false);
}

function draw() {
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "#020817";
  ctx.fillRect(0, 0, width, height);

  drawCenterLine();

  drawRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height, "#93c5fd");
  drawRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height, "#fca5a5");

  drawBall(ball.x, ball.y, ball.radius, "#f8fafc");
}

function gameLoop() {
  updateLeftPaddle();
  updateRightPaddle();
  updateBall();
  draw();
  requestAnimationFrame(gameLoop);
}

canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  mouse.y = ((event.clientY - rect.top) / rect.height) * height;
});

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp" || event.key === "ArrowDown") {
    keys[event.key] = true;
  }
});

window.addEventListener("keyup", (event) => {
  if (event.key === "ArrowUp" || event.key === "ArrowDown") {
    keys[event.key] = false;
  }
});

updateScoreboard();
resetBall(Math.random() < 0.5 ? -1 : 1);
gameLoop();