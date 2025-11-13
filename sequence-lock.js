// Sequence Lock Game Logic

// Ambient sound using Web Audio API for seamless looping
let audioContext;
let ambientBuffer;
let ambientSource;
let gainNode;

async function loadAmbientSound() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        gainNode = audioContext.createGain();
        gainNode.gain.value = 0.5; // Increased volume for PC speakers
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

// Difficulty configuration
const DIFFICULTY_CONFIG = {
    low: {
        tumblerCount: 3,
        timeLimit: 45,
        fadeDelay: 4000, // 4 seconds before fade starts
        name: 'BASIC'
    },
    standard: {
        tumblerCount: 4,
        timeLimit: 60,
        fadeDelay: 3000, // 3 seconds
        name: 'STANDARD'
    },
    high: {
        tumblerCount: 5,
        timeLimit: 75,
        fadeDelay: 2500, // 2.5 seconds
        name: 'ADVANCED'
    }
};

// Game state
let currentDifficulty = null;
let tumblers = [];
let timeRemaining = 0;
let timerInterval = null;
let gameRunning = false;
let isDragging = false;
let currentTumbler = null;
let startAngle = 0;

// DOM elements
const difficultyScreen = document.getElementById('difficulty-screen');
const gameScreen = document.getElementById('game-screen');
const resultsScreen = document.getElementById('results-screen');

const currentDifficultyDisplay = document.getElementById('current-difficulty');
const timerDisplay = document.getElementById('timer-display');
const checkmarksList = document.getElementById('checkmarks-list');
const circlesContainer = document.getElementById('circles-container');
const messageDisplay = document.getElementById('message-display');

const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const retryBtn = document.getElementById('retry-btn');
const menuBtn = document.getElementById('menu-btn');
const backBtn = document.getElementById('back-btn');

const resultsStatus = document.getElementById('results-status');
const resultsScore = document.getElementById('results-score');
const resultsMessage = document.getElementById('results-message');

// Initialize game
function init() {
    setupDifficultySelection();
    setupEventListeners();
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
    timeRemaining = currentDifficulty.timeLimit;
    updateTimerDisplay();

    // Create lock mechanism
    createLock();
}

// Create lock with tumblers
function createLock() {
    circlesContainer.innerHTML = '';
    checkmarksList.innerHTML = '';
    tumblers = [];

    const baseSize = 400; // Size of largest circle
    const sizeDecrement = 70; // How much smaller each circle gets

    for (let i = 0; i < currentDifficulty.tumblerCount; i++) {
        const size = baseSize - (i * sizeDecrement);
        const circle = createTumbler(size, i);

        tumblers.push({
            element: circle,
            rotation: 0,
            correctNumber: Math.floor(Math.random() * 10),
            fadeTimeout: null,
            isAligned: false,
            isFading: false,
            checkmarkElement: null
        });

        circlesContainer.appendChild(circle);

        // Create checkmark box
        const checkmark = document.createElement('div');
        checkmark.className = 'checkmark-box';
        checkmark.textContent = '';
        tumblers[i].checkmarkElement = checkmark;
        checkmarksList.appendChild(checkmark);
    }
}

// Create a single tumbler circle
function createTumbler(size, index) {
    const circle = document.createElement('div');
    circle.className = 'tumbler-circle';
    circle.style.width = `${size}px`;
    circle.style.height = `${size}px`;
    circle.style.transform = `translate(-50%, -50%)`;
    circle.dataset.index = index;

    // Add numbers around the circle
    for (let num = 0; num < 10; num++) {
        const numberElement = document.createElement('div');
        numberElement.className = 'tumbler-number';
        numberElement.textContent = num;

        // Position number around circle
        const angle = (num * 36) - 90; // 36 degrees apart, -90 to start at top
        const radius = (size / 2) - 20;
        const x = Math.cos(angle * Math.PI / 180) * radius;
        const y = Math.sin(angle * Math.PI / 180) * radius;

        numberElement.style.left = `calc(50% + ${x}px)`;
        numberElement.style.top = `calc(50% + ${y}px)`;
        numberElement.style.transform = `translate(-50%, -50%)`;

        circle.appendChild(numberElement);
    }

    // Add drag events
    circle.addEventListener('mousedown', startDrag);
    circle.addEventListener('touchstart', startDrag);

    return circle;
}

// Start dragging
function startDrag(e) {
    if (!gameRunning) return;

    e.preventDefault();
    isDragging = true;
    currentTumbler = parseInt(e.currentTarget.dataset.index);

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    startAngle = Math.atan2(clientY - centerY, clientX - centerX) * 180 / Math.PI;
    startAngle -= tumblers[currentTumbler].rotation;
}

// Handle drag movement
function handleDrag(e) {
    if (!isDragging || currentTumbler === null) return;

    e.preventDefault();

    const tumbler = tumblers[currentTumbler];
    const rect = tumbler.element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const currentAngle = Math.atan2(clientY - centerY, clientX - centerX) * 180 / Math.PI;
    let rotation = currentAngle - startAngle;

    // Normalize rotation to 0-360
    rotation = ((rotation % 360) + 360) % 360;

    tumbler.rotation = rotation;
    tumbler.element.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;

    // Check alignment
    checkAlignment(currentTumbler);
}

// Stop dragging
function stopDrag() {
    isDragging = false;
    currentTumbler = null;
}

