/* ============================================
   MINI GAMES ENGINE
   "Work? No. Snake? Yes."
   ============================================ */

// =============================
// GAME 1: SNAKE
// =============================
function initSnakeGame(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const gridSize = 15;
  const tileCount = Math.floor(canvas.width / gridSize);
  const tileCountY = Math.floor(canvas.height / gridSize);

  let snake = [{ x: 10, y: 10 }];
  let food = { x: 5, y: 5 };
  let dx = 0, dy = 0;
  let score = 0;
  let gameRunning = false;
  let gameLoop = null;
  let speed = 120;

  const scoreEl = document.getElementById(canvasId + '-score');
  const startBtn = document.getElementById(canvasId + '-start');

  // Neon colors for the snake
  const snakeColors = ['#39ff14', '#32e612', '#2bcc10', '#24b30e', '#1d990c'];

  function placeFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCountY);
    // Don't place on snake
    for (const seg of snake) {
      if (seg.x === food.x && seg.y === food.y) {
        placeFood();
        return;
      }
    }
  }

  function drawGame() {
    // Background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines (subtle)
    ctx.strokeStyle = '#0a0a0a';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < tileCount; i++) {
      ctx.beginPath();
      ctx.moveTo(i * gridSize, 0);
      ctx.lineTo(i * gridSize, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < tileCountY; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * gridSize);
      ctx.lineTo(canvas.width, i * gridSize);
      ctx.stroke();
    }

    // Food (pulsing)
    const pulse = Math.sin(Date.now() / 200) * 2;
    ctx.font = (gridSize + pulse) + 'px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const foodEmojis = ['🍕', '🌮', '🍔', '🍩', '🍪', '🧁', '🍣'];
    ctx.fillText(
      foodEmojis[score % foodEmojis.length],
      food.x * gridSize + gridSize / 2,
      food.y * gridSize + gridSize / 2
    );

    // Snake
    snake.forEach((seg, i) => {
      const colorIdx = Math.min(i, snakeColors.length - 1);
      ctx.fillStyle = snakeColors[colorIdx];
      ctx.shadowColor = snakeColors[0];
      ctx.shadowBlur = i === 0 ? 10 : 3;
      ctx.fillRect(seg.x * gridSize + 1, seg.y * gridSize + 1, gridSize - 2, gridSize - 2);

      // Eyes on head
      if (i === 0) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#000';
        ctx.fillRect(seg.x * gridSize + 3, seg.y * gridSize + 3, 4, 4);
        ctx.fillRect(seg.x * gridSize + gridSize - 7, seg.y * gridSize + 3, 4, 4);
      }
    });
    ctx.shadowBlur = 0;

    // Start message
    if (!gameRunning) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = '14px "Press Start 2P", monospace';
      ctx.fillStyle = '#39ff14';
      ctx.textAlign = 'center';
      ctx.fillText(score > 0 ? 'GAME OVER!' : 'PRESS START', canvas.width / 2, canvas.height / 2 - 10);
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillStyle = '#888';
      ctx.fillText('Use Arrow Keys', canvas.width / 2, canvas.height / 2 + 15);
    }
  }

  function update() {
    if (!gameRunning) return;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCountY) {
      gameOver();
      return;
    }

    // Self collision
    for (const seg of snake) {
      if (seg.x === head.x && seg.y === head.y) {
        gameOver();
        return;
      }
    }

    snake.unshift(head);

    // Eat food
    if (head.x === food.x && head.y === food.y) {
      score++;
      if (scoreEl) scoreEl.textContent = 'Score: ' + score;
      placeFood();
      if (speed > 60) speed -= 3;
    } else {
      snake.pop();
    }

    drawGame();
  }

  function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    if (startBtn) startBtn.textContent = '🐍 Play Again';
    drawGame();

    // Silly game over messages
    const messages = [
      'The snake has perished. F in chat.',
      'RIP Snakey McSnakeface 🐍💀',
      'Your LinkedIn headline: "Failed Snake Player"',
      'Even the snake couldn\'t handle your moves.',
      'Game Over! Time to update your resume.',
    ];
    if (scoreEl) scoreEl.textContent = messages[Math.floor(Math.random() * messages.length)] + ' (Score: ' + score + ')';
  }

  function startGame() {
    snake = [{ x: 10, y: 10 }];
    dx = 1;
    dy = 0;
    score = 0;
    speed = 120;
    gameRunning = true;
    placeFood();
    if (scoreEl) scoreEl.textContent = 'Score: 0';
    if (startBtn) startBtn.textContent = '🐍 Playing...';

    clearInterval(gameLoop);
    gameLoop = setInterval(update, speed);

    // Restart interval with new speed after eating
    const checkSpeed = setInterval(() => {
      if (!gameRunning) {
        clearInterval(checkSpeed);
        return;
      }
      clearInterval(gameLoop);
      gameLoop = setInterval(update, speed);
    }, 1000);
  }

  // Controls
  document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    switch (e.key) {
      case 'ArrowUp': if (dy !== 1) { dx = 0; dy = -1; } e.preventDefault(); break;
      case 'ArrowDown': if (dy !== -1) { dx = 0; dy = 1; } e.preventDefault(); break;
      case 'ArrowLeft': if (dx !== 1) { dx = -1; dy = 0; } e.preventDefault(); break;
      case 'ArrowRight': if (dx !== -1) { dx = 1; dy = 0; } e.preventDefault(); break;
    }
  });

  if (startBtn) {
    startBtn.addEventListener('click', startGame);
  }

  drawGame();
}


