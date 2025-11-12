// Word Match Game Logic

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

// Word lists (same as brute-force.js)
const WORD_LISTS = {
    low: [
        'CODE', 'HACK', 'DATA', 'FILE', 'LINK', 'NODE', 'PORT', 'USER', 'BOOT', 'CORE',
        'BYTE', 'DISK', 'EDIT', 'FIRE', 'GATE', 'HOST', 'ICON', 'JAVA', 'KEYS', 'LOAD',
        'MAIN', 'NAME', 'OPEN', 'PATH', 'QUIT', 'READ', 'SAVE', 'SCAN', 'TEMP', 'TEXT',
        'WALL', 'ZONE', 'APPS', 'BASE', 'CHIP', 'COPY', 'DROP', 'ECHO', 'FLAG', 'GRID',
        'HASH', 'INFO', 'JOIN', 'KILL', 'LINE', 'MASK', 'NULL', 'PAGE', 'ROOT', 'SAFE'
    ],
    standard: [
        'ACCESS', 'BINARY', 'BUFFER', 'CIPHER', 'CLIENT', 'DAEMON', 'DELETE', 'ENCODE',
        'FILTER', 'FORMAT', 'GLOBAL', 'HEADER', 'IMPORT', 'INJECT', 'KERNEL', 'LAMBDA',
        'MATRIX', 'MEMORY', 'MODULE', 'NATIVE', 'OBJECT', 'OUTPUT', 'PACKET', 'PARSER',
        'PLUGIN', 'PORTAL', 'PYTHON', 'RANDOM', 'REBOOT', 'RECORD', 'REGEX', 'RENDER',
        'SCRIPT', 'SECURE', 'SELECT', 'SERVER', 'SIGNAL', 'SOCKET', 'SOURCE', 'STATUS'
    ],
    high: [
        'ABSTRACT', 'ADVANCED', 'ANALYSIS', 'ARGUMENT', 'ASSEMBLY', 'BACKBONE', 'BACKDOOR',
        'BREAKPOINT', 'CALLBACK', 'CHECKSUM', 'COMPILER', 'CONSTANT', 'DATABASE', 'DATATYPE',
        'DEBUGGER', 'DELEGATE', 'DOWNLOAD', 'ENDPOINT', 'EVALUATE', 'FEEDBACK', 'FIREWALL',
        'FUNCTION', 'GENERATE', 'GRAPHICS', 'HARDWARE', 'INDEXING', 'INSTANCE', 'INTERNET',
        'KEYBOARD', 'LIGHTING', 'MAINFRAME', 'METADATA', 'MODIFIER', 'NAVIGATE', 'OPERATOR'
    ]
};

// Difficulty configuration
const DIFFICULTY_CONFIG = {
    low: {
        wordCount: 3,
        timeLimit: 60,
        name: 'SHALLOW',
        wordList: WORD_LISTS.low
    },
    standard: {
        wordCount: 5,
        timeLimit: 90,
        name: 'STANDARD',
        wordList: WORD_LISTS.standard
    },
    high: {
        wordCount: 7,
        timeLimit: 120,
        name: 'DEEP',
        wordList: WORD_LISTS.high
    }
};

// Game state
let currentDifficulty = null;
let targetWords = [];
let foundWords = new Set();
let timeRemaining = 0;
let timerInterval = null;
let gameRunning = false;

// DOM elements
const difficultyScreen = document.getElementById('difficulty-screen');
const gameScreen = document.getElementById('game-screen');
const resultsScreen = document.getElementById('results-screen');

const currentDifficultyDisplay = document.getElementById('current-difficulty');
const timerDisplay = document.getElementById('timer-display');
const foundDisplay = document.getElementById('found-display');
const scrollContent = document.getElementById('scroll-content');
const wordList = document.getElementById('word-list');
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

    // Select random target words
    selectTargetWords();

    // Generate scrolling text
    generateScrollingText();

    // Display word list
    displayWordList();
}

// Select random target words
function selectTargetWords() {
    const wordPool = [...currentDifficulty.wordList];
    targetWords = [];
    foundWords.clear();

    for (let i = 0; i < currentDifficulty.wordCount; i++) {
        const randomIndex = Math.floor(Math.random() * wordPool.length);
        targetWords.push(wordPool[randomIndex]);
        wordPool.splice(randomIndex, 1);
    }

    updateFoundDisplay();
}

