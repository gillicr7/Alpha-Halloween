// Audio synthesizer adapted from horrorcraft_the_backstabber.html.
class HorrorAudioEngine {
    constructor() {
        this.ctx = null;
        this.initialized = false;
        this.muted = false;
        this.heartbeatInterval = null;
    }

    init() {
        if (this.initialized) {
            return this.ctx.resume();
        }
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
        this.output = this.ctx.createGain();
        this.output.gain.value = 0.2;
        this.output.connect(this.ctx.destination);
        this.initialized = true;
        return this.ctx.resume();
    }

    // Procedural knife pull sound (squish + metallic scrape)
    playKnifePullSound() {
        if (!this.initialized || this.muted) return;
        const now = this.ctx.currentTime;

        // Squish Noise
        const bufferSize = this.ctx.sampleRate * 0.15;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.15);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.output);
        noise.start(now);

        // Metallic Cling
        const osc = this.ctx.createOscillator();
        const metallicGain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);

        metallicGain.gain.setValueAtTime(0.4, now);
        metallicGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.connect(metallicGain);
        metallicGain.connect(this.output);
        osc.start(now);
        osc.stop(now + 0.1);
    }

    // Procedural wet blood splatter squirt sound
    playSplatterSound() {
        if (!this.initialized || this.muted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(40, now + 0.2);

        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.connect(gain);
        gain.connect(this.output);
        osc.start(now);
        osc.stop(now + 0.2);
    }

    // Monster Warning Alarm Siren
    playMonsterAlarm() {
        if (!this.initialized || this.muted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(700, now + 0.25);
        osc.frequency.linearRampToValueAtTime(300, now + 0.5);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        osc.connect(gain);
        gain.connect(this.output);
        osc.start(now);
        osc.stop(now + 0.5);
    }

    // Gunshot effect for shooting mini-game
    playGunshotSound() {
        if (!this.initialized || this.muted) return;
        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.3;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.05));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(1.0, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        noise.connect(gain);
        gain.connect(this.output);
        noise.start(now);
    }

    // Screen Clean Victory Sound
    playCleanVictorySound() {
        if (!this.initialized || this.muted) return;
        const now = this.ctx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25]; // C E G C
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);

            gain.gain.setValueAtTime(0.2, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);

            osc.connect(gain);
            gain.connect(this.output);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.2);
        });
    }

    // Jumpscare / Game Over Sound
    playJumpscareSound() {
        if (!this.initialized || this.muted) return;
        const now = this.ctx.currentTime;

        // Screaming Noise Layer
        const bufferSize = this.ctx.sampleRate * 1.2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.sin(i * 0.05);
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.Q.setValueAtTime(3.0, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(1.0, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.output);
        noise.start(now);

        // Harsh Distorted Pitch Drop
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 1.0);

        oscGain.gain.setValueAtTime(1.0, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);

        osc.connect(oscGain);
        oscGain.connect(this.output);
        osc.start(now);
        osc.stop(now + 1.0);
    }
}

const horrorAudio = new HorrorAudioEngine();

async function initializeAudio() {
    try {
        await horrorAudio.init();
        if (horrorAudio.muted) await horrorAudio.ctx.suspend();
        return true;
    } catch (error) {
        document.getElementById("soundStatus").textContent = "Audio unavailable: " + error.message;
        return false;
    }
}

function stopHeartbeat() {
    clearInterval(horrorAudio.heartbeatInterval);
    horrorAudio.heartbeatInterval = null;
}

function startHeartbeat() {
    stopHeartbeat();
    const delay = Math.max(350, 850 - difficultyLevel * 20);
    horrorAudio.heartbeatInterval = setInterval(() => {
        if (!horrorAudio.initialized || horrorAudio.muted) return;
        const ctx = horrorAudio.ctx;
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.frequency.setValueAtTime(65, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        oscillator.connect(gain);
        gain.connect(horrorAudio.output);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.22);
    }, delay);
}

function updateHeartbeat() {
    if (window.gameEngine?.active) startHeartbeat();
}

async function playSound(name) {
    if (!await initializeAudio()) return;
    const effects = {
        knife: () => horrorAudio.playKnifePullSound(),
        gunshot: () => horrorAudio.playGunshotSound(),
        gameover: () => horrorAudio.playJumpscareSound(),
        heartbeat: startHeartbeat
    };
    if (!effects[name]) throw new Error("Unknown sound: " + name);
    effects[name]();
}

function stopSound(name) {
    if (name === "heartbeat") stopHeartbeat();
}

document.getElementById("testSoundButton").addEventListener("click", async () => {
    await playSound("knife");
    document.getElementById("soundStatus").textContent = horrorAudio.initialized
        ? "Knife sound ready." : "Audio is unavailable. You can still play.";
});

document.getElementById("muteButton").addEventListener("click", async event => {
    horrorAudio.muted = !horrorAudio.muted;
    event.currentTarget.setAttribute("aria-pressed", String(horrorAudio.muted));
    event.currentTarget.textContent = horrorAudio.muted ? "UNMUTE" : "MUTE";
    try {
        if (horrorAudio.ctx) {
            if (horrorAudio.muted) await horrorAudio.ctx.suspend();
            else await horrorAudio.ctx.resume();
        }
    } catch {
        document.getElementById("gameStatus").textContent = "Audio unavailable. You can still play.";
    }
});
