
const sounds = {
    knife: new Audio("src/assets/sounds/knife.mp3"),
    heartbeat: new Audio("src/assets/sounds/heartbeat.wav"),
    gunshot: new Audio("src/assets/sounds/gunshot.wav"),
    gameover: new Audio("src/assets/sounds/gameover.wav")
};

sounds.heartbeat.loop = true;
sounds.heartbeat.volume = 0.3;

sounds.knife.volume = 0.8;
sounds.gunshot.volume = 0.6;
sounds.gameover.volume = 0.7;

async function playSound(name) {
    const sound = sounds[name];

    if (!sound) throw new Error(`Unknown sound: ${name}`);

    sound.muted = false;
    sound.currentTime = 0;
    await sound.play();
}

const testSoundButton = document.getElementById("testSoundButton");
const soundStatus = document.getElementById("soundStatus");

testSoundButton.addEventListener("click", async () => {
    soundStatus.textContent = "Loading knife sound…";
    try {
        await playSound("knife");
        soundStatus.textContent = "Playing knife sound 🔊";
    } catch (error) {
        console.error("Sound could not play:", error);
        soundStatus.textContent = `Could not play knife sound: ${error.message}`;
    }
});

function stopSound(name) {
    const sound = sounds[name];

    if (!sound) return;

    sound.pause();
    sound.currentTime = 0;
}

function updateHeartbeat(sanity) {
    const heartbeat = sounds.heartbeat;

    if (sanity <= 0) {
        heartbeat.playbackRate = 2;
        heartbeat.volume = 0.8;
    } else if (sanity <= 50) {
        heartbeat.playbackRate = 1.5;
        heartbeat.volume = 0.6;
    } else {
        heartbeat.playbackRate = 1;
        heartbeat.volume = 0.3;
    }
}