// Check if tumbler is aligned correctly
function checkAlignment(index) {
    const tumbler = tumblers[index];
    const correctAngle = tumbler.correctNumber * 36; // Each number is 36 degrees apart

    // Normalize current rotation
    let normalizedRotation = ((tumbler.rotation % 360) + 360) % 360;

    // Check if within tolerance (±15 degrees)
    const tolerance = 15;
    let angleDiff = Math.abs(normalizedRotation - correctAngle);

    // Handle wrap-around (e.g., 355 degrees vs 5 degrees)
    if (angleDiff > 180) {
        angleDiff = 360 - angleDiff;
    }

    if (angleDiff <= tolerance) {
        if (!tumbler.isAligned) {
            // Just aligned
            tumbler.isAligned = true;
            tumbler.isFading = false;
            activateCheckmark(index);
        }
    } else {
        if (tumbler.isAligned) {
            // No longer aligned
            tumbler.isAligned = false;
            deactivateCheckmark(index);
        }
    }
}

// Activate checkmark for a tumbler
function activateCheckmark(index) {
    const tumbler = tumblers[index];

    // Clear any existing fade timeout
    if (tumbler.fadeTimeout) {
        clearTimeout(tumbler.fadeTimeout);
    }

    // Show checkmark
    tumbler.checkmarkElement.textContent = '✓';
    tumbler.checkmarkElement.classList.add('active');
    tumbler.checkmarkElement.classList.remove('fading');
    tumbler.isFading = false;

    // Visual feedback
    tumbler.element.classList.add('correct');

    // Start fade countdown
    tumbler.fadeTimeout = setTimeout(() => {
        startFade(index);
    }, currentDifficulty.fadeDelay);

    // Check for win
    checkWinCondition();
}

// Deactivate checkmark
function deactivateCheckmark(index) {
    const tumbler = tumblers[index];

    if (tumbler.fadeTimeout) {
        clearTimeout(tumbler.fadeTimeout);
        tumbler.fadeTimeout = null;
    }

    tumbler.checkmarkElement.textContent = '';
    tumbler.checkmarkElement.classList.remove('active', 'fading');
    tumbler.element.classList.remove('correct');
    tumbler.isFading = false;
}

// Start fading a checkmark
function startFade(index) {
    const tumbler = tumblers[index];
    tumbler.isFading = true;
    tumbler.checkmarkElement.classList.add('fading');
}

// Check win condition
function checkWinCondition() {
    if (!gameRunning) return;

    // Check if all tumblers are aligned and none are fading
    const allAligned = tumblers.every(t => t.isAligned);
    const noneFading = tumblers.every(t => !t.isFading);

    if (allAligned && noneFading) {
        winGame();
    }
}

// Setup event listeners
function setupEventListeners() {
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', resetGame);
    retryBtn.addEventListener('click', resetGame);
    menuBtn.addEventListener('click', returnToMenu);
    backBtn.addEventListener('click', returnToMenu);

    // Global drag handlers
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('touchmove', handleDrag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);
}

// Start game
function startGame() {
    gameRunning = true;
    startBtn.classList.add('hidden');
    startTimer();
}

// Start timer
function startTimer() {
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();

        if (timeRemaining <= 0) {
            loseGame();
        }
    }, 1000);
}

// Update timer display
function updateTimerDisplay() {
    timerDisplay.textContent = timeRemaining;

    timerDisplay.classList.remove('warning', 'danger');
    if (timeRemaining <= 10) {
        timerDisplay.classList.add('danger');
    } else if (timeRemaining <= 20) {
        timerDisplay.classList.add('warning');
    }
}

// Stop timer
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Win game
function winGame() {
    gameRunning = false;
    stopTimer();

    // Clear all fade timeouts
    tumblers.forEach(t => {
        if (t.fadeTimeout) clearTimeout(t.fadeTimeout);
    });

    setTimeout(() => {
        gameScreen.classList.remove('active');
        resultsScreen.classList.add('active');

        resultsStatus.textContent = 'LOCK BYPASSED';
        resultsStatus.classList.add('success');
        resultsStatus.classList.remove('failure');
        resultsScore.textContent = `Time Remaining: ${timeRemaining}s`;
        resultsMessage.textContent = 'ALL TUMBLERS ALIGNED SUCCESSFULLY. SECURITY BYPASS COMPLETE. ACCESS GRANTED.';
    }, 500);
}

// Lose game
function loseGame() {
    gameRunning = false;
    stopTimer();

    // Clear all fade timeouts
    tumblers.forEach(t => {
        if (t.fadeTimeout) clearTimeout(t.fadeTimeout);
    });

    gameScreen.classList.remove('active');
    resultsScreen.classList.add('active');

    const alignedCount = tumblers.filter(t => t.isAligned).length;

    resultsStatus.textContent = 'BYPASS FAILED';
    resultsStatus.classList.remove('success');
    resultsStatus.classList.add('failure');
    resultsScore.textContent = `${alignedCount} / ${currentDifficulty.tumblerCount} Tumblers Aligned`;
    resultsMessage.textContent = 'TIME EXPIRED. UNABLE TO BYPASS SECURITY MECHANISM. ACCESS DENIED.';
}

// Reset game
function resetGame() {
    stopTimer();
    gameRunning = false;
    isDragging = false;
    currentTumbler = null;

    // Clear all timeouts
    tumblers.forEach(t => {
        if (t.fadeTimeout) clearTimeout(t.fadeTimeout);
    });

    resultsScreen.classList.remove('active');
    difficultyScreen.classList.add('active');

    startBtn.classList.remove('hidden');
    messageDisplay.innerHTML = '';
}

// Return to main menu
function returnToMenu() {
    window.location.href = 'index.html';
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

// Add glitch animation
const style = document.createElement('style');
style.textContent = `
    @keyframes glitch {
        0%, 100% { transform: translate(0); }
        25% { transform: translate(-2px, 2px); }
        50% { transform: translate(2px, -2px); }
        75% { transform: translate(-2px, -2px); }
    }
`;
document.head.appendChild(style);

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
});
