// Blood renderer adapted from horrorcraft_the_backstabber.html.
class BloodSplatterSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.splatters = [];
        this.drips = [];
        this.intensityLevel = 1;

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Animation loop for blood dripping
        this.animate = this.animate.bind(this);
        this.animationFrame = null;
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.redraw();
        this.updateContaminationUI();
    }

    // Core Global Function: Add Blood Splatter
    addBloodSplatter() {
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Generate 3 to 5 distinct splatters per single call for MASSIVE coverage
        const burstCount = Math.floor(Math.random() * 3) + 3;

        for (let b = 0; b < burstCount; b++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const radius = Math.random() * 85 + 45; // Much larger splatters

            const splatter = {
                x: x,
                y: y,
                radius: radius,
                rotation: Math.random() * Math.PI * 2,
                opacity: 0,
                targetOpacity: Math.random() * 0.3 + 0.7,
                color: this.getRandomBloodColor(),
                droplets: [],
                isBlocky: Math.random() > 0.3
            };

            // Sub-droplets
            const numDroplets = Math.floor(Math.random() * 16) + 10;
            for (let i = 0; i < numDroplets; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = radius * (1 + Math.random() * 2.2);
                splatter.droplets.push({
                    dx: Math.cos(angle) * dist,
                    dy: Math.sin(angle) * dist,
                    r: Math.random() * (radius * 0.3) + 4
                });
            }

            this.splatters.push(splatter);

            // Add thick dripping
            if (Math.random() > 0.2) {
                this.drips.push({
                    x: splatter.x + (Math.random() - 0.5) * radius,
                    y: splatter.y,
                    length: 0,
                    maxLength: Math.random() * 250 + 80,
                    speed: Math.random() * 4 + 2,
                    width: Math.random() * 10 + 4,
                    color: splatter.color
                });
            }
        }

        horrorAudio.playSplatterSound();
        this.updateContaminationUI();
    }

    // Core Global Function: Clean Blood
    cleanBlood(amountPercent) {
        if (this.splatters.length === 0) return;

        const removeCount = Math.ceil(this.splatters.length * (amountPercent / 100));
        this.splatters.splice(0, removeCount);
        this.drips.splice(0, Math.ceil(this.drips.length * (amountPercent / 100)));

        this.updateContaminationUI();
        this.redraw();
        horrorAudio.playCleanVictorySound();
    }

    // Core Global Function: Reset Blood
    resetBlood() {
        this.splatters = [];
        this.drips = [];
        this.intensityLevel = 1;
        this.updateContaminationUI();
        this.redraw();
    }

    // Set specific intensity level (1 to 5)
    setIntensityLevel(level) {
        this.intensityLevel = Math.max(1, Math.min(5, level));
        const targetCounts = [3, 10, 22, 40, 75];
        const desiredCount = targetCounts[this.intensityLevel - 1];

        this.splatters = [];
        this.drips = [];
        for (let i = 0; i < desiredCount; i++) {
            this.addBloodSplatter();
        }
    }

    getRandomBloodColor() {
        const colors = [
            { r: 120, g: 0, b: 0 },   // Deep dark crimson
            { r: 160, g: 10, b: 10 }, // Bright fresh blood
            { r: 80, g: 0, b: 0 },    // Coagulated dark red
            { r: 140, g: 5, b: 15 }   // Slasher red
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getContaminationPercentage() {
        const totalArea = this.canvas.width * this.canvas.height;
        let bloodArea = 0;
        this.splatters.forEach(s => {
            bloodArea += Math.PI * s.radius * s.radius * 3.5;
        });
        return totalArea === 0 ? 0 : Math.min(100, Math.round((bloodArea / totalArea) * 100));
    }

    updateContaminationUI() {
        const percent = this.getContaminationPercentage();
        document.getElementById('contaminationPercent').innerText = `${percent}%`;
        document.getElementById('contaminationBar').style.width = `${percent}%`;
    }

    start() {
        if (this.animationFrame !== null) return;
        this.animate();
    }

    stop() {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Splatters
        this.splatters.forEach(s => {
            if (s.opacity < s.targetOpacity) {
                s.opacity += 0.05;
            }
            this.drawSplatter(s);
        });

        // Update & Draw Dripping Blood
        this.drips.forEach((d, idx) => {
            if (d.length < d.maxLength) {
                d.length += d.speed;
            }
            this.drawDrip(d);
        });

        this.animationFrame = requestAnimationFrame(this.animate);
    }

    drawSplatter(s) {
        this.ctx.save();
        this.ctx.translate(s.x, s.y);
        this.ctx.rotate(s.rotation);
        this.ctx.globalAlpha = s.opacity;

        const c = s.color;
        this.ctx.fillStyle = `rgb(${c.r}, ${c.g}, ${c.b})`;
        this.ctx.shadowColor = 'rgba(0,0,0,0.8)';
        this.ctx.shadowBlur = 8;

        if (s.isBlocky) {
            // Minecraft Blocky Pixelated Splatter
            const r = s.radius;
            this.ctx.fillRect(-r * 0.7, -r * 0.7, r * 1.4, r * 1.4);
            this.ctx.fillRect(-r * 0.4, -r, r * 0.8, r * 2);
            this.ctx.fillRect(-r, -r * 0.4, r * 2, r * 0.8);
        } else {
            // Organic Irregular Splatter
            this.ctx.beginPath();
            this.ctx.arc(0, 0, s.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Sub-droplets around splatter
        s.droplets.forEach(drop => {
            if (s.isBlocky) {
                this.ctx.fillRect(drop.dx, drop.dy, drop.r, drop.r);
            } else {
                this.ctx.beginPath();
                this.ctx.arc(drop.dx, drop.dy, drop.r, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });

        // Wet liquid specular shine highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        this.ctx.beginPath();
        this.ctx.arc(-s.radius * 0.25, -s.radius * 0.25, s.radius * 0.2, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    drawDrip(d) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.9;
        const c = d.color;
        this.ctx.fillStyle = `rgb(${c.r}, ${c.g}, ${c.b})`;
        this.ctx.shadowColor = '#000';
        this.ctx.shadowBlur = 4;

        this.ctx.fillRect(d.x - d.width / 2, d.y, d.width, d.length);

        // Bulbous tear-drop tip at bottom of drip
        this.ctx.beginPath();
        this.ctx.arc(d.x, d.y + d.length, d.width * 1.2, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    redraw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.splatters.forEach(s => this.drawSplatter(s));
        this.drips.forEach(d => this.drawDrip(d));
    }
}
