import { CasinoClient, ClientEvent } from "casino-sdk";

// SDK setup
const urlParams = new URLSearchParams(window.location.search);
const wsUrl = urlParams.get("wsUrl") || "ws://localhost:9000";
const token = urlParams.get("token") || "dev";
const session = parseInt(urlParams.get("session") || "0");
const useSDK = (urlParams.get("usesdk") || "").length > 0;

const client = useSDK
    ? new CasinoClient(wsUrl, {
          authenticateFromLocalStorage: false,
          clientType: "game-sdk",
          token,
          session,
      })
    : null;

if (useSDK) {
    client.on(ClientEvent.AUTH_SUCCESS, () => {
        client.sendGameFinishedLoading();
    });
}

// European roulette numbers and colors
const numbers = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];
const colors = [
  'green', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black'
];

// Game variables
let canvas, ctx, radius, center, segmentAngle;
let currentRotation = 0;
let spinning = false;
let currentBets = [];
let playerBudget = 1000;
let currentBetAmount = 10;

// DOM elements
let tableCanvas, tableCtx, chipsContainer, betInfo, spinBtn;

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();

    // SDK connection and wallet integration
    if (client) {
        client.connect();
        client.casino.wallet.store.subscribe((wallet) => {
            playerBudget = wallet.NetworthCents / 100;
            updateBudgetDisplay();
        });
    }
});

function initializeGame() {
    // Get canvas elements
    canvas = document.getElementById('roulette-wheel');
    ctx = canvas.getContext('2d');
    radius = canvas.width / 2;
    center = { x: radius, y: radius };
    segmentAngle = 2 * Math.PI / numbers.length;

    tableCanvas = document.getElementById('betting-table');
    tableCtx = tableCanvas.getContext('2d');
    chipsContainer = document.getElementById('chips-container');
    betInfo = document.getElementById('bet-info');
    spinBtn = document.getElementById('spin-btn');

    // Initialize UI components
    createChipSelector();
    updateBudgetDisplay();
    drawBettingTable();
    drawWheel();
    hideOriginalBettingForm();
    showBettingTable();

    // Event listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Spin button
    spinBtn.addEventListener('click', spinWheel);

    // Table click for betting
    tableCanvas.addEventListener('click', handleTableClick);
}

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

function drawBettingTable() {
  // Table layout constants
  const tableMargin = 20;
  const cellW = 60;
  const cellH = 50;
  const rows = 3;
  const cols = 12;
  const zeroCell = { x: 0, y: 0, w: cellW, h: cellH * 3 };

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

  // Draw color fields (red, black)
  const colorFieldY = tableMargin + cellH * 3 + 20;
  const colorFieldW = cellW * cols;
  const colorFieldH = 40;
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

// SDK transaction helper
async function processTransaction(amount, isWin) {
    if (!client) return;

    try {
        if (isWin) {
            await client.casino.wallet.addFunds(amount);
        } else {
            await client.casino.wallet.removeFunds(amount);
        }
    } catch (error) {
        console.error("Transaction failed:", error);
    }
}

function handleTableClick(e) {
  const rect = tableCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const result = getNumberFromTableClick(x, y);
  if (typeof result === 'number' && result !== null) {
    placeOrRemoveChip(x, y, result);
  } else if (typeof result === 'string') {
    placeOrRemoveChip(x, y, result);
  }
}

function getNumberFromTableClick(x, y) {
  const tableMargin = 20;
  const cellW = 60;
  const cellH = 50;
  const cols = 12;
  const zeroCell = { x: 0, y: 0, w: cellW, h: cellH * 3 };

  // Check 0 cell
  const zeroX = zeroCell.x + tableMargin;
  const zeroY = zeroCell.y + tableMargin;
  if (x >= zeroX && x < zeroX + zeroCell.w && y >= zeroY && y < zeroY + zeroCell.h) {
    return 0;
  }

  // Check number grid (1-36)
  if (x >= tableMargin + cellW && x < tableMargin + cellW * 13 && y >= tableMargin && y < tableMargin + cellH * 3) {
    const col = Math.floor((x - (tableMargin + cellW)) / cellW);
    const row = Math.floor((y - tableMargin) / cellH);
    const idx = col * 3 + row + 1;
    if (idx >= 1 && idx <= 36) {
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
  return null;
}

async function placeOrRemoveChip(x, y, numberOrColor) {
  const betAmount = parseInt(currentBetAmount, 10) || 10;
  const betIdx = currentBets.findIndex(bet => bet.value === numberOrColor);

  if (betIdx !== -1) {
    // Remove bet and refund
    playerBudget += currentBets[betIdx].amount;
    currentBets.splice(betIdx, 1);
    await processTransaction(currentBets[betIdx].amount, true);
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
  await processTransaction(betAmount, false);
  updateBudgetDisplay();
  renderChips();
  betInfo.textContent = typeof numberOrColor === 'number' ? `Bet placed on number ${numberOrColor} ($${betAmount})` : `Bet placed on color ${numberOrColor} ($${betAmount})`;
}

function renderChips() {
  chipsContainer.innerHTML = '';
  const tableMargin = 20;
  const cellW = 60;
  const cellH = 50;

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
      const colorFieldW = cellW * 12;
      const colorFieldH = 40;
      const colorFieldY = tableMargin + cellH * 3 + 20;
      const halfW = colorFieldW / 2;
      let colorIdx = 0;
      if (bet.value === 'black') colorIdx = 1;
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

    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.style.left = `${chipX + offsetX - 16}px`;
    chip.style.top = `${chipY + offsetY - 16}px`;
    chip.style.background = chipColor;
    chip.textContent = bet.amount;
    chipsContainer.appendChild(chip);
  });
}

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

function getResultIndex() {
  let angle = (Math.PI * 1.5 - currentRotation) % (2 * Math.PI);
  if (angle < 0) angle += 2 * Math.PI;
  const index = Math.floor(angle / segmentAngle) % numbers.length;
  return index;
}

async function showResultMulti() {
  const idx = getResultIndex();
  const resultNum = numbers[idx];
  const resultColor = colors[idx];
  let msg = `Result: ${resultNum} (${resultColor})`;
  let totalWin = 0;
  let totalLoss = 0;
  let winDetails = [];
  let lossDetails = [];
  let winType = null;
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
      totalLoss += bet.amount;
      lossDetails.push(`${bet.type === 'number' ? bet.value : bet.value.charAt(0).toUpperCase() + bet.value.slice(1)} ($${bet.amount})`);
    }
  });

  playerBudget = parseInt(playerBudget, 10) + totalWin - totalLoss;

  // Process SDK transactions
  if (totalWin > 0) {
    await processTransaction(totalWin, true);
  }

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

  showWinAnim(animType, animType === 'loss' ? totalLoss : totalWin, () => {
    chipsContainer.innerHTML = '';
    currentBets = [];
    showBettingTable();
  });
}

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

function hideOriginalBettingForm() {
  ['bet-form', 'bet-type', 'bet-number', 'bet-color'].forEach(id => {
    const el = document.getElementById(id);
    if (el && el.id === id) el.style.display = 'none';
  });
}

// Expose showWinAnim globally for F12 console
window.showWinAnim = showWinAnim;
