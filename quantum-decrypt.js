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

function playAmbientSound() {
    if (!ambientBuffer || !audioContext) return;

    if (ambientSource) {
        ambientSource.stop();
    }

    ambientSource = audioContext.createBufferSource();
    ambientSource.buffer = ambientBuffer;
    ambientSource.loop = true;
    ambientSource.connect(gainNode);
    ambientSource.start(0);
}

// Initialize ambient sound
loadAmbientSound().then(() => {
    const startAudioOnInteraction = () => {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
        playAmbientSound();
        document.removeEventListener('click', startAudioOnInteraction);
        document.removeEventListener('keydown', startAudioOnInteraction);
    };
    document.addEventListener('click', startAudioOnInteraction);
    document.addEventListener('keydown', startAudioOnInteraction);
});

// Game state
const difficulties = {
    basic: {
        name: 'BASIC',
        maxErrors: 5,
        targetRange: [8, 10],
        gridSize: 50,
        numberRange: [1, 100]
    },
    standard: {
        name: 'STANDARD',
        maxErrors: 3,
        targetRange: [6, 8],
        gridSize: 45,
        numberRange: [1, 150]
    },
    advanced: {
        name: 'ADVANCED',
        maxErrors: 2,
        targetRange: [5, 7],
        gridSize: 40,
        numberRange: [1, 200]
    }
};

let currentDifficulty = null;
let currentFormula = null;
let validNumbers = [];
let errors = 0;
let found = 0;
let totalTargets = 0;
let gridNumbers = [];

// DOM Elements
const difficultyScreen = document.getElementById('difficulty-screen');
const gameScreen = document.getElementById('game-screen');
const successScreen = document.getElementById('success-screen');
const failureScreen = document.getElementById('failure-screen');

const sequenceDisplay = document.getElementById('sequence-display');
const numberGrid = document.getElementById('number-grid');
const errorsDisplay = document.getElementById('errors-display');
const foundDisplay = document.getElementById('found-display');

// Formula generators for each difficulty
const formulaGenerators = {
    basic: [
        // Multiples of N
        () => {
            const n = Math.floor(Math.random() * 5) + 2; // 2-6
            return {
                check: (num) => num % n === 0 && num > 0,
                description: `Multiples of ${n}`
            };
        },
        // Powers of 2
        () => ({
            check: (num) => num > 0 && (num & (num - 1)) === 0,
            description: 'Powers of 2'
        }),
        // Even numbers
        () => ({
            check: (num) => num % 2 === 0 && num > 0,
            description: 'Even numbers'
        }),
        // Odd numbers
        () => ({
            check: (num) => num % 2 === 1,
            description: 'Odd numbers'
        }),
        // Add constant (arithmetic sequence)
        () => {
            const base = Math.floor(Math.random() * 5) + 2; // 2-6
            const add = Math.floor(Math.random() * 5) + 3; // 3-7
            return {
                check: (num) => (num - base) % add === 0 && num >= base,
                description: `${base} + ${add}n`
            };
        },
        // Multiples of N plus constant
        () => {
            const mult = Math.floor(Math.random() * 4) + 2; // 2-5
            const add = Math.floor(Math.random() * 5) + 1; // 1-5
            return {
                check: (num) => (num - add) % mult === 0 && num >= add,
                description: `${mult}n + ${add}`
            };
        }
    ],
    standard: [
        // Perfect squares
        () => ({
            check: (num) => {
                const sqrt = Math.sqrt(num);
                return sqrt === Math.floor(sqrt) && num > 0;
            },
            description: 'Perfect squares (n²)'
        }),
        // Triangular numbers
        () => ({
            check: (num) => {
                // n(n+1)/2 = num -> n² + n - 2*num = 0
                const n = (-1 + Math.sqrt(1 + 8 * num)) / 2;
                return n === Math.floor(n) && n > 0;
            },
            description: 'Triangular numbers'
        }),
        // Prime numbers
        () => ({
            check: (num) => {
                if (num < 2) return false;
                if (num === 2) return true;
                if (num % 2 === 0) return false;
                for (let i = 3; i <= Math.sqrt(num); i += 2) {
                    if (num % i === 0) return false;
                }
                return true;
            },
            description: 'Prime numbers'
        }),
        // Fibonacci-like sequence
        () => {
            const fibs = [1, 1];
            for (let i = 2; i < 20; i++) {
                fibs.push(fibs[i-1] + fibs[i-2]);
            }
            return {
                check: (num) => fibs.includes(num),
                description: 'Fibonacci sequence'
            };
        },
        // n² + constant
        () => {
            const add = Math.floor(Math.random() * 5) + 1; // 1-5
            return {
                check: (num) => {
                    const val = num - add;
                    if (val <= 0) return false;
                    const sqrt = Math.sqrt(val);
                    return sqrt === Math.floor(sqrt);
                },
                description: `n² + ${add}`
            };
        },
        // Cubes
        () => ({
            check: (num) => {
                const cbrt = Math.round(Math.pow(num, 1/3));
                return cbrt * cbrt * cbrt === num && num > 0;
            },
            description: 'Perfect cubes (n³)'
        })
    ],
    advanced: [
        // Polynomial an² + bn + c
        () => {
            const a = Math.floor(Math.random() * 3) + 1; // 1-3
            const b = Math.floor(Math.random() * 5) + 1; // 1-5
            const c = Math.floor(Math.random() * 5); // 0-4
            const values = new Set();
            for (let n = 1; n <= 20; n++) {
                values.add(a * n * n + b * n + c);
            }
            return {
                check: (num) => values.has(num),
                description: `${a}n² + ${b}n + ${c}`
            };
        },
        // Modulo operations
        () => {
            const mod = Math.floor(Math.random() * 7) + 5; // 5-11
            const remainder = Math.floor(Math.random() * mod);
            return {
                check: (num) => num % mod === remainder && num > 0,
                description: `n ≡ ${remainder} (mod ${mod})`
            };
        },
        // Factorials
        () => {
            const factorials = [1, 2, 6, 24, 120];
            return {
                check: (num) => factorials.includes(num),
                description: 'Factorials (n!)'
            };
        },
        // Powers of N
        () => {
            const base = Math.floor(Math.random() * 3) + 3; // 3-5
            const powers = new Set();
            for (let i = 1; i <= 10; i++) {
                const val = Math.pow(base, i);
                if (val <= 200) powers.add(val);
            }
            return {
                check: (num) => powers.has(num),
                description: `Powers of ${base}`
            };
        },
        // n² - n
        () => ({
            check: (num) => {
                // n² - n = num -> n² - n - num = 0
                const n = (1 + Math.sqrt(1 + 4 * num)) / 2;
                return n === Math.floor(n) && n > 0;
            },
            description: 'n² - n'
        }),
        // 2^n - 1 (Mersenne-like)
        () => {
            const values = new Set();
            for (let i = 1; i <= 10; i++) {
                values.add(Math.pow(2, i) - 1);
            }
            return {
                check: (num) => values.has(num),
                description: '2ⁿ - 1'
            };
        }
    ]
};

