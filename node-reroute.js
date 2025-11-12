// Node Reroute Game Logic

// Node type definitions
// Each node type has connections in each rotation (0-3)
// Connections: [north, east, south, west] where true = connected
const NODE_TYPES = {
    'I': [ // Straight pipe
        [true, false, true, false],   // 0° (vertical)
        [false, true, false, true],   // 90° (horizontal)
        [true, false, true, false],   // 180° (vertical)
        [false, true, false, true]    // 270° (horizontal)
    ],
    'L': [ // Corner pipe
        [true, true, false, false],   // 0° (north-east)
        [false, true, true, false],   // 90° (east-south)
        [false, false, true, true],   // 180° (south-west)
        [true, false, false, true]    // 270° (west-north)
    ],
    'T': [ // T-junction
        [true, true, true, false],    // 0° (north-east-south)
        [false, true, true, true],    // 90° (east-south-west)
        [true, false, true, true],    // 180° (south-west-north)
        [true, true, false, true]     // 270° (west-north-east)
    ],
    'X': [ // Cross (all directions)
        [true, true, true, true],     // All rotations same
        [true, true, true, true],
        [true, true, true, true],
        [true, true, true, true]
    ]
};

// Difficulty configuration
const DIFFICULTY_CONFIG = {
    low: {
        gridSize: 5,
        timeLimit: 120,
        name: 'LOW COMPLEXITY'
    },
    standard: {
        gridSize: 7,
        timeLimit: 180,
        name: 'STANDARD COMPLEXITY'
    },
    high: {
        gridSize: 9,
        timeLimit: 240,
        name: 'HIGH COMPLEXITY'
    }
};

