let difficultyLevel = 0;

const minimumHitboxScale = 0.55;
const hitboxReductionPerLevel = 0.04;

function applyDifficulty() {
    const scale = Math.max(minimumHitboxScale, 1 - difficultyLevel * hitboxReductionPerLevel);
    document.documentElement.style.setProperty("--knife-hitbox-scale", scale);
    document.getElementById("difficultyDisplay").textContent = difficultyLevel;
}

function resetDifficulty() {
    difficultyLevel = 0;
    applyDifficulty();
}

function increaseDifficulty() {
    difficultyLevel++;
    applyDifficulty();
}
