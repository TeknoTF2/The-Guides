// Brute Force Game Logic

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

// Word lists by difficulty
const WORD_LISTS = {
    low: [
        // 4-6 letter common words
        'CODE', 'HACK', 'DATA', 'FILE', 'LINK', 'NODE', 'PORT', 'USER', 'BOOT', 'CORE',
        'BYTE', 'DISK', 'EDIT', 'FIRE', 'GATE', 'HOST', 'ICON', 'JAVA', 'KEYS', 'LOAD',
        'MAIN', 'NAME', 'OPEN', 'PATH', 'QUIT', 'READ', 'SAVE', 'SCAN', 'TEMP', 'TEXT',
        'WALL', 'ZONE', 'APPS', 'BASE', 'CHIP', 'COPY', 'DROP', 'ECHO', 'FLAG', 'GRID',
        'HASH', 'INFO', 'JOIN', 'KILL', 'LINE', 'MASK', 'NULL', 'PAGE', 'ROOT', 'SAFE',
        'TASK', 'UNIT', 'VIEW', 'WAVE', 'ATOM', 'BIND', 'CALL', 'DIAL', 'EXEC', 'FLOW',
        'HOME', 'INIT', 'JUMP', 'KEEP', 'LIVE', 'MODE', 'MOVE', 'NEXT', 'PLUG', 'PUSH',
        'QUEUE', 'RESET', 'SHELL', 'START', 'TABLE', 'TRACE', 'VIRUS', 'WRITE', 'ADMIN',
        'ARRAY', 'BLOCK', 'CACHE', 'CLASS', 'DEBUG', 'DRIVE', 'ERROR', 'FIELD', 'FRAME',
        'GRAPH', 'GROUP', 'IMAGE', 'INDEX', 'INPUT', 'LAYER', 'LEVEL', 'LOCAL', 'LOGIC',
        'MACRO', 'MEDIA', 'MERGE', 'MODEL', 'MOUNT', 'PATCH', 'PHASE', 'PIXEL', 'PRIME',
        'PRINT', 'PROXY', 'QUICK', 'RADIO', 'RANGE', 'RATIO', 'RELAY', 'ROUTE', 'SCALE',
        'SCOPE', 'SETUP', 'SHARE', 'SHIFT', 'SLEEP', 'SLICE', 'SOLID', 'SOUND', 'SPACE',
        'SPEED', 'STACK', 'STATE', 'STORE', 'STYLE', 'SUPER', 'SWIFT', 'SWITCH', 'SYNC',
        'TOKEN', 'TOPIC', 'TOTAL', 'TRACK', 'TRAIT', 'TRANS', 'TUPLE', 'UNITY', 'VALID',
        'VALUE', 'VIDEO', 'VISIT', 'VOICE', 'WIDTH', 'YIELD', 'ALERT', 'ANGLE', 'APPLY',
        'AUDIO', 'BASIC', 'BATCH', 'BLANK', 'BLEND', 'BREAK', 'BUILD', 'CHECK', 'CLEAN',
        'CLEAR', 'CLICK', 'CLONE', 'CLOSE', 'COLOR', 'COUNT', 'CRASH', 'CROSS', 'CYCLE',
        'DAILY', 'DELAY', 'DEPTH', 'DIGIT', 'DIRTY', 'EMPTY', 'ENTER', 'ENTRY', 'EQUAL',
        'EVENT', 'EXACT', 'EXTRA', 'FALSE', 'FETCH', 'FINAL', 'FIRST', 'FLASH', 'FLOAT',
        'FOCUS', 'FORCE', 'FORMS', 'FRONT', 'GUARD', 'GUIDE', 'HELLO', 'HOVER', 'HTTPS',
        'INNER', 'LABEL', 'LARGE', 'LASER', 'LEARN', 'LIGHT', 'LIMIT', 'LINKS', 'LOGIN',
        'MAGIC', 'MATCH', 'MATRIX', 'MINOR', 'MIXED', 'MODAL', 'MULTI', 'NODES', 'OCEAN',
        'ORDER', 'OUTER', 'OWNER', 'PAINT', 'PANEL', 'PAPER', 'PARSE', 'PASTE', 'PAUSE',
        'POWER', 'PRESS', 'PROBE', 'QUERY', 'RADAR', 'RAISE', 'REACH', 'REACT', 'REPLY',
        'RIGHT', 'ROBOT', 'ROUND', 'SCENE', 'SCORE', 'SCRIPT', 'SEARCH', 'SELECT', 'SEND',
        'SERVE', 'SHORT', 'SIGNAL', 'SIMPLE', 'SINGLE', 'SLIDE', 'SMALL', 'SMART', 'SORT',
        'SPAWN', 'SPLIT', 'STAMP', 'STAND', 'STATS', 'STILL', 'STOP', 'STORM', 'STORY',
        'STRIP', 'STUDY', 'SUBMIT', 'SWEEP', 'SYMBOL', 'SYSTEM', 'THEME', 'THROW', 'TIMER',
        'TITLE', 'TOUCH', 'TRASH', 'TRUST', 'TRUTH', 'TYPES', 'UNDER', 'UNSET', 'UNTIL'
    ],
    standard: [
        // 6-8 letter mixed words
        'ACCESS', 'ACTION', 'ACTIVE', 'BACKUP', 'BINARY', 'BITMAP', 'BRIDGE', 'BROWSE',
        'BUFFER', 'BUTTON', 'CANCEL', 'CENTER', 'CHANGE', 'CHARGE', 'CIPHER', 'CLIENT',
        'COLUMN', 'CONFIG', 'COOKIE', 'CURSOR', 'CUSTOM', 'DAEMON', 'DECODE', 'DELETE',
        'DEVICE', 'DIALOG', 'DIRECT', 'DOMAIN', 'DOUBLE', 'DRIVER', 'ENCODE', 'ENGINE',
        'EXPORT', 'EXTEND', 'FACTOR', 'FILTER', 'FOLDER', 'FORMAT', 'FROZEN', 'GLOBAL',
        'HANDLE', 'HEADER', 'HEIGHT', 'HIDDEN', 'IGNORE', 'IMPORT', 'INLINE', 'INSERT',
        'INVERT', 'KERNEL', 'LAMBDA', 'LAUNCH', 'LAYOUT', 'LEGEND', 'LENGTH', 'LETTER',
        'LINKED', 'LISTEN', 'LOADER', 'LOCALE', 'LOCATE', 'LOCKED', 'LOOKUP', 'MARGIN',
        'MARKER', 'MASTER', 'MATRIX', 'MEMORY', 'METHOD', 'MIDDLE', 'MIRROR', 'MOBILE',
        'MODULE', 'MOTION', 'NATIVE', 'NESTED', 'NORMAL', 'NUMBER', 'OBJECT', 'OFFSET',
        'ONLINE', 'OPTION', 'OUTPUT', 'PACKET', 'PARENT', 'PARSER', 'PAUSED', 'PLUGIN',
        'POCKET', 'PORTAL', 'PREFIX', 'PRESET', 'PRINTF', 'PROMPT', 'PUBLIC', 'RANDOM',
        'RECORD', 'REDUCE', 'REFLEX', 'REGION', 'RELOAD', 'REMOTE', 'REMOVE', 'RENDER',
        'REPAIR', 'REPEAT', 'REPORT', 'RESIZE', 'RESULT', 'RETURN', 'REVEAL', 'REVERT',
        'ROTATE', 'ROUTER', 'SAMPLE', 'SCHEME', 'SCREEN', 'SCROLL', 'SEARCH', 'SECRET',
        'SECURE', 'SELECT', 'SENDER', 'SERVER', 'SHADOW', 'SIGNAL', 'SIGNED', 'SIMPLE',
        'SINGLE', 'SOCKET', 'SOURCE', 'STATIC', 'STATUS', 'STICKY', 'STORED', 'STREAM',
        'STRING', 'STRONG', 'STRUCT', 'SUBMIT', 'SUBNET', 'SUFFIX', 'SWITCH', 'SYMBOL',
        'SYNTAX', 'TARGET', 'THREAD', 'TICKER', 'TOGGLE', 'TRACKER', 'TUNNEL', 'UNIQUE',
        'UNLOCK', 'UPDATE', 'UPLOAD', 'URGENT', 'VECTOR', 'VERIFY', 'VERTEX', 'VIEWER',
        'VIRTUAL', 'WINDOW', 'WIZARD', 'WORKER', 'WRITER', 'ACCEPT', 'ADDRESS', 'ADVANCE',
        'ANDROID', 'ARCHIVE', 'ARTICLE', 'BACKEND', 'BALANCE', 'BATTERY', 'BOOLEAN', 'BOOTUP',
        'BROWSER', 'CAPTURE', 'CASCADE', 'CATALOG', 'CHANNEL', 'CHARSET', 'CHECKED', 'CLEANUP',
        'COMMAND', 'COMMENT', 'COMPACT', 'COMPARE', 'COMPILE', 'COMPLEX', 'COMPOSE', 'COMPUTE',
        'CONCEPT', 'CONFIRM', 'CONNECT', 'CONSOLE', 'CONTENT', 'CONTEXT', 'CONTROL', 'CONVERT',
        'COUNTER', 'COUPLED', 'CURRENT', 'DATABASE', 'DECIMAL', 'DEFAULT', 'DEFINED', 'DESKTOP',
        'DESTROY', 'DETAILS', 'DISABLE', 'DISPLAY', 'DYNAMIC', 'ELEMENT', 'ENABLED', 'ENCRYPT',
        'ENDLESS', 'ENHANCE', 'ENTROPY', 'EXECUTE', 'EXPRESS', 'FACTORY', 'FAILURE', 'FEATURE',
        'FIREFOX', 'FORWARD', 'GATEWAY', 'GENERAL', 'GENERIC', 'GRAPHIC', 'HANDLER', 'HEADING',
        'HISTORY', 'INCLUDE', 'INTEGER', 'INVALID', 'ISOLATE', 'ITERATOR', 'KEYBOARD', 'KEYCODE',
        'KEYWORD', 'LANDING', 'LIBRARY', 'LICENSE', 'LIMITED', 'LOADING', 'MACHINE', 'MANAGER',
        'MAXIMUM', 'MESSAGE', 'MINIMUM', 'MONITOR', 'NETWORK', 'NUMERIC', 'OPERATE', 'OPTIMIZE',
        'PACKAGE', 'PADDING', 'PATTERN', 'PAYLOAD', 'PICTURE', 'POINTER', 'POLLING', 'POPULAR',
        'POSTFIX', 'PREVIEW', 'PRIMARY', 'PRIVACY', 'PRIVATE', 'PROCESS', 'PRODUCT', 'PROFILE',
        'PROGRAM', 'PROJECT', 'PROTECT', 'PROTOCOL', 'PUBLISH', 'QUALITY', 'QUANTUM', 'RECEIVE',
        'REFRESH', 'RELEASE', 'REPLACE', 'REQUEST', 'REQUIRE', 'RESERVE', 'RESOLVE', 'RESOURCE',
        'RESPOND', 'RESTORE', 'REVERSE', 'ROLLING', 'RUNTIME', 'SANDBOX', 'SECTION', 'SEGMENT',
        'SERVICE', 'SESSION', 'SETTING', 'SIMILAR', 'SPATIAL', 'SPECIAL', 'STORAGE', 'STRANGE',
        'SUPPORT', 'SURFACE', 'SUSPEND', 'TEMPLATE', 'TERMINAL', 'TESTING', 'TEXTURE', 'TIMEOUT',
        'TOOLBAR', 'TOOLBOX', 'TOOLTIP', 'TRAFFIC', 'TRIGGER', 'UNICODE', 'UNKNOWN', 'UNSHIFT',
        'UPGRADE', 'UTILITY', 'VALIDATE', 'VERSION', 'VISIBLE', 'WARNING', 'WEBSITE', 'WRAPPER'
    ],
    high: [
        // 8-10 letter complex words
        'ABSTRACT', 'ADJACENT', 'ADVANCED', 'ALGORITHM', 'ALLOCATED', 'ANIMATION', 'ANONYMOUS',
        'ASSEMBLY', 'ASSIGNED', 'ASYMMETRIC', 'ATTACHED', 'ATTRIBUTE', 'AUGMENTED', 'AUTOMATIC',
        'AUXILIARY', 'AVAILABLE', 'BANDWIDTH', 'BENCHMARK', 'BILATERAL', 'BITSTRING', 'BLACKLIST',
        'BLUETOOTH', 'BOOTSTRAP', 'BOTTLENECK', 'BROADCAST', 'BYTECODE', 'CALCULATE', 'CALIBRATE',
        'CALLBACK', 'CANONICAL', 'CAPACITY', 'CARTESIAN', 'CASCADING', 'CATCHABLE', 'CHARACTER',
        'CHECKSUM', 'CLIPBOARD', 'CLOCKWISE', 'CLUSTERED', 'COLLISION', 'COMBINATOR', 'COMMODITY',
        'COMMUNITY', 'COMPARABLE', 'COMPATIBLE', 'COMPLETED', 'COMPONENT', 'COMPOSITE', 'COMPOUND',
        'COMPRESSED', 'COMPUTING', 'CONCATENATE', 'CONDITION', 'CONFIGURE', 'CONNECTED', 'CONSENSUS',
        'CONSERVE', 'CONSTRAIN', 'CONSTRUCT', 'CONTAINER', 'CONTINUED', 'CONTINUUM', 'CONTRACTED',
        'CONVERTER', 'COORDINATE', 'CORRUPTED', 'CRAFTABLE', 'CRYPTIC', 'DASHBOARD', 'DATASTORE',
        'DEADLOCK', 'DEBUGGER', 'DECRYPTED', 'DEDICATED', 'DEFERRED', 'DELIMETER', 'DEPENDENCY',
        'DEPRECATED', 'DETECTED', 'DEVELOPER', 'DIMENSION', 'DIRECTORY', 'DISABLED', 'DISCARD',
        'DISCOVERY', 'DISPATCH', 'DISTANCE', 'DISTINCT', 'DISTRIBUTE', 'DOCUMENT', 'DOWNLOAD',
        'DUPLICATE', 'DURATION', 'EDITABLE', 'EFFICIENT', 'ELLIPTIC', 'EMBEDDED', 'EMERGENCY',
        'EMULATOR', 'ENCODING', 'ENCRYPTED', 'ENDPOINT', 'ENFORCED', 'ENHANCED', 'ENUMERABLE',
        'ENUMERATE', 'EQUALITY', 'EQUATION', 'ETHERNET', 'EVALUATE', 'EXCEPTION', 'EXCHANGE',
        'EXCLUDED', 'EXECUTED', 'EXPLICIT', 'EXTENDED', 'EXTENSION', 'EXTERNAL', 'FALLBACK',
        'FAVORITE', 'FEEDBACK', 'FILENAME', 'FILEPATH', 'FILTERED', 'FINALIZE', 'FIREWALL',
        'FIRMWARE', 'FLEXIBLE', 'FLOATING', 'FLUSHING', 'FOOTPRINT', 'FORECAST', 'FRAGMENT',
        'FRAMERATE', 'FRAMEWORK', 'FRONTEND', 'FUNCTION', 'GENERATE', 'GENERATOR', 'GEOMETRY',
        'GRADIENT', 'GRAPHICAL', 'HARDCODE', 'HARDWARE', 'HASHING', 'HEADLESS', 'HEXADECIMAL',
        'HIERARCHY', 'HISTOGRAM', 'HOMEPAGE', 'HOSTNAME', 'HYPERLINK', 'HYPERTEXT', 'IDENTITY',
        'IMMUTABLE', 'IMPLEMENT', 'IMPLICIT', 'IMPORTED', 'INCLUDED', 'INCREMENT', 'INDEXED',
        'INDICATOR', 'INDIRECT', 'INFINITY', 'INHERITED', 'INITIALIZE', 'INJECTION', 'INSPECTOR',
        'INSTALLED', 'INSTANCE', 'INSTANCED', 'INSTANTLY', 'INTEGRATE', 'INTEGRITY', 'INTENSITY',
        'INTERFACE', 'INTERNAL', 'INTERPRET', 'INTERRUPT', 'INTERVAL', 'INTRINSIC', 'INTRODUCE',
        'INVARIANT', 'INVERTED', 'ISOLATED', 'ITERATION', 'ITERATIVE', 'JAVASCRIPT', 'JUSTIFIED',
        'KEYBOARD', 'LANGUAGE', 'LATITUDE', 'LAUNCHER', 'LIFETIME', 'LIGHTING', 'LIKEWISE',
        'LIMITLESS', 'LINKABLE', 'LISTENER', 'LOADABLE', 'LOCATION', 'LOCKDOWN', 'LOGARITHM',
        'LONGITUDE', 'MAINFRAME', 'MAINTAIN', 'MANIFEST', 'MANUALLY', 'MARKDOWN', 'MATERIAL',
        'MAXIMIZE', 'MEASURED', 'MECHANISM', 'METADATA', 'MICROCHIP', 'MIDDLEWARE', 'MIGRATE',
        'MINIMIZE', 'MISMATCH', 'MODIFIER', 'MODULAR', 'MOMENTUM', 'MONITORED', 'MONOCHROME',
        'MULTIBYTE', 'MULTICAST', 'MULTICORE', 'MULTIPLE', 'MULTIPLY', 'MULTIUSER', 'MUTATION',
        'NAMESPACE', 'NAVIGATE', 'NEGATIVE', 'NEGOTIATE', 'NEIGHBOR', 'NETWORK', 'NONZERO',
        'NOTATION', 'NOTIFIED', 'NULLABLE', 'OBSOLETE', 'OBTAINED', 'OCCUPIED', 'OCCURRED',
        'OCTAL', 'OFFSCREEN', 'ONDEMAND', 'OPERATOR', 'OPTIMIZE', 'OPTIONAL', 'ORDERING',
        'ORDINARY', 'OUTBOUND', 'OUTDATED', 'OUTLINED', 'OVERHEAD', 'OVERFLOW', 'OVERRIDE',
        'OVERWRITE', 'PACKAGED', 'PAGINATE', 'PARALLEL', 'PARAMETER', 'PASSPORT', 'PASSWORD',
        'PATHNAME', 'PATTERNS', 'PAUSABLE', 'PENDING', 'PERFORMS', 'PERIODIC', 'PIPELINE',
        'PLATFORM', 'PLAYBACK', 'PLAYLIST', 'POINTING', 'POLARITY', 'PORTABLE', 'POSITION',
        'POSITIVE', 'POSSIBLE', 'POSTBACK', 'POSTPONE', 'POWERFUL', 'PRACTICE', 'PRECISE',
        'PREDICT', 'PREFETCH', 'PREPARED', 'PRESENCE', 'PRESERVE', 'PRESSURE', 'PREVIOUS',
        'PRIMITIVE', 'PRIORITY', 'PROBABLE', 'PROCEDURE', 'PRODUCER', 'PROGRESS', 'PROPERTY',
        'PROPOSAL', 'PROVIDER', 'PROXYING', 'PUBLICLY', 'QUANTITY', 'QUERABLE', 'QUICKSORT',
        'RADIAN', 'RANDOMLY', 'REACHABLE', 'REACTIVE', 'READABLE', 'READONLY', 'REALTIME',
        'REBALANCE', 'REBOOT', 'RECEIVED', 'RECENTLY', 'RECEIVER', 'REDIRECT', 'REDUCED',
        'REFERRER', 'REGISTER', 'REGISTRY', 'REGULATE', 'RELATION', 'RELATIVE', 'RELIABLE',
        'RELOADED', 'REMOTELY', 'RENDERER', 'REORDER', 'REPEATED', 'REPLACED', 'REPLICATE',
        'REPORTED', 'REPOSITORY', 'REQUIRED', 'RESERVED', 'RESIDENT', 'RESOLVER', 'RESOURCE',
        'RESPONSE', 'RESTORED', 'RESTRICT', 'RESULTED', 'RETAINED', 'RETRIEVE', 'RETURNED',
        'REUSABLE', 'REVERSED', 'REVIEWED', 'REVISION', 'REWRITER', 'ROTATION', 'ROUNDING',
        'RUNNABLE', 'RUNTIME', 'SAMPLING', 'SANITIZE', 'SATELLITE', 'SCALABLE', 'SCENARIO',
        'SCHEDULE', 'SCROLLBAR', 'SEAMLESS', 'SEARCHED', 'SECURITY', 'SELECTED', 'SELECTOR',
        'SEMANTIC', 'SENDABLE', 'SENTINEL', 'SEPARATE', 'SEQUENCE', 'SERIALIZED', 'SETTINGS',
        'SEVERITY', 'SHORTCUT', 'SHUTDOWN', 'SIDEBAR', 'SIGNATURE', 'SIMULATE', 'SINKHOLE',
        'SKELETON', 'SNAPSHOT', 'SOFTWARE', 'SOLUTION', 'SORTABLE', 'SPECTRUM', 'SPLITTER',
        'STANDARD', 'STARTABLE', 'STATEFUL', 'STATELESS', 'STATEMENT', 'STATIC', 'STATISTICS',
        'STIMULUS', 'STORAGE', 'STRAIGHT', 'STRATEGY', 'STREAMED', 'STRENGTH', 'STRICTLY',
        'STRIPING', 'STRONGLY', 'STRUCTURE', 'STYLESHEET', 'SUBCLASS', 'SUBDOMAIN', 'SUBJECT',
        'SUBMITTED', 'SUBNETS', 'SUBSCRIBE', 'SUBSHELL', 'SUBTRACT', 'SUCCEEDED', 'SUITABLE',
        'SUMMARIZE', 'SUPPLIED', 'SUPPRESS', 'SURFACE', 'SUSPEND', 'SWAPPABLE', 'SYMBOLIC',
        'SYMMETRY', 'SYNCED', 'SYNCHRONIZED', 'TABULAR', 'TAILORED', 'TEMPLATE', 'TEMPORAL',
        'TERMINAL', 'TERTIARY', 'TESTABLE', 'THROTTLE', 'TIMELINE', 'TIMESTAMP', 'TOKENIZE',
        'TOPOLOGY', 'TOUCHPAD', 'TRACKABLE', 'TRAILING', 'TRANSACTION', 'TRANSFER', 'TRANSFORM',
        'TRANSIENT', 'TRANSITION', 'TRANSLATE', 'TRANSMIT', 'TRANSPARENT', 'TRAVERSE', 'TRIANGLE',
        'TRUNCATE', 'TYPEDEF', 'TYPENAME', 'ULTIMATE', 'UMBRELLA', 'UNALIGNED', 'UNASSIGNED',
        'UNAVAILABLE', 'UNBOUNDED', 'UNCACHED', 'UNCHANGED', 'UNCOMPRESS', 'UNDEFINED', 'UNDERFLOW',
        'UNDERTAKE', 'UNDOABLE', 'UNESCAPED', 'UNEXPIRED', 'UNFOCUSED', 'UNIFORM', 'UNINSTALL',
        'UNIPOLAR', 'UNIQUELY', 'UNITTEST', 'UNIVERSAL', 'UNLOCKED', 'UNMAPPED', 'UNMODIFIED',
        'UNNAMED', 'UNPACKED', 'UNPAIRED', 'UNQUOTED', 'UNRANKED', 'UNROUTED', 'UNSIGNED',
        'UNSTABLE', 'UNTESTED', 'UNTOUCHED', 'UNTRACKED', 'UNUSABLE', 'UNVERIFIED', 'UPCOMING',
        'UPDATABLE', 'UPLOADED', 'UPSTREAM', 'USERNAME', 'VALIDATED', 'VALUABLE', 'VARIABLE',
        'VARIANCE', 'VELOCITY', 'VERTICAL', 'VIEWPORT', 'VIOLATED', 'VIRTUALIZE', 'VOLATILE',
        'VOLUMETRIC', 'WARNABLE', 'WARRANTY', 'WATCHDOG', 'WAVEFORM', 'WEIGHTED', 'WILDCARD',
        'WIRELESS', 'WORKFLOW', 'WORKLOAD', 'WRAPPING', 'WRITABLE', 'WRITEBACK', 'ZEROABLE'
    ]
};

