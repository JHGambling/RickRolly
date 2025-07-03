// European roulette numbers and colors
const numbers = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];
const colors = [
  'green', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black'
];
const canvas = document.getElementById('roulette-wheel');
const ctx = canvas.getContext('2d');
const radius = canvas.width / 2;
const center = { x: radius, y: radius };
const segmentAngle = 2 * Math.PI / numbers.length;

function drawWheel(rotation = 0) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < numbers.length; i++) {
    const startAngle = i * segmentAngle + rotation;
    const endAngle = startAngle + segmentAngle;
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.arc(center.x, center.y, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = colors[i];
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Draw numbers
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(startAngle + segmentAngle / 2);
    ctx.textAlign = 'right';
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeText(numbers[i], radius - 10, 10);
    ctx.fillText(numbers[i], radius - 10, 10);
    ctx.restore();
  }
  // Draw center circle
  ctx.beginPath();
  ctx.arc(center.x, center.y, 60, 0, 2 * Math.PI);
  ctx.fillStyle = '#ffd700';
  ctx.fill();
  ctx.strokeStyle = '#b8860b';
  ctx.lineWidth = 5;
  ctx.stroke();
}

let currentRotation = 0;
let spinning = false;

// Betting logic
let currentBet = null;
const betForm = document.getElementById('bet-form');
const betType = document.getElementById('bet-type');
const betNumber = document.getElementById('bet-number');
const betColor = document.getElementById('bet-color');
const betInfo = document.getElementById('bet-info');
const spinBtn = document.getElementById('spin-btn');

betType.addEventListener('change', () => {
  if (betType.value === 'number') {
    betNumber.style.display = '';
    betColor.style.display = 'none';
  } else {
    betNumber.style.display = 'none';
    betColor.style.display = '';
  }
});

betForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (betType.value === 'number') {
    const num = parseInt(betNumber.value, 10);
    if (isNaN(num) || num < 0 || num > 36) {
      betInfo.textContent = 'Please enter a valid number (0-36).';
      currentBet = null;
      return;
    }
    currentBet = { type: 'number', value: num };
    betInfo.textContent = `Bet placed on number ${num}`;
  } else {
    const color = betColor.value;
    currentBet = { type: 'color', value: color };
    betInfo.textContent = `Bet placed on color ${color}`;
  }
});

function getResultIndex() {
  // The pointer is at the top (Math.PI * 1.5 radians), so calculate the index at (Math.PI * 1.5 - currentRotation)
  let angle = (Math.PI * 1.5 - currentRotation) % (2 * Math.PI);
  if (angle < 0) angle += 2 * Math.PI;
  const index = Math.floor(angle / segmentAngle) % numbers.length;
  return index;
}

function showResult() {
  const idx = getResultIndex();
  const resultNum = numbers[idx];
  const resultColor = colors[idx];
  let msg = `Result: ${resultNum} (${resultColor})`;
  let winTotal = 0;
  let loseTotal = 0;
  bets.forEach(bet => {
    const betAmount = parseInt(bet.amount, 10) || 10;
    let win = false;
    let payout = 0;
    if (bet.type === 'number' && bet.value === resultNum) {
      win = true;
      payout = betAmount * 36;
    } else if (bet.type === 'color' && bet.value === resultColor) {
      win = true;
      payout = betAmount * 2;
    }
    if (win) {
      playerBudget = parseInt(playerBudget, 10) + payout;
      winTotal += payout;
    } else {
      playerBudget = parseInt(playerBudget, 10) - betAmount;
      loseTotal += betAmount;
    }
  });
  updateBudgetDisplay();
  if (winTotal > 0) msg += ` — You win $${winTotal}!`;
  if (loseTotal > 0) msg += ` — You lose $${loseTotal}!`;
  betInfo.textContent = msg;
  clearBets();
}

// --- Betting Table Logic ---
const tableCanvas = document.getElementById('betting-table');
const tableCtx = tableCanvas.getContext('2d');
const chipsContainer = document.getElementById('chips-container');

// Table layout constants
const tableMargin = 20;
const cellW = 60;
const cellH = 50;
const rows = 3;
const cols = 12;
const zeroCell = { x: 0, y: 0, w: cellW, h: cellH * 3 };

