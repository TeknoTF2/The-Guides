// Firewall Breach Game Logic

// Ambient sound using Web Audio API for seamless looping
let audioContext;
let ambientBuffer;
let ambientSource;
let gainNode;

async function loadAmbientSound() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        gainNode = audioContext.createGain();
        gainNode.gain.value = 0.3;
        gainNode.connect(audioContext.destination);
        const response = await fetch('sounds/crt-hum.mp3');
        const arrayBuffer = await response.arrayBuffer();
        ambientBuffer = await audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
        console.log('Could not load ambient sound:', error);
    }
}

function startAmbientSound() {
    if (!audioContext || !ambientBuffer) return;
    if (audioContext.state === 'suspended') audioContext.resume();
    if (ambientSource) return;
    ambientSource = audioContext.createBufferSource();
    ambientSource.buffer = ambientBuffer;
    ambientSource.loop = true;
    ambientSource.connect(gainNode);
    ambientSource.start(0);
}

// Game configuration
const DIFFICULTY_CONFIG = {
    low: {
        gridSize: 15,
        minPackets: 5,
        maxPackets: 8,
        antivirusCount: 2,
        name: 'LOW FIREWALL',
        antivirusSpeed: 2
    },
    standard: {
        gridSize: 20,
        minPackets: 10,
        maxPackets: 15,
        antivirusCount: 3,
        name: 'STANDARD FIREWALL',
        antivirusSpeed: 3
    },
    high: {
        gridSize: 25,
        minPackets: 15,
        maxPackets: 20,
        antivirusCount: 4,
        name: 'HIGH FIREWALL',
        antivirusSpeed: 4
    }
};

// Game constants
const CELL_SIZE = 20;
const WALL = 1;
const PATH = 0;
const PLAYER_COLOR = '#00ff41';
const WALL_COLOR = '#003311';
const PATH_COLOR = '#001100';
const PACKET_COLOR = '#00ff41';
const ANTIVIRUS_COLOR = '#ff4444';

// Game state
let currentDifficulty = null;
let canvas, ctx;
let maze = [];
let player = { x: 0, y: 0 };
let packets = [];
let antiviruses = [];
let currentPacketNumber = 1;
let totalPackets = 0;
let collectedPackets = 0;
let gameRunning = false;
let gamePhase = 'difficulty'; // difficulty, ready, playing, won, lost
let lastMoveTime = 0;
let moveDelay = 150; // ms between moves
let animationFrame = 0;

// Keyboard state
let keys = {};

// DOM elements
const difficultyScreen = document.getElementById('difficulty-screen');
const gameScreen = document.getElementById('game-screen');
const gameCanvas = document.getElementById('game-canvas');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const messageDisplay = document.getElementById('message-display');
const currentDifficultyDisplay = document.getElementById('current-difficulty');
const nextPacketDisplay = document.getElementById('next-packet');
const packetsCollectedDisplay = document.getElementById('packets-collected');
const gameStatusDisplay = document.getElementById('game-status');

// Initialize game
function init() {
    canvas = gameCanvas;
    ctx = canvas.getContext('2d');

    setupDifficultySelection();
    setupGameControls();
    setupKeyboardControls();
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

// Select difficulty and initialize
function selectDifficulty(difficulty) {
    currentDifficulty = DIFFICULTY_CONFIG[difficulty];

    // Update UI
    difficultyScreen.classList.remove('active');
    gameScreen.classList.add('active');

    // Update HUD
    currentDifficultyDisplay.textContent = currentDifficulty.name;
    gameStatusDisplay.textContent = 'READY TO BREACH';

    // Setup canvas
    const canvasSize = currentDifficulty.gridSize * CELL_SIZE;
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    // Initialize game
    generateMaze();
    placePlayer();
    placePackets();
    placeAntiviruses();

    updateHUD();
    render();

    gamePhase = 'ready';
}

// Generate maze using recursive backtracking
function generateMaze() {
    const size = currentDifficulty.gridSize;

    // Initialize maze with walls
    maze = Array(size).fill().map(() => Array(size).fill(WALL));

    // Carve paths using recursive backtracking
    const stack = [];
    const startX = 1;
    const startY = 1;

    maze[startY][startX] = PATH;
    stack.push({ x: startX, y: startY });

    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const neighbors = getUnvisitedNeighbors(current.x, current.y);

        if (neighbors.length > 0) {
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];

            // Remove wall between current and next
            const wallX = current.x + (next.x - current.x) / 2;
            const wallY = current.y + (next.y - current.y) / 2;
            maze[wallY][wallX] = PATH;
            maze[next.y][next.x] = PATH;

            stack.push(next);
        } else {
            stack.pop();
        }
    }

    // Add some random openings for more interesting gameplay
    for (let i = 0; i < size * 2; i++) {
        const x = Math.floor(Math.random() * (size - 2)) + 1;
        const y = Math.floor(Math.random() * (size - 2)) + 1;
        if (maze[y][x] === WALL && hasAdjacentPaths(x, y)) {
            maze[y][x] = PATH;
        }
    }
}