// Generate random formula
function generateFormula(difficulty) {
    const generators = formulaGenerators[difficulty];
    const generator = generators[Math.floor(Math.random() * generators.length)];
    return generator();
}

// Generate sequence of 4 example numbers
function generateSequence(formula, range) {
    const sequence = [];
    let attempts = 0;
    const maxAttempts = 1000;

    while (sequence.length < 4 && attempts < maxAttempts) {
        const num = Math.floor(Math.random() * (range[1] - range[0])) + range[0];
        if (formula.check(num) && !sequence.includes(num)) {
            sequence.push(num);
        }
        attempts++;
    }

    return sequence.sort((a, b) => a - b);
}

// Generate all valid numbers in range
function generateValidNumbers(formula, range, exclude) {
    const valid = [];
    for (let i = range[0]; i <= range[1]; i++) {
        if (formula.check(i) && !exclude.includes(i)) {
            valid.push(i);
        }
    }
    return valid;
}

// Generate grid numbers (mix of valid and invalid)
function generateGridNumbers(validNums, range, targetCount) {
    const grid = [];
    const selectedValid = [];

    // Select random valid numbers
    const shuffledValid = [...validNums].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(targetCount, shuffledValid.length); i++) {
        selectedValid.push(shuffledValid[i]);
        grid.push({ value: shuffledValid[i], isValid: true });
    }

    // Fill rest with invalid numbers
    const gridSize = currentDifficulty.gridSize;
    while (grid.length < gridSize) {
        const num = Math.floor(Math.random() * (range[1] - range[0])) + range[0];
        const alreadyInGrid = grid.some(item => item.value === num);
        if (!alreadyInGrid && !currentFormula.check(num)) {
            grid.push({ value: num, isValid: false });
        }
    }

    // Shuffle grid
    return {
        grid: grid.sort(() => Math.random() - 0.5),
        validCount: selectedValid.length
    };
}