// Premade puzzles (3 per difficulty)
const PUZZLES = {
    low: [
        // Puzzle 1
        {
            grid: [
                [null, null, {type:'I',rot:0,locked:false}, null, null],
                [null, {type:'L',rot:1,locked:false}, {type:'L',rot:2,locked:true}, null, null],
                [{type:'L',rot:0,locked:false}, {type:'L',rot:3,locked:false}, {type:'I',rot:0,locked:false}, {type:'L',rot:1,locked:false}, {type:'L',rot:2,locked:false}],
                [null, null, {type:'L',rot:0,locked:true}, {type:'L',rot:3,locked:false}, null],
                [null, null, {type:'I',rot:0,locked:false}, null, null]
            ],
            source: {x: 2, y: 0},
            destination: {x: 2, y: 4}
        },
        // Puzzle 2
        {
            grid: [
                [null, null, {type:'I',rot:0,locked:false}, null, null],
                [null, {type:'L',rot:0,locked:false}, {type:'T',rot:2,locked:false}, {type:'L',rot:1,locked:true}, null],
                [null, {type:'I',rot:1,locked:false}, null, {type:'I',rot:0,locked:false}, null],
                [null, {type:'L',rot:3,locked:true}, {type:'I',rot:1,locked:false}, {type:'L',rot:2,locked:false}, null],
                [null, null, {type:'I',rot:0,locked:false}, null, null]
            ],
            source: {x: 2, y: 0},
            destination: {x: 2, y: 4}
        },
        // Puzzle 3
        {
            grid: [
                [null, {type:'I',rot:0,locked:false}, null, null, null],
                [{type:'L',rot:0,locked:false}, {type:'L',rot:2,locked:true}, null, {type:'L',rot:0,locked:false}, {type:'L',rot:1,locked:false}],
                [{type:'I',rot:0,locked:false}, null, {type:'L',rot:0,locked:false}, {type:'L',rot:3,locked:false}, {type:'I',rot:0,locked:false}],
                [{type:'L',rot:3,locked:false}, {type:'L',rot:1,locked:true}, {type:'L',rot:2,locked:false}, null, {type:'I',rot:0,locked:false}],
                [null, null, null, null, {type:'I',rot:0,locked:false}]
            ],
            source: {x: 1, y: 0},
            destination: {x: 4, y: 4}
        }
    ],
    standard: [
        // Puzzle 1
        {
            grid: [
                [null, null, null, {type:'I',rot:0,locked:false}, null, null, null],
                [null, {type:'L',rot:0,locked:false}, {type:'L',rot:1,locked:false}, {type:'T',rot:2,locked:false}, {type:'L',rot:1,locked:true}, {type:'L',rot:2,locked:false}, null],
                [null, {type:'I',rot:0,locked:false}, null, {type:'I',rot:0,locked:false}, null, {type:'I',rot:0,locked:false}, null],
                [null, {type:'L',rot:3,locked:false}, {type:'I',rot:1,locked:true}, {type:'X',rot:0,locked:false}, {type:'I',rot:1,locked:false}, {type:'L',rot:2,locked:false}, null],
                [null, null, null, {type:'I',rot:0,locked:false}, null, {type:'I',rot:0,locked:false}, null],
                [null, null, null, {type:'L',rot:3,locked:true}, {type:'I',rot:1,locked:false}, {type:'L',rot:2,locked:false}, null],
                [null, null, null, null, null, {type:'I',rot:0,locked:false}, null]
            ],
            source: {x: 3, y: 0},
            destination: {x: 5, y: 6}
        },
        // Puzzle 2
        {
            grid: [
                [null, null, {type:'I',rot:0,locked:false}, null, null, null, null],
                [null, {type:'L',rot:0,locked:false}, {type:'T',rot:1,locked:false}, {type:'L',rot:1,locked:false}, {type:'L',rot:2,locked:true}, null, null],
                [{type:'L',rot:0,locked:false}, {type:'L',rot:3,locked:false}, null, {type:'L',rot:0,locked:false}, {type:'T',rot:2,locked:false}, {type:'L',rot:1,locked:false}, {type:'L',rot:2,locked:false}],
                [{type:'I',rot:0,locked:false}, null, null, {type:'I',rot:0,locked:true}, null, null, {type:'I',rot:0,locked:false}],
                [{type:'T',rot:0,locked:false}, {type:'I',rot:1,locked:false}, {type:'L',rot:1,locked:false}, {type:'L',rot:2,locked:false}, null, {type:'L',rot:3,locked:true}, {type:'L',rot:2,locked:false}],
                [{type:'L',rot:3,locked:false}, {type:'L',rot:1,locked:false}, {type:'L',rot:2,locked:false}, null, null, null, null],
                [null, null, {type:'I',rot:0,locked:false}, null, null, null, null]
            ],
            source: {x: 2, y: 0},
            destination: {x: 2, y: 6}
        },
        // Puzzle 3
        {
            grid: [
                [null, null, null, null, {type:'I',rot:0,locked:false}, null, null],
                [null, {type:'L',rot:0,locked:false}, {type:'I',rot:1,locked:true}, {type:'L',rot:1,locked:false}, {type:'L',rot:2,locked:false}, null, null],
                [{type:'L',rot:0,locked:false}, {type:'L',rot:3,locked:false}, null, null, {type:'L',rot:3,locked:false}, {type:'L',rot:1,locked:false}, {type:'L',rot:2,locked:false}],
                [{type:'I',rot:0,locked:false}, null, {type:'L',rot:0,locked:false}, {type:'I',rot:1,locked:false}, {type:'L',rot:2,locked:true}, null, {type:'I',rot:0,locked:false}],
                [{type:'T',rot:0,locked:false}, {type:'L',rot:1,locked:false}, {type:'T',rot:1,locked:false}, {type:'L',rot:1,locked:false}, {type:'L',rot:2,locked:false}, null, {type:'I',rot:0,locked:false}],
                [{type:'L',rot:3,locked:true}, {type:'L',rot:1,locked:false}, {type:'L',rot:2,locked:false}, null, null, null, {type:'L',rot:3,locked:false}],
                [null, null, null, null, null, null, {type:'I',rot:0,locked:false}]
            ],
            source: {x: 4, y: 0},
            destination: {x: 6, y: 6}
        }
    ],
    high: [
        // Puzzle 1
        {
            grid: [
                [null, null, null, null, {type:'I',rot:0,locked:false}, null, null, null, null],
                [null, {type:'L',rot:0,locked:false}, {type:'I',rot:1,locked:false}, {type:'L',rot:1,locked:false}, {type:'T',rot:2,locked:false}, {type:'L',rot:1,locked:true}, {type:'L',rot:2,locked:false}, null, null],
                [null, {type:'I',rot:0,locked:false}, null, null, {type:'L',rot:3,locked:false}, {type:'T',rot:1,locked:false}, {type:'L',rot:2,locked:false}, null, null],
                [{type:'L',rot:0,locked:false}, {type:'L',rot:2,locked:true}, null, {type:'L',rot:0,locked:false}, {type:'I',rot:1,locked:false}, {type:'L',rot:2,locked:false}, null, {type:'L',rot:0,locked:false}, {type:'L',rot:1,locked:false}],
                [{type:'I',rot:0,locked:false}, null, {type:'L',rot:0,locked:false}, {type:'T',rot:3,locked:false}, null, null, null, {type:'I',rot:0,locked:false}, {type:'I',rot:0,locked:false}],
                [{type:'T',rot:0,locked:false}, {type:'I',rot:1,locked:true}, {type:'T',rot:1,locked:false}, {type:'T',rot:1,locked:false}, {type:'L',rot:1,locked:false}, {type:'L',rot:2,locked:false}, null, {type:'L',rot:3,locked:false}, {type:'L',rot:2,locked:false}],
                [{type:'L',rot:3,locked:false}, {type:'L',rot:1,locked:false}, {type:'L',rot:2,locked:false}, null, null, null, {type:'L',rot:0,locked:true}, {type:'I',rot:1,locked:false}, null],
                [null, null, null, null, null, null, {type:'L',rot:3,locked:false}, {type:'L',rot:1,locked:false}, {type:'L',rot:2,locked:false}],
                [null, null, null, null, null, null, null, null, {type:'I',rot:0,locked:false}]
            ],
            source: {x: 4, y: 0},
            destination: {x: 8, y: 8}
        },
        // Puzzle 2
        {
            grid: [
                [null, null, {type:'I',rot:0,locked:false}, null, null, null, null, null, null],
                [null, {type:'L',rot:0,locked:false}, {type:'T',rot:1,locked:false}, {type:'L',rot:1,locked:true}, {type:'L',rot:2,locked:false}, null, null, null, null],
                [{type:'L',rot:0,locked:false}, {type:'L',rot:3,locked:false}, null, null, {type:'L',rot:3,locked:false}, {type:'I',rot:1,locked:false}, {type:'L',rot:1,locked:false}, {type:'L',rot:2,locked:false}, null],
                [{type:'I',rot:0,locked:false}, null, {type:'L',rot:0,locked:false}, {type:'I',rot:1,locked:false}, {type:'T',rot:3,locked:false}, null, null, {type:'I',rot:0,locked:true}, null],
                [{type:'T',rot:0,locked:false}, {type:'I',rot:1,locked:false}, {type:'T',rot:1,locked:false}, {type:'L',rot:1,locked:false}, {type:'T',rot:2,locked:false}, {type:'I',rot:1,locked:false}, {type:'L',rot:1,locked:false}, {type:'L',rot:2,locked:false}, null],
                [{type:'L',rot:3,locked:true}, {type:'L',rot:1,locked:false}, {type:'L',rot:2,locked:false}, null, {type:'L',rot:3,locked:false}, {type:'L',rot:1,locked:false}, {type:'L',rot:2,locked:false}, null, null],
                [null, null, null, null, null, null, {type:'L',rot:3,locked:false}, {type:'L',rot:1,locked:false}, {type:'L',rot:2,locked:false}],
                [null, null, null, null, null, null, null, null, {type:'L',rot:3,locked:true}],
                [null, null, null, null, null, null, null, null, {type:'I',rot:0,locked:false}]
            ],
            source: {x: 2, y: 0},
            destination: {x: 8, y: 8}
        },
        // Puzzle 3
        {
            grid: [
                [null, null, null, {type:'I',rot:0,locked:false}, null, null, null, null, null],
                [null, null, {type:'L',rot:0,locked:false}, {type:'T',rot:1,locked:false}, {type:'L',rot:1,locked:false}, {type:'L',rot:2,locked:true}, null, null, null],
                [null, {type:'L',rot:0,locked:false}, {type:'X',rot:0,locked:false}, null, null, {type:'L',rot:3,locked:false}, {type:'I',rot:1,locked:false}, {type:'L',rot:1,locked:false}, {type:'L',rot:2,locked:false}],
                [{type:'L',rot:0,locked:false}, {type:'T',rot:1,locked:false}, {type:'L',rot:2,locked:false}, null, {type:'L',rot:0,locked:false}, {type:'L',rot:3,locked:false}, null, null, {type:'I',rot:0,locked:false}],
                [{type:'I',rot:0,locked:true}, null, null, {type:'L',rot:0,locked:false}, {type:'X',rot:0,locked:false}, {type:'L',rot:1,locked:false}, {type:'L',rot:2,locked:false}, null, {type:'I',rot:0,locked:false}],
                [{type:'T',rot:0,locked:false}, {type:'I',rot:1,locked:false}, {type:'L',rot:1,locked:true}, {type:'T',rot:1,locked:false}, {type:'T',rot:1,locked:false}, {type:'L',rot:2,locked:false}, null, null, {type:'L',rot:3,locked:false}],
                [{type:'L',rot:3,locked:false}, {type:'L',rot:1,locked:false}, {type:'L',rot:2,locked:false}, null, null, null, null, null, {type:'L',rot:3,locked:false}],
                [null, null, null, null, null, null, null, null, {type:'L',rot:3,locked:false}],
                [null, null, null, null, null, null, null, null, {type:'I',rot:0,locked:false}]
            ],
            source: {x: 3, y: 0},
            destination: {x: 8, y: 8}
        }
    ]
};