// Draw the betting table
function drawBettingTable() {
  // Background
  tableCtx.clearRect(0, 0, tableCanvas.width, tableCanvas.height);
  tableCtx.fillStyle = '#0a5c2c';
  tableCtx.fillRect(0, 0, tableCanvas.width, tableCanvas.height);

  // Draw 0 cell
  tableCtx.fillStyle = '#2e8b57';
  tableCtx.fillRect(zeroCell.x + tableMargin, zeroCell.y + tableMargin, zeroCell.w, zeroCell.h);
  tableCtx.strokeStyle = '#fff';
  tableCtx.lineWidth = 2;
  tableCtx.strokeRect(zeroCell.x + tableMargin, zeroCell.y + tableMargin, zeroCell.w, zeroCell.h);
  tableCtx.save();
  tableCtx.fillStyle = '#fff';
  tableCtx.font = 'bold 20px Arial';
  tableCtx.textAlign = 'center';
  tableCtx.textBaseline = 'middle';
  tableCtx.fillText('0', zeroCell.x + tableMargin + cellW / 2, tableMargin + cellH * 1.5);
  tableCtx.restore();

  // Draw number grid (1-36)
  let n = 1;
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const x = tableMargin + cellW + col * cellW;
      const y = tableMargin + row * cellH;
      tableCtx.fillStyle = (colors[numbers.indexOf(n)] === 'red') ? '#e63946' : (colors[numbers.indexOf(n)] === 'black' ? '#222' : '#2e8b57');
      tableCtx.fillRect(x, y, cellW, cellH);
      tableCtx.strokeStyle = '#fff';
      tableCtx.lineWidth = 2;
      tableCtx.strokeRect(x, y, cellW, cellH);
      tableCtx.save();
      tableCtx.fillStyle = '#fff';
      tableCtx.font = 'bold 18px Arial';
      tableCtx.textAlign = 'center';
      tableCtx.textBaseline = 'middle';
      tableCtx.fillText(n, x + cellW / 2, y + cellH / 2);
      tableCtx.restore();
      n++;
    }
  }

  // Draw color fields (red, black, green)
  const colorFieldW = 100;
  const colorFieldH = 40;
  const colorFieldY = tableMargin + cellH * 3 + 20;
  const colorFields = [
    { color: 'red', x: tableMargin + cellW, label: 'Red', fill: '#e63946' },
    { color: 'black', x: tableMargin + cellW + colorFieldW + 10, label: 'Black', fill: '#222' },
    { color: 'green', x: tableMargin + cellW + 2 * (colorFieldW + 10), label: 'Green', fill: '#2e8b57' }
  ];
  colorFields.forEach(field => {
    tableCtx.fillStyle = field.fill;
    tableCtx.fillRect(field.x, colorFieldY, colorFieldW, colorFieldH);
    tableCtx.strokeStyle = '#fff';
    tableCtx.lineWidth = 2;
    tableCtx.strokeRect(field.x, colorFieldY, colorFieldW, colorFieldH);
    tableCtx.save();
    tableCtx.fillStyle = '#fff';
    tableCtx.font = 'bold 18px Arial';
    tableCtx.textAlign = 'center';
    tableCtx.textBaseline = 'middle';
    tableCtx.fillText(field.label, field.x + colorFieldW / 2, colorFieldY + colorFieldH / 2);
    tableCtx.restore();
  });
}

drawBettingTable();

// --- Chip Placement Logic ---
// Replace single bet with multiple bets system
let currentBets = []; // Array of { type, value, amount }

let playerBudget = 1000;
let currentBetAmount = 10;

function updateBudgetDisplay() {
  let budgetDisplay = document.getElementById('budget-display');
  if (!budgetDisplay) {
    budgetDisplay = document.createElement('div');
    budgetDisplay.id = 'budget-display';
    budgetDisplay.style.color = '#fff';
    budgetDisplay.style.fontSize = '1.2rem';
    budgetDisplay.style.marginBottom = '10px';
    document.body.insertBefore(budgetDisplay, document.body.children[2]);
  }
  // Always parse playerBudget as integer for display
  budgetDisplay.textContent = `Budget: $${parseInt(playerBudget, 10)}`;
}