// Get unvisited neighbors for maze generation
function getUnvisitedNeighbors(x, y) {
    const neighbors = [];
    const directions = [
        { x: 0, y: -2 }, // up
        { x: 2, y: 0 },  // right
        { x: 0, y: 2 },  // down
        { x: -2, y: 0 }  // left
    ];

    for (const dir of directions) {
        const newX = x + dir.x;
        const newY = y + dir.y;

        if (newX > 0 && newX < maze[0].length - 1 &&
            newY > 0 && newY < maze.length - 1 &&
            maze[newY][newX] === WALL) {
            neighbors.push({ x: newX, y: newY });
        }
    }

    return neighbors;
}

// Check if cell has adjacent paths
function hasAdjacentPaths(x, y) {
    let pathCount = 0;
    const directions = [
        { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }
    ];

    for (const dir of directions) {
        const newX = x + dir.x;
        const newY = y + dir.y;

        if (newX >= 0 && newX < maze[0].length &&
            newY >= 0 && newY < maze.length &&
            maze[newY][newX] === PATH) {
            pathCount++;
        }
    }

    return pathCount >= 2;
}

// Place player at start
function placePlayer() {
    // Find a path cell near top-left
    for (let y = 1; y < maze.length; y++) {
        for (let x = 1; x < maze[0].length; x++) {
            if (maze[y][x] === PATH) {
                player.x = x;
                player.y = y;
                return;
            }
        }
    }
}

// Place numbered packets
function placePackets() {
    packets = [];
    const packetCount = Math.floor(
        Math.random() * (currentDifficulty.maxPackets - currentDifficulty.minPackets + 1) +
        currentDifficulty.minPackets
    );
    totalPackets = packetCount;
    collectedPackets = 0;
    currentPacketNumber = 1;

    const pathCells = [];
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[0].length; x++) {
            if (maze[y][x] === PATH &&
                (Math.abs(x - player.x) > 3 || Math.abs(y - player.y) > 3)) {
                pathCells.push({ x, y });
            }
        }
    }

    // Shuffle and select packet locations
    pathCells.sort(() => Math.random() - 0.5);

    for (let i = 0; i < packetCount && i < pathCells.length; i++) {
        packets.push({
            x: pathCells[i].x,
            y: pathCells[i].y,
            number: i + 1,
            collected: false
        });
    }
}

// Place antiviruses
function placeAntiviruses() {
    antiviruses = [];

    const pathCells = [];
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[0].length; x++) {
            if (maze[y][x] === PATH &&
                (Math.abs(x - player.x) > 5 || Math.abs(y - player.y) > 5)) {
                pathCells.push({ x, y });
            }
        }
    }

    pathCells.sort(() => Math.random() - 0.5);

    for (let i = 0; i < currentDifficulty.antivirusCount && i < pathCells.length; i++) {
        antiviruses.push({
            x: pathCells[i].x,
            y: pathCells[i].y,
            direction: Math.floor(Math.random() * 4), // 0: up, 1: right, 2: down, 3: left
            moveCounter: 0
        });
    }
}

// Setup game controls
function setupGameControls() {
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', restartGame);
}

// Setup keyboard controls
function setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            keys[e.key] = true;
        }
    });

    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });
}

// Start game
function startGame() {
    if (gamePhase !== 'ready') return;

    gamePhase = 'playing';
    gameRunning = true;
    gameStatusDisplay.textContent = 'BREACHING...';
    startBtn.disabled = true;
    messageDisplay.innerHTML = '';

    gameLoop();
}

// Restart game
function restartGame() {
    // Reset to difficulty selection
    gameRunning = false;
    gamePhase = 'difficulty';

    gameScreen.classList.remove('active');
    difficultyScreen.classList.add('active');

    restartBtn.classList.add('hidden');
    startBtn.disabled = false;
    startBtn.classList.remove('hidden');
    messageDisplay.innerHTML = '';
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;

    const now = Date.now();

    // Handle player movement
    if (now - lastMoveTime > moveDelay) {
        handlePlayerMovement();
        moveAntiviruses();
        checkCollisions();
        lastMoveTime = now;
    }

    animationFrame++;
    render();

    requestAnimationFrame(gameLoop);
}

// Handle player movement
function handlePlayerMovement() {
    let newX = player.x;
    let newY = player.y;

    if (keys['ArrowUp']) newY--;
    else if (keys['ArrowDown']) newY++;
    else if (keys['ArrowLeft']) newX--;
    else if (keys['ArrowRight']) newX++;

    // Check if move is valid
    if (newX !== player.x || newY !== player.y) {
        if (canMoveTo(newX, newY)) {
            player.x = newX;
            player.y = newY;
            checkPacketCollection();
        }
    }
}

// Check if can move to position
function canMoveTo(x, y) {
    if (x < 0 || x >= maze[0].length || y < 0 || y >= maze.length) {
        return false;
    }
    return maze[y][x] === PATH;
}

// Check packet collection
function checkPacketCollection() {
    for (const packet of packets) {
        if (packet.x === player.x && packet.y === player.y && !packet.collected) {
            if (packet.number === currentPacketNumber) {
                // Correct packet
                packet.collected = true;
                collectedPackets++;
                currentPacketNumber++;
                updateHUD();

                // Check win condition
                if (collectedPackets === totalPackets) {
                    winGame();
                }
            }
            // Wrong packet - do nothing (must collect in order)
        }
    }
}