// Difficulty configuration
const DIFFICULTY_CONFIG = {
    low: {
        minLength: 4,
        maxLength: 6,
        attempts: 10,
        name: 'BASIC ENCRYPTION'
    },
    standard: {
        minLength: 6,
        maxLength: 8,
        attempts: 8,
        name: 'STANDARD ENCRYPTION'
    },
    high: {
        minLength: 8,
        maxLength: 10,
        attempts: 6,
        name: 'ADVANCED ENCRYPTION'
    }
};

// Game state
let currentDifficulty = null;
let currentWord = '';
let revealedLetters = new Set();
let usedLetters = new Set();
let attemptsRemaining = 0;
let gameRunning = false;
let gamePhase = 'difficulty';

// DOM elements
const difficultyScreen = document.getElementById('difficulty-screen');
const gameScreen = document.getElementById('game-screen');
const startBtn = document.getElementById('start-btn');
const guessWordBtn = document.getElementById('guess-word-btn');
const restartBtn = document.getElementById('restart-btn');
const messageDisplay = document.getElementById('message-display');
const currentDifficultyDisplay = document.getElementById('current-difficulty');
const attemptsLeftDisplay = document.getElementById('attempts-left');
const wordLengthDisplay = document.getElementById('word-length');
const gameStatusDisplay = document.getElementById('game-status');
const passwordDisplay = document.getElementById('password-display');
const usedLettersDisplay = document.getElementById('used-letters');
const keyboard = document.getElementById('keyboard');
const finalGuessContainer = document.getElementById('final-guess-container');
const finalGuessInput = document.getElementById('final-guess-input');

