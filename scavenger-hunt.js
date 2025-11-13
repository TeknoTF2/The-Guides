// Scavenger Hunt Game Logic

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

// Scenario definitions
const SCENARIOS = {
    low: [
        {
            type: 'Blog Post',
            document: `Personal Blog - Adventures with Sparky
Posted: March 15, 2024

Hey everyone! Just wanted to share some pics of my new puppy, Sparky!
He's a golden retriever and the most adorable thing ever. We got him
from Riverside Pet Adoption last weekend.

I graduated from Lincoln High School back in 2018, and I always dreamed
of having a dog. Now that I'm settled in my apartment on 42 Maple Street,
I finally made it happen!

Sparky loves playing fetch in the park. My favorite color is blue, which
is why I got him a blue collar. Can't wait to share more adventures!

- Sarah M.`,
            questions: [
                {
                    question: 'What is the pet\'s name?',
                    options: ['Buddy', 'Sparky', 'Max', 'Charlie'],
                    correct: 1
                },
                {
                    question: 'What high school did Sarah graduate from?',
                    options: ['Washington High', 'Lincoln High School', 'Roosevelt Academy', 'Madison High'],
                    correct: 1
                },
                {
                    question: 'What is Sarah\'s favorite color?',
                    options: ['Red', 'Green', 'Blue', 'Yellow'],
                    correct: 2
                }
            ]
        },
        {
            type: 'Social Media Post',
            document: `@TechGuru2024 - Twitter Thread
Posted: June 3, 2024

Just landed my dream job at CyberDyne Systems! 🎉 Starting as a
Junior Developer on July 1st. My employee ID is CD-4782.

Can't believe I'm finally using my Computer Science degree from
State University! Mom would be so proud. Her maiden name was
Thompson, and she always encouraged me to pursue tech.

My office is on the 5th floor, and I already met my team lead,
Michael Rodriguez. This is going to be amazing!

First day outfit: definitely wearing my lucky red tie. Red has
always been my power color since high school.

#NewJob #Developer #DreamJob`,
            questions: [
                {
                    question: 'What company did they get hired at?',
                    options: ['TechCorp', 'CyberDyne Systems', 'DataTech Inc', 'SystemWorks'],
                    correct: 1
                },
                {
                    question: 'What is their mother\'s maiden name?',
                    options: ['Rodriguez', 'Johnson', 'Thompson', 'Williams'],
                    correct: 2
                },
                {
                    question: 'What floor is the office on?',
                    options: ['3rd floor', '5th floor', '7th floor', '10th floor'],
                    correct: 1
                }
            ]
        },
        {
            type: 'Email',
            document: `From: jennifer.parker@email.com
To: familygroup@email.com
Subject: Summer Vacation Plans!
Date: May 20, 2024

Hi Family!

I've been thinking about our summer plans. Since we're all meeting
up in Portland this July, I wanted to coordinate everything.

My flight arrives on July 15th at 2:30 PM (flight number UA-892).
I'm staying at the Grand Hotel on Oak Street - room 304.

Also, quick reminder: my new phone number is 555-0142. The old
one got disconnected. My password for the family photo album is
still "sunshine2024" so you can all access it.

Can't wait to see everyone! It's been too long since we've all
been together. Remember, Uncle Bob's birthday is on July 18th,
so we should plan something special.

Love,
Jenny`,
            questions: [
                {
                    question: 'What is Jenny\'s new phone number?',
                    options: ['555-0132', '555-0142', '555-0152', '555-0162'],
                    correct: 1
                },
                {
                    question: 'What hotel room is she staying in?',
                    options: ['203', '304', '405', '506'],
                    correct: 1
                },
                {
                    question: 'What is the password for the family photo album?',
                    options: ['summer2024', 'sunshine2024', 'family2024', 'vacation2024'],
                    correct: 1
                }
            ]
        }
    ],
    standard: [
        {
            type: 'Intercepted Messages',
            document: `Text Message Thread - Alex & Morgan
Intercepted: April 10, 2024

Alex: Hey, did you reset the WiFi password?
Morgan: Yeah, same as always - our anniversary date
Alex: The day we got married or the day we met?
Morgan: The wedding date! June 14, 2019
Alex: So 06142019?
Morgan: Yep! Don't forget this time lol
Alex: Also, what was the name of that restaurant we went to?
Morgan: The one on our first date? Bella Vista
Alex: Right, I'm writing a review. They just asked for your
       mother's maiden name for the account
Morgan: It's Harrison. My mom's family name.
Alex: Perfect, thanks!
Morgan: BTW, picking up groceries. The code for the garage
        is still the last 4 digits of your SSN right?
Alex: Yeah, 7392. Don't lose that!`,
            questions: [
                {
                    question: 'What is the WiFi password?',
                    options: ['06142019', '14062019', '20190614', '19062014'],
                    correct: 0
                },
                {
                    question: 'What year did they get married?',
                    options: ['2017', '2018', '2019', '2020'],
                    correct: 2
                },
                {
                    question: 'What is Morgan\'s mother\'s maiden name?',
                    options: ['Morgan', 'Bella', 'Harrison', 'Vista'],
                    correct: 2
                },
                {
                    question: 'What is the garage code?',
                    options: ['7392', '2019', '0614', '1406'],
                    correct: 0
                }
            ]
        },
        {
            type: 'Company Memo',
            document: `INTERNAL MEMO - CONFIDENTIAL
TechFlow Industries
Date: September 8, 2024

TO: All Department Heads
FROM: David Chen, IT Security
RE: System Access Update

Effective immediately, all senior staff must update their
credentials following the new security protocol.

New badge access codes will be employee initials + birth year.
For example, David Chen (born 1985) = DC1985

Staff requiring immediate access:
- Rachel Foster (DOB: March 3, 1990) - Marketing Director
- James Miller (DOB: December 12, 1988) - Finance Head
- Patricia Wong (DOB: July 22, 1992) - Operations Manager

Server room access remains restricted to IT staff only.
Current IT team members are David Chen, Marcus Johnson,
and Elena Rodriguez.

The new system server IP is 192.168.1.50, port 8080.
Default administrator username remains "admin_techflow".

For password resets, security questions must be configured.
Reminder: Most common security questions are:
- First pet name
- Mother's maiden name
- City of birth
- First car model

Please complete updates by September 15, 2024.

-DC`,
            questions: [
                {
                    question: 'What would Rachel Foster\'s badge access code be?',
                    options: ['RF1990', 'RF1988', 'RF1992', 'RW1990'],
                    correct: 0
                },
                {
                    question: 'What is the server IP address?',
                    options: ['192.168.1.40', '192.168.1.50', '192.168.2.50', '192.168.1.60'],
                    correct: 1
                },
                {
                    question: 'Who is NOT on the IT team?',
                    options: ['David Chen', 'Marcus Johnson', 'James Miller', 'Elena Rodriguez'],
                    correct: 2
                },
                {
                    question: 'What is the administrator username?',
                    options: ['admin_techflow', 'techflow_admin', 'admin_system', 'system_admin'],
                    correct: 0
                }
            ]
        },
        {
            type: 'Forum Post',
            document: `CryptoTalk Forums - User: BlockchainKing
Posted: February 28, 2024, 11:47 PM

Subject: Finally cracked my old wallet!

Guys, I FINALLY recovered my old crypto wallet from 2017!
I thought I'd lost it forever but found my old backup codes.

Backstory: I created the wallet right after my 25th birthday
(I'm 32 now, born in July). Used my dog's name "Rusty" and
my lucky number 7 in the password. The wallet address starts
with 1A7x...

I had written down the seed phrase on paper and stored it at
my parents' house in Denver. Almost threw it away during their
move last year!

Total in the wallet: 2.5 BTC. At today's price of $63,000 per
BTC, that's a nice chunk of change!

My two-factor authentication was set up with my old phone number
ending in 4829. Need to update that now.

Anyone else have wallet recovery success stories?`,
            questions: [
                {
                    question: 'What year was BlockchainKing born?',
                    options: ['1990', '1991', '1992', '1993'],
                    correct: 1
                },
                {
                    question: 'How much is the wallet worth in USD?',
                    options: ['$157,500', '$147,500', '$167,500', '$137,500'],
                    correct: 0
                },
                {
                    question: 'What city did they store the backup in?',
                    options: ['Dallas', 'Detroit', 'Denver', 'Des Moines'],
                    correct: 2
                },
                {
                    question: 'What is the dog\'s name mentioned?',
                    options: ['Rocky', 'Rusty', 'Buddy', 'Lucky'],
                    correct: 1
                }
            ]
        }
    ],
    high: [
        {
            type: 'Fragmented Logs',
            document: `System Access Logs - CORRUPTED DATA
Server: PROD-DB-01 | Location: Unknown
Date Range: [CORRUPTED]

[LOG FRAGMENT 1]
10:42:15 - User login attempt: j.anderson@
10:42:18 - Authentication failed - incorrect password
10:42:45 - User login attempt: j.anderson@corp.net
10:42:47 - SUCCESS - Welcome back, Dr. Anderson
10:43:02 - Accessed: Patient_Records/Cardiology/2024/

[LOG FRAGMENT 2]
[TIME CORRUPTED] - Database query executed
Query: SELECT * FROM employees WHERE dept='Research'
       AND clearance_level >= 4
Results: 12 records returned
Top result: Anderson, Jennifer - Employee #R-4782
           Clearance: Level 5 (Restricted)
           Department: Neurology Research
           Start Date: 03/15/2019

[LOG FRAGMENT 3]
11:15:33 - VPN connection established
IP Address: 172.16.54.xxx (Internal network)
Location services: GPS coordinates suggest building B, floor 3
Workstation ID: WS-NR-0847

[LOG FRAGMENT 4]
11:47:22 - Badge scan: Entry point NORTH-B3-LAB
11:47:25 - Voice authentication requested
11:47:28 - Voice print confirmed
11:47:30 - Biometric scan: Access granted to Cold Storage Unit 7

[LOG FRAGMENT 5]
Subject: RE: Weekend Plans
From: j.anderson@ [DOMAIN CORRUPTED]
The kids want to visit [CORRUPTED] this weekend. Emily is excited
about the marine exhibit. She's been talking about it since her
birthday last month (she turned 8 on the [CORRUPTED]).
We should go before [CORRUPTED] closes for renovations.

[LOG FRAGMENT 6]
14:22:10 - System notification: Password expires in 5 days
14:22:45 - Password change initiated
14:22:58 - Security question 1: "City where you were born?"
14:23:03 - Answer: Boston
14:23:05 - Security question 2: "First car?"
14:23:09 - Answer: Honda Civic
14:23:11 - Password updated successfully`,
            questions: [
                {
                    question: 'What is Dr. Anderson\'s employee number?',
                    options: ['R-4872', 'R-4782', 'R-4728', 'R-4287'],
                    correct: 1
                },
                {
                    question: 'What department does Dr. Anderson work in?',
                    options: ['Cardiology', 'Research', 'Neurology Research', 'Biology'],
                    correct: 2
                },
                {
                    question: 'What floor is Dr. Anderson\'s workstation likely on?',
                    options: ['Floor 2', 'Floor 3', 'Floor 4', 'Floor 5'],
                    correct: 1
                },
                {
                    question: 'What city was Dr. Anderson born in?',
                    options: ['Brooklyn', 'Baltimore', 'Boston', 'Buffalo'],
                    correct: 2
                },
                {
                    question: 'What was Dr. Anderson\'s first car?',
                    options: ['Toyota Camry', 'Honda Civic', 'Ford Focus', 'Nissan Sentra'],
                    correct: 1
                }
            ]
        },
        {
            type: 'Partial Chat History',
            document: `Encrypted Chat - Partial Recovery
Participants: RedFox, BlueBird, NightOwl
Date: [TIMESTAMPS MISSING]

RedFox: The package arrives Tuesday
BlueBird: Same time as usual?
RedFox: Affirmative. 14:30 hours
NightOwl: Location?
RedFox: Warehouse district, near the old mill
BlueBird: That's the building on 5th and Morrison, right?
RedFox: Correct
NightOwl: Access code?
RedFox: Same sequence - building number + current month + day
BlueBird: So for building 847 on May 12th that would be...
RedFox: 84705-12
NightOwl: Got it

[SECTION CORRUPTED]

BlueBird: What about the contact?
RedFox: Goes by "Marcus" but real name starts with R
NightOwl: How do we verify?
RedFox: Ask about the painting. He'll mention his grandmother
BlueBird: The one who lived in Prague?
RedFox: No, that was my grandmother. His was from Vienna
NightOwl: What year did she immigrate?
RedFox: He said 1956, during the revolution
BlueBird: And she brought that painting with her?
RedFox: Correct. Worth over $2 million now
NightOwl: Incredible

[SECTION CORRUPTED]

RedFox: Emergency protocol - if compromised, use the backup number
BlueBird: The one ending in 7733?
RedFox: No, that's OLD. New number ends in 8847
NightOwl: And the safe word?
RedFox: Same as BlueBird's cat's name
BlueBird: Haha, Whiskers? Really?
RedFox: Simple is secure
NightOwl: Fair enough

[SECTION CORRUPTED]

NightOwl: By the way, did you get that data from the server?
RedFox: Yes, downloaded 47 GB total
BlueBird: From which IP?
RedFox: The internal one, 10.0.0.152
NightOwl: Port 8443?
RedFox: Affirmative
BlueBird: Encryption?
RedFox: AES-256, key length 2048 bits`,
            questions: [
                {
                    question: 'What is the warehouse access code for May 12th?',
                    options: ['84705-12', '84712-05', '12-05847', '847-0512'],
                    correct: 0
                },
                {
                    question: 'What city was Marcus\'s grandmother from?',
                    options: ['Prague', 'Vienna', 'Budapest', 'Berlin'],
                    correct: 1
                },
                {
                    question: 'What are the last 4 digits of the backup number?',
                    options: ['7733', '8847', '8437', '4788'],
                    correct: 1
                },
                {
                    question: 'What is the safe word?',
                    options: ['Marcus', 'Vienna', 'Whiskers', 'Painting'],
                    correct: 2
                },
                {
                    question: 'What is the internal server IP?',
                    options: ['10.0.0.152', '10.0.0.151', '192.168.1.152', '172.16.0.152'],
                    correct: 0
                }
            ]
        },
        {
            type: 'Investigation Notes',
            document: `CASE FILE #2847-C - CLASSIFIED
Lead Investigator: Agent Morrison
Target: Unknown (Codename: "Phoenix")

SURVEILLANCE NOTES:

Day 1: Subject spotted at coffee shop on Market St.
Ordered: Large black coffee, no sugar. Paid with credit card
showing initials "A.R." - last 4 digits visible: 4729

Day 3: Followed subject to residential area. Subject entered
building at 2847 Elm Street, Apartment unknown. Building has
6 floors, 4 units per floor.

Day 5: Intercepted delivery. Package addressed to "A. Reynolds,
Unit 3B". Contents: Electronics equipment, untraceable.

Day 7: Subject made phone call from pay phone (rare these days).
Called number: 555-01XX. Could only hear partial: "...meet at
the usual place... Thursday at 8..." Call lasted 47 seconds.

Day 9: Tracked subject to parking garage. Vehicle: Silver sedan,
license plate partially visible: "XK7-[OBSCURED]-92". Parking
spot reserved for "A. Reynolds - Space 24".

Day 12: Analyzed credit card transactions. Pattern shows weekly
purchases at same gas station (corner of 8th & Madison, always
Thursday mornings) and monthly payments to "StorageMart Facility."

Day 15: Background check results:
- Subject's employer: TechCore Industries (Employee since 2018)
- Previous residence: Seattle, WA (2015-2018)
- Education: Computer Science degree, University of Washington
- Associates: Frequently contacts three numbers
  Primary: 555-0147 (labeled "Mom" in phone records)
  Secondary: 555-0198 (labeled "J.M.")
  Tertiary: The pay phone number from Day 7

Day 18: Security footage recovered from building lobby. Subject
checks mailbox daily at 6:00 PM. Mailbox number matches unit: 3B.
Subject appears to be approximately 30-35 years old, brown hair,
approximately 5'10" tall.

Day 20: Discovered subject's social media under alias. Posts
from 2016 mention: "Finally graduating! Can't believe it's been
4 years at UW. Mom would be proud." Additional post mentions
starting position at previous company "DataFlow Inc" in Seattle.

CONCLUSION: Subject is likely Aaron or Alexandra Reynolds, lives
in unit 3B at 2847 Elm Street, works at TechCore Industries.
Further surveillance required to determine full identity and
connection to ongoing investigation.`,
            questions: [
                {
                    question: 'What is the subject\'s apartment unit?',
                    options: ['2B', '3B', '4B', '3A'],
                    correct: 1
                },
                {
                    question: 'What are the last 4 digits of the credit card?',
                    options: ['4729', '2847', '4792', '7294'],
                    correct: 0
                },
                {
                    question: 'What parking space number does the subject use?',
                    options: ['22', '23', '24', '25'],
                    correct: 2
                },
                {
                    question: 'When did the subject graduate from university?',
                    options: ['2014', '2015', '2016', '2017'],
                    correct: 2
                },
                {
                    question: 'What is Mom\'s phone number?',
                    options: ['555-0147', '555-0198', '555-0174', '555-0189'],
                    correct: 0
                }
            ]
        }
    ]
};

