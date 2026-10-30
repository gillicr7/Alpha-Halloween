
const sounds = {
    knife: new Audio("assets/sounds/knife.mp3"),
    heartbeat: new Audio("assets/sounds/heartbeat.mp3"),
    gunshot: new Audio("assets/sounds/gunshot.mp3"),
    gameover: new Audio("assets/sounds/gameover.mp3")
};

sounds.heartbeat.loop = true;
sounds.heartbeat.volume = 0.3;

sounds.knife.volume = 0.8;
sounds.gunshot.volume = 0.6;
sounds.gameover.volume = 0.7;

function playSound(name) {
    const sound = sounds[name];

    if (!sound) return;

    sound.currentTime = 0;
    sound.play().catch(error => {
        console.warn("Sound could not play:", error);
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