// Initialize game
function initGame(difficulty) {
    currentDifficulty = difficulties[difficulty];
    errors = 0;
    found = 0;

    // Generate formula and sequence
    currentFormula = generateFormula(difficulty);
    console.log('Formula:', currentFormula.description); // For testing

    const sequence = generateSequence(currentFormula, currentDifficulty.numberRange);

    // Generate all valid numbers
    const allValid = generateValidNumbers(
        currentFormula,
        currentDifficulty.numberRange,
        sequence
    );

    // Generate grid
    const targetCount = Math.floor(
        Math.random() * (currentDifficulty.targetRange[1] - currentDifficulty.targetRange[0] + 1)
    ) + currentDifficulty.targetRange[0];

    const gridData = generateGridNumbers(allValid, currentDifficulty.numberRange, targetCount);
    gridNumbers = gridData.grid;
    totalTargets = gridData.validCount;

    // Display sequence
    sequenceDisplay.innerHTML = '';
    sequence.forEach(num => {
        const div = document.createElement('div');
        div.className = 'sequence-number';
        div.textContent = num;
        sequenceDisplay.appendChild(div);
    });

    // Display grid
    numberGrid.innerHTML = '';
    gridNumbers.forEach((item, index) => {
        const cell = document.createElement('div');
        cell.className = 'number-cell';
        cell.textContent = item.value;
        cell.dataset.index = index;
        cell.addEventListener('click', () => handleCellClick(index));
        numberGrid.appendChild(cell);
    });

    // Update displays
    updateDisplays();

    // Show game screen
    difficultyScreen.classList.remove('active');
    gameScreen.classList.add('active');
}

// Handle cell click
function handleCellClick(index) {
    const item = gridNumbers[index];
    const cell = numberGrid.children[index];

    if (cell.classList.contains('correct') || cell.classList.contains('wrong')) {
        return; // Already clicked
    }

    if (item.isValid) {
        // Correct selection
        cell.classList.add('correct');
        found++;
        updateDisplays();

        // Check win condition
        if (found === totalTargets) {
            setTimeout(() => showSuccess(), 500);
        }
    } else {
        // Wrong selection
        cell.classList.add('wrong');
        errors++;
        updateDisplays();

        // Check lose condition
        if (errors >= currentDifficulty.maxErrors) {
            setTimeout(() => showFailure(), 500);
        }

        // Reset cell after animation
        setTimeout(() => {
            cell.classList.remove('wrong');
            if (errors < currentDifficulty.maxErrors) {
                cell.classList.add('locked');
            }
        }, 500);
    }
}

// Update displays
function updateDisplays() {
    errorsDisplay.textContent = `${errors}/${currentDifficulty.maxErrors}`;
    foundDisplay.textContent = `${found}/${totalTargets}`;

    if (errors >= currentDifficulty.maxErrors - 1) {
        errorsDisplay.classList.add('danger');
    } else {
        errorsDisplay.classList.remove('danger');
    }
}

// Show success screen
function showSuccess() {
    const accuracy = Math.round((found / (found + errors)) * 100);

    document.getElementById('accuracy-display').textContent = `${accuracy}%`;
    document.getElementById('final-errors-display').textContent = errors;

    gameScreen.classList.remove('active');
    successScreen.classList.add('active');
}

// Show failure screen
function showFailure() {
    document.getElementById('final-found-display').textContent = `${found}/${totalTargets}`;
    document.getElementById('final-errors-fail-display').textContent = errors;

    // Lock all remaining cells
    Array.from(numberGrid.children).forEach(cell => {
        if (!cell.classList.contains('correct')) {
            cell.classList.add('locked');
        }
    });

    gameScreen.classList.remove('active');
    failureScreen.classList.add('active');
}

// Event Listeners
document.querySelectorAll('.difficulty-option').forEach(option => {
    option.addEventListener('click', () => {
        const difficulty = option.dataset.difficulty;
        initGame(difficulty);
    });

    option.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const difficulty = option.dataset.difficulty;
            initGame(difficulty);
        }
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (difficultyScreen.classList.contains('active')) {
        if (e.key === '1') initGame('basic');
        if (e.key === '2') initGame('standard');
        if (e.key === '3') initGame('advanced');
        if (e.key === 'Escape') window.location.href = 'index.html';
    }

    if (gameScreen.classList.contains('active')) {
        if (e.key === 'Escape') window.location.href = 'index.html';
    }

    if (successScreen.classList.contains('active') || failureScreen.classList.contains('active')) {
        if (e.key === 'r' || e.key === 'R') {
            successScreen.classList.remove('active');
            failureScreen.classList.remove('active');
            difficultyScreen.classList.add('active');
        }
        if (e.key === 'm' || e.key === 'M') {
            window.location.href = 'index.html';
        }
    }
});

// Back button
document.getElementById('back-btn').addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Result screen buttons
document.getElementById('retry-success-btn').addEventListener('click', () => {
    successScreen.classList.remove('active');
    difficultyScreen.classList.add('active');
});

document.getElementById('menu-success-btn').addEventListener('click', () => {
    window.location.href = 'index.html';
});

document.getElementById('retry-fail-btn').addEventListener('click', () => {
    failureScreen.classList.remove('active');
    difficultyScreen.classList.add('active');
});

document.getElementById('menu-fail-btn').addEventListener('click', () => {
    window.location.href = 'index.html';
});
