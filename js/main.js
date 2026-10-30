// Coordinates the prototype's blood, audio and monster systems with the team's DOM knives.
class HorrorCraftGame {
    constructor() {
        this.container = document.getElementById("gameContainer");
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.monster = new MonsterEncounter();
        this.monsterTarget = document.getElementById("monsterTarget");
        this.active = false;
        this.frame = null;
        this.render = this.render.bind(this);

        document.getElementById("knives").addEventListener("click", event => {
            const button = event.target.closest(".knife-hitbox");
            if (button) this.pullKnife(button);
        });
        this.monsterTarget.addEventListener("click", () => this.shootMonster());
        this.canvas.addEventListener("click", event => {
            if (!this.active || !this.monster.active) return;
            const rect = this.canvas.getBoundingClientRect();
            const x = (event.clientX - rect.left) * this.canvas.width / rect.width;
            const y = (event.clientY - rect.top) * this.canvas.height / rect.height;
            if (this.monster.contains(x, y)) this.shootMonster();
            else horrorAudio.playGunshotSound();
        });
        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(this.container);
    }

    resize() {
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
        const scale = Math.max(0.1, Math.min(1, (this.canvas.width - 20) / 600, (this.canvas.height - 42) / 600));
        document.getElementById("characterScene").style.setProperty("--character-scale", scale);
        if (this.monster.active) {
            this.monster.teleport(this.canvas);
            this.updateMonsterTarget();
        }
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
        this.endEncounter();
        document.getElementById("gameOverOverlay").hidden = true;
        document.getElementById("hitboxDebug").checked = false;
        document.documentElement.classList.remove("show-hitboxes");
        document.getElementById("gameStatus").textContent = "Your nightmare begins...";
        window.bloodSystem.resetBlood();
        window.bloodSystem.start();
        this.resize();
        this.updateUI();
        startHeartbeat();
        this.previousTime = performance.now();
        this.frame = requestAnimationFrame(this.render);
        document.querySelector(".knife-hitbox").focus();
    }

    stop() {
        this.active = false;
        cancelAnimationFrame(this.frame);
        this.frame = null;
        this.monster.active = false;
        stopHeartbeat();
        window.bloodSystem.stop();
    }

    pullKnife(button) {
        if (!this.active || this.monster.active || button.disabled || !button.isConnected) return;
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
        if (!this.active || this.monster.active) return;
        this.monster.spawn(this.canvas, this.knivesExtracted);
        setKnivesEnabled(false);
        this.container.classList.add("crosshair-mode");
        document.getElementById("monsterWarning").hidden = false;
        document.getElementById("gameHint").textContent = "Shoot the monster before the timer runs out!";
        this.monsterTarget.hidden = false;
        this.updateMonsterTarget();
        horrorAudio.playMonsterAlarm();
    }

    updateMonsterTarget() {
        const p = this.monster.position;
        Object.assign(this.monsterTarget.style, {
            left: p.x + "px", top: p.y + "px",
            width: p.width + "px", height: p.height + "px"
        });
        document.getElementById("monsterTimer").textContent = this.monster.remaining.toFixed(1);
    }

    endEncounter() {
        this.monster.active = false;
        this.monsterTarget.hidden = true;
        document.getElementById("monsterWarning").hidden = true;
        this.container.classList.remove("crosshair-mode");
        document.getElementById("gameHint").textContent = "Pull the knives. Every pull makes the remaining hitboxes smaller.";
        setKnivesEnabled(this.active);
        this.nextMonsterAt = performance.now() + 2000;
    }

    shootMonster() {
        if (!this.active || !this.monster.active) return;
        horrorAudio.playGunshotSound();
        this.endEncounter();
        this.score += 1000;
        window.bloodSystem.cleanBlood(100);
        document.getElementById("gameStatus").textContent = "Monster defeated. Your screen is clear.";
        this.updateUI();
    }

    loseLife() {
        this.endEncounter();
        this.lives--;
        this.updateUI();
        if (this.lives === 0) {
            this.triggerGameOver();
            return;
        }
        horrorAudio.playMonsterAlarm();
        window.bloodSystem.addBloodSplatter();
        document.getElementById("gameStatus").textContent = "Too slow. You lost a life!";
    }

    triggerGameOver() {
        document.getElementById("finalScore").textContent = this.score;
        document.getElementById("finalKnives").textContent = this.knivesExtracted;
        document.getElementById("finalBlood").textContent = window.bloodSystem.getContaminationPercentage() + "%";
        this.stop();
        setKnivesEnabled(false);
        this.monsterTarget.hidden = true;
        document.getElementById("monsterWarning").hidden = true;
        document.getElementById("gameOverOverlay").hidden = false;
        horrorAudio.playJumpscareSound();
        document.getElementById("restartGameBtn").focus();
    }

    render(now) {
        if (!this.active) return;
        const seconds = Math.max(0, (now - this.previousTime) / 1000);
        this.previousTime = now;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.monster.active) {
            if (this.monster.update(seconds, this.canvas)) this.loseLife();
            else {
                this.monster.draw(this.ctx);
                this.updateMonsterTarget();
            }
        } else if (now >= this.nextMonsterAt && window.bloodSystem.getContaminationPercentage() >= 80) {
            this.spawnMonster();
        }

        if (this.active) this.frame = requestAnimationFrame(this.render);
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