// Initialize game
function init() {
    setupDifficultySelection();
    setupGameControls();
    setupKeyboard();
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

    // Select random word from appropriate list
    const words = WORD_LISTS[difficulty].filter(word =>
        word.length >= currentDifficulty.minLength &&
        word.length <= currentDifficulty.maxLength
    );
    currentWord = words[Math.floor(Math.random() * words.length)];

    // Update UI
    difficultyScreen.classList.remove('active');
    gameScreen.classList.add('active');

    // Update HUD
    currentDifficultyDisplay.textContent = currentDifficulty.name;
    gameStatusDisplay.textContent = 'READY TO DECRYPT';
    attemptsRemaining = currentDifficulty.attempts;
    attemptsLeftDisplay.textContent = attemptsRemaining;
    wordLengthDisplay.textContent = currentWord.length;

    // Initialize display
    revealedLetters.clear();
    usedLetters.clear();
    updatePasswordDisplay();
    updateUsedLetters();
    updateAttemptsDisplay();

    gamePhase = 'ready';
}

// Setup game controls
function setupGameControls() {
    startBtn.addEventListener('click', startGame);
    guessWordBtn.addEventListener('click', showFinalGuess);
    restartBtn.addEventListener('click', restartGame);

    // Final guess input
    finalGuessInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            submitFinalGuess();
        }
    });
}

