
const sounds = {
    knife: new Audio("src/assets/sounds/knife.mp3"),
    heartbeat: new Audio("src/assets/sounds/heartbeat.wav"),
    gunshot: new Audio("src/assets/sounds/gunshot.wav"),
    gameover: new Audio("src/assets/sounds/gameover.wav"),
    screaming: new Audio("src/assets/sounds/screaming.m4a"),
    ringing: new Audio("src/assets/sounds/ringing.wav")
};

sounds.heartbeat.loop = true;
sounds.heartbeat.volume = 0.3;

sounds.knife.volume = 0.8;
sounds.gunshot.volume = 0.6;
sounds.gameover.volume = 0.7;
sounds.screaming.volume = 1;
sounds.ringing.loop = true;
sounds.ringing.volume = 0.7;

let soundContext;

function enableScreamBoost() {
    if (!soundContext) {
        soundContext = new AudioContext();
        const source = soundContext.createMediaElementSource(sounds.screaming);
        const gain = soundContext.createGain();
        gain.gain.value = 2;
        source.connect(gain);
        gain.connect(soundContext.destination);
    }
    return soundContext.state === "suspended" ? soundContext.resume() : Promise.resolve();
}

async function playSound(name) {
    const sound = sounds[name];

    if (!sound) throw new Error(`Unknown sound: ${name}`);

    sound.muted = false;
    sound.currentTime = 0;
    await Promise.all([enableScreamBoost(), sound.play()]);
}

const soundStatus = document.getElementById("soundStatus");

function playGameSound(name) {
    return playSound(name).catch(error => {
        if (error.name === "AbortError") return;
        console.error(`Could not play ${name}:`, error);
        soundStatus.textContent = `Could not play ${name}: ${error.message}`;
    });
}

function stopAllSounds() {
    for (const name of Object.keys(sounds)) {
        sounds[name].onended = null;
        stopSound(name);
    }
}

function playRoundEnding(won) {
    stopAllSounds();
    if (!won) {
        sounds.screaming.onended = () => {
            sounds.screaming.onended = null;
            playGameSound("gameover");
        };
    }
    playSound("screaming").catch(error => {
        if (error.name === "AbortError") return;
        soundStatus.textContent = `Could not play screaming: ${error.message}`;
        if (!won) playGameSound("gameover");
    });
}

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
