// Code Injection Game Logic

// Difficulty configuration
const DIFFICULTY_CONFIG = {
    low: {
        speed: 6000,  // ms to travel from bottom to top
        totalCommands: 15,
        minLength: 2,
        maxLength: 4,
        spawnInterval: 2500,  // ms between spawns
        name: 'LOW SPEED'
    },
    standard: {
        speed: 4500,
        totalCommands: 25,
        minLength: 3,
        maxLength: 6,
        spawnInterval: 2000,
        name: 'STANDARD SPEED'
    },
    high: {
        speed: 3000,
        totalCommands: 40,
        minLength: 4,
        maxLength: 8,
        spawnInterval: 1500,
        name: 'HIGH SPEED'
    }
};

// Arrow key mapping
const ARROW_KEYS = {
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→'
};

const ARROW_KEYS_REVERSE = {
    '↑': 'ArrowUp',
    '↓': 'ArrowDown',
    '←': 'ArrowLeft',
    '→': 'ArrowRight'
};

// Game state
let currentDifficulty = null;
let prompts = [];
let activePrompts = [];
let currentInput = '';
let totalCommands = 0;
let injectedCount = 0;
let missedCount = 0;
let spawnedCount = 0;
let gameRunning = false;
let gamePhase = 'difficulty';
let spawnInterval = null;
let maxMissedAllowed = 5;

// DOM elements
const difficultyScreen = document.getElementById('difficulty-screen');
const gameScreen = document.getElementById('game-screen');
const playArea = document.getElementById('play-area');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const messageDisplay = document.getElementById('message-display');
const currentDifficultyDisplay = document.getElementById('current-difficulty');
const injectedCountDisplay = document.getElementById('injected-count');
const missedCountDisplay = document.getElementById('missed-count');
const gameStatusDisplay = document.getElementById('game-status');
const currentInputDisplay = document.getElementById('current-input');

// Initialize game
function init() {
    setupDifficultySelection();
    setupGameControls();
    setupKeyboardInput();
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

    // Update UI
    difficultyScreen.classList.remove('active');
    gameScreen.classList.add('active');

    // Update HUD
    currentDifficultyDisplay.textContent = currentDifficulty.name;
    gameStatusDisplay.textContent = 'READY TO INJECT';
    totalCommands = currentDifficulty.totalCommands;
    injectedCountDisplay.textContent = `0 / ${totalCommands}`;
    missedCountDisplay.textContent = '0';

    // Generate all prompts for this game
    generatePrompts();

    gamePhase = 'ready';
}

// Generate prompts
function generatePrompts() {
    prompts = [];

    for (let i = 0; i < totalCommands; i++) {
        const length = Math.floor(
            Math.random() * (currentDifficulty.maxLength - currentDifficulty.minLength + 1) +
            currentDifficulty.minLength
        );

        // 50/50 chance of letter or arrow prompt
        const isArrow = Math.random() < 0.5;

        let sequence = '';
        if (isArrow) {
            // Generate arrow sequence
            const arrows = Object.values(ARROW_KEYS);
            for (let j = 0; j < length; j++) {
                sequence += arrows[Math.floor(Math.random() * arrows.length)];
            }
        } else {
            // Generate letter sequence
            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            for (let j = 0; j < length; j++) {
                sequence += letters[Math.floor(Math.random() * letters.length)];
            }
        }

        prompts.push({
            id: i,
            sequence: sequence,
            isArrow: isArrow,
            spawned: false
        });
    }
}

// Setup game controls
function setupGameControls() {
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', restartGame);
}

// Setup keyboard input
function setupKeyboardInput() {
    document.addEventListener('keydown', handleKeyPress);
}

// Handle key press
function handleKeyPress(e) {
    if (!gameRunning) return;

    // Prevent default for arrow keys
    if (Object.keys(ARROW_KEYS).includes(e.key)) {
        e.preventDefault();
    }

    // Handle special keys
    if (e.key === 'Escape') {
        clearInput();
        return;
    }

    if (e.key === 'Enter') {
        submitInput();
        return;
    }

    // Handle arrow keys
    if (Object.keys(ARROW_KEYS).includes(e.key)) {
        currentInput += ARROW_KEYS[e.key];
        updateInputDisplay();
        checkInput();
        return;
    }

    // Handle letter keys
    if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
        currentInput += e.key.toUpperCase();
        updateInputDisplay();
        checkInput();
        return;
    }
}

// Update input display
function updateInputDisplay() {
    currentInputDisplay.textContent = currentInput || '_';
    currentInputDisplay.classList.remove('error');
}

// Clear input
function clearInput() {
    currentInput = '';
    updateInputDisplay();

    // Remove active state from all prompts
    activePrompts.forEach(prompt => {
        const element = document.getElementById(`prompt-${prompt.id}`);
        if (element) {
            element.classList.remove('active');
            const progress = element.querySelector('.input-progress');
            if (progress) progress.remove();
        }
    });
}

// Submit input (optional - can also auto-submit on match)
function submitInput() {
    // Input is checked automatically as you type
    clearInput();
}

// Check input against active prompts
function checkInput() {
    if (!currentInput) return;

    let foundMatch = false;

    // Check all active prompts
    for (const prompt of activePrompts) {
        const element = document.getElementById(`prompt-${prompt.id}`);
        if (!element) continue;

        // Check if current input matches the start of the sequence
        if (prompt.sequence.startsWith(currentInput)) {
            foundMatch = true;

            // Mark as active
            element.classList.add('active');

            // Show progress
            updatePromptProgress(element, currentInput);

            // Check if complete match
            if (currentInput === prompt.sequence) {
                injectCommand(prompt);
                return;
            }

            break;  // Only match one prompt at a time
        }
    }

    // If no match found, show error
    if (!foundMatch) {
        currentInputDisplay.classList.add('error');
        setTimeout(() => {
            clearInput();
        }, 300);
    }
}