// Generate scrolling text with embedded words
function generateScrollingText() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const totalChars = 3000; // Total characters in the scroll
    let text = '';
    let wordPositions = [];

    // Decide positions to place target words
    for (let word of targetWords) {
        const position = Math.floor(Math.random() * (totalChars - word.length - 100)) + 50;
        wordPositions.push({ word, position });
    }

    // Sort by position
    wordPositions.sort((a, b) => a.position - b.position);

    let currentPos = 0;

    for (let wordInfo of wordPositions) {
        // Fill with random chars up to word position
        while (currentPos < wordInfo.position) {
            text += chars[Math.floor(Math.random() * chars.length)];
            currentPos++;
        }

        // Insert the word as a clickable span
        text += `<span class="word" data-word="${wordInfo.word}">${wordInfo.word}</span>`;
        currentPos += wordInfo.word.length;
    }

    // Fill remaining with random chars
    while (currentPos < totalChars) {
        text += chars[Math.floor(Math.random() * chars.length)];
        currentPos++;
    }

    scrollContent.innerHTML = text;

    // Add click handlers to words
    document.querySelectorAll('.word').forEach(wordElement => {
        wordElement.addEventListener('click', () => selectWord(wordElement));
    });
}

// Display word list
function displayWordList() {
    wordList.innerHTML = '';

    targetWords.forEach(word => {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        wordItem.textContent = word;
        wordItem.dataset.word = word;
        wordList.appendChild(wordItem);
    });
}

// Setup event listeners
function setupEventListeners() {
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', resetGame);
    retryBtn.addEventListener('click', resetGame);
    menuBtn.addEventListener('click', returnToMenu);
    backBtn.addEventListener('click', returnToMenu);
}

// Start game
function startGame() {
    gameRunning = true;
    startBtn.classList.add('hidden');
    scrollContent.classList.remove('paused');

    // Start timer
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
    } else if (timeRemaining <= 30) {
        timerDisplay.classList.add('warning');
    }
}

// Update found display
function updateFoundDisplay() {
    foundDisplay.textContent = `${foundWords.size} / ${currentDifficulty.wordCount}`;
}

// Select word
function selectWord(wordElement) {
    if (!gameRunning) return;

    const word = wordElement.dataset.word;

    // Check if it's a target word
    if (targetWords.includes(word)) {
        // Check if already found
        if (foundWords.has(word)) {
            showMessage('ALREADY FOUND', 'info');
            return;
        }

        // Mark as found
        foundWords.add(word);
        wordElement.classList.add('found');

        // Update word list display
        const wordItem = wordList.querySelector(`[data-word="${word}"]`);
        if (wordItem) {
            wordItem.classList.add('found');
        }

        updateFoundDisplay();
        showMessage('PATTERN MATCHED', 'success');

        // Check for win
        if (foundWords.size === currentDifficulty.wordCount) {
            winGame();
        }
    } else {
        showMessage('INVALID PATTERN', 'failure');
    }
}

// Win game
function winGame() {
    gameRunning = false;
    stopTimer();
    scrollContent.classList.add('paused');

    setTimeout(() => {
        gameScreen.classList.remove('active');
        resultsScreen.classList.add('active');

        resultsStatus.textContent = 'SCAN COMPLETE';
        resultsStatus.classList.add('success');
        resultsStatus.classList.remove('failure');
        resultsScore.textContent = `${foundWords.size} / ${currentDifficulty.wordCount} PATTERNS FOUND`;
        resultsMessage.textContent = 'ALL TARGET PATTERNS SUCCESSFULLY IDENTIFIED. DATA EXTRACTION COMPLETE.';
    }, 1000);
}

// Lose game
function loseGame() {
    gameRunning = false;
    stopTimer();
    scrollContent.classList.add('paused');

    gameScreen.classList.remove('active');
    resultsScreen.classList.add('active');

    resultsStatus.textContent = 'SCAN FAILED';
    resultsStatus.classList.remove('success');
    resultsStatus.classList.add('failure');
    resultsScore.textContent = `${foundWords.size} / ${currentDifficulty.wordCount} PATTERNS FOUND`;
    resultsMessage.textContent = 'TIME EXPIRED. INSUFFICIENT PATTERNS IDENTIFIED. SCAN TERMINATED.';
}

// Stop timer
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Reset game
function resetGame() {
    stopTimer();
    foundWords.clear();
    gameRunning = false;

    resultsScreen.classList.remove('active');
    difficultyScreen.classList.add('active');

    scrollContent.classList.add('paused');
    startBtn.classList.remove('hidden');
    messageDisplay.innerHTML = '';
}

// Return to main menu
function returnToMenu() {
    window.location.href = 'index.html';
}

// Show message
function showMessage(text, type = 'info') {
    messageDisplay.innerHTML = '';

    const messageText = document.createElement('div');
    messageText.className = `message-text ${type}`;
    messageText.textContent = text;
    messageDisplay.appendChild(messageText);

    setTimeout(() => {
        messageDisplay.innerHTML = '';
    }, 1500);
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
    // Load and start ambient sound
    await loadAmbientSound();
    startAmbientSound();

    init();
    addRandomGlitches();
});
