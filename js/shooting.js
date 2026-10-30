// Adapted from feature/shoot-system: monster targets, click-to-survive scares and multiplying popups.
let shootingScore = 0;
let shootingSeconds = 15;
let shootingActive = false;
let scareActive = false;
let shotsUntilScare = 0;
let scareClicks = 15;
let shootingClock = null;
let shootingSpawner = null;
const shootingTimeouts = new Set();

const shootingImages = [
    "src/assets/images/monster1.jpg",
    "src/assets/images/monster2.jpg",
    "src/assets/images/monster3.jpg"
];

function RandomScareThreshold() {
    return Math.floor(Math.random() * 4) + 5;
}

function StartShootingGame() {
    if (shootingActive) return;
    shootingScore = 0;
    shootingSeconds = 15;
    shootingActive = true;
    scareActive = false;
    shotsUntilScare = RandomScareThreshold();

    const overlay = document.createElement("section");
    overlay.id = "shootingOverlay";
    overlay.setAttribute("aria-label", "Monster shooter");
    overlay.innerHTML = [
        '<header class="shooting-header">',
        '<h2>MONSTER SHOOTER</h2>',
        '<span>TIME: <strong id="shootingTime">15</strong>s</span>',
        '<span>KILLS: <strong id="shootingScore">0</strong> / 10</span>',
        '<button id="shootingExit" type="button">EXIT</button>',
        '</header>',
        '<div id="shootingArena" aria-label="Shoot the monsters" tabindex="-1"></div>',
        '<div id="shootingScare" class="shooting-hidden" role="button" tabindex="0" aria-label="Click 15 times to escape">',
        '<img src="src/assets/images/monster3.jpg" alt="Scary monster" draggable="false">',
        '<div class="scare-label">CLICK TO SURVIVE! <span id="scareRemaining">15</span></div>',
        '</div>'
    ].join("");
    document.body.appendChild(overlay);

    // A click event is truthy; passing EndShootingGame directly would count EXIT as a win.
    document.getElementById("shootingExit").addEventListener("click", () => EndShootingGame(false));
    const scare = document.getElementById("shootingScare");
    scare.addEventListener("click", HandleScareClick);
    scare.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            HandleScareClick();
        }
    });
    document.getElementById("shootingArena").addEventListener("click", event => {
        if (!event.target.closest(".shooting-monster")) horrorAudio.playGunshotSound();
    });

    SpawnShootingMonster();
    shootingSpawner = setInterval(SpawnShootingMonster, 800);
    shootingClock = setInterval(() => {
        if (!shootingActive || scareActive) return;
        shootingSeconds--;
        document.getElementById("shootingTime").textContent = shootingSeconds;
        if (shootingSeconds <= 0) EndShootingGame(false);
    }, 1000);
    document.getElementById("shootingExit").focus();
}

function ClearShootingTargets() {
    for (const timeout of shootingTimeouts) clearTimeout(timeout);
    shootingTimeouts.clear();
    document.getElementById("shootingArena")?.replaceChildren();
}

function SpawnShootingMonster() {
    if (!shootingActive || scareActive) return;
    const arena = document.getElementById("shootingArena");
    if (!arena) return;
    const monster = document.createElement("button");
    monster.type = "button";
    monster.className = "shooting-monster";
    monster.setAttribute("aria-label", "Shoot monster");
    const image = document.createElement("img");
    image.src = shootingImages[Math.floor(Math.random() * shootingImages.length)];
    image.alt = "";
    image.draggable = false;
    monster.appendChild(image);

    const size = Math.max(24, Math.min(110, Math.max(65, arena.clientWidth * 0.18), arena.clientHeight, arena.clientWidth));
    Object.assign(monster.style, {
        width: size + "px", height: size + "px",
        left: Math.random() * Math.max(0, arena.clientWidth - size) + "px",
        top: Math.random() * Math.max(0, arena.clientHeight - size) + "px"
    });

    monster.addEventListener("click", () => {
        if (!shootingActive || scareActive || !monster.isConnected) return;
        monster.remove();
        clearTimeout(expiry);
        shootingTimeouts.delete(expiry);
        horrorAudio.playGunshotSound();
        shootingScore++;
        document.getElementById("shootingScore").textContent = shootingScore;
        if (shootingScore >= 10) {
            EndShootingGame(true);
            return;
        }
        shotsUntilScare--;
        if (shotsUntilScare <= 0) StartShootingScare();
    });
    arena.appendChild(monster);
    const expiry = setTimeout(() => {
        monster.remove();
        shootingTimeouts.delete(expiry);
    }, 2000);
    shootingTimeouts.add(expiry);
}

