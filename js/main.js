// Coordinates DOM knives, blood and the shooting game from feature/shoot-system.
class HorrorCraftGame {
    constructor() {
        this.container = document.getElementById("gameContainer");
        this.shooting = false;
        this.active = false;
        this.frame = null;
        this.update = this.update.bind(this);

        document.getElementById("knives").addEventListener("click", event => {
            const button = event.target.closest(".knife-hitbox");
            if (button) this.pullKnife(button);
        });
        document.addEventListener("shootingGameEnded", event => this.finishShooting(event.detail));
        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(this.container);
    }

    resize() {
        const scale = Math.max(0.1, Math.min(1, (this.container.clientWidth - 20) / 600, (this.container.clientHeight - 42) / 600));
        document.getElementById("characterScene").style.setProperty("--character-scale", scale);
    }

    start() {
        this.stop();
        this.score = 0;
        this.knivesExtracted = 0;
        this.lives = 3;
        this.active = true;
        this.nextMonsterAt = performance.now() + 2000;
        resetDifficulty();
        createKnives();
        this.resumeKnives();
        document.getElementById("gameOverOverlay").hidden = true;
        document.getElementById("hitboxDebug").checked = false;
        document.documentElement.classList.remove("show-hitboxes");
        document.getElementById("gameStatus").textContent = "Your nightmare begins...";
        window.bloodSystem.resetBlood();
        window.bloodSystem.start();
        this.resize();
        this.updateUI();
        startHeartbeat();
        this.frame = requestAnimationFrame(this.update);
        document.querySelector(".knife-hitbox").focus();
    }

    stop() {
        this.active = false;
        cancelAnimationFrame(this.frame);
        this.frame = null;
        this.shooting = false;
        document.getElementById("gameScreen").inert = false;
        CancelShootingGame();
        StopFakePopups();
        stopHeartbeat();
        window.bloodSystem.stop();
    }

    pullKnife(button) {
        if (!this.active || this.shooting || button.disabled || !button.isConnected) return;
        button.parentElement.remove();
        this.score += 150;
        this.knivesExtracted++;
        increaseDifficulty();
        horrorAudio.playKnifePullSound();
        window.bloodSystem.addBloodSplatter();
        this.updateUI();
        updateHeartbeat();

        if (document.querySelectorAll(".knife-hitbox").length === 0) {
            createKnives();
            document.getElementById("gameStatus").textContent = "Another wave. The difficulty stays with you.";
        }
    }

    updateUI() {
        document.getElementById("scoreDisplay").textContent = String(this.score).padStart(6, "0");
        document.getElementById("knivesDisplay").textContent = this.knivesExtracted;
        const lives = document.getElementById("livesContainer");
        lives.textContent = "♥".repeat(this.lives) + "♡".repeat(3 - this.lives);
        lives.setAttribute("aria-label", this.lives + " lives remaining");
    }

    spawnMonster() {
        if (!this.active || this.shooting) return;
        this.shooting = true;
        setKnivesEnabled(false);
        document.getElementById("gameScreen").inert = true;
        document.getElementById("gameHint").textContent = "Kill 10 monsters to clear the blood!";
        StartShootingGame();
        horrorAudio.playMonsterAlarm();
    }

    resumeKnives() {
        this.shooting = false;
        document.getElementById("gameScreen").inert = false;
        document.getElementById("gameHint").textContent = "Pull the knives. Every pull makes the remaining hitboxes smaller.";
        setKnivesEnabled(this.active);
        this.nextMonsterAt = performance.now() + 2000;
    }

    finishShooting(result) {
        if (!this.active || !this.shooting) return;
        this.resumeKnives();
        this.score += result.score * 100;
        if (result.won) {
            this.score += 1000;
            window.bloodSystem.cleanBlood(100);
            document.getElementById("gameStatus").textContent = "10 monsters defeated. Blood cleared. System errors detected...";
        } else {
            this.loseLife();
        }
        this.updateUI();
        if (this.active) document.querySelector(".knife-hitbox")?.focus();
    }

    loseLife() {
        this.lives--;
        this.updateUI();
        if (this.lives === 0) {
            this.triggerGameOver();
            return;
        }
        horrorAudio.playMonsterAlarm();
        window.bloodSystem.addBloodSplatter();
        document.getElementById("gameStatus").textContent = "Shooting failed. You lost a life!";
    }

    triggerGameOver() {
        document.getElementById("finalScore").textContent = this.score;
        document.getElementById("finalKnives").textContent = this.knivesExtracted;
        document.getElementById("finalBlood").textContent = window.bloodSystem.getContaminationPercentage() + "%";
        this.stop();
        setKnivesEnabled(false);
        document.getElementById("gameOverOverlay").hidden = false;
        horrorAudio.playJumpscareSound();
        document.getElementById("restartGameBtn").focus();
    }

    update(now) {
        if (!this.active) return;
        if (!this.shooting && now >= this.nextMonsterAt && window.bloodSystem.getContaminationPercentage() >= 80) {
            this.spawnMonster();
        }

        if (this.active) this.frame = requestAnimationFrame(this.update);
    }
}

function startHorrorCraft() {
    document.getElementById("startMenu").hidden = true;
    document.getElementById("gameScreen").hidden = false;
    if (!window.gameEngine) {
        window.bloodSystem = new BloodSplatterSystem("bloodCanvas");
        window.gameEngine = new HorrorCraftGame();
    }
    window.gameEngine.start();
}

function returnToMenu() {
    window.gameEngine.stop();
    document.getElementById("gameScreen").hidden = true;
    document.getElementById("startMenu").hidden = false;
    resetStartMenu();
}

document.getElementById("restartGameBtn").addEventListener("click", () => window.gameEngine.start());
document.getElementById("menuButton").addEventListener("click", returnToMenu);
document.getElementById("gameOverMenuButton").addEventListener("click", returnToMenu);
document.getElementById("addBloodButton").addEventListener("click", () => {
    if (window.gameEngine.active) window.bloodSystem.addBloodSplatter();
});
document.getElementById("maxBloodButton").addEventListener("click", () => {
    if (window.gameEngine.active) window.bloodSystem.setIntensityLevel(5);
});
document.getElementById("cleanBloodButton").addEventListener("click", () => {
    if (window.gameEngine.active) window.bloodSystem.cleanBlood(100);
});
document.getElementById("spawnMonsterButton").addEventListener("click", () => window.gameEngine.spawnMonster());
document.getElementById("hitboxDebug").addEventListener("change", event => {
    document.documentElement.classList.toggle("show-hitboxes", event.target.checked);
});
