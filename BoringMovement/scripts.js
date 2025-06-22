// (g is toggle singleplayer)

const player1 = document.getElementById('player1');
const player2 = document.getElementById('player2');

let size1 = 50, size2 = 50;
let x1, y1, x2, y2;
let vx1 = 0, vy1 = 0, vx2 = 0, vy2 = 0;
const normalMaxSpeed = 6, boostMaxSpeed = 12;
const acceleration = 0.5, friction = 0.15;
const keys = {
  w: false, a: false, s: false, d: false,
  ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
  Space: false, '.': false
};
let score1 = 0, score2 = 0, winningScore = 5;
let stamina1 = 100, stamina2 = 100, maxStamina = 100;
const staminaDrainRate = 0.8, staminaRegenRate = 0.4, staminaCooldownThreshold = 10;
let canMove = false, singlePlayer = false;

// UI
const messageNote = document.createElement('div');
messageNote.style.position = 'fixed';
messageNote.style.top = '10px';
messageNote.style.left = '10px';
messageNote.style.color = 'white';
messageNote.style.fontSize = '14px';
messageNote.style.fontFamily = 'Arial, sans-serif';
messageNote.style.zIndex = '1000';
messageNote.textContent = '(g is toggle singleplayer)';
document.body.appendChild(messageNote);

const scoreBoard = document.createElement('div');
scoreBoard.style.position = 'fixed';
scoreBoard.style.top = '30px';
scoreBoard.style.left = '10px';
scoreBoard.style.color = 'white';
scoreBoard.style.fontSize = '20px';
scoreBoard.style.fontFamily = 'Arial, sans-serif';
scoreBoard.style.zIndex = '1000';
document.body.appendChild(scoreBoard);

const countdownDisplay = document.createElement('div');
countdownDisplay.style.position = 'fixed';
countdownDisplay.style.top = '50%';
countdownDisplay.style.left = '50%';
countdownDisplay.style.transform = 'translate(-50%, -50%)';
countdownDisplay.style.color = 'white';
countdownDisplay.style.fontSize = '100px';
countdownDisplay.style.fontWeight = 'bold';
countdownDisplay.style.fontFamily = 'Arial, sans-serif';
countdownDisplay.style.zIndex = '2000';
document.body.appendChild(countdownDisplay);

// Input
document.addEventListener("keydown", (e) => {
  if (e.key === 'g') {
    singlePlayer = !singlePlayer;
    resetGame();
  }
  if (!canMove) return;
  if (e.code === 'Space') keys.Space = true;
  if (e.key in keys) keys[e.key] = true;
});
document.addEventListener("keyup", (e) => {
  if (!canMove) return;
  if (e.code === 'Space') keys.Space = false;
  if (e.key in keys) keys[e.key] = false;
});

function resetKeys() {
  for (let k in keys) keys[k] = false;
}

function applyFriction(v) {
  return v > 0 ? Math.max(v - friction, 0) : Math.min(v + friction, 0);
}

function clampVelocity(vx, vy, max) {
  const mag = Math.hypot(vx, vy);
  if (mag > max) {
    const scale = max / mag;
    return [vx * scale, vy * scale];
  }
  return [vx, vy];
}

function constrainPosition() {
  const w = window.innerWidth, h = window.innerHeight;
  x1 = Math.max(0, Math.min(x1, w - size1));
  y1 = Math.max(0, Math.min(y1, h - size1));
  x2 = Math.max(0, Math.min(x2, w - size2));
  y2 = Math.max(0, Math.min(y2, h - size2));
}

function aiControl() {
  if (!canMove) return;
  const dx = x1 - x2;
  const dy = y1 - y2;
  const dist = Math.hypot(dx, dy);
  const dirX = dx / dist || 0;
  const dirY = dy / dist || 0;

  vx2 += dirX * acceleration * 0.6;
  vy2 += dirY * acceleration * 0.6;

  const boost = dist > 200 && stamina2 > staminaCooldownThreshold;
  const maxV = boost ? normalMaxSpeed + 2 : normalMaxSpeed;
  [vx2, vy2] = clampVelocity(vx2, vy2, maxV);

  stamina2 += boost ? -staminaDrainRate * 0.5 : staminaRegenRate;
  stamina2 = Math.max(0, Math.min(maxStamina, stamina2));
}

