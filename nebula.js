/**
 * Liquid Quantum Aurora & Cosmic Starfield Engine
 * Features:
 * - Morphing Plasma Nebula Auroras & Fluid Metaballs
 * - Dynamic Color Theme Shift per Slide
 * - 3D Parallax Starfield & Twinkling Constellation Lines
 * - Interactive Cursor Energy Ripples & Shooting Stars
 * - Floating Cosmic Dust & Glowing Light Orbs
 */

class NebulaEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.stars = [];
        this.nebulaClouds = [];
        this.dustParticles = [];
        this.shootingStars = [];
        this.ripples = [];
        
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;

        // Color Palettes for each slide (10 presentation slides)
        this.slidePalettes = [
            // Slide 0: Home (Cyan & Violet Cosmos)
            [ { r: 56, g: 189, b: 248 }, { r: 139, g: 92, b: 246 }, { r: 16, g: 185, b: 129 }, { r: 30, g: 58, b: 138 } ],
            // Slide 1: What (Deep Sky Blue & Sapphire)
            [ { r: 14, g: 165, b: 233 }, { r: 79, g: 70, b: 229 }, { r: 56, g: 189, b: 248 }, { r: 15, g: 23, b: 42 } ],
            // Slide 2: How (Emerald Green & Quantum Teal)
            [ { r: 16, g: 185, b: 129 }, { r: 52, g: 211, b: 153 }, { r: 6, g: 182, b: 212 }, { r: 15, g: 118, b: 110 } ],
            // Slide 3: Features (Electric Purple & Neon Pink)
            [ { r: 168, g: 85, b: 247 }, { r: 236, g: 72, b: 153 }, { r: 99, g: 102, b: 241 }, { r: 192, g: 38, b: 211 } ],
            // Slide 4: Benefits (Amber Gold & Warm Coral)
            [ { r: 245, g: 158, b: 11 }, { r: 251, g: 191, b: 36 }, { r: 244, g: 63, b: 94 }, { r: 180, g: 83, b: 9 } ],
            // Slide 5: Comparison (High-Tech Cyan & Deep Indigo)
            [ { r: 6, g: 182, b: 212 }, { r: 59, g: 130, b: 246 }, { r: 99, g: 102, b: 241 }, { r: 14, g: 116, b: 144 } ],
            // Slide 6: Applications (Ocean Emerald & Aquamarine)
            [ { r: 20, g: 184, b: 166 }, { r: 56, g: 189, b: 248 }, { r: 52, g: 211, b: 153 }, { r: 13, g: 148, b: 136 } ],
            // Slide 7: Limitations (Sunset Rose Gold & Crimson Accent)
            [ { r: 244, g: 63, b: 94 }, { r: 251, g: 146, b: 60 }, { r: 217, g: 70, b: 239 }, { r: 159, g: 18, b: 57 } ],
            // Slide 8: Conclusion (Aurora Borealis Spectral Mix)
            [ { r: 56, g: 189, b: 248 }, { r: 168, g: 85, b: 247 }, { r: 52, g: 211, b: 153 }, { r: 236, g: 72, b: 153 } ],
            // Slide 9: Team (Diamond Electric Cyan & Pure Crystal)
            [ { r: 125, g: 211, b: 252 }, { r: 56, g: 189, b: 248 }, { r: 147, g: 197, b: 253 }, { r: 30, g: 64, b: 175 } ]
        ];

        this.currentSlideIndex = 0;
        this.targetPalette = this.slidePalettes[0];
        
        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        window.addEventListener('mousemove', (e) => {
            const rawX = (e.clientX / window.innerWidth - 0.5) * 60;
            const rawY = (e.clientY / window.innerHeight - 0.5) * 60;
            this.targetMouseX = rawX;
            this.targetMouseY = rawY;

            // Trigger energy ripples occasionally on fast cursor move
            if (Math.random() < 0.08) {
                this.ripples.push({
                    x: e.clientX,
                    y: e.clientY,
                    radius: 5,
                    maxRadius: 120 + Math.random() * 80,
                    alpha: 0.5,
                    color: '#38BDF8'
                });
            }
        });

        // Listen for slide navigation events to transition background colors smoothly
        window.addEventListener('slidechange', (e) => {
            const index = e.detail ? e.detail.index : 0;
            this.currentSlideIndex = index % this.slidePalettes.length;
            this.targetPalette = this.slidePalettes[this.currentSlideIndex];
        });

        this.generateStars(220);
        this.generateNebulaClouds(6);
        this.generateDust(75);

        this.animate();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width * (window.devicePixelRatio || 1);
        this.canvas.height = this.height * (window.devicePixelRatio || 1);
        this.ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    }

    generateStars(count) {
        this.stars = [];
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 1.8 + 0.3,
                baseAlpha: Math.random() * 0.75 + 0.2,
                alpha: 0,
                twinkleSpeed: Math.random() * 0.025 + 0.006,
                phase: Math.random() * Math.PI * 2,
                depth: Math.random() * 0.9 + 0.1,
                color: this.getRandomStarColor()
            });
        }
    }

    getRandomStarColor() {
        const colors = [
            '#FFFFFF', '#E0F2FE', '#BAE6FD', '#DDD6FE', '#FBCFE8', '#7DD3FC', '#A7F3D0'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    generateNebulaClouds(count) {
        this.nebulaClouds = [];
        for (let i = 0; i < count; i++) {
            const col = this.targetPalette[i % this.targetPalette.length];
            this.nebulaClouds.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.min(this.width, this.height) * (Math.random() * 0.4 + 0.35),
                currentCol: { r: col.r, g: col.g, b: col.b },
                targetColIndex: i % this.targetPalette.length,
                alpha: Math.random() * 0.18 + 0.14,
                angle: Math.random() * Math.PI * 2,
                speed: (Math.random() - 0.5) * 0.0006,
                driftX: (Math.random() - 0.5) * 0.25,
                driftY: (Math.random() - 0.5) * 0.25,
                scalePulse: Math.random() * Math.PI * 2
            });
        }
    }

    generateDust(count) {
        this.dustParticles = [];
        for (let i = 0; i < count; i++) {
            this.dustParticles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 2.2 + 0.8,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                alpha: Math.random() * 0.45 + 0.15,
                color: '#38BDF8'
            });
        }
    }

    spawnShootingStar() {
        if (Math.random() < 0.015 && this.shootingStars.length < 3) {
            const startX = Math.random() * this.width * 0.8;
            const startY = Math.random() * (this.height * 0.4);
            const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.2;
            const speed = Math.random() * 12 + 10;
            this.shootingStars.push({
                x: startX,
                y: startY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                length: Math.random() * 120 + 80,
                alpha: 1,
                decay: Math.random() * 0.018 + 0.012
            });
        }
    }

    drawDeepSpaceGradient() {
        const grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
        grad.addColorStop(0, '#040612');
        grad.addColorStop(0.5, '#0A0E26');
        grad.addColorStop(1, '#03040C');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    updateCloudColors() {
        // Smoothly interpolate current cloud colors toward active slide palette
        this.nebulaClouds.forEach((cloud, i) => {
            const target = this.targetPalette[i % this.targetPalette.length];
            cloud.currentCol.r += (target.r - cloud.currentCol.r) * 0.03;
            cloud.currentCol.g += (target.g - cloud.currentCol.g) * 0.03;
            cloud.currentCol.b += (target.b - cloud.currentCol.b) * 0.03;
        });
    }

    drawNebulaClouds(timestamp) {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';

        this.nebulaClouds.forEach((cloud, idx) => {
            cloud.angle += cloud.speed;
            cloud.x += cloud.driftX + Math.sin(timestamp * 0.00025 + idx) * 0.2;
            cloud.y += cloud.driftY + Math.cos(timestamp * 0.00025 + idx) * 0.2;

            if (cloud.x < -cloud.radius) cloud.x = this.width + cloud.radius;
            if (cloud.x > this.width + cloud.radius) cloud.x = -cloud.radius;
            if (cloud.y < -cloud.radius) cloud.y = this.height + cloud.radius;
            if (cloud.y > this.height + cloud.radius) cloud.y = -cloud.radius;

            const pulseRadius = cloud.radius + Math.sin(timestamp * 0.0006 + cloud.scalePulse) * 50;
            const parallaxX = cloud.x + this.mouseX * 0.4;
            const parallaxY = cloud.y + this.mouseY * 0.4;

            const radGrad = this.ctx.createRadialGradient(
                parallaxX, parallaxY, 0,
                parallaxX, parallaxY, Math.max(10, pulseRadius)
            );

            const r = Math.round(cloud.currentCol.r);
            const g = Math.round(cloud.currentCol.g);
            const b = Math.round(cloud.currentCol.b);

            radGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${cloud.alpha})`);
            radGrad.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, ${cloud.alpha * 0.55})`);
            radGrad.addColorStop(0.75, `rgba(${r}, ${g}, ${b}, ${cloud.alpha * 0.18})`);
            radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            this.ctx.fillStyle = radGrad;
            this.ctx.beginPath();
            this.ctx.arc(parallaxX, parallaxY, Math.max(10, pulseRadius), 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.ctx.restore();
    }

    drawStars() {
        const mouseCanvasX = this.width / 2 + this.targetMouseX * 10;
        const mouseCanvasY = this.height / 2 + this.targetMouseY * 10;

        this.stars.forEach(star => {
            star.phase += star.twinkleSpeed;
            const currentAlpha = star.baseAlpha + Math.sin(star.phase) * 0.35;
            star.alpha = Math.max(0.08, Math.min(1, currentAlpha));

            const px = star.x + this.mouseX * star.depth;
            const py = star.y + this.mouseY * star.depth;

            this.ctx.fillStyle = star.color;
            this.ctx.globalAlpha = star.alpha;
            this.ctx.beginPath();
            this.ctx.arc(px, py, star.radius, 0, Math.PI * 2);
            this.ctx.fill();

            if (star.radius > 1.3) {
                this.ctx.fillStyle = star.color;
                this.ctx.globalAlpha = star.alpha * 0.25;
                this.ctx.beginPath();
                this.ctx.arc(px, py, star.radius * 2.6, 0, Math.PI * 2);
                this.ctx.fill();
            }

            // Draw interactive constellation connections to nearby cursor position
            const dx = px - mouseCanvasX;
            const dy = py - mouseCanvasY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 140) {
                const lineAlpha = (1 - dist / 140) * 0.25 * star.alpha;
                this.ctx.strokeStyle = star.color;
                this.ctx.lineWidth = 0.6;
                this.ctx.globalAlpha = lineAlpha;
                this.ctx.beginPath();
                this.ctx.moveTo(px, py);
                this.ctx.lineTo(mouseCanvasX, mouseCanvasY);
                this.ctx.stroke();
            }
        });
        this.ctx.globalAlpha = 1;
    }

    drawRipples() {
        this.ctx.save();
        for (let i = this.ripples.length - 1; i >= 0; i--) {
            const r = this.ripples[i];
            r.radius += 2.5;
            r.alpha -= 0.012;

            if (r.alpha <= 0 || r.radius >= r.maxRadius) {
                this.ripples.splice(i, 1);
                continue;
            }

            this.ctx.strokeStyle = r.color;
            this.ctx.lineWidth = 1.2;
            this.ctx.globalAlpha = r.alpha;
            this.ctx.beginPath();
            this.ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        this.ctx.restore();
    }

    drawShootingStars() {
        this.ctx.save();
        for (let i = this.shootingStars.length - 1; i >= 0; i--) {
            const s = this.shootingStars[i];
            s.x += s.vx;
            s.y += s.vy;
            s.alpha -= s.decay;

            if (s.alpha <= 0 || s.x > this.width || s.y > this.height) {
                this.shootingStars.splice(i, 1);
                continue;
            }

            const tailX = s.x - s.vx * (s.length / 20);
            const tailY = s.y - s.vy * (s.length / 20);

            const grad = this.ctx.createLinearGradient(s.x, s.y, tailX, tailY);
            grad.addColorStop(0, `rgba(255, 255, 255, ${s.alpha})`);
            grad.addColorStop(0.4, `rgba(56, 189, 248, ${s.alpha * 0.7})`);
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            this.ctx.strokeStyle = grad;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(s.x, s.y);
            this.ctx.lineTo(tailX, tailY);
            this.ctx.stroke();

            // Head sparkle
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.globalAlpha = s.alpha;
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.restore();
    }

    drawDust() {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'lighter';
        this.dustParticles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = this.width;
            if (p.x > this.width) p.x = 0;
            if (p.y < 0) p.y = this.height;
            if (p.y > this.height) p.y = 0;

            const px = p.x + this.mouseX * 0.5;
            const py = p.y + this.mouseY * 0.5;

            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.alpha;
            this.ctx.beginPath();
            this.ctx.arc(px, py, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.restore();
    }

    animate(timestamp = 0) {
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.updateCloudColors();
        this.drawDeepSpaceGradient();
        this.drawNebulaClouds(timestamp);
        this.drawStars();
        this.drawRipples();
        this.spawnShootingStar();
        this.drawShootingStars();
        this.drawDust();

        requestAnimationFrame((t) => this.animate(t));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.nebulaEngineInstance = new NebulaEngine('nebula-canvas');
});