// Add chip amount selection (optional, default 10)
function createChipSelector() {
  let selector = document.getElementById('chip-selector');
  if (!selector) {
    selector = document.createElement('select');
    selector.id = 'chip-selector';
    [10, 50, 100, 500].forEach(val => {
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = `$${val}`;
      selector.appendChild(opt);
    });
    selector.style.marginRight = '10px';
    selector.style.fontSize = '1rem';
    selector.addEventListener('change', e => {
      currentBetAmount = parseInt(e.target.value, 10) || 10;
    });
    document.getElementById('betting-table-container').insertAdjacentElement('beforebegin', selector);
  }
}
createChipSelector();

// Helper to check if a bet already exists on a field
function betExistsOnField(value) {
  return currentBets.some(bet => bet.value === value);
}

// Place or remove a chip (toggle bet) on click
function placeOrRemoveChip(x, y, numberOrColor) {
  const betAmount = parseInt(currentBetAmount, 10) || 10;
  const betIdx = currentBets.findIndex(bet => bet.value === numberOrColor);
  if (betIdx !== -1) {
    // Remove bet
    currentBets.splice(betIdx, 1);
    renderChips();
    betInfo.textContent = typeof numberOrColor === 'number' ? `Bet removed from number ${numberOrColor}` : `Bet removed from color ${numberOrColor}`;
    return;
  }
  if (playerBudget < betAmount) {
    betInfo.textContent = 'Not enough budget!';
    return;
  }
  // Add bet
  currentBets.push({
    type: typeof numberOrColor === 'number' ? 'number' : 'color',
    value: numberOrColor,
    amount: betAmount
  });
  renderChips();
  betInfo.textContent = typeof numberOrColor === 'number' ? `Bet placed on number ${numberOrColor} ($${betAmount})` : `Bet placed on color ${numberOrColor} ($${betAmount})`;
}

// Render all chips for all bets
function renderChips() {
  chipsContainer.innerHTML = '';
  currentBets.forEach(bet => {
    let chipX, chipY;
    if (typeof bet.value === 'number') {
      if (bet.value === 0) {
        chipX = tableMargin + cellW / 2;
        chipY = tableMargin + cellH * 1.5;
      } else {
        const n = bet.value;
        const col = Math.floor((n - 1) / 3);
        const row = (n - 1) % 3;
        chipX = tableMargin + cellW + col * cellW + cellW / 2;
        chipY = tableMargin + row * cellH + cellH / 2;
      }
    } else if (typeof bet.value === 'string') {
      const colorFieldW = 100;
      const colorFieldH = 40;
      const colorFieldY = tableMargin + cellH * 3 + 20;
      let colorIdx = 0;
      if (bet.value === 'black') colorIdx = 1;
      if (bet.value === 'green') colorIdx = 2;
      chipX = tableMargin + cellW + colorIdx * (colorFieldW + 10) + colorFieldW / 2;
      chipY = colorFieldY + colorFieldH / 2;
    }
    // Adjust chip placement to align with canvas offset
    const containerRect = chipsContainer.getBoundingClientRect();
    const canvasRect = tableCanvas.getBoundingClientRect();
    const offsetX = canvasRect.left - containerRect.left;
    const offsetY = canvasRect.top - containerRect.top;
    // Chip color by amount
    let chipColor = '#ffd700';
    if (bet.amount >= 500) chipColor = '#e63946';
    else if (bet.amount >= 100) chipColor = '#1976d2';
    else if (bet.amount >= 50) chipColor = '#43a047';
    // else gold for 10
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.style.left = `${chipX + offsetX - 16}px`;
    chip.style.top = `${chipY + offsetY - 16}px`;
    chip.style.background = chipColor;
    chip.textContent = bet.amount;
    chipsContainer.appendChild(chip);
  });
}