// Setup keyboard
function setupKeyboard() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (const letter of letters) {
        const key = document.createElement('div');
        key.className = 'key';
        key.textContent = letter;
        key.dataset.letter = letter;

        key.addEventListener('click', () => guessLetter(letter));

        keyboard.appendChild(key);
    }

    // Also allow physical keyboard input
    document.addEventListener('keydown', (e) => {
        if (!gameRunning || finalGuessContainer.classList.contains('hidden') === false) return;

        const key = e.key.toUpperCase();
        if (/^[A-Z]$/.test(key)) {
            guessLetter(key);
        }
    });
}

// Start game
function startGame() {
    if (gamePhase !== 'ready') return;

    gamePhase = 'playing';
    gameRunning = true;
    gameStatusDisplay.textContent = 'DECRYPTING...';
    startBtn.classList.add('hidden');
    guessWordBtn.classList.remove('hidden');
    messageDisplay.innerHTML = '';
}

// Update password display
function updatePasswordDisplay() {
    passwordDisplay.innerHTML = '';

    for (const char of currentWord) {
        const box = document.createElement('div');
        box.className = 'letter-box';

        if (revealedLetters.has(char)) {
            box.textContent = char;
            box.classList.add('revealed');
        } else {
            box.classList.add('hidden-letter');
        }

        passwordDisplay.appendChild(box);
    }
}