// Game state
let currentDifficulty = null;
let currentPuzzleIndex = 0;
let currentPuzzle = null;
let grid = [];
let timeRemaining = 0;
let timerInterval = null;
let gameRunning = false;
let gamePhase = 'difficulty';

// DOM elements
const difficultyScreen = document.getElementById('difficulty-screen');
const gameScreen = document.getElementById('game-screen');
const gameGrid = document.getElementById('game-grid');
const startBtn = document.getElementById('start-btn');
const verifyBtn = document.getElementById('verify-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const messageDisplay = document.getElementById('message-display');
const currentDifficultyDisplay = document.getElementById('current-difficulty');
const timerDisplay = document.getElementById('timer-display');
const puzzleNumberDisplay = document.getElementById('puzzle-number');
const gameStatusDisplay = document.getElementById('game-status');

// Initialize game
function init() {
    setupDifficultySelection();
    setupGameControls();
}

// Setup difficulty selection
function setupDifficultySelection() {
    const difficultyOptions = document.querySelectorAll('.difficulty-option');

    difficultyOptions.forEach(option => {
        option.addEventListener('click', function() {
            const difficulty = this.getAttribute('data-difficulty');
            selectDifficulty(difficulty);
        });

        option.setAttribute('tabindex', '0');
        option.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const difficulty = this.getAttribute('data-difficulty');
                selectDifficulty(difficulty);
            }
        });
    });
}