// Move antiviruses
function moveAntiviruses() {
    for (const av of antiviruses) {
        av.moveCounter++;

        // Move every N frames based on speed
        if (av.moveCounter >= (10 - currentDifficulty.antivirusSpeed)) {
            av.moveCounter = 0;

            // Try to move in current direction
            const directions = [
                { x: 0, y: -1 }, // up
                { x: 1, y: 0 },  // right
                { x: 0, y: 1 },  // down
                { x: -1, y: 0 }  // left
            ];

            let moved = false;
            let attempts = 0;

            while (!moved && attempts < 4) {
                const dir = directions[av.direction];
                const newX = av.x + dir.x;
                const newY = av.y + dir.y;

                if (canMoveTo(newX, newY)) {
                    av.x = newX;
                    av.y = newY;
                    moved = true;

                    // Randomly change direction sometimes
                    if (Math.random() < 0.1) {
                        av.direction = Math.floor(Math.random() * 4);
                    }
                } else {
                    // Change direction if can't move
                    av.direction = (av.direction + 1) % 4;
                    attempts++;
                }
            }
        }
    }
}

// Check collisions
function checkCollisions() {
    for (const av of antiviruses) {
        if (av.x === player.x && av.y === player.y) {
            loseGame();
            return;
        }
    }
}

// Win game
function winGame() {
    gameRunning = false;
    gamePhase = 'won';
    gameStatusDisplay.textContent = 'ACCESS GRANTED';

    showMessage('ACCESS GRANTED', 'success', 'ALL PACKETS EXTRACTED SUCCESSFULLY');

    startBtn.classList.add('hidden');
    restartBtn.classList.remove('hidden');
}

// Lose game
function loseGame() {
    gameRunning = false;
    gamePhase = 'lost';
    gameStatusDisplay.textContent = 'ACCESS DENIED';

    showMessage('ACCESS DENIED', 'failure', 'ANTIVIRUS DETECTION - BREACH TERMINATED');

    startBtn.classList.add('hidden');
    restartBtn.classList.remove('hidden');
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

// Update HUD
function updateHUD() {
    nextPacketDisplay.textContent = currentPacketNumber <= totalPackets ?
        `#${currentPacketNumber}` : 'NONE';
    packetsCollectedDisplay.textContent = `${collectedPackets} / ${totalPackets}`;
}

// Render game
function render() {
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw maze
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[0].length; x++) {
            if (maze[y][x] === WALL) {
                ctx.fillStyle = WALL_COLOR;
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

                // Add grid lines for walls
                ctx.strokeStyle = '#004422';
                ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            } else {
                ctx.fillStyle = PATH_COLOR;
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }

    // Draw packets
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const packet of packets) {
        if (!packet.collected) {
            const x = packet.x * CELL_SIZE + CELL_SIZE / 2;
            const y = packet.y * CELL_SIZE + CELL_SIZE / 2;

            // Pulsing effect for next packet
            if (packet.number === currentPacketNumber) {
                const pulse = Math.sin(animationFrame * 0.1) * 0.3 + 0.7;
                ctx.globalAlpha = pulse;

                // Glow effect
                ctx.shadowBlur = 10;
                ctx.shadowColor = PACKET_COLOR;
            } else {
                ctx.globalAlpha = 0.5;
                ctx.shadowBlur = 0;
            }

            // Draw packet circle
            ctx.fillStyle = PACKET_COLOR;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();

            // Draw packet number
            ctx.fillStyle = '#000000';
            ctx.fillText(packet.number, x, y);

            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }
    }

    // Draw antiviruses
    for (const av of antiviruses) {
        const x = av.x * CELL_SIZE + CELL_SIZE / 2;
        const y = av.y * CELL_SIZE + CELL_SIZE / 2;

        // Pulsing red effect
        const pulse = Math.sin(animationFrame * 0.15) * 0.3 + 0.7;
        ctx.globalAlpha = pulse;

        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = ANTIVIRUS_COLOR;

        // Draw antivirus diamond
        ctx.fillStyle = ANTIVIRUS_COLOR;
        ctx.beginPath();
        ctx.moveTo(x, y - 8);
        ctx.lineTo(x + 8, y);
        ctx.lineTo(x, y + 8);
        ctx.lineTo(x - 8, y);
        ctx.closePath();
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }

    // Draw player
    const px = player.x * CELL_SIZE + CELL_SIZE / 2;
    const py = player.y * CELL_SIZE + CELL_SIZE / 2;

    ctx.shadowBlur = 10;
    ctx.shadowColor = PLAYER_COLOR;
    ctx.fillStyle = PLAYER_COLOR;
    ctx.beginPath();
    ctx.arc(px, py, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
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
document.addEventListener('DOMContentLoaded', async function() {
    // Load and start ambient sound
    await loadAmbientSound();
    startAmbientSound();

    init();
    addRandomGlitches();
    addScreenFlicker();
});