// Update used letters display
function updateUsedLetters() {
    usedLettersDisplay.innerHTML = '';

    const sortedLetters = Array.from(usedLetters).sort();

    for (const letter of sortedLetters) {
        const letterEl = document.createElement('div');
        letterEl.className = 'used-letter';
        letterEl.textContent = letter;

        if (currentWord.includes(letter)) {
            letterEl.classList.add('correct');
        } else {
            letterEl.classList.add('incorrect');
        }

        usedLettersDisplay.appendChild(letterEl);
    }
}

// Update attempts display
function updateAttemptsDisplay() {
    attemptsLeftDisplay.textContent = attemptsRemaining;

    // Color based on remaining attempts
    attemptsLeftDisplay.classList.remove('warning', 'danger');
    const percentage = attemptsRemaining / currentDifficulty.attempts;

    if (percentage <= 0.3) {
        attemptsLeftDisplay.classList.add('danger');
    } else if (percentage <= 0.5) {
        attemptsLeftDisplay.classList.add('warning');
    }
}

// Guess a letter
function guessLetter(letter) {
    if (!gameRunning || usedLetters.has(letter)) return;

    // Mark as used
    usedLetters.add(letter);

    // Find key element and disable it
    const keyElement = keyboard.querySelector(`[data-letter="${letter}"]`);

    // Check if letter is in word
    if (currentWord.includes(letter)) {
        // Correct guess
        revealedLetters.add(letter);
        if (keyElement) keyElement.classList.add('correct', 'disabled');

        // Check if word is complete
        const allRevealed = Array.from(currentWord).every(char => revealedLetters.has(char));
        if (allRevealed) {
            winGame();
            return;
        }
    } else {
        // Incorrect guess
        attemptsRemaining--;
        if (keyElement) keyElement.classList.add('incorrect', 'disabled');

        // Check if out of attempts
        if (attemptsRemaining <= 0) {
            // Allow final guess
            gameRunning = false;
            showFinalGuess();
            return;
        }
    }

    // Update displays
    updatePasswordDisplay();
    updateUsedLetters();
    updateAttemptsDisplay();
}

