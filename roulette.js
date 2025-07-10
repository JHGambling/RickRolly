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

  // Draw color fields (red, black) - align with number grid
  const colorFieldY = tableMargin + cellH * 3 + 20;
  const colorFieldW = cellW * cols; // exactly the width of the number grid
  const colorFieldH = 40;
  // Each color field is half the width of the number grid
  const halfW = colorFieldW / 2;
  const colorFields = [
    { color: 'red', x: tableMargin + cellW, label: 'Red', fill: '#e63946' },
    { color: 'black', x: tableMargin + cellW + halfW, label: 'Black', fill: '#222' }
  ];
  colorFields.forEach((field, i) => {
    tableCtx.fillStyle = field.fill;
    tableCtx.fillRect(field.x, colorFieldY, halfW, colorFieldH);
    tableCtx.strokeStyle = '#fff';
    tableCtx.lineWidth = 2;
    tableCtx.strokeRect(field.x, colorFieldY, halfW, colorFieldH);
    tableCtx.save();
    tableCtx.fillStyle = '#fff';
    tableCtx.font = 'bold 22px Arial';
    tableCtx.textAlign = 'center';
    tableCtx.textBaseline = 'middle';
    tableCtx.fillText(field.label, field.x + halfW / 2, colorFieldY + colorFieldH / 2);
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
    budgetDisplay.style.color = '#ffd700';
    budgetDisplay.style.fontWeight = 'bold';
    budgetDisplay.style.fontSize = '2.2rem';
    budgetDisplay.style.marginBottom = '18px';
    budgetDisplay.style.letterSpacing = '1px';
    budgetDisplay.style.textShadow = '0 2px 8px #000, 0 0 2px #fff';
    budgetDisplay.style.textAlign = 'center';
    document.body.insertBefore(budgetDisplay, document.body.children[2]);
  }
  budgetDisplay.textContent = `Budget: $${parseInt(playerBudget, 10)}`;
}

// Restore the old chip selector
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
    selector.style.fontSize = '1.2rem';
    selector.style.padding = '8px 18px';
    selector.style.borderRadius = '8px';
    selector.style.background = '#222';
    selector.style.color = '#ffd700';
    selector.style.border = '2px solid #ffd700';
    selector.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    selector.style.outline = 'none';
    selector.style.fontWeight = 'bold';
    selector.addEventListener('change', e => {
      currentBetAmount = parseInt(e.target.value, 10) || 10;
    });
    const label = document.createElement('label');
    label.textContent = 'Choose Chip:';
    label.htmlFor = 'chip-selector';
    label.style.fontSize = '1.2rem';
    label.style.color = '#fff';
    label.style.fontWeight = 'bold';
    label.style.marginRight = '10px';
    label.style.letterSpacing = '1px';
    label.style.verticalAlign = 'middle';
    const formDiv = document.createElement('div');
    formDiv.style.display = 'flex';
    formDiv.style.alignItems = 'center';
    formDiv.style.justifyContent = 'center';
    formDiv.style.gap = '8px';
    formDiv.style.marginBottom = '18px';
    formDiv.appendChild(label);
    formDiv.appendChild(selector);
    const tableContainer = document.getElementById('betting-table-container');
    if (tableContainer) {
      tableContainer.insertAdjacentElement('beforebegin', formDiv);
    } else {
      document.body.insertBefore(formDiv, document.body.firstChild);
    }
  }
}
createChipSelector();
updateBudgetDisplay();

// Remove the custom chip selection area if present
const chipArea = document.getElementById('chip-selection-area');
if (chipArea) chipArea.remove();

// Helper to check if a bet already exists on a field
function betExistsOnField(value) {
  return currentBets.some(bet => bet.value === value);
}