// Handle click on table to place bet
function getNumberFromTableClick(x, y) {
  // Check 0 cell
  const zeroX = zeroCell.x + tableMargin;
  const zeroY = zeroCell.y + tableMargin;
  if (x >= zeroX && x < zeroX + zeroCell.w && y >= zeroY && y < zeroY + zeroCell.h) {
    return 0; // 0 cell
  }
  // Check number grid (1-36)
  if (x >= tableMargin + cellW && x < tableMargin + cellW * 13 && y >= tableMargin && y < tableMargin + cellH * 3) {
    const col = Math.floor((x - (tableMargin + cellW)) / cellW);
    const row = Math.floor((y - tableMargin) / cellH);
    // The table is filled column-wise: each column has 3 numbers, from bottom to top (row 2 is bottom, row 0 is top)
    // numbers on table: [row 0][col], [row 1][col], [row 2][col] => numbers[(col*3)+row]
    const idx = col * 3 + row + 1; // +1 because numbers[0] is 0
    if (idx >= 1 && idx <= 36) {
      // Find the actual roulette number for this cell
      // The numbers array is the wheel order, but the table is sequential 1-36
      return idx;
    }
  }
  // Check color fields
  const colorFieldW = 100;
  const colorFieldH = 40;
  const colorFieldY = tableMargin + cellH * 3 + 20;
  const colorFields = [
    { color: 'red', x: tableMargin + cellW },
    { color: 'black', x: tableMargin + cellW + colorFieldW + 10 },
    { color: 'green', x: tableMargin + cellW + 2 * (colorFieldW + 10) }
  ];
  for (const field of colorFields) {
    if (
      x >= field.x && x <= field.x + colorFieldW &&
      y >= colorFieldY && y <= colorFieldY + colorFieldH
    ) {
      return field.color;
    }
  }
  return null; // Outside of any clickable area
}

tableCanvas.addEventListener('click', (e) => {
  const rect = tableCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const result = getNumberFromTableClick(x, y);
  if (typeof result === 'number' && result !== null) {
    placeOrRemoveChip(x, y, result);
  } else if (typeof result === 'string') {
    placeOrRemoveChip(x, y, result);
  }
});

// Only allow spin if at least one bet is placed
function spinWheel() {
  if (spinning) return;
  if (!currentBets.length) {
    betInfo.textContent = 'Please place at least one bet by clicking the table!';
    return;
  }
  spinning = true;
  const spinTime = 4000 + Math.random() * 2000;
  const spinAngle = 10 * 2 * Math.PI + Math.random() * 2 * Math.PI;
  const start = performance.now();
  function animate(now) {
    const elapsed = now - start;
    const t = Math.min(elapsed / spinTime, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    currentRotation = spinAngle * ease;
    drawWheel(currentRotation);
    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      spinning = false;
      showResultMulti();
      // Remove chips after spin
      chipsContainer.innerHTML = '';
      currentBets = [];
    }
  }
  requestAnimationFrame(animate);
}

drawWheel();
document.getElementById('spin-btn').addEventListener('click', spinWheel);

// Show result for all bets
function showResultMulti() {
  const idx = getResultIndex();
  const resultNum = numbers[idx];
  const resultColor = colors[idx];
  let msg = `Result: ${resultNum} (${resultColor})`;
  let totalWin = 0;
  let totalLoss = 0;
  let winDetails = [];
  let lossDetails = [];
  currentBets.forEach(bet => {
    let win = false;
    let payout = 0;
    if (bet.type === 'number' && bet.value === resultNum) {
      win = true;
      payout = bet.amount * 36;
    } else if (bet.type === 'color' && bet.value === resultColor) {
      win = true;
      payout = bet.amount * 2;
    }
    if (win) {
      totalWin += payout;
      winDetails.push(`${bet.type === 'number' ? bet.value : bet.value.charAt(0).toUpperCase() + bet.value.slice(1)} ($${bet.amount} → $${payout})`);
    } else {
      totalLoss += bet.amount;
      lossDetails.push(`${bet.type === 'number' ? bet.value : bet.value.charAt(0).toUpperCase() + bet.value.slice(1)} ($${bet.amount})`);
    }
  });
  playerBudget = parseInt(playerBudget, 10) + totalWin - totalLoss;
  updateBudgetDisplay();
  if (winDetails.length) {
    msg += ` — Win: ${winDetails.join(', ')}`;
  }
  if (lossDetails.length) {
    msg += ` — Lose: ${lossDetails.join(', ')}`;
  }
  betInfo.textContent = msg;
}