// Update prompt progress display
function updatePromptProgress(element, input) {
    let progress = element.querySelector('.input-progress');
    if (!progress) {
        progress = document.createElement('div');
        progress.className = 'input-progress';
        element.appendChild(progress);
    }
    progress.textContent = input;
}

// Inject command successfully
function injectCommand(prompt) {
    const element = document.getElementById(`prompt-${prompt.id}`);

    // Remove from active list
    activePrompts = activePrompts.filter(p => p.id !== prompt.id);

    // Animate success
    if (element) {
        element.classList.add('matched');
        element.classList.remove('active');

        setTimeout(() => {
            element.remove();
        }, 300);
    }

    // Update stats
    injectedCount++;
    updateStats();

    // Clear input
    clearInput();

    // Check win condition
    if (injectedCount >= totalCommands) {
        winGame();
    }
}

// Start game
function startGame() {
    if (gamePhase !== 'ready') return;

    gamePhase = 'playing';
    gameRunning = true;
    gameStatusDisplay.textContent = 'INJECTING...';
    startBtn.classList.add('hidden');
    messageDisplay.innerHTML = '';

    // Reset stats
    spawnedCount = 0;
    injectedCount = 0;
    missedCount = 0;
    activePrompts = [];
    currentInput = '';
    updateStats();
    updateInputDisplay();

    // Start spawning prompts
    startSpawning();
}

// Start spawning prompts
function startSpawning() {
    spawnInterval = setInterval(() => {
        if (spawnedCount < prompts.length) {
            spawnPrompt(prompts[spawnedCount]);
            spawnedCount++;
        } else {
            clearInterval(spawnInterval);
        }
    }, currentDifficulty.spawnInterval);

    // Spawn first one immediately
    if (prompts.length > 0) {
        spawnPrompt(prompts[0]);
        spawnedCount++;
    }
}

// Spawn a prompt
function spawnPrompt(prompt) {
    const element = document.createElement('div');
    element.id = `prompt-${prompt.id}`;
    element.className = 'prompt';
    if (prompt.isArrow) {
        element.classList.add('arrow-prompt');
    }
    element.textContent = prompt.sequence;

    // Position at bottom
    element.style.bottom = '0px';

    playArea.appendChild(element);
    activePrompts.push(prompt);

    // Animate upward
    animatePrompt(element, prompt);
}

// Animate prompt upward
function animatePrompt(element, prompt) {
    const startTime = Date.now();
    const duration = currentDifficulty.speed;
    const startBottom = 0;
    const endBottom = playArea.clientHeight + 50;  // Move past the top

    function animate() {
        if (!gameRunning) {
            element.remove();
            return;
        }

        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress >= 1) {
            // Prompt escaped
            missPrompt(prompt, element);
            return;
        }

        // Update position
        const currentBottom = startBottom + (endBottom - startBottom) * progress;
        element.style.bottom = currentBottom + 'px';

        requestAnimationFrame(animate);
    }

    animate();
}

// Miss a prompt
function missPrompt(prompt, element) {
    // Remove from active list
    activePrompts = activePrompts.filter(p => p.id !== prompt.id);

    // Animate missed
    if (element && element.parentNode) {
        element.classList.add('missed');

        setTimeout(() => {
            element.remove();
        }, 500);
    }

    // Update stats
    missedCount++;
    updateStats();

    // Check lose condition
    if (missedCount >= maxMissedAllowed) {
        loseGame();
    }
}

// Update stats
function updateStats() {
    injectedCountDisplay.textContent = `${injectedCount} / ${totalCommands}`;
    missedCountDisplay.textContent = missedCount;
}

// Win game
function winGame() {
    gameRunning = false;
    gamePhase = 'won';
    gameStatusDisplay.textContent = 'ACCESS GRANTED';

    if (spawnInterval) {
        clearInterval(spawnInterval);
    }

    // Remove all remaining prompts
    activePrompts.forEach(prompt => {
        const element = document.getElementById(`prompt-${prompt.id}`);
        if (element) element.remove();
    });

    showMessage('ACCESS GRANTED', 'success', `SUCCESSFULLY INJECTED ${injectedCount} COMMANDS`);

    restartBtn.classList.remove('hidden');
}

// Lose game
function loseGame() {
    gameRunning = false;
    gamePhase = 'lost';
    gameStatusDisplay.textContent = 'ACCESS DENIED';

    if (spawnInterval) {
        clearInterval(spawnInterval);
    }

    // Remove all remaining prompts
    activePrompts.forEach(prompt => {
        const element = document.getElementById(`prompt-${prompt.id}`);
        if (element) element.remove();
    });

    showMessage('ACCESS DENIED', 'failure', `TOO MANY COMMANDS ESCAPED (${missedCount} MISSED)`);

    restartBtn.classList.remove('hidden');
}

// Restart game
function restartGame() {
    // Reset to difficulty selection
    gameRunning = false;
    gamePhase = 'difficulty';

    if (spawnInterval) {
        clearInterval(spawnInterval);
    }

    gameScreen.classList.remove('active');
    difficultyScreen.classList.add('active');

    restartBtn.classList.add('hidden');
    startBtn.classList.remove('hidden');
    messageDisplay.innerHTML = '';

    // Clear play area
    playArea.innerHTML = '';

    // Reset state
    prompts = [];
    activePrompts = [];
    currentInput = '';
    injectedCount = 0;
    missedCount = 0;
    spawnedCount = 0;
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