// Show final guess input
function showFinalGuess() {
    if (!gameRunning && attemptsRemaining > 0) return;

    finalGuessContainer.classList.remove('hidden');
    finalGuessInput.value = '';
    finalGuessInput.focus();

    guessWordBtn.classList.add('hidden');
}

// Submit final guess
function submitFinalGuess() {
    const guess = finalGuessInput.value.trim().toUpperCase();

    if (!guess) return;

    if (guess === currentWord) {
        winGame();
    } else {
        loseGame();
    }
}

// Win game
function winGame() {
    gameRunning = false;
    gamePhase = 'won';
    gameStatusDisplay.textContent = 'ACCESS GRANTED';

    // Reveal all letters
    revealedLetters = new Set(currentWord);
    updatePasswordDisplay();

    showMessage('ACCESS GRANTED', 'success', `PASSWORD DECRYPTED: ${currentWord}`);

    guessWordBtn.classList.add('hidden');
    finalGuessContainer.classList.add('hidden');
    restartBtn.classList.remove('hidden');
}

// Lose game
function loseGame() {
    gameRunning = false;
    gamePhase = 'lost';
    gameStatusDisplay.textContent = 'ACCESS DENIED';

    showMessage('ACCESS DENIED', 'failure', `PASSWORD WAS: ${currentWord}`);

    finalGuessContainer.classList.add('hidden');
    restartBtn.classList.remove('hidden');
}

// Restart game
function restartGame() {
    // Reset to difficulty selection
    gameRunning = false;
    gamePhase = 'difficulty';

    gameScreen.classList.remove('active');
    difficultyScreen.classList.add('active');

    restartBtn.classList.add('hidden');
    guessWordBtn.classList.add('hidden');
    startBtn.classList.remove('hidden');
    finalGuessContainer.classList.add('hidden');
    messageDisplay.innerHTML = '';

    // Reset keyboard
    keyboard.querySelectorAll('.key').forEach(key => {
        key.classList.remove('correct', 'incorrect', 'disabled');
    });

    // Reset state
    revealedLetters.clear();
    usedLetters.clear();
    currentWord = '';
    attemptsRemaining = 0;
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