// =============================
// GAME 2: WHACK-A-MOLE (but it's Whack-a-Bug)
// =============================
function initWhackGame(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let whackScore = 0;
  let whackTimeLeft = 30;
  let whackRunning = false;
  let whackTimer = null;
  let moleTimer = null;

  const scoreEl = document.getElementById(containerId + '-score');
  const timerEl = document.getElementById(containerId + '-timer');
  const startBtn = document.getElementById(containerId + '-start');
  const grid = document.getElementById(containerId + '-grid');

  const bugs = ['🐛', '🐞', '🪲', '🦗', '🕷️', '🐜'];
  const bonusItems = ['💎', '⭐', '🏆'];

  // Create holes
  const holes = [];
  for (let i = 0; i < 9; i++) {
    const hole = document.createElement('div');
    hole.style.cssText = `
      width: 70px; height: 70px;
      background: radial-gradient(ellipse, #1a0a00, #330a00);
      border: 3px ridge #8B4513;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 32px;
      cursor: crosshair;
      user-select: none;
      transition: background 0.1s;
      position: relative;
    `;
    hole.dataset.index = i;
    hole.dataset.active = 'false';
    hole.innerHTML = '';

    hole.addEventListener('click', () => {
      if (!whackRunning || hole.dataset.active !== 'true') {
        // Miss animation
        hole.style.background = 'radial-gradient(ellipse, #330000, #1a0000)';
        setTimeout(() => {
          hole.style.background = 'radial-gradient(ellipse, #1a0a00, #330a00)';
        }, 150);
        return;
      }

      const isBonus = hole.dataset.bonus === 'true';
      const points = isBonus ? 5 : 1;
      whackScore += points;
      if (scoreEl) scoreEl.textContent = 'Score: ' + whackScore;

      // Hit effect
      hole.innerHTML = isBonus ? '💥' : '💨';
      hole.dataset.active = 'false';
      hole.style.background = 'radial-gradient(ellipse, #003300, #001a00)';

      // Floating score popup
      const floater = document.createElement('div');
      floater.textContent = '+' + points;
      floater.style.cssText = `
        position: absolute; top: -20px; left: 50%; transform: translateX(-50%);
        color: ${isBonus ? '#FFD700' : '#39ff14'}; font-family: 'Press Start 2P', monospace;
        font-size: 14px; pointer-events: none; z-index: 10;
        animation: float-score 0.8s ease-out forwards;
      `;
      hole.appendChild(floater);
      setTimeout(() => floater.remove(), 800);

      setTimeout(() => {
        hole.innerHTML = '';
        hole.style.background = 'radial-gradient(ellipse, #1a0a00, #330a00)';
      }, 200);
    });

    holes.push(hole);
    grid.appendChild(hole);
  }

  // Add the float animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes float-score {
      0% { opacity: 1; transform: translateX(-50%) translateY(0); }
      100% { opacity: 0; transform: translateX(-50%) translateY(-30px); }
    }
  `;
  document.head.appendChild(style);

  function spawnMole() {
    if (!whackRunning) return;

    // Clear all active moles
    holes.forEach(h => {
      if (h.dataset.active === 'true') {
        h.innerHTML = '';
        h.dataset.active = 'false';
      }
    });

    // Spawn 1-2 moles
    const count = Math.random() > 0.7 ? 2 : 1;
    const indices = [];
    for (let i = 0; i < count; i++) {
      let idx;
      do {
        idx = Math.floor(Math.random() * 9);
      } while (indices.includes(idx));
      indices.push(idx);

      const hole = holes[idx];
      const isBonus = Math.random() > 0.85;
      hole.dataset.active = 'true';
      hole.dataset.bonus = isBonus ? 'true' : 'false';
      hole.innerHTML = isBonus
        ? bonusItems[Math.floor(Math.random() * bonusItems.length)]
        : bugs[Math.floor(Math.random() * bugs.length)];
      hole.style.transform = 'scale(1)';
      hole.style.animation = 'wobble 0.3s ease infinite';

      // Auto-hide after timeout
      const hideDelay = 800 + Math.random() * 800;
      setTimeout(() => {
        if (hole.dataset.active === 'true') {
          hole.innerHTML = '';
          hole.dataset.active = 'false';
          hole.style.animation = '';
        }
      }, hideDelay);
    }

    const nextSpawn = Math.max(400, 1000 - (30 - whackTimeLeft) * 15);
    moleTimer = setTimeout(spawnMole, nextSpawn);
  }

  function startWhack() {
    whackScore = 0;
    whackTimeLeft = 30;
    whackRunning = true;
    if (scoreEl) scoreEl.textContent = 'Score: 0';
    if (timerEl) timerEl.textContent = 'Time: 30s';
    if (startBtn) startBtn.textContent = '🔨 Whacking...';

    holes.forEach(h => { h.innerHTML = ''; h.dataset.active = 'false'; });

    whackTimer = setInterval(() => {
      whackTimeLeft--;
      if (timerEl) timerEl.textContent = 'Time: ' + whackTimeLeft + 's';

      if (whackTimeLeft <= 0) {
        whackRunning = false;
        clearInterval(whackTimer);
        clearTimeout(moleTimer);
        holes.forEach(h => { h.innerHTML = ''; h.dataset.active = 'false'; h.style.animation = ''; });

        const endMessages = [
          `Exterminator rating: ${whackScore > 20 ? 'LEGENDARY' : whackScore > 10 ? 'Pretty Good' : 'Needs Practice'}`,
          `${whackScore} bugs squashed! QA would be proud.`,
          `Score: ${whackScore}. The bugs fear you now.`,
        ];
        if (scoreEl) scoreEl.textContent = endMessages[Math.floor(Math.random() * endMessages.length)];
        if (startBtn) startBtn.textContent = '🔨 Play Again';
      }
    }, 1000);

    spawnMole();
  }

  if (startBtn) {
    startBtn.addEventListener('click', startWhack);
  }
}


// =============================
// GAME 3: COOKIE CLICKER (MINI)
// =============================
function initCookieClicker(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let cookies = 0;
  let cps = 0; // cookies per second
  let clickPower = 1;

  const cookieEl = document.getElementById(containerId + '-cookie');
  const countEl = document.getElementById(containerId + '-count');
  const cpsEl = document.getElementById(containerId + '-cps');
  const upgradesEl = document.getElementById(containerId + '-upgrades');

  const upgrades = [
    { name: '🤖 Auto-Clicker', cost: 10, cpsAdd: 1, owned: 0 },
    { name: '🏭 Cookie Factory', cost: 50, cpsAdd: 5, owned: 0 },
    { name: '🚀 Cookie Rocket', cost: 200, cpsAdd: 20, owned: 0 },
    { name: '🌍 Cookie Planet', cost: 1000, cpsAdd: 100, owned: 0 },
    { name: '💪 Power Click (+1)', cost: 25, cpsAdd: 0, clickAdd: 1, owned: 0 },
  ];

  function render() {
    if (countEl) countEl.textContent = Math.floor(cookies).toLocaleString() + ' cookies';
    if (cpsEl) cpsEl.textContent = cps + ' cookies/sec | Click power: ' + clickPower;

    if (upgradesEl) {
      upgradesEl.innerHTML = upgrades.map((u, i) => `
        <button onclick="buyCookieUpgrade(${i})" style="
          display: block; width: 100%; margin: 3px 0; padding: 5px 8px;
          background: ${cookies >= u.cost ? '#003300' : '#1a1a1a'};
          border: 1px solid ${cookies >= u.cost ? '#39ff14' : '#333'};
          color: ${cookies >= u.cost ? '#39ff14' : '#666'};
          font-family: 'Silkscreen', monospace; font-size: 10px;
          cursor: ${cookies >= u.cost ? 'pointer' : 'not-allowed'};
          text-align: left;
        ">
          ${u.name} - Cost: ${u.cost} (Owned: ${u.owned})
        </button>
      `).join('');
    }
  }

  window.buyCookieUpgrade = function(idx) {
    const u = upgrades[idx];
    if (cookies < u.cost) return;
    cookies -= u.cost;
    u.owned++;
    u.cost = Math.floor(u.cost * 1.5);
    if (u.cpsAdd) cps += u.cpsAdd;
    if (u.clickAdd) clickPower += u.clickAdd;
    render();
  };

  if (cookieEl) {
    cookieEl.addEventListener('click', (e) => {
      cookies += clickPower;

      // Click effect
      const floater = document.createElement('div');
      floater.textContent = '+' + clickPower;
      floater.style.cssText = `
        position: absolute; pointer-events: none; z-index: 10;
        color: #FFD700; font-family: 'Press Start 2P', monospace; font-size: 16px;
        left: ${e.offsetX}px; top: ${e.offsetY}px;
        animation: float-score 0.6s ease-out forwards;
      `;
      cookieEl.parentElement.style.position = 'relative';
      cookieEl.parentElement.appendChild(floater);
      setTimeout(() => floater.remove(), 600);

      cookieEl.style.transform = 'scale(0.9)';
      setTimeout(() => cookieEl.style.transform = 'scale(1)', 100);

      render();
    });
  }

  // Auto cookies
  setInterval(() => {
    if (cps > 0) {
      cookies += cps / 10;
      render();
    }
  }, 100);

  render();
}

// =============================
// GAME 4: PAC-MAN
// =============================
function initPacmanGame(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const TILE = 15;
  const COLS = Math.floor(canvas.width / TILE);
  const ROWS = Math.floor(canvas.height / TILE);

  const scoreEl = document.getElementById('pacman-game-score');
  const startBtn = document.getElementById('pacman-game-start');

  let pacman, ghosts, dots, powerPellets, score, lives, gameRunning, gameLoop, frightened, frightenedTimer;

  // Build a simple maze: 0=path, 1=wall
  function buildMaze() {
    const m = [];
    for (let r = 0; r < ROWS; r++) {
      m[r] = [];
      for (let c = 0; c < COLS; c++) {
        // Border walls
        if (r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1) {
          m[r][c] = 1;
        } else {
          m[r][c] = 0;
        }
      }
    }
    // Interior wall blocks to create maze-like feel
    const wallBlocks = [
      // Horizontal bars
      {r: 2, c: 2, w: 4, h: 1}, {r: 2, c: 8, w: 5, h: 1}, {r: 2, c: 15, w: 5, h: 1}, {r: 2, c: 22, w: 5, h: 1}, {r: 2, c: 29, w: 2, h: 1},
      {r: 4, c: 2, w: 2, h: 3}, {r: 4, c: 5, w: 5, h: 1}, {r: 4, c: 12, w: 1, h: 3}, {r: 4, c: 14, w: 5, h: 1}, {r: 4, c: 21, w: 1, h: 3},
      {r: 4, c: 23, w: 4, h: 1}, {r: 4, c: 29, w: 2, h: 3},
      {r: 8, c: 2, w: 4, h: 1}, {r: 8, c: 8, w: 3, h: 1}, {r: 8, c: 14, w: 4, h: 1}, {r: 8, c: 21, w: 3, h: 1}, {r: 8, c: 26, w: 5, h: 1},
      {r: 10, c: 3, w: 3, h: 1}, {r: 10, c: 8, w: 5, h: 1}, {r: 10, c: 15, w: 2, h: 1}, {r: 10, c: 19, w: 5, h: 1}, {r: 10, c: 26, w: 3, h: 1},
      {r: 12, c: 2, w: 2, h: 1}, {r: 12, c: 6, w: 3, h: 1}, {r: 12, c: 11, w: 1, h: 3}, {r: 12, c: 14, w: 4, h: 1}, {r: 12, c: 20, w: 1, h: 3},
      {r: 12, c: 23, w: 3, h: 1}, {r: 12, c: 28, w: 2, h: 1},
      {r: 15, c: 2, w: 5, h: 1}, {r: 15, c: 9, w: 4, h: 1}, {r: 15, c: 15, w: 3, h: 1}, {r: 15, c: 20, w: 4, h: 1}, {r: 15, c: 26, w: 4, h: 1},
      {r: 17, c: 3, w: 3, h: 1}, {r: 17, c: 8, w: 2, h: 1}, {r: 17, c: 13, w: 6, h: 1}, {r: 17, c: 22, w: 2, h: 1}, {r: 17, c: 26, w: 3, h: 1},
    ];
    for (const b of wallBlocks) {
      for (let dr = 0; dr < b.h; dr++) {
        for (let dc = 0; dc < b.w; dc++) {
          const rr = b.r + dr, cc = b.c + dc;
          if (rr > 0 && rr < ROWS - 1 && cc > 0 && cc < COLS - 1) {
            m[rr][cc] = 1;
          }
        }
      }
    }
    return m;
  }

  let maze = buildMaze();

  function placeDots() {
    dots = [];
    powerPellets = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (maze[r][c] === 0) {
          // Skip pacman start
          if (r === 1 && c === 1) continue;
          dots.push({r, c});
        }
      }
    }
    // Place 4 power pellets in corners of open space
    const corners = [
      {r: 1, c: COLS - 2}, {r: ROWS - 2, c: 1},
      {r: ROWS - 2, c: COLS - 2}, {r: 1, c: 7}
    ];
    for (const p of corners) {
      if (maze[p.r][p.c] === 0) {
        powerPellets.push(p);
        // Remove from regular dots
        const idx = dots.findIndex(d => d.r === p.r && d.c === p.c);
        if (idx !== -1) dots.splice(idx, 1);
      }
    }
  }

  function resetState() {
    pacman = {r: 1, c: 1, dr: 0, dc: 1, nextDr: 0, nextDc: 1, mouthOpen: true, mouthAngle: 0};
    ghosts = [
      {r: 9, c: 15, dr: -1, dc: 0, color: '#ff0000', name: 'Blinky'},
      {r: 9, c: 16, dr: 1, dc: 0, color: '#ffb8ff', name: 'Pinky'},
      {r: 9, c: 17, dr: 0, dc: -1, color: '#00ffff', name: 'Inky'},
      {r: 9, c: 14, dr: 0, dc: 1, color: '#ffb852', name: 'Clyde'},
    ];
    frightened = false;
    clearTimeout(frightenedTimer);
  }

  function startGame() {
    maze = buildMaze();
    placeDots();
    resetState();
    score = 0;
    lives = 3;
    gameRunning = true;
    if (scoreEl) scoreEl.textContent = 'Score: 0 | Lives: 3';
    if (startBtn) startBtn.textContent = '\uD83C\uDFB4 Playing...';
    clearInterval(gameLoop);
    gameLoop = setInterval(tick, 150);
  }

  function canMove(r, c) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return false;
    return maze[r][c] === 0;
  }

  function moveGhost(g) {
    // Try current direction, otherwise pick a random valid one
    const dirs = [{dr: -1, dc: 0}, {dr: 1, dc: 0}, {dr: 0, dc: -1}, {dr: 0, dc: 1}];
    const opposite = {dr: -g.dr, dc: -g.dc};

    // Get valid directions (not backwards)
    let valid = dirs.filter(d => {
      if (d.dr === opposite.dr && d.dc === opposite.dc) return false;
      return canMove(g.r + d.dr, g.c + d.dc);
    });

    if (valid.length === 0) {
      // Dead end, go backwards
      valid = dirs.filter(d => canMove(g.r + d.dr, g.c + d.dc));
    }

    if (valid.length === 0) return;

    // If can continue, bias towards current direction; otherwise random
    const canContinue = valid.find(d => d.dr === g.dr && d.dc === g.dc);

    let chosen;
    if (!frightened) {
      // Chase: bias toward pacman
      const toPac = {dr: Math.sign(pacman.r - g.r), dc: Math.sign(pacman.c - g.c)};
      const towardPac = valid.find(d => d.dr === toPac.dr && d.dc === toPac.dc);
      if (towardPac && Math.random() > 0.4) {
        chosen = towardPac;
      } else if (canContinue && Math.random() > 0.3) {
        chosen = canContinue;
      } else {
        chosen = valid[Math.floor(Math.random() * valid.length)];
      }
    } else {
      // Frightened: run away from pacman
      const awayPac = {dr: -Math.sign(pacman.r - g.r), dc: -Math.sign(pacman.c - g.c)};
      const awayDir = valid.find(d => d.dr === awayPac.dr && d.dc === awayPac.dc);
      chosen = awayDir || valid[Math.floor(Math.random() * valid.length)];
    }

    g.dr = chosen.dr;
    g.dc = chosen.dc;
    g.r += g.dr;
    g.c += g.dc;
  }

  function tick() {
    if (!gameRunning) return;

    // Try next direction first
    if (canMove(pacman.r + pacman.nextDr, pacman.c + pacman.nextDc)) {
      pacman.dr = pacman.nextDr;
      pacman.dc = pacman.nextDc;
    }

    // Move pacman
    const nr = pacman.r + pacman.dr;
    const nc = pacman.c + pacman.dc;
    if (canMove(nr, nc)) {
      pacman.r = nr;
      pacman.c = nc;
    }

    // Animate mouth
    pacman.mouthAngle += 0.3;
    pacman.mouthOpen = Math.sin(pacman.mouthAngle) > 0;

    // Eat dots
    const dotIdx = dots.findIndex(d => d.r === pacman.r && d.c === pacman.c);
    if (dotIdx !== -1) {
      dots.splice(dotIdx, 1);
      score += 10;
    }

    // Eat power pellets
    const ppIdx = powerPellets.findIndex(p => p.r === pacman.r && p.c === pacman.c);
    if (ppIdx !== -1) {
      powerPellets.splice(ppIdx, 1);
      score += 50;
      frightened = true;
      clearTimeout(frightenedTimer);
      frightenedTimer = setTimeout(() => { frightened = false; }, 5000);
    }

    // Move ghosts
    ghosts.forEach(g => moveGhost(g));

    // Check collision with ghosts
    for (let i = ghosts.length - 1; i >= 0; i--) {
      const g = ghosts[i];
      if (g.r === pacman.r && g.c === pacman.c) {
        if (frightened) {
          // Eat ghost
          score += 200;
          g.r = 9;
          g.c = 15;
        } else {
          // Lose a life
          lives--;
          if (lives <= 0) {
            gameOver();
            return;
          }
          resetState();
        }
      }
    }

    if (scoreEl) scoreEl.textContent = 'Score: ' + score + ' | Lives: ' + lives;

    // Win condition
    if (dots.length === 0 && powerPellets.length === 0) {
      score += 1000;
      placeDots();
      resetState();
      // Speed up slightly
    }

    draw();
  }

  function draw() {
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw maze walls
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (maze[r][c] === 1) {
          ctx.fillStyle = '#1a1aff';
          ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
          // Inner border for 3D effect
          ctx.fillStyle = '#0000aa';
          ctx.fillRect(c * TILE + 1, r * TILE + 1, TILE - 2, TILE - 2);
        }
      }
    }

    // Draw dots
    ctx.fillStyle = '#ffcc00';
    for (const d of dots) {
      ctx.beginPath();
      ctx.arc(d.c * TILE + TILE / 2, d.r * TILE + TILE / 2, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw power pellets (pulsing)
    const pulse = Math.abs(Math.sin(Date.now() / 200));
    ctx.fillStyle = `rgba(255, 204, 0, ${0.5 + pulse * 0.5})`;
    for (const p of powerPellets) {
      ctx.beginPath();
      ctx.arc(p.c * TILE + TILE / 2, p.r * TILE + TILE / 2, 5 + pulse * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Pac-Man
    const px = pacman.c * TILE + TILE / 2;
    const py = pacman.r * TILE + TILE / 2;
    const mouthSize = pacman.mouthOpen ? 0.3 : 0.05;
    let angle = 0;
    if (pacman.dc === 1) angle = 0;
    else if (pacman.dc === -1) angle = Math.PI;
    else if (pacman.dr === -1) angle = -Math.PI / 2;
    else if (pacman.dr === 1) angle = Math.PI / 2;

    ctx.fillStyle = '#ffff00';
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(px, py, TILE / 2 - 1, angle + mouthSize * Math.PI, angle + (2 - mouthSize) * Math.PI);
    ctx.lineTo(px, py);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw ghosts
    for (const g of ghosts) {
      const gx = g.c * TILE;
      const gy = g.r * TILE;

      ctx.fillStyle = frightened ? '#2222ff' : g.color;
      ctx.shadowColor = frightened ? '#2222ff' : g.color;
      ctx.shadowBlur = 5;

      // Ghost body (rounded top + wavy bottom)
      ctx.beginPath();
      ctx.arc(gx + TILE / 2, gy + TILE / 2 - 1, TILE / 2 - 1, Math.PI, 0);
      ctx.lineTo(gx + TILE - 1, gy + TILE - 1);
      // Wavy bottom
      const waveW = (TILE - 2) / 3;
      for (let i = 2; i >= 0; i--) {
        const wx = gx + 1 + i * waveW;
        ctx.quadraticCurveTo(wx + waveW / 2, gy + TILE + 2, wx, gy + TILE - 1);
      }
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Eyes
      const eyeW = 3, eyeH = 4;
      ctx.fillStyle = '#fff';
      ctx.fillRect(gx + 3, gy + TILE / 2 - 3, eyeW + 1, eyeH);
      ctx.fillRect(gx + TILE - 7, gy + TILE / 2 - 3, eyeW + 1, eyeH);
      if (!frightened) {
        ctx.fillStyle = '#00f';
        ctx.fillRect(gx + 4 + Math.sign(pacman.c - g.c), gy + TILE / 2 - 2, 2, 2);
        ctx.fillRect(gx + TILE - 6 + Math.sign(pacman.c - g.c), gy + TILE / 2 - 2, 2, 2);
      }
    }

    // Overlay when not running
    if (!gameRunning) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = '14px "Press Start 2P", monospace';
      ctx.fillStyle = '#ffff00';
      ctx.textAlign = 'center';
      ctx.fillText(score > 0 ? 'GAME OVER!' : 'PRESS START', canvas.width / 2, canvas.height / 2 - 10);
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillStyle = '#888';
      ctx.fillText('Arrow Keys to move', canvas.width / 2, canvas.height / 2 + 15);
    }
  }

  function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    clearTimeout(frightenedTimer);
    if (startBtn) startBtn.textContent = '\uD83C\uDFB4 Play Again';
    const messages = [
      'The ghosts got you! Demand: un-generated.',
      'Waka waka waka... SPLAT. Game over.',
      'Even Pac-Man can\'t outrun a bad GTM strategy.',
      'Ghost 1, Yannis 0. Try again!',
      'Your pipeline has been consumed by ghosts.',
    ];
    if (scoreEl) scoreEl.textContent = messages[Math.floor(Math.random() * messages.length)] + ' (Score: ' + score + ')';
    draw();
  }

  // Controls
  document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    switch (e.key) {
      case 'ArrowUp': pacman.nextDr = -1; pacman.nextDc = 0; e.preventDefault(); break;
      case 'ArrowDown': pacman.nextDr = 1; pacman.nextDc = 0; e.preventDefault(); break;
      case 'ArrowLeft': pacman.nextDr = 0; pacman.nextDc = -1; e.preventDefault(); break;
      case 'ArrowRight': pacman.nextDr = 0; pacman.nextDc = 1; e.preventDefault(); break;
    }
  });

  if (startBtn) startBtn.addEventListener('click', startGame);

  // Initial draw
  maze = buildMaze();
  placeDots();
  resetState();
  score = 0; lives = 3;
  draw();
}

// Init games when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initPacmanGame('pacman-canvas');
  initSnakeGame('snake-canvas');
  initWhackGame('whack-game');
  initCookieClicker('cookie-game');
});