// Scenario metadata for selection screen
const SCENARIO_INFO = {
    low: [
        { name: 'Personal Blog', desc: 'Social media post about daily life' },
        { name: 'Twitter Thread', desc: 'Public job announcement' },
        { name: 'Email Chain', desc: 'Family vacation planning' }
    ],
    standard: [
        { name: 'Text Messages', desc: 'Private conversation thread' },
        { name: 'Company Memo', desc: 'Internal security protocol update' },
        { name: 'Forum Post', desc: 'Cryptocurrency wallet recovery story' }
    ],
    high: [
        { name: 'System Logs', desc: 'Corrupted server access records' },
        { name: 'Encrypted Chat', desc: 'Partial message recovery' },
        { name: 'Investigation Notes', desc: 'Surveillance case file' }
    ]
};

// Difficulty display names
const DIFFICULTY_NAMES = {
    low: 'LOW SECURITY',
    standard: 'STANDARD SECURITY',
    high: 'HIGH SECURITY'
};

// Game state
let currentDifficulty = null;
let currentScenario = null;
let currentQuestionIndex = 0;
let correctAnswers = 0;
let totalQuestions = 0;

// DOM elements
const difficultyScreen = document.getElementById('difficulty-screen');
const scenarioScreen = document.getElementById('scenario-screen');
const documentScreen = document.getElementById('document-screen');
const questionsScreen = document.getElementById('questions-screen');
const resultsScreen = document.getElementById('results-screen');