function StartShootingScare() {
    if (!shootingActive) return;
    scareActive = true;
    scareClicks = 15;
    document.getElementById("scareRemaining").textContent = scareClicks;
    ClearShootingTargets();
    const scare = document.getElementById("shootingScare");
    scare.classList.remove("shooting-hidden");
    horrorAudio.playJumpscareSound();
    scare.focus();
}

function HandleScareClick() {
    if (!shootingActive || !scareActive) return;
    scareClicks--;
    document.getElementById("scareRemaining").textContent = scareClicks;
    if (scareClicks <= 0) {
        scareActive = false;
        shotsUntilScare = RandomScareThreshold();
        document.getElementById("shootingScare").classList.add("shooting-hidden");
        SpawnShootingMonster();
        document.getElementById("shootingArena").focus();
    }
}

// Cancel is used for menu/restart/game over and never reports a loss or opens an alert.
function CancelShootingGame() {
    shootingActive = false;
    scareActive = false;
    clearInterval(shootingClock);
    clearInterval(shootingSpawner);
    shootingClock = null;
    shootingSpawner = null;
    ClearShootingTargets();
    document.getElementById("shootingOverlay")?.remove();
}

function EndShootingGame(won = false) {
    if (!shootingActive) return;
    const result = { score: shootingScore, won: won === true };
    CancelShootingGame();

    alert(result.won ? "YOU SURVIVED! 10 MONSTERS KILLED!" : "TIME'S UP! YOU FAILED!");
    StartFakePopups();
    document.dispatchEvent(new CustomEvent("shootingGameEnded", { detail: result }));
}

let popupsActive = false;
let popupCount = 0;
let popupClock = null;
let typedKeys = "";

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

function StartFakePopups() {
    popupsActive = true;
    ShowFakePopup();
    if (popupClock === null) popupClock = setInterval(ShowFakePopup, 4000);
}

function StopFakePopups() {
    popupsActive = false;
    clearInterval(popupClock);
    popupClock = null;
    typedKeys = "";
    popupCount = 0;
    document.querySelectorAll(".fake-popup").forEach(popup => popup.remove());
}

function ShowFakePopup() {
    if (!popupsActive) return;
    popupCount++;
    const popup = document.createElement("div");
    popup.className = "fake-popup";
    popup.setAttribute("role", "dialog");
    popup.setAttribute("aria-label", "System Error " + popupCount);
    const randomError = fakeErrors[Math.floor(Math.random() * fakeErrors.length)];
    popup.innerHTML = [
        '<div class="fake-popup-header">',
        '<span>System Error</span>',
        '<button class="fake-popup-close" type="button" aria-label="Close system error">✕</button>',
        '</div><div class="fake-popup-content">',
        '<h3>⚠️ Windows Security</h3>',
        '<p>' + randomError + '</p>',
        '<p>Error count: ' + popupCount + '</p></div>'
    ].join("");
    document.body.appendChild(popup);
    const bounds = popup.getBoundingClientRect();
    popup.style.left = Math.random() * Math.max(0, window.innerWidth - bounds.width) + "px";
    popup.style.top = Math.random() * Math.max(0, window.innerHeight - bounds.height) + "px";
    popup.style.zIndex = 99999 + popupCount;

    popup.querySelector(".fake-popup-close").addEventListener("click", () => {
        popup.remove();
        ShowFakePopup();
        ShowFakePopup();
    });
}

document.addEventListener("keydown", event => {
    if (!popupsActive || event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) return;
    typedKeys = (typedKeys + event.key.toLowerCase()).slice(-4);
    if (typedKeys === "stop") StopFakePopups();
});

window.addEventListener("resize", () => {
    if (!shootingActive || scareActive) return;
    ClearShootingTargets();
    SpawnShootingMonster();
});