// Select difficulty
function selectDifficulty(difficulty) {
    currentDifficulty = DIFFICULTY_CONFIG[difficulty];
    currentPuzzleIndex = 0;

    // Update UI
    difficultyScreen.classList.remove('active');
    gameScreen.classList.add('active');

    // Update HUD
    currentDifficultyDisplay.textContent = currentDifficulty.name;
    gameStatusDisplay.textContent = 'READY TO REROUTE';

    // Load first puzzle
    loadPuzzle(difficulty, currentPuzzleIndex);

    gamePhase = 'ready';
}

// Load puzzle
function loadPuzzle(difficulty, index) {
    currentPuzzle = PUZZLES[difficulty][index];
    grid = JSON.parse(JSON.stringify(currentPuzzle.grid)); // Deep copy

    // Update puzzle number display
    puzzleNumberDisplay.textContent = `${index + 1} / 3`;

    // Render grid
    renderGrid();

    // Reset timer display
    timeRemaining = currentDifficulty.timeLimit;
    updateTimerDisplay();
}

// Render grid
function renderGrid() {
    gameGrid.innerHTML = '';
    gameGrid.className = `game-grid grid-${currentDifficulty.gridSize}x${currentDifficulty.gridSize}`;

    for (let y = 0; y < currentDifficulty.gridSize; y++) {
        for (let x = 0; x < currentDifficulty.gridSize; x++) {
            const cell = document.createElement('div');
            cell.className = 'node-cell';
            cell.dataset.x = x;
            cell.dataset.y = y;

            const node = grid[y][x];

            // Check if this is source or destination
            if (currentPuzzle.source.x === x && currentPuzzle.source.y === y) {
                cell.classList.add('source');
            } else if (currentPuzzle.destination.x === x && currentPuzzle.destination.y === y) {
                cell.classList.add('destination');
            }

            if (node) {
                if (node.locked) {
                    cell.classList.add('locked');
                }

                // Render pipes
                renderPipes(cell, node);

                // Add click handler for rotation
                if (!node.locked) {
                    cell.addEventListener('click', () => rotateNode(x, y));
                }
            }

            gameGrid.appendChild(cell);
        }
    }
}

