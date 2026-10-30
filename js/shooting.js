// Monster shooting mini-game. Call StartShootingGame() from another game when needed.
let shootingScore = 0;
let shootingSeconds = 60;
let shootingActive = false;
let scareActive = false;
let shotsUntilScare = 0;
let scareClicks = 15;
let shootingClock = null;
let shootingSpawner = null;
let popupsActive = false;

const shootingImages = [
    'src/assets/images/monster1.jpg',
    'src/assets/images/monster2.jpg',
    'src/assets/images/monster3.jpg'
];

function RandomScareThreshold() {
    return Math.floor(Math.random() * 8) + 5; // 5 to 12 hits
}

function StartShootingGame() {
    if (shootingActive) return;
    shootingScore = 0;
    shootingSeconds = 15;
    shootingActive = true;
    scareActive = false;
    shotsUntilScare = RandomScareThreshold();

    const overlay = document.createElement('section');
    overlay.id = 'shootingOverlay';
    overlay.innerHTML = `
        <header class="shooting-header">
            <h2>MONSTER SHOOTER</h2>
            <span>TIME: <strong id="shootingTime">60</strong>s</span>
            <span>KILLS: <strong id="shootingScore">0</strong></span>
            <button id="shootingExit" type="button">EXIT</button>
        </header>
        <div id="shootingArena" aria-label="Shoot the monsters"></div>
        <div id="shootingScare" class="shooting-hidden" role="button" tabindex="0" aria-label="Click 15 times to escape">
            <img src="src/assets/images/monster3.jpg" alt="Scary monster">
            <div class="scare-label">CLICK TO SURVIVE! <span id="scareRemaining">15</span></div>
        </div>
        <div id="shootingResult" class="shooting-hidden"></div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('shootingExit').addEventListener('click', EndShootingGame);
    document.getElementById('shootingScare').addEventListener('click', HandleScareClick);
    document.getElementById('shootingScare').addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); HandleScareClick(); }
    });

    SpawnShootingMonster();
    shootingSpawner = setInterval(SpawnShootingMonster, 800);
    shootingClock = setInterval(() => {
        if (!shootingActive || scareActive) return;
        shootingSeconds--;
        document.getElementById('shootingTime').textContent = shootingSeconds;
        if (shootingSeconds <= 0) EndShootingGame();
    }, 1000);
}

function SpawnShootingMonster() {
    if (!shootingActive || scareActive) return;
    const arena = document.getElementById('shootingArena');
    if (!arena) return;
    const monster = document.createElement('img');
    monster.className = 'shooting-monster';
    monster.src = shootingImages[Math.floor(Math.random() * shootingImages.length)];
    monster.alt = 'Monster target';
    const size = Math.min(110, Math.max(65, arena.clientWidth * 0.18));
    monster.style.width = size + 'px';
    monster.style.height = size + 'px';
    monster.style.left = Math.random() * Math.max(0, arena.clientWidth - size) + 'px';
    monster.style.top = Math.random() * Math.max(0, arena.clientHeight - size) + 'px';
    monster.addEventListener('click', () => {
        if (!shootingActive || scareActive) return;
        monster.remove();
        shootingScore++;
        if (shootingScore >= 10) {
            EndShootingGame(true);
            return;
        }
        document.getElementById('shootingScore').textContent = shootingScore;
        shotsUntilScare--;
        if (shotsUntilScare <= 0) StartShootingScare();
    });
    arena.appendChild(monster);
    setTimeout(() => monster.remove(), 2000);
}

function StartShootingScare() {
    scareActive = true;
    scareClicks = 15;
    document.getElementById('scareRemaining').textContent = scareClicks;
    document.getElementById('shootingArena').replaceChildren();
    document.getElementById('shootingScare').classList.remove('shooting-hidden');
}

function HandleScareClick() {
    if (!shootingActive || !scareActive) return;
    scareClicks--;
    document.getElementById('scareRemaining').textContent = scareClicks;
    if (scareClicks <= 0) {
        scareActive = false;
        shotsUntilScare = RandomScareThreshold();
        document.getElementById('shootingScare').classList.add('shooting-hidden');
    }
}

function EndShootingGame(won) {
    if (!shootingActive) return;

    shootingActive = false;
    scareActive = false;

    clearInterval(shootingClock);
    clearInterval(shootingSpawner);

    document.getElementById('shootingOverlay')?.remove();

    if (won) {
        alert("YOU SURVIVED! 10 MONSTERS KILLED!");
        popupsActive = true;
        ShowFakePopup();
        // Tell the other games that the player won
        document.dispatchEvent(new CustomEvent('shootingGameEnded', {
            detail: {
                score: shootingScore,
                won: true
            }
        }));
    }
    else {
        alert("TIME'S UP! YOU FAILED!");
        popupsActive = true;
        ShowFakePopup();

        // Tell the other games that the player lost
        document.dispatchEvent(new CustomEvent('shootingGameEnded', {
            detail: {
                score: shootingScore,
                won: false
            }
        }));
    }
}


let popupCount = 0;

const fakeErrors = [
    "Critical system error detected.",
    "Unknown process is running.",
    "Your computer is acting suspiciously.",
    "Error 0x666: Something went wrong.",
    "Failed to close this window.",
    "WHY ARE YOU STILL CLICKING?",
    "STOP CLICKING THE X.",
    "YOU CANNOT ESCAPE."
];

function ShowFakePopup() {
    if (!popupsActive) return;
    popupCount++;

    const popup = document.createElement("div");
    popup.className = "fake-popup";

    const randomError = fakeErrors[
        Math.floor(Math.random() * fakeErrors.length)
    ];

    popup.innerHTML = `
        <div class="fake-popup-header">
            <span>System Error</span>
            <button class="fake-popup-close">✕</button>
        </div>

        <div class="fake-popup-content">
            <h3>⚠️ Windows Security</h3>
            <p>${randomError}</p>
            <p>Error count: ${popupCount}</p>
        </div>
    `;

    // Random position on screen
    popup.style.left =
        Math.random() * Math.max(0, window.innerWidth - 350) + "px";

    popup.style.top =
        Math.random() * Math.max(0, window.innerHeight - 180) + "px";

    document.body.appendChild(popup);

    // Closing one popup creates two more
    popup.querySelector(".fake-popup-close")
        .addEventListener("click", function () {
            popup.remove();

            ShowFakePopup();
            ShowFakePopup();
        });
}

let typedKeys = "";

document.addEventListener("keydown", function (event) {
    // Save the keys the player types
    typedKeys += event.key.toLowerCase();

    // Keep only the last 4 characters
    typedKeys = typedKeys.slice(-4);

    // Check if the player typed STOP
    if (typedKeys === "stop") {
        // Remove all fake popups
        document.querySelectorAll(".fake-popup").forEach(popup => {
            popup.remove();
        });

        // Reset the typed keys
        typedKeys = "";

        // Stop new popups from appearing
        popupsActive = false;
    }
});