const documentType = document.getElementById('document-type');
const documentContent = document.getElementById('document-content');
const proceedBtn = document.getElementById('proceed-btn');

const questionsProgress = document.getElementById('questions-progress');
const questionText = document.getElementById('question-text');
const questionOptions = document.getElementById('question-options');
const messageDisplay = document.getElementById('message-display');

const resultsStatus = document.getElementById('results-status');
const resultsScore = document.getElementById('results-score');
const resultsMessage = document.getElementById('results-message');
const retryBtn = document.getElementById('retry-btn');
const menuBtn = document.getElementById('menu-btn');
const backBtn = document.getElementById('back-btn');

// Initialize game
function init() {
    setupDifficultySelection();
    setupScenarioSelection();
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

// Select difficulty and show scenario selection
function selectDifficulty(difficulty) {
    currentDifficulty = difficulty;

    // Update scenario screen with difficulty info
    const scenarioSubtitle = document.getElementById('scenario-subtitle');
    scenarioSubtitle.textContent = DIFFICULTY_NAMES[difficulty];

    // Populate scenario descriptions
    const scenarioInfo = SCENARIO_INFO[difficulty];
    scenarioInfo.forEach((info, index) => {
        const descElement = document.getElementById(`scenario-desc-${index}`);
        descElement.textContent = `${info.name} - ${info.desc}`;
    });

    // Show scenario screen
    difficultyScreen.classList.remove('active');
    scenarioScreen.classList.add('active');
}

// Setup scenario selection
function setupScenarioSelection() {
    const scenarioOptions = document.querySelectorAll('.scenario-option');

    scenarioOptions.forEach(option => {
        option.addEventListener('click', function() {
            const scenarioIndex = parseInt(this.getAttribute('data-scenario'));
            selectScenario(scenarioIndex);
        });

        option.setAttribute('tabindex', '0');
        option.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const scenarioIndex = parseInt(this.getAttribute('data-scenario'));
                selectScenario(scenarioIndex);
            }
        });
    });

    // Back to difficulty button
    const backToDifficultyBtn = document.getElementById('back-to-difficulty-btn');
    backToDifficultyBtn.addEventListener('click', function() {
        scenarioScreen.classList.remove('active');
        difficultyScreen.classList.add('active');
    });
}

