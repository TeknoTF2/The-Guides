// Bootup text sequence
const bootSequence = [
    "ROBCO INDUSTRIES (TM) TERMLINK PROTOCOL",
    "ENTER PASSWORD NOW",
    "",
    "> ********************",
    "",
    "INITIALIZING SYSTEM...",
    "LOADING BIOS...",
    "CHECKING MEMORY... OK",
    "VERIFYING DMI POOL DATA... OK",
    "DETECTING PRIMARY MASTER... OK",
    "DETECTING PRIMARY SLAVE... OK",
    "",
    "SYSTEM INTEGRITY CHECK... PASSED",
    "LOADING UNIFIED OPERATING SYSTEM...",
    "",
    "> OS_LOAD.EXE",
    "> KERNEL_INIT.SYS",
    "> DEVICE_DRIVERS.DLL",
    "> GRAPHICS_RENDERER.VXD",
    "",
    "ALL SYSTEMS NOMINAL",
    "WELCOME TO ROBCO INDUSTRIES UNIFIED OPERATING SYSTEM",
    "",
    "ACCESSING MAINFRAME...",
    "CONNECTION ESTABLISHED",
    "",
    "LOADING HACKING PROTOCOLS...",
    "> WORD_MATCH.EXE... READY",
    "> PASSWORD_CRACK.EXE... READY",
    "> MEMORY_TRACE.EXE... READY",
    "> CIPHER_DECODE.EXE... READY",
    "> NODE_BREACH.EXE... READY",
    "> SEQUENCE_LOCK.EXE... READY",
    "",
    "SYSTEM READY",
    "PRESS ANY KEY TO CONTINUE..."
];

let currentLine = 0;
let currentChar = 0;
let bootTextElement;
let bootupComplete = false;
let bootupSkipped = false;

// Type out boot sequence
function typeBootText() {
    if (bootupSkipped || currentLine >= bootSequence.length) {
        bootupComplete = true;
        return;
    }

    const line = bootSequence[currentLine];

    if (currentChar < line.length) {
        bootTextElement.textContent += line[currentChar];
        currentChar++;

        // Variable speed for more realistic feel
        const speed = line[currentChar - 1] === '.' ? 100 : Math.random() * 30 + 10;
        setTimeout(typeBootText, speed);
    } else {
        bootTextElement.textContent += '\n';
        currentLine++;
        currentChar = 0;

        // Pause between lines
        const pause = line === '' ? 50 : (line.includes('...') ? 400 : 150);
        setTimeout(typeBootText, pause);
    }
}

// Transition to main menu
function transitionToMenu() {
    const bootupScreen = document.getElementById('bootup-screen');
    const mainMenu = document.getElementById('main-menu');

    // Mark bootup as seen for this session
    sessionStorage.setItem('bootupSeen', 'true');

    // Add pixelate effect
    bootupScreen.classList.add('pixelate');

    // Play static/fizzle sound effect would go here

    // After pixelate animation, hide bootup and show menu
    setTimeout(() => {
        bootupScreen.classList.add('hidden');
        mainMenu.classList.remove('hidden');

        // Fade in main menu
        setTimeout(() => {
            mainMenu.classList.add('active');
        }, 50);
    }, 1500);
}

// Handle key press during bootup - allow immediate skip
function handleBootupKey(event) {
    // Skip bootup immediately on any key press
    bootupSkipped = true;
    bootupComplete = true;
    document.removeEventListener('keydown', handleBootupKey);
    document.removeEventListener('click', handleBootupClick);
    transitionToMenu();
}

// Handle click during bootup - allow immediate skip
function handleBootupClick() {
    // Skip bootup immediately on click
    bootupSkipped = true;
    bootupComplete = true;
    document.removeEventListener('keydown', handleBootupKey);
    document.removeEventListener('click', handleBootupClick);
    transitionToMenu();
}

