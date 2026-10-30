// The prototype's monster, with one frame-driven timer instead of stacked intervals.
class MonsterEncounter {
    constructor() {
        this.active = false;
        this.remaining = 0;
        this.teleportCountdown = 0;
        this.position = { x: 0, y: 0, width: 140, height: 220 };
    }

    spawn(canvas, knivesExtracted) {
        this.active = true;
        this.remaining = Math.max(3.5, 6 - knivesExtracted * 0.06);
        this.teleportCountdown = 0.65;
        this.teleport(canvas);
    }

    teleport(canvas) {
        const scale = Math.max(0.15, Math.min(1, (canvas.width - 32) / 140, (canvas.height - 110) / 220));
        this.position.width = 140 * scale;
        this.position.height = 220 * scale;
        const minimumY = Math.min(95, canvas.height / 4);
        const rangeX = Math.max(0, canvas.width - this.position.width - 32);
        const rangeY = Math.max(0, canvas.height - minimumY - this.position.height - 16);
        this.position.x = 16 + Math.random() * rangeX;
        this.position.y = minimumY + Math.random() * rangeY;
    }

    update(seconds, canvas) {
        this.remaining = Math.max(0, this.remaining - seconds);
        this.teleportCountdown -= seconds;
        if (this.teleportCountdown <= 0) {
            this.teleport(canvas);
            this.teleportCountdown = 0.65;
        }
        return this.remaining === 0;
    }

    contains(x, y) {
        const p = this.position;
        return x >= p.x && x <= p.x + p.width && y >= p.y && y <= p.y + p.height;
    }

    draw(ctx) {
        const p = this.position;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.scale(p.width / 140, p.height / 220);
        ctx.fillStyle = "rgba(255, 0, 0, 0.4)";
        ctx.fillRect((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, 140, 220);
        ctx.fillStyle = "#050002";
        ctx.fillRect(0, 0, 140, 220);
        ctx.fillRect(-15, -25, 30, 40);
        ctx.fillRect(125, -25, 30, 40);
        ctx.fillStyle = "#ff0000";
        ctx.shadowColor = "#ff0000";
        ctx.shadowBlur = 15;
        ctx.fillRect(25, 40, 25, 25);
        ctx.fillRect(85, 40, 25, 25);
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.moveTo(30, 120);
        for (let x = 30; x <= 110; x += 16) {
            ctx.lineTo(x, 120 + (x % 32 === 0 ? 25 : 0));
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}