// Helper to show/hide betting table and roulette wheel
function showBettingTable() {
  document.getElementById('betting-table-container').style.display = '';
  const rouletteContainer = document.getElementById('roulette-container');
  rouletteContainer.style.display = 'none';
  rouletteContainer.style.marginTop = '';
  const chipSelector = document.getElementById('chip-selector');
  if (chipSelector) chipSelector.parentElement.style.display = '';
}
function showRouletteWheel() {
  document.getElementById('betting-table-container').style.display = 'none';
  const rouletteContainer = document.getElementById('roulette-container');
  rouletteContainer.style.display = '';
  rouletteContainer.style.marginTop = '40px';
  const chipSelector = document.getElementById('chip-selector');
  if (chipSelector) chipSelector.parentElement.style.display = 'none';
}

// Show betting table by default
showBettingTable();

// Place or remove a chip (toggle bet) on click
function placeOrRemoveChip(x, y, numberOrColor) {
  const betAmount = parseInt(currentBetAmount, 10) || 10;
  const betIdx = currentBets.findIndex(bet => bet.value === numberOrColor);
  if (betIdx !== -1) {
    // Remove bet and refund
    playerBudget += currentBets[betIdx].amount;
    currentBets.splice(betIdx, 1);
    updateBudgetDisplay();
    renderChips();
    betInfo.textContent = typeof numberOrColor === 'number' ? `Bet removed from number ${numberOrColor}` : `Bet removed from color ${numberOrColor}`;
    return;
  }
  if (playerBudget < betAmount) {
    betInfo.textContent = 'Not enough budget!';
    return;
  }
  // Add bet and deduct
  currentBets.push({
    type: typeof numberOrColor === 'number' ? 'number' : 'color',
    value: numberOrColor,
    amount: betAmount
  });
  playerBudget -= betAmount;
  updateBudgetDisplay();
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
      // Use the same logic as in drawBettingTable and getNumberFromTableClick
      const colorFieldY = tableMargin + cellH * 3 + 20;
      const colorFieldW = cellW * cols;
      const colorFieldH = 40;
      const halfW = colorFieldW / 2;
      let colorIdx = bet.value === 'black' ? 1 : 0;
      chipX = tableMargin + cellW + colorIdx * halfW + halfW / 2;
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
  const colorFieldW = cellW * cols;
  const colorFieldH = 40;
  const colorFieldY = tableMargin + cellH * 3 + 20;
  const halfW = colorFieldW / 2;
  const colorFields = [
    { color: 'red', x: tableMargin + cellW },
    { color: 'black', x: tableMargin + cellW + halfW }
  ];
  for (const field of colorFields) {
    if (
      x >= field.x && x <= field.x + halfW &&
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
  showRouletteWheel();
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
  let winDetails = [];
  let lossDetails = [];
  let winType = null; // For animation
  let winOnZero = false;
  currentBets.forEach(bet => {
    let win = false;
    let payout = 0;
    if (bet.type === 'number' && bet.value === resultNum) {
      win = true;
      payout = bet.amount * 36;
      if (bet.value === 0) winOnZero = true;
      winType = winOnZero ? 'zero' : 'number';
    } else if (bet.type === 'color' && bet.value === resultColor) {
      win = true;
      payout = bet.amount * 2;
      if (!winType) winType = 'color';
    }
    if (win) {
      totalWin += payout;
      winDetails.push(`${bet.type === 'number' ? bet.value : bet.value.charAt(0).toUpperCase() + bet.value.slice(1)} ($${bet.amount} → $${payout})`);
    } else {
      lossDetails.push(`${bet.type === 'number' ? bet.value : bet.value.charAt(0).toUpperCase() + bet.value.slice(1)} ($${bet.amount})`);
    }
  });
  // Only add winnings, do not subtract losses again
  playerBudget = parseInt(playerBudget, 10) + totalWin;
  updateBudgetDisplay();
  if (winDetails.length) {
    msg += ` — Win: ${winDetails.join(', ')}`;
  }
  if (lossDetails.length) {
    msg += ` — Lose: ${lossDetails.join(', ')}`;
  }
  betInfo.textContent = msg;
  // Animation logic
  let animType = 'loss';
  if (winOnZero) {
    animType = 'zero';
  } else if (winType === 'number') {
    animType = 'number';
  } else if (winType === 'color') {
    animType = 'color';
  }
  // Play animation, then after it finishes, hide wheel and show table
  showWinAnim(animType, animType === 'loss' ? 0 : totalWin, () => {
    // Remove chips after spin
    chipsContainer.innerHTML = '';
    currentBets = [];
    // Show betting table again after animation
    showBettingTable();
  });
}

// Show win/loss animation overlay
function showWinAnim(type, amount, onDone) {
  const overlay = document.getElementById('win-anim-overlay');
  overlay.innerHTML = '';
  let content = document.createElement('div');
  content.className = 'win-anim-content';
  if (type === 'loss') {
    content.innerHTML = '<span class="win-anim-sad">😢<br>Better luck next time!</span>';
    overlay.style.background = 'rgba(33,150,243,0.18)';
  } else if (type === 'color') {
    content.innerHTML = '<span class="win-anim-happy">🎉<br>Nice! You won by color!<br>+$' + amount + '</span>';
    overlay.style.background = 'rgba(67,160,71,0.18)';
    confettiEffect(30, '#43a047');
  } else if (type === 'number') {
    content.innerHTML = '<span class="win-anim-jackpot">🎊<br>Jackpot! Number win!<br>+$' + amount + '</span>';
    overlay.style.background = 'rgba(255,215,0,0.18)';
    confettiEffect(60, '#ffd700');
  } else if (type === 'zero') {
    content.innerHTML = '<span class="win-anim-crown">👑</span><span class="win-anim-jackpot">JACKPOT!<br>Zero Win!<br>+$' + amount + '</span>';
    overlay.style.background = 'rgba(255,255,0,0.25)';
    confettiEffect(100, '#ffd700', '#fff700', '#e63946');
  }
  overlay.appendChild(content);
  overlay.classList.add('active');
  setTimeout(() => {
    overlay.classList.remove('active');
    overlay.innerHTML = '';
    overlay.style.background = 'transparent';
    if (typeof onDone === 'function') onDone();
  }, 2200);
}
// Expose showWinAnim globally for F12 console
window.showWinAnim = showWinAnim;

// Simple confetti effect using emojis
function confettiEffect(count, ...colors) {
  const overlay = document.getElementById('win-anim-overlay');
  for (let i = 0; i < count; i++) {
    const conf = document.createElement('div');
    conf.textContent = Math.random() > 0.5 ? '🎉' : '✨';
    conf.style.position = 'fixed';
    conf.style.left = Math.random() * 100 + 'vw';
    conf.style.top = '-40px';
    conf.style.fontSize = (Math.random() * 1.2 + 1.2) + 'rem';
    conf.style.zIndex = 2100;
    conf.style.pointerEvents = 'none';
    conf.style.transition = 'transform 1.7s cubic-bezier(.23,1.02,.64,1), opacity 1.7s';
    conf.style.color = colors[Math.floor(Math.random() * colors.length)] || '#ffd700';
    overlay.appendChild(conf);
    setTimeout(() => {
      conf.style.transform = 'translateY(' + (window.innerHeight * 0.8 + Math.random() * 60) + 'px) rotate(' + (Math.random() * 360) + 'deg)';
      conf.style.opacity = 0;
    }, 30 + Math.random() * 200);
    setTimeout(() => {
      conf.remove();
    }, 1700);
  }
}

// Hide the original betting form
function hideOriginalBettingForm() {
  ['bet-form', 'bet-type', 'bet-number', 'bet-color', 'bet-info'].forEach(id => {
    const el = document.getElementById(id);
    if (el && el.id === id) el.style.display = 'none';
  });
}
// Hide the original betting form interface on load and after UI updates
hideOriginalBettingForm();

// After UI changes that might show the form again, call hideOriginalBettingForm
showBettingTable = (function(orig) {
  return function() {
    orig.apply(this, arguments);
    hideOriginalBettingForm();
  };
})(showBettingTable);