// Initialize grid items
function initializeGrid() {
    const gridItems = document.querySelectorAll('.grid-item');

    gridItems.forEach(item => {
        const status = item.querySelector('.grid-status').textContent;

        // Mark locked items
        if (status.includes('LOCKED')) {
            item.setAttribute('data-locked', 'true');
        }

        // Add click handler for ready items
        item.addEventListener('click', function() {
            if (this.getAttribute('data-locked') !== 'true') {
                const gameId = this.getAttribute('data-game');
                launchGame(gameId);
            } else {
                // Play error sound for locked items
                playLockedEffect(this);
            }
        });

        // Add keyboard navigation
        item.setAttribute('tabindex', '0');
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

// Play locked item effect
function playLockedEffect(item) {
    item.style.animation = 'shake 0.3s';
    setTimeout(() => {
        item.style.animation = '';
    }, 300);

    // Create temporary error message
    const errorMsg = document.createElement('div');
    errorMsg.textContent = 'ACCESS DENIED';
    errorMsg.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #ff4444;
        font-size: 16px;
        font-weight: bold;
        text-shadow: 0 0 10px #ff4444;
        pointer-events: none;
        animation: fadeOut 1s forwards;
    `;
    item.appendChild(errorMsg);

    setTimeout(() => {
        errorMsg.remove();
    }, 1000);
}

// Add shake animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }

    @keyframes fadeOut {
        0% { opacity: 1; }
        100% { opacity: 0; }
    }
`;
document.head.appendChild(style);

// Launch game
function launchGame(gameId) {
    console.log(`Launching game ${gameId}`);

    // Create transition effect
    const mainMenu = document.getElementById('main-menu');
    mainMenu.style.animation = 'pixelate-out 1s steps(10) forwards';

    // Navigate to game after transition
    setTimeout(() => {
        // Map game IDs to their respective pages
        const gamePages = {
            '2': 'brute-force.html',
            '3': 'memory-leak.html',
            '4': 'code-injection.html',
            '5': 'node-reroute.html',
            '8': 'firewall.html',
            // Add more games as they are implemented
        };

        if (gamePages[gameId]) {
            // Navigate to the game page
            window.location.href = gamePages[gameId];
        } else {
            // Game not yet implemented
            alert(`Game ${gameId} is not yet implemented.\n\nCheck back soon!`);
            mainMenu.style.animation = '';
        }
    }, 1000);
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
    bootTextElement = document.getElementById('boot-text');

    // Check if bootup has already been seen this session
    const bootupSeen = sessionStorage.getItem('bootupSeen');

    if (bootupSeen === 'true') {
        // Skip bootup entirely - go straight to menu
        const bootupScreen = document.getElementById('bootup-screen');
        const mainMenu = document.getElementById('main-menu');

        bootupScreen.classList.remove('active');
        bootupScreen.classList.add('hidden');
        mainMenu.classList.remove('hidden');
        mainMenu.classList.add('active');
    } else {
        // First visit - show bootup sequence
        // Start boot sequence after short delay
        setTimeout(() => {
            typeBootText();
        }, 500);

        // Listen for key press or click to skip
        document.addEventListener('keydown', handleBootupKey);
        document.addEventListener('click', handleBootupClick);
    }

    // Initialize grid when menu is shown
    initializeGrid();

    // Add atmospheric effects
    addRandomGlitches();
    addScreenFlicker();
});

// Easter egg: Konami code
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', function(e) {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);

    if (konamiCode.join(',') === konamiSequence.join(',')) {
        const header = document.querySelector('.header-text .glitch');
        if (header) {
            header.textContent = '*** ADMIN ACCESS GRANTED ***';
            header.style.color = '#ff00ff';

            // Unlock all games
            document.querySelectorAll('.grid-item[data-locked="true"]').forEach(item => {
                item.removeAttribute('data-locked');
                const status = item.querySelector('.grid-status');
                status.textContent = '[UNLOCKED]';
                status.style.color = '#00ff41';
            });
        }
    }
});
