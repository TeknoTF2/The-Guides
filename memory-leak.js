// Memory Leak Game Logic

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
        gridSize: 3,
        minNodes: 4,
        maxNodes: 6,
        displayTime: 3000,
        name: 'LOW SECURITY'
    },
    standard: {
        gridSize: 5,
        minNodes: 6,
        maxNodes: 12,
        displayTime: 6000,
        name: 'STANDARD SECURITY'
    },
    high: {
        gridSize: 7,
        minNodes: 13,
        maxNodes: 20,
        displayTime: 10000,
        name: 'HIGH SECURITY'
    }
};

// Game state
let currentDifficulty = null;
let correctPattern = new Set();
let playerPattern = new Set();
let gamePhase = 'difficulty'; // difficulty, ready, displaying, playing, result

// DOM elements
const difficultyScreen = document.getElementById('difficulty-screen');
const gameScreen = document.getElementById('game-screen');
const gameGrid = document.getElementById('game-grid');
const injectBtn = document.getElementById('inject-btn');
const resetBtn = document.getElementById('reset-btn');
const messageDisplay = document.getElementById('message-display');
const currentDifficultyDisplay = document.getElementById('current-difficulty');
const gridSizeDisplay = document.getElementById('grid-size');
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

        // Keyboard support
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

// Select difficulty and start game
function selectDifficulty(difficulty) {
    currentDifficulty = DIFFICULTY_CONFIG[difficulty];

    // Update UI
    difficultyScreen.classList.remove('active');
    gameScreen.classList.add('active');

    // Update game info
    currentDifficultyDisplay.textContent = currentDifficulty.name;
    gridSizeDisplay.textContent = `${currentDifficulty.gridSize}x${currentDifficulty.gridSize}`;
    gameStatusDisplay.textContent = 'AWAITING INJECTION';

    // Create grid
    createGrid();

    // Reset game state
    gamePhase = 'ready';
    correctPattern.clear();
    playerPattern.clear();
    injectBtn.disabled = false;
    messageDisplay.innerHTML = '';
}

// Create game grid
function createGrid() {
    gameGrid.innerHTML = '';
    gameGrid.className = `game-grid grid-${currentDifficulty.gridSize}x${currentDifficulty.gridSize}`;

    const totalCells = currentDifficulty.gridSize * currentDifficulty.gridSize;

    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell disabled';
        cell.setAttribute('data-index', i);

        cell.addEventListener('click', () => handleCellClick(i));

        gameGrid.appendChild(cell);
    }
}

// Setup game controls
function setupGameControls() {
    injectBtn.addEventListener('click', startInjection);
    resetBtn.addEventListener('click', resetToReady);
}

// Start injection (show pattern)
function startInjection() {
    if (gamePhase !== 'ready') return;

    gamePhase = 'displaying';
    gameStatusDisplay.textContent = 'INJECTING PATTERN...';
    injectBtn.disabled = true;

    // Generate random pattern
    generatePattern();

    // Display pattern
    displayPattern();

    // Hide pattern after display time
    setTimeout(() => {
        hidePattern();
        startPlayerTurn();
    }, currentDifficulty.displayTime);

    // Add countdown timer
    showCountdown(currentDifficulty.displayTime);
}

// Generate random pattern
function generatePattern() {
    correctPattern.clear();

    const totalCells = currentDifficulty.gridSize * currentDifficulty.gridSize;
    const nodeCount = Math.floor(
        Math.random() * (currentDifficulty.maxNodes - currentDifficulty.minNodes + 1) +
        currentDifficulty.minNodes
    );

    // Generate unique random positions
    while (correctPattern.size < nodeCount) {
        const randomIndex = Math.floor(Math.random() * totalCells);
        correctPattern.add(randomIndex);
    }
}

// Display pattern to player
function displayPattern() {
    const cells = gameGrid.querySelectorAll('.grid-cell');

    cells.forEach((cell, index) => {
        if (correctPattern.has(index)) {
            cell.classList.add('green');
        } else {
            cell.classList.add('red');
        }
    });
}