// Render pipes for a node
function renderPipes(cell, node) {
    // Clear existing pipes
    cell.querySelectorAll('.pipe').forEach(p => p.remove());

    const connections = NODE_TYPES[node.type][node.rot];
    const [north, east, south, west] = connections;

    // Add center piece for multi-connection nodes
    if ((north + east + south + west) > 1) {
        const center = document.createElement('div');
        center.className = 'pipe pipe-center';
        cell.appendChild(center);
    }

    // Add directional pipes
    if (north) {
        const pipe = document.createElement('div');
        pipe.className = 'pipe pipe-n';
        cell.appendChild(pipe);
    }
    if (east) {
        const pipe = document.createElement('div');
        pipe.className = 'pipe pipe-e';
        cell.appendChild(pipe);
    }
    if (south) {
        const pipe = document.createElement('div');
        pipe.className = 'pipe pipe-s';
        cell.appendChild(pipe);
    }
    if (west) {
        const pipe = document.createElement('div');
        pipe.className = 'pipe pipe-w';
        cell.appendChild(pipe);
    }
}

// Rotate node
function rotateNode(x, y) {
    if (!gameRunning) return;

    const node = grid[y][x];
    if (!node || node.locked) return;

    // Rotate 90 degrees
    node.rot = (node.rot + 1) % 4;

    // Update visual
    const cell = gameGrid.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    cell.classList.add('rotating');

    setTimeout(() => {
        cell.classList.remove('rotating');
        renderPipes(cell, node);
    }, 300);
}

// Setup game controls
function setupGameControls() {
    startBtn.addEventListener('click', startGame);
    verifyBtn.addEventListener('click', verifyConnection);
    nextBtn.addEventListener('click', loadNextPuzzle);
    restartBtn.addEventListener('click', restartGame);
}

// Start game
function startGame() {
    if (gamePhase !== 'ready') return;

    gamePhase = 'playing';
    gameRunning = true;
    gameStatusDisplay.textContent = 'REROUTING...';
    startBtn.classList.add('hidden');
    verifyBtn.classList.remove('hidden');
    messageDisplay.innerHTML = '';

    // Start timer
    startTimer();
}

// Start timer
function startTimer() {
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();

        if (timeRemaining <= 0) {
            loseGame('TIME EXPIRED');
        }
    }, 1000);
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Change color based on time remaining
    timerDisplay.classList.remove('warning', 'danger');
    if (timeRemaining <= 30) {
        timerDisplay.classList.add('danger');
    } else if (timeRemaining <= 60) {
        timerDisplay.classList.add('warning');
    }
}

// Verify connection
function verifyConnection() {
    if (!gameRunning) return;

    const isConnected = checkConnection();

    if (isConnected) {
        stopTimer();
        winPuzzle();
    } else {
        showMessage('INVALID PATH', 'failure', 'CONNECTION NOT ESTABLISHED');
        setTimeout(() => {
            messageDisplay.innerHTML = '';
        }, 2000);
    }
}

// Check if path is connected
function checkConnection() {
    const visited = new Set();
    const queue = [];

    // Start from source
    const source = currentPuzzle.source;
    queue.push({ x: source.x, y: source.y });
    visited.add(`${source.x},${source.y}`);

    while (queue.length > 0) {
        const current = queue.shift();
        const node = grid[current.y][current.x];

        if (!node) continue;

        // Get connections for current node
        const connections = NODE_TYPES[node.type][node.rot];
        const [north, east, south, west] = connections;

        // Check all four directions
        const directions = [
            { dx: 0, dy: -1, canGo: north, needsConnection: 2 },  // north (need south connection)
            { dx: 1, dy: 0, canGo: east, needsConnection: 3 },    // east (need west connection)
            { dx: 0, dy: 1, canGo: south, needsConnection: 0 },   // south (need north connection)
            { dx: -1, dy: 0, canGo: west, needsConnection: 1 }    // west (need east connection)
        ];

        for (const dir of directions) {
            if (!dir.canGo) continue;

            const newX = current.x + dir.dx;
            const newY = current.y + dir.dy;

            // Check bounds
            if (newX < 0 || newX >= currentDifficulty.gridSize ||
                newY < 0 || newY >= currentDifficulty.gridSize) {
                continue;
            }

            const key = `${newX},${newY}`;
            if (visited.has(key)) continue;

            const nextNode = grid[newY][newX];
            if (!nextNode) continue;

            // Check if next node has corresponding connection
            const nextConnections = NODE_TYPES[nextNode.type][nextNode.rot];
            if (nextConnections[dir.needsConnection]) {
                visited.add(key);
                queue.push({ x: newX, y: newY });

                // Check if we reached destination
                if (newX === currentPuzzle.destination.x &&
                    newY === currentPuzzle.destination.y) {
                    // Activate flow animation
                    activateFlow(visited);
                    return true;
                }
            }
        }
    }

    return false;
}