// Select scenario and load document
function selectScenario(scenarioIndex) {
    // Load the selected scenario
    currentScenario = SCENARIOS[currentDifficulty][scenarioIndex];

    // Reset state
    currentQuestionIndex = 0;
    correctAnswers = 0;
    totalQuestions = currentScenario.questions.length;

    // Show document screen
    scenarioScreen.classList.remove('active');
    documentScreen.classList.add('active');

    // Load document
    documentType.textContent = currentScenario.type.toUpperCase();
    documentContent.textContent = currentScenario.document;
}

// Setup event listeners
function setupEventListeners() {
    proceedBtn.addEventListener('click', startQuestions);
    retryBtn.addEventListener('click', resetGame);
    menuBtn.addEventListener('click', returnToMenu);
    backBtn.addEventListener('click', returnToMenu);
}

// Start questions phase
function startQuestions() {
    documentScreen.classList.remove('active');
    questionsScreen.classList.add('active');

    showQuestion();
}

// Show current question
function showQuestion() {
    const question = currentScenario.questions[currentQuestionIndex];

    // Update progress
    questionsProgress.textContent = `QUESTION ${currentQuestionIndex + 1} / ${totalQuestions}`;

    // Update question text
    questionText.textContent = question.question;

    // Clear previous options
    questionOptions.innerHTML = '';
    messageDisplay.innerHTML = '';

    // Create option buttons
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'question-option';
        optionDiv.textContent = option;
        optionDiv.addEventListener('click', () => selectAnswer(index));
        questionOptions.appendChild(optionDiv);
    });
}