// Hide pattern
function hidePattern() {
    const cells = gameGrid.querySelectorAll('.grid-cell');

    cells.forEach(cell => {
        cell.classList.remove('green', 'red');
    });
}

// Show countdown timer
function showCountdown(duration) {
    const timerElement = document.createElement('div');
    timerElement.className = 'countdown-timer';
    gameGrid.style.position = 'relative';
    gameGrid.appendChild(timerElement);

    let remaining = Math.ceil(duration / 1000);
    timerElement.textContent = remaining;

    const interval = setInterval(() => {
        remaining--;
        if (remaining > 0) {
            timerElement.textContent = remaining;
        } else {
            clearInterval(interval);
            timerElement.remove();
        }
    }, 1000);
}

// Start player turn
function startPlayerTurn() {
    gamePhase = 'playing';
    gameStatusDisplay.textContent = 'RECREATE PATTERN';
    playerPattern.clear();

    // Enable cells for clicking
    const cells = gameGrid.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
        cell.classList.remove('disabled');
    });

    // Show message
    showMessage('Recreate the pattern you saw', 'info');
}

// Handle cell click
function handleCellClick(index) {
    if (gamePhase !== 'playing') return;

    const cell = gameGrid.querySelector(`[data-index="${index}"]`);

    // Check if this cell was in the correct pattern
    if (correctPattern.has(index)) {
        // Correct cell
        if (!playerPattern.has(index)) {
            playerPattern.add(index);
            cell.classList.add('selected');

            // Check if player completed the pattern
            if (playerPattern.size === correctPattern.size) {
                setTimeout(() => {
                    handleSuccess();
                }, 500);
            }
        }
    } else {
        // Wrong cell - game over
        cell.classList.add('wrong');
        handleFailure();
    }
}

// Handle success
function handleSuccess() {
    gamePhase = 'result';
    gameStatusDisplay.textContent = 'ACCESS GRANTED';

    // Show all correct cells
    const cells = gameGrid.querySelectorAll('.grid-cell');
    cells.forEach((cell, index) => {
        cell.classList.add('disabled');
        if (correctPattern.has(index)) {
            cell.classList.add('green');
        }
    });

    // Show success message
    showMessage('ACCESS GRANTED', 'success', 'PATTERN SUCCESSFULLY REPLICATED');

    // Show reset button
    resetBtn.classList.remove('hidden');
}

// Handle failure
function handleFailure() {
    gamePhase = 'result';
    gameStatusDisplay.textContent = 'ACCESS DENIED';

    // Disable all cells
    const cells = gameGrid.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
        cell.classList.add('disabled');
    });

    // Show failure message
    showMessage('ACCESS DENIED', 'failure', 'INCORRECT PATTERN DETECTED');

    // Show reset button after delay
    setTimeout(() => {
        resetBtn.classList.remove('hidden');
    }, 1500);
}

// Show message in message display
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

// Reset to ready state
function resetToReady() {
    gamePhase = 'ready';
    gameStatusDisplay.textContent = 'AWAITING INJECTION';

    // Clear patterns
    correctPattern.clear();
    playerPattern.clear();

    // Reset grid
    const cells = gameGrid.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
        cell.className = 'grid-cell disabled';
    });

    // Reset controls
    injectBtn.disabled = false;
    resetBtn.classList.add('hidden');

    // Clear message
    messageDisplay.innerHTML = '';
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
    // Load ambient sound
    await loadAmbientSound();

    // Start ambient sound on first user interaction (required by browser autoplay policy)
    const startAudioOnInteraction = () => {
        startAmbientSound();
        document.removeEventListener('click', startAudioOnInteraction);
        document.removeEventListener('keydown', startAudioOnInteraction);
    };
    document.addEventListener('click', startAudioOnInteraction);
    document.addEventListener('keydown', startAudioOnInteraction);

    init();
    addRandomGlitches();
    addScreenFlicker();
});