// Activate flow animation
function activateFlow(visitedCells) {
    visitedCells.forEach(key => {
        const [x, y] = key.split(',').map(Number);
        const cell = gameGrid.querySelector(`[data-x="${x}"][data-y="${y}"]`);
        if (cell) {
            cell.querySelectorAll('.pipe').forEach(pipe => {
                pipe.classList.add('active');
            });
        }
    });
}

// Stop timer
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Win puzzle
function winPuzzle() {
    gameRunning = false;
    gamePhase = 'won';
    gameStatusDisplay.textContent = 'CONNECTION VERIFIED';

    showMessage('CONNECTION ESTABLISHED', 'success', 'DATA STREAM REROUTED');

    verifyBtn.classList.add('hidden');

    // Check if there are more puzzles
    if (currentPuzzleIndex < 2) {
        nextBtn.classList.remove('hidden');
    } else {
        // All puzzles completed
        setTimeout(() => {
            showMessage('ALL PUZZLES COMPLETE', 'success', 'ACCESS GRANTED');
            restartBtn.classList.remove('hidden');
        }, 2000);
    }
}

// Load next puzzle
function loadNextPuzzle() {
    currentPuzzleIndex++;
    loadPuzzle(Object.keys(DIFFICULTY_CONFIG).find(k => DIFFICULTY_CONFIG[k] === currentDifficulty), currentPuzzleIndex);

    gamePhase = 'ready';
    messageDisplay.innerHTML = '';
    nextBtn.classList.add('hidden');
    startBtn.classList.remove('hidden');
    gameStatusDisplay.textContent = 'READY TO REROUTE';

    // Reset timer
    timeRemaining = currentDifficulty.timeLimit;
    updateTimerDisplay();
}

// Lose game
function loseGame(reason) {
    gameRunning = false;
    gamePhase = 'lost';
    stopTimer();
    gameStatusDisplay.textContent = 'ACCESS DENIED';

    showMessage('ACCESS DENIED', 'failure', reason);

    verifyBtn.classList.add('hidden');
    restartBtn.classList.remove('hidden');
}

// Restart game
function restartGame() {
    // Reset to difficulty selection
    gameRunning = false;
    gamePhase = 'difficulty';
    stopTimer();

    gameScreen.classList.remove('active');
    difficultyScreen.classList.add('active');

    restartBtn.classList.add('hidden');
    nextBtn.classList.add('hidden');
    verifyBtn.classList.add('hidden');
    startBtn.classList.remove('hidden');
    messageDisplay.innerHTML = '';
}

// Show message
function showMessage(mainText, type = 'info', subText = '') {
    messageDisplay.innerHTML = '';

    const messageText = document.createElement('div');
    messageText.className = `message-text ${type}`;
    messageText.textContent = mainText;
    messageDisplay.appendChild(messageText);

    if (subText) {
        const messageSubText = document.createElement('div');
        messageSubText.className = 'message-subtext';
        messageSubText.textContent = subText;
        messageDisplay.appendChild(messageSubText);
    }
}

// Add random glitch effects
function addRandomGlitches() {
    setInterval(() => {
        if (Math.random() > 0.95) {
            const header = document.querySelector('.header-text');
            if (header) {
                header.style.animation = 'glitch 0.3s';
                setTimeout(() => {
                    header.style.animation = '';
                }, 300);
            }
        }
    }, 2000);
}

// Add ambient screen flicker
function addScreenFlicker() {
    const scanlines = document.querySelectorAll('.scanlines');

    setInterval(() => {
        if (Math.random() > 0.98) {
            scanlines.forEach(scanline => {
                scanline.style.opacity = Math.random() * 0.3 + 0.7;
            });

            setTimeout(() => {
                scanlines.forEach(scanline => {
                    scanline.style.opacity = 1;
                });
            }, 50);
        }
    }, 100);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    init();
    addRandomGlitches();
    addScreenFlicker();
});