// Handle answer selection
function selectAnswer(selectedIndex) {
    const question = currentScenario.questions[currentQuestionIndex];
    const options = questionOptions.querySelectorAll('.question-option');
    const selectedOption = options[selectedIndex];

    // Disable all options
    options.forEach(opt => {
        opt.style.pointerEvents = 'none';
    });

    // Check if correct
    if (selectedIndex === question.correct) {
        correctAnswers++;
        selectedOption.classList.add('correct');
        showMessage('CORRECT', 'success', 'ACCESS GRANTED');
    } else {
        selectedOption.classList.add('incorrect');
        options[question.correct].classList.add('correct');
        showMessage('INCORRECT', 'failure', 'ACCESS DENIED');
    }

    // Move to next question after delay
    setTimeout(() => {
        currentQuestionIndex++;

        if (currentQuestionIndex < totalQuestions) {
            showQuestion();
        } else {
            showResults();
        }
    }, 2000);
}

// Show results
function showResults() {
    questionsScreen.classList.remove('active');
    resultsScreen.classList.add('active');

    const percentage = (correctAnswers / totalQuestions) * 100;

    // Update results display
    resultsScore.textContent = `${correctAnswers} / ${totalQuestions} CORRECT`;

    if (percentage === 100) {
        resultsStatus.textContent = 'PERFECT ACCESS';
        resultsStatus.classList.add('success');
        resultsStatus.classList.remove('failure');
        resultsMessage.textContent = 'OUTSTANDING PERFORMANCE. ALL SECURITY PROTOCOLS BYPASSED. FULL SYSTEM ACCESS GRANTED.';
    } else if (percentage >= 60) {
        resultsStatus.textContent = 'ACCESS GRANTED';
        resultsStatus.classList.add('success');
        resultsStatus.classList.remove('failure');
        resultsMessage.textContent = 'SUFFICIENT INTELLIGENCE GATHERED. PARTIAL ACCESS GRANTED. CONTINUE SURVEILLANCE.';
    } else {
        resultsStatus.textContent = 'ACCESS DENIED';
        resultsStatus.classList.remove('success');
        resultsStatus.classList.add('failure');
        resultsMessage.textContent = 'INSUFFICIENT INTELLIGENCE. SECURITY BREACH DETECTED. MISSION FAILED.';
    }
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

// Reset game - go back to scenario selection
function resetGame() {
    resultsScreen.classList.remove('active');
    scenarioScreen.classList.add('active');
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