function updatePlayerStyles() {
  player1.style.left = x1 + "px";
  player1.style.top = y1 + "px";
  player1.style.width = size1 + "px";
  player1.style.height = size1 + "px";

  player2.style.left = x2 + "px";
  player2.style.top = y2 + "px";
  player2.style.width = size2 + "px";
  player2.style.height = size2 + "px";
}

function updateScoreBoard() {
  scoreBoard.textContent = `Player 1: ${score1} | Player 2: ${score2} ${singlePlayer ? '(Singleplayer)' : ''}`;
}

function checkCollision() {
  const r1 = player1.getBoundingClientRect();
  const r2 = player2.getBoundingClientRect();
  const hit = !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
  if (hit) {
    const v1 = Math.hypot(vx1, vy1);
    const v2 = Math.hypot(vx2, vy2);
    if (v1 > v2) {
      score1++;
      size1 += 10;
    } else if (v2 > v1) {
      score2++;
      size2 += 10;
    }
    updateScoreBoard();
    if (score1 >= winningScore || score2 >= winningScore) {
      alert(score1 > score2 ? "Player 1 Wins!" : "Player 2 Wins!");
      resetGame();
    } else {
      resetRound();
    }
  }
}

function resetPositionsAndVelocity() {
  vx1 = vy1 = vx2 = vy2 = 0;
  x1 = 100;
  y1 = window.innerHeight / 2 - size1 / 2;
  x2 = window.innerWidth - 150;
  y2 = window.innerHeight / 2 - size2 / 2;
  updatePlayerStyles();
}

function resetGame() {
  score1 = 0;
  score2 = 0;
  size1 = 50;
  size2 = 50;
  stamina1 = maxStamina;
  stamina2 = maxStamina;
  resetRound();
  updateScoreBoard();
}

function resetRound() {
  resetKeys();
  resetPositionsAndVelocity();
  canMove = false;
  startCountdown();
}

function startCountdown() {
  let count = 3;
  countdownDisplay.textContent = count;
  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownDisplay.textContent = count;
    } else {
      countdownDisplay.textContent = "GO!";
      setTimeout(() => {
        countdownDisplay.textContent = "";
        canMove = true;
      }, 700);
      clearInterval(interval);
    }
  }, 1000);
}

function update() {
  if (canMove) {
    const boost1 = keys.Space && stamina1 > staminaCooldownThreshold;
    const boost2 = keys['.'] && stamina2 > staminaCooldownThreshold;

    const max1 = boost1 ? boostMaxSpeed : normalMaxSpeed;
    const max2 = boost2 ? boostMaxSpeed : normalMaxSpeed;

    if (keys.a) vx1 -= acceleration;
    if (keys.d) vx1 += acceleration;
    if (keys.w) vy1 -= acceleration;
    if (keys.s) vy1 += acceleration;

    if (singlePlayer) aiControl();
    else {
      if (keys.ArrowLeft) vx2 -= acceleration;
      if (keys.ArrowRight) vx2 += acceleration;
      if (keys.ArrowUp) vy2 -= acceleration;
      if (keys.ArrowDown) vy2 += acceleration;
    }

    // Clamp velocities
    [vx1, vy1] = clampVelocity(vx1, vy1, max1);
    [vx2, vy2] = clampVelocity(vx2, vy2, max2);

    // Apply friction
    if (!keys.a && !keys.d) vx1 = applyFriction(vx1);
    if (!keys.w && !keys.s) vy1 = applyFriction(vy1);

    if (!singlePlayer) {
      if (!keys.ArrowLeft && !keys.ArrowRight) vx2 = applyFriction(vx2);
      if (!keys.ArrowUp && !keys.ArrowDown) vy2 = applyFriction(vy2);
    }

    // Move
    x1 += vx1;
    y1 += vy1;
    x2 += vx2;
    y2 += vy2;

    // Constrain
    constrainPosition();
    updatePlayerStyles();

    // Stamina updates
    stamina1 += boost1 ? -staminaDrainRate : staminaRegenRate;
    stamina2 += boost2 ? -staminaDrainRate : staminaRegenRate;
    stamina1 = Math.max(0, Math.min(maxStamina, stamina1));
    stamina2 = Math.max(0, Math.min(maxStamina, stamina2));
  }

  checkCollision();
  requestAnimationFrame(update);
}

// Start the game
resetGame();
update();